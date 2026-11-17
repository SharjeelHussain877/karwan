import type { Role } from "@/types/auth"

type Account = { role: Role; is_super_admin: boolean }

/** Who sees the Users menu and page: a dev or super_admin whose is_super_admin is on. */
export const canViewUsers = (account: Account): boolean =>
  account.is_super_admin && (account.role === "dev" || account.role === "super_admin")

/** Who may change other users: only the super_admin, while is_super_admin is on. */
export const canManageUsers = (account: Account): boolean =>
  account.is_super_admin && account.role === "super_admin"
