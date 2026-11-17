import { z } from "zod";

export const ROLES = ["user", "dev", "super_admin"] as const;
export type Role = (typeof ROLES)[number];

/** Shape we keep in Supabase `app_metadata` (only the server can write it). */
export type AppMetadata = { role: Role };

/**
 * Roles an admin may hand out. "super_admin" is never assigned through the app;
 * it exists only for the account created by the seed.
 */
export const ASSIGNABLE_ROLES = ["user", "dev"] as const;

/** Seed accounts start with is_super_admin on; after that it is toggled by hand. */
export const isSuperAdminRole = (role: Role): boolean =>
  role === "dev" || role === "super_admin";

/** Who may open the Users page: a `dev` or `super_admin` whose is_super_admin is on. */
export const canViewUsers = (role: Role, is_super_admin: boolean): boolean =>
  is_super_admin && (role === "dev" || role === "super_admin");

/** Who may change other users: only the `super_admin`, and only while is_super_admin is on. */
export const canManageUsers = (role: Role, is_super_admin: boolean): boolean =>
  is_super_admin && role === "super_admin";

export const buildAppMetadata = (role: Role): AppMetadata => ({ role });

const appMetadataSchema = z.object({
  role: z.enum(ROLES).catch("user")
});

/** Reads app_metadata safely; a missing or invalid role falls back to a plain user. */
export const readAppMetadata = (raw: object): AppMetadata => {
  const parsed = appMetadataSchema.parse(raw);
  return { role: parsed.role };
};
