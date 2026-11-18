type Account = { is_super_admin: boolean }

export const canViewUsers = (account: Account): boolean => account.is_super_admin

export const canManageUsers = (account: Account): boolean => account.is_super_admin
