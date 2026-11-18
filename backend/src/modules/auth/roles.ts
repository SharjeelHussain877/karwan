import { z } from "zod";

export const ROLES = ["user", "dev"] as const;
export type Role = (typeof ROLES)[number];

export type AppMetadata = { roles: Role[] };

export const ALLOWED_ROLE_SETS: readonly (readonly Role[])[] = [["user"], ["user", "dev"]];

export const sameRoles = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((role, index) => role === b[index]);

export const isValidRoles = (roles: readonly string[]): roles is Role[] =>
  ALLOWED_ROLE_SETS.some((allowed) => sameRoles(allowed, roles));

export const canViewUsers = (is_super_admin: boolean): boolean => is_super_admin;
export const canManageUsers = (is_super_admin: boolean): boolean => is_super_admin;

export const buildAppMetadata = (roles: Role[]): AppMetadata => ({ roles });

const storedRolesSchema = z.object({ roles: z.array(z.string()) });

export const readAppMetadata = (raw: object): AppMetadata => {
  const parsed = storedRolesSchema.safeParse(raw);
  return { roles: parsed.success && isValidRoles(parsed.data.roles) ? parsed.data.roles : ["user"] };
};
