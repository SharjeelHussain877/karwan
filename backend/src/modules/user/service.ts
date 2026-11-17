import { z } from "zod";

import { supabaseAdmin } from "../../config/supabase.js";
import { HttpError } from "../../utils/http-error.js";
import { warnMigrationMissing } from "../../utils/migration-warning.js";
import logger from "../../utils/logger.js";
import {
  ROLES,
  canManageUsers,
  canViewUsers,
  isSuperAdminRole,
  readAppMetadata
} from "../auth/roles.js";
import { getUserFromToken, isAccountActive, toPublicUser, type PublicUser } from "../auth/service.js";

/**
 * One user as the list sees it. The field names are the database's own
 * (auth.users columns / metadata keys) and are used unchanged in the SQL function,
 * here, in the API payloads and in the frontend.
 */
const rowSchema = z.object({
  id: z.string(),
  email: z.string().nullable().transform((value) => value ?? ""),
  name: z.string().nullable().transform((value) => value ?? ""),
  avatar_url: z.string().nullable().transform((value) => value ?? ""),
  role: z.enum(ROLES).catch("user"),
  is_super_admin: z.boolean().nullable().transform((value) => value === true),
  is_active: z.boolean().nullable().transform((value) => value !== false),
  created_at: z.string()
});

export type ManagedUser = z.infer<typeof rowSchema>;

/**
 * Without the SQL migration the is_super_admin column is out of reach, so the list is
 * built from the Admin API and the flag falls back to "on for dev and super_admin".
 */
