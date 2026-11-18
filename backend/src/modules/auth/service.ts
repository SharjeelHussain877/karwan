import type { Session, User } from "@supabase/supabase-js";

import { supabaseAdmin, supabasePublic } from "../../config/supabase.js";
import { ENV } from "../../constants/index.js";
import { HttpError } from "../../utils/http-error.js";
import logger from "../../utils/logger.js";
import { warnMigrationMissing } from "../../utils/migration-warning.js";
import { buildAppMetadata, readAppMetadata, type Role } from "./roles.js";

const verifyUrl = `${ENV.CLIENT_URL.split(",")[0]!.trim()}/verify-email`;
const resetUrl = `${ENV.CLIENT_URL.split(",")[0]!.trim()}/reset-password`;

const readName = (user: User): string => {
  const name: unknown = user.user_metadata.name;
  return typeof name === "string" ? name : "";
};

const readAvatarUrl = (user: User): string => {
  const url: unknown = user.user_metadata.avatar_url;
  return typeof url === "string" ? url : "";
};

const readString = (user: User, key: string): string => {
  const value: unknown = user.user_metadata[key];
  return typeof value === "string" ? value : "";
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  phone: string;
  date_of_birth: string;
  email_verified: boolean;
  roles: Role[];
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
};

export const isAccountActive = (bannedUntil: string | null | undefined): boolean =>
  !bannedUntil || new Date(bannedUntil) <= new Date();

export const readIsSuperAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabaseAdmin().rpc("admin_get_is_super_admin", { target: userId });
  if (error) {
    warnMigrationMissing("admin_get_is_super_admin");
    return false;
  }
  return data === true;
};

export const toPublicUser = async (user: User): Promise<PublicUser> => {
  const meta = readAppMetadata(user.app_metadata);
  return {
    id: user.id,
    email: user.email ?? "",
    name: readName(user),
    avatar_url: readAvatarUrl(user),
    phone: user.phone ? `+${user.phone}` : "",
    date_of_birth: readString(user, "date_of_birth"),
    email_verified: Boolean(user.email_confirmed_at),
    roles: meta.roles,
    is_super_admin: await readIsSuperAdmin(user.id),
    is_active: isAccountActive(user.banned_until),
    created_at: user.created_at
  };
};

export const signUp = async (input: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data, error } = await supabasePublic().auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name }, emailRedirectTo: verifyUrl }
  });

  if (error) {
    if (error.code === "user_already_exists") {
      throw new HttpError(409, "An account with this email already exists", "EMAIL_TAKEN");
    }
    if (error.code === "weak_password") {
      throw new HttpError(400, error.message, "WEAK_PASSWORD");
    }
    throw new HttpError(400, error.message);
  }

  if (data.user && data.user.identities?.length === 0) {
    throw new HttpError(409, "An account with this email already exists", "EMAIL_TAKEN");
  }

  if (data.user) {
    const { error: roleError } = await supabaseAdmin().auth.admin.updateUserById(
      data.user.id,
      { app_metadata: buildAppMetadata(["user"]) }
    );
    if (roleError) {
      logger.error({ error: roleError, userId: data.user.id }, "Could not set default role");
    }
  }

  const user = data.user
    ? await toPublicUser({ ...data.user, app_metadata: buildAppMetadata(["user"]) })
    : null;

  return { user, session: data.session };
};

export const login = async (email: string, password: string) => {
  const { data, error } = await supabasePublic().auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    if (error?.code === "user_banned") {
      throw new HttpError(403, "This account has been deactivated", "ACCOUNT_INACTIVE");
    }
    if (error?.code === "email_not_confirmed") {
      throw new HttpError(403, "Please verify your email before signing in", "EMAIL_NOT_VERIFIED");
    }
    throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return { user: await toPublicUser(data.user), session: data.session };
};

export const getUserFromToken = async (accessToken: string | undefined) => {
  if (!accessToken) throw new HttpError(401, "Not authenticated", "UNAUTHENTICATED");

  const { data, error } = await supabasePublic().auth.getUser(accessToken);
  if (error || !data.user) {
    throw new HttpError(401, "Session expired", "UNAUTHENTICATED");
  }
  if (!data.user.email_confirmed_at) {
    throw new HttpError(403, "Please verify your email", "EMAIL_NOT_VERIFIED");
  }
  return await toPublicUser(data.user);
};

export const refresh = async (refreshToken: string | undefined) => {
  if (!refreshToken) throw new HttpError(401, "Not authenticated", "UNAUTHENTICATED");

  const { data, error } = await supabasePublic().auth.refreshSession({
    refresh_token: refreshToken
  });
  if (error || !data.session || !data.user) {
    throw new HttpError(401, "Session expired", "UNAUTHENTICATED");
  }
  return { user: await toPublicUser(data.user), session: data.session };
};

export const logout = async (accessToken: string | undefined) => {
  if (!accessToken) return;
  await supabaseAdmin().auth.admin.signOut(accessToken).catch(() => undefined);
};

export const forgotPassword = async (email: string) => {
  await supabasePublic().auth.resetPasswordForEmail(email, { redirectTo: resetUrl });
};

export const resetPassword = async (input: {
  accessToken: string;
  tokenHash: string;
  password: string;
}) => {
  let accessToken = input.accessToken;

  if (accessToken === "") {
    const { data, error } = await supabasePublic().auth.verifyOtp({
      token_hash: input.tokenHash,
      type: "recovery"
    });
    if (error || !data.session) {
      throw new HttpError(400, "Reset link is invalid or has expired", "INVALID_TOKEN");
    }
    accessToken = data.session.access_token;
  }

  const { data: userData, error } = await supabasePublic().auth.getUser(accessToken);
  if (error || !userData.user) {
    throw new HttpError(400, "Reset link is invalid or has expired", "INVALID_TOKEN");
  }

  const { error: updateError } = await supabaseAdmin().auth.admin.updateUserById(
    userData.user.id,
    { password: input.password }
  );
  if (updateError) {
    throw new HttpError(
      updateError.code === "weak_password" ? 400 : 500,
      updateError.code === "weak_password" ? updateError.message : "Could not update password"
    );
  }
};

export const verifyEmail = async (input: {
  accessToken: string;
  refreshToken: string;
  tokenHash: string;
}): Promise<{ user: PublicUser; session: Session }> => {
  const invalid = new HttpError(400, "Verification link is invalid or has expired", "INVALID_TOKEN");
  const sb = supabasePublic();

  if (input.tokenHash !== "") {
    const { data, error } = await sb.auth.verifyOtp({
      token_hash: input.tokenHash,
      type: "email"
    });
    if (error || !data.session || !data.user) throw invalid;
    return { user: await toPublicUser(data.user), session: data.session };
  }

  const { data, error } = await sb.auth.setSession({
    access_token: input.accessToken,
    refresh_token: input.refreshToken
  });
  if (error || !data.session || !data.user) throw invalid;
  if (!data.user.email_confirmed_at) throw invalid;
  return { user: await toPublicUser(data.user), session: data.session };
};

export const resendVerification = async (email: string) => {
  const { error } = await supabasePublic().auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: verifyUrl }
  });
  if (error && error.code === "over_email_send_rate_limit") {
    throw new HttpError(429, "Please wait a minute before requesting another email", "RATE_LIMITED");
  }
};
