export type Role = "user" | "dev" | "super_admin"

export type User = {
  id: string
  email: string
  name: string
  /** Public URL of the profile photo; "" when none. */
  avatar_url: string
  /** "" when not set. */
  phone: string
  /** YYYY-MM-DD, or "" when not set. */
  date_of_birth: string
  email_verified: boolean
  role: Role
  /** The auth.users.is_super_admin column. */
  is_super_admin: boolean
  /** false while the account is deactivated and cannot sign in. */
  is_active: boolean
  created_at: string
}

/** Every response body from the backend. */
export type UserResponse = { success: boolean; data: { user: User } }
export type MessageResponse = { success: boolean; message: string }
export type SignUpResponse = {
  success: boolean
  message: string
  data: { user: User | null; verificationRequired: boolean }
}

/** Error body from the backend; `code` is always present ("ERROR" when generic). */
export type ErrorBody = { success: boolean; code: string; message: string }

/** What RTK Query exposes when a request fails. `status` is 0 when the server is unreachable. */
export type ApiError = { status: number; code: string; message: string }

export type SignUpBody = { name: string; email: string; password: string }
export type LoginBody = { email: string; password: string }
/** `id` is the user being updated (your own). `avatar` is the new photo, or null to keep the current one. */
export type ProfileBody = { id: string; name: string; date_of_birth: string; avatar: File | null }
export type EmailBody = { email: string }

/** Missing tokens are sent as empty strings. */
export type ResetPasswordBody = { accessToken: string; tokenHash: string; password: string }
export type VerifyEmailBody = { accessToken: string; refreshToken: string; tokenHash: string }

/** A row on the Users page (admin API). */
export type ManagedUser = {
  id: string
  email: string
  name: string
  avatar_url: string
  role: Role
  is_super_admin: boolean
  is_active: boolean
  created_at: string
}
/** One page of the Users list. `nextOffset` is null on the last page. */
export type UsersPageResponse = {
  success: boolean
  data: { users: ManagedUser[]; nextOffset: number | null; total: number }
}
export type ManagedUserResponse = { success: boolean; data: { user: ManagedUser } }

/** Roles that can be handed out. "super_admin" is never assigned from the app. */
export type AssignableRole = "user" | "dev"
