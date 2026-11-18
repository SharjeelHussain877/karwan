import { z } from "zod";

import { supabaseAdmin } from "../../config/supabase.js";
import { HttpError } from "../../utils/http-error.js";
import { warnMigrationMissing } from "../../utils/migration-warning.js";
import logger from "../../utils/logger.js";
import {
  ROLES,
  canManageUsers,
  canViewUsers,
  readAppMetadata,
  sameRoles,
  type Role
} from "../auth/roles.js";
import { getUserFromToken, isAccountActive, toPublicUser, type PublicUser } from "../auth/service.js";

const rowSchema = z.object({
  id: z.string(),
  email: z.string().nullable().transform((value) => value ?? ""),
  name: z.string().nullable().transform((value) => value ?? ""),
  avatar_url: z.string().nullable().transform((value) => value ?? ""),
  roles: z.array(z.enum(ROLES)).catch(["user"]),
  is_super_admin: z.boolean().nullable().transform((value) => value === true),
  is_active: z.boolean().nullable().transform((value) => value !== false),
  created_at: z.string()
});

export type ManagedUser = z.infer<typeof rowSchema>;

const fetchAllFromAdminApi = async (): Promise<ManagedUser[]> => {
  const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new HttpError(500, "Could not load users");

  return data.users.map((user) => {
    const { roles } = readAppMetadata(user.app_metadata);
    const name: unknown = user.user_metadata.name;
    const avatar: unknown = user.user_metadata.avatar_url;
    return {
      id: user.id,
      email: user.email ?? "",
      name: typeof name === "string" ? name : "",
      avatar_url: typeof avatar === "string" ? avatar : "",
      roles,
      is_super_admin: false,
      is_active: isAccountActive(user.banned_until),
      created_at: user.created_at
    };
  });
};

const fetchAll = async (): Promise<ManagedUser[]> => {
  const { data, error } = await supabaseAdmin().rpc("admin_list_users");
  if (error) {
    warnMigrationMissing("admin_list_users");
    return fetchAllFromAdminApi();
  }

  return z.array(rowSchema).parse(data);
};

const INACTIVE_BAN = "876000h";

const forbidden = (message: string) => new HttpError(403, message, "FORBIDDEN");

const requireViewer = async (accessToken: string | undefined): Promise<PublicUser> => {
  const viewer = await getUserFromToken(accessToken);
  if (!canViewUsers(viewer.is_super_admin)) {
    throw forbidden("You don't have access to this page");
  }
  return viewer;
};

export type UsersPage = {
  users: ManagedUser[];
  nextOffset: number | null;
  total: number;
};

export const listUsers = async (
  accessToken: string | undefined,
  offset: number,
  limit: number
): Promise<UsersPage> => {
  const viewer = await requireViewer(accessToken);
  const others = (await fetchAll()).filter((user) => user.id !== viewer.id);

  const users = others.slice(offset, offset + limit);
  const next = offset + users.length;

  return { users, nextOffset: next < others.length ? next : null, total: others.length };
};

const loadUser = async (id: string) => {
  const { data, error } = await supabaseAdmin().auth.admin.getUserById(id);
  if (error || !data.user) throw new HttpError(404, "User not found", "NOT_FOUND");
  return data.user;
};

export const getUser = async (accessToken: string | undefined, id: string): Promise<PublicUser> => {
  const actor = await getUserFromToken(accessToken);
  if (actor.id === id) return actor;

  if (!canViewUsers(actor.is_super_admin)) {
    throw forbidden("You can only see your own data");
  }

  return toPublicUser(await loadUser(id));
};

export const PROFILE_BUCKET = "profile";

export const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type AvatarUpload = { buffer: Buffer; contentType: string };