const fetchAllFromAdminApi = async (): Promise<ManagedUser[]> => {
  const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new HttpError(500, "Could not load users");

  return data.users.map((user) => {
    const { role } = readAppMetadata(user.app_metadata);
    const name: unknown = user.user_metadata.name;
    const avatar: unknown = user.user_metadata.avatar_url;
    return {
      id: user.id,
      email: user.email ?? "",
      name: typeof name === "string" ? name : "",
      avatar_url: typeof avatar === "string" ? avatar : "",
      role,
      is_super_admin: isSuperAdminRole(role),
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

/** "Inactive" is a ban that effectively never ends (100 years). Active clears it. */
const INACTIVE_BAN = "876000h";

// ---------- who may do what ----------

const forbidden = (message: string) => new HttpError(403, message, "FORBIDDEN");

const requireViewer = async (accessToken: string | undefined): Promise<PublicUser> => {
  const viewer = await getUserFromToken(accessToken);
  if (!canViewUsers(viewer.role, viewer.is_super_admin)) {
    throw forbidden("You don't have access to this page");
  }
  return viewer;
};

// ---------- GET /user ----------

export type UsersPage = {
  users: ManagedUser[];
  /** Where the next page starts, or null when this was the last one. */
  nextOffset: number | null;
  /** How many users there are in total (the signed-in user is not counted). */
  total: number;
};

/**
 * One page of everyone except the signed-in user, oldest account first.
 * Only a super_admin can see super_admin accounts; for every other role they are
 * left out, and the total and the paging don't count them either.
 * The page is cut from the full list, which is fine for a user base this size.
 */
export const listUsers = async (
  accessToken: string | undefined,
  offset: number,
  limit: number
): Promise<UsersPage> => {
  const viewer = await requireViewer(accessToken);
  const others = (await fetchAll()).filter(
    (user) => user.id !== viewer.id && (viewer.role === "super_admin" || user.role !== "super_admin")
  );

  const users = others.slice(offset, offset + limit);
  const next = offset + users.length;

  return { users, nextOffset: next < others.length ? next : null, total: others.length };
};

// ---------- GET /user/:id ----------

const loadUser = async (id: string) => {
  const { data, error } = await supabaseAdmin().auth.admin.getUserById(id);
  if (error || !data.user) throw new HttpError(404, "User not found", "NOT_FOUND");
  return data.user;
};

/**
 * One user's full data. Your own id always works. Someone else's needs the same access
 * as the list, and a super_admin account is invisible (404) to every other role.
 */
export const getUser = async (accessToken: string | undefined, id: string): Promise<PublicUser> => {
  const actor = await getUserFromToken(accessToken);
  if (actor.id === id) return actor;

  if (!canViewUsers(actor.role, actor.is_super_admin)) {
    throw forbidden("You can only see your own data");
  }

  const target = await toPublicUser(await loadUser(id));
  if (target.role === "super_admin" && actor.role !== "super_admin") {
    throw new HttpError(404, "User not found", "NOT_FOUND");
  }
  return target;
};

// ---------- PATCH /user/:id ----------

export const PROFILE_BUCKET = "profile";

export const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type AvatarUpload = { buffer: Buffer; contentType: string };

/**
 * Stores the image in the public "profile" bucket and returns its URL.
 *
 * Every user has exactly one file, `<user id>/avatar`. A new upload replaces it
 * in place instead of adding another file.
 */
const saveAvatar = async (userId: string, avatar: AvatarUpload): Promise<string> => {
  const bucket = supabaseAdmin().storage.from(PROFILE_BUCKET);

  const fileName = "avatar";
  const path = `${userId}/${fileName}`;

  const { error } = await bucket.upload(path, avatar.buffer, {
    contentType: avatar.contentType,
    upsert: true, // replace the existing photo
    cacheControl: "3600"
  });
  if (error) {
    logger.error({ error, userId }, "Avatar upload failed");
    throw new HttpError(500, "Could not upload the image");
  }

  // Clear out files left behind by earlier versions that used a new name per upload.
  const { data: files } = await bucket.list(userId);
  const leftovers = (files ?? []).filter((f) => f.name !== fileName).map((f) => `${userId}/${f.name}`);
  if (leftovers.length > 0) await bucket.remove(leftovers);

  // The file URL never changes, so a version query makes browsers fetch the new image.
  return `${bucket.getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
};

export type UserChanges = {
  // profile fields
  name?: string | undefined;
  date_of_birth?: string | undefined;
  phone?: string | undefined;
  avatar?: AvatarUpload | undefined;
  // access fields
  role?: "user" | "dev" | undefined;
  is_super_admin?: boolean | undefined;
  is_active?: boolean | undefined;
};

/**
 * Updates the user in the URL with whatever is in the payload.
 *
 *  - Your own id: you may change your profile fields (name, date_of_birth, phone, avatar).
 *    Your own role / is_super_admin / is_active are never changeable.
 *  - Anyone else's id: only the super_admin (with is_super_admin on) may, for any field.
 *    The super admin's own account can't be changed by anyone else.
 *
 * Only values that differ from the current ones are written. Profile fields go into
 * auth metadata (phone into the auth user's own `phone`), role into app_metadata,
 * is_active as a ban, and is_super_admin through the SQL function.
 */
export const updateUser = async (
  accessToken: string | undefined,
  id: string,
  changes: UserChanges
): Promise<PublicUser> => {
  const actor = await getUserFromToken(accessToken);
  const isSelf = actor.id === id;

  const touchesAccess =
    changes.role !== undefined || changes.is_super_admin !== undefined || changes.is_active !== undefined;

  if (isSelf && touchesAccess) {
    throw forbidden("You can't change your own role or access");
  }
  if (!isSelf && !canManageUsers(actor.role, actor.is_super_admin)) {
    throw forbidden("You can only change your own data");
  }

  const user = await loadUser(id);
  const current = await toPublicUser(user);
  if (!isSelf && current.role === "super_admin") {
    throw forbidden("The super admin can't be changed");
  }

  const savedPhone = user.phone ? `+${user.phone}` : "";
  if (changes.phone === "" && savedPhone !== "") {
    throw new HttpError(
      400,
      "A saved phone number can't be removed. Replace it with a new number instead.",
      "PHONE_REQUIRED"
    );
  }

  // Older versions kept the phone in metadata; drop that copy.
  const { phone: _legacyPhone, ...metadata } = user.user_metadata;
  const avatar_url = changes.avatar !== undefined ? await saveAvatar(id, changes.avatar) : undefined;

  // null = leave as it is (not sent, or the same as now)
  const newRole = changes.role !== undefined && changes.role !== current.role ? changes.role : null;
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
    ...(newRole !== null ? { app_metadata: { ...readAppMetadata(user.app_metadata), role: newRole } } : {}),
    ...(newActive !== null ? { ban_duration: newActive ? "none" : INACTIVE_BAN } : {}),
    // phone_confirm: no SMS is sent; the number is simply stored.
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