const saveAvatar = async (userId: string, avatar: AvatarUpload): Promise<string> => {
  const bucket = supabaseAdmin().storage.from(PROFILE_BUCKET);

  const fileName = "avatar";
  const path = `${userId}/${fileName}`;

  const { error } = await bucket.upload(path, avatar.buffer, {
    contentType: avatar.contentType,
    upsert: true,
    cacheControl: "3600"
  });
  if (error) {
    logger.error({ error, userId }, "Avatar upload failed");
    throw new HttpError(500, "Could not upload the image");
  }

  const { data: files } = await bucket.list(userId);
  const leftovers = (files ?? []).filter((f) => f.name !== fileName).map((f) => `${userId}/${f.name}`);
  if (leftovers.length > 0) await bucket.remove(leftovers);

  return `${bucket.getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
};

export type UserChanges = {
  name?: string | undefined;
  date_of_birth?: string | undefined;
  phone?: string | undefined;
  avatar?: AvatarUpload | undefined;
  roles?: Role[] | undefined;
  is_super_admin?: boolean | undefined;
  is_active?: boolean | undefined;
};

export const updateUser = async (
  accessToken: string | undefined,
  id: string,
  changes: UserChanges
): Promise<PublicUser> => {
  const actor = await getUserFromToken(accessToken);
  const isSelf = actor.id === id;

  const touchesAccess =
    changes.roles !== undefined || changes.is_super_admin !== undefined || changes.is_active !== undefined;

  if (isSelf && touchesAccess) {
    throw forbidden("You can't change your own roles or access");
  }
  if (!isSelf && !canManageUsers(actor.is_super_admin)) {
    throw forbidden("You can only change your own data");
  }

  const user = await loadUser(id);
  const current = await toPublicUser(user);

  const savedPhone = user.phone ? `+${user.phone}` : "";
  if (changes.phone === "" && savedPhone !== "") {
    throw new HttpError(
      400,
      "A saved phone number can't be removed. Replace it with a new number instead.",
      "PHONE_REQUIRED"
    );
  }

  const { phone: _legacyPhone, ...metadata } = user.user_metadata;
  const avatar_url = changes.avatar !== undefined ? await saveAvatar(id, changes.avatar) : undefined;

  const newRoles =
    changes.roles !== undefined && !sameRoles(changes.roles, current.roles) ? changes.roles : null;
  const newActive =
    changes.is_active !== undefined && changes.is_active !== current.is_active ? changes.is_active : null;
  const newFlag =
    changes.is_super_admin !== undefined && changes.is_super_admin !== current.is_super_admin
      ? changes.is_super_admin
      : null;
  const newPhone =
    changes.phone !== undefined && changes.phone !== "" && changes.phone !== savedPhone ? changes.phone : null;

  const { data, error } = await supabaseAdmin().auth.admin.updateUserById(id, {
    user_metadata: {
      ...metadata,
      ...(changes.name !== undefined ? { name: changes.name } : {}),
      ...(changes.date_of_birth !== undefined ? { date_of_birth: changes.date_of_birth } : {}),
      ...(avatar_url !== undefined ? { avatar_url } : {})
    },
    ...(newRoles !== null ? { app_metadata: { roles: newRoles } } : {}),
    ...(newActive !== null ? { ban_duration: newActive ? "none" : INACTIVE_BAN } : {}),
    ...(newPhone !== null ? { phone: newPhone, phone_confirm: true } : {})
  });
  if (error?.code === "phone_exists") {
    throw new HttpError(409, "This phone number is already used by another account", "PHONE_TAKEN");
  }
  if (error || !data.user) throw new HttpError(500, "Could not save the changes");

  if (newFlag !== null) {
    const { error: flagError } = await supabaseAdmin().rpc("admin_set_is_super_admin", {
      target: id,
      value: newFlag
    });
    if (flagError) {
      throw new HttpError(
        503,
        "Can't change is_super_admin yet: run the SQL migration in Supabase first.",
        "MIGRATION_REQUIRED"
      );
    }
  }

  return toPublicUser(await loadUser(id));
};

