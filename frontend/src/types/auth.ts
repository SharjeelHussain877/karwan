export type Role = "user" | "dev"

export type User = {
  id: string
  email: string
  name: string
  avatar_url: string
  phone: string
  date_of_birth: string
  email_verified: boolean
  roles: Role[]
  is_super_admin: boolean
  is_active: boolean
  created_at: string
}

export type UserResponse = { success: boolean; data: { user: User } }
export type MessageResponse = { success: boolean; message: string }
export type SignUpResponse = {
  success: boolean
  message: string
  data: { user: User | null; verificationRequired: boolean }
}

export type ErrorBody = { success: boolean; code: string; message: string }

export type ApiError = { status: number; code: string; message: string }

export type SignUpBody = { name: string; email: string; password: string }
export type LoginBody = { email: string; password: string }
export type ProfileBody = { id: string; name: string; date_of_birth: string; avatar: File | null }
export type EmailBody = { email: string }

export type ResetPasswordBody = { accessToken: string; tokenHash: string; password: string }
export type VerifyEmailBody = { accessToken: string; refreshToken: string; tokenHash: string }

export type ManagedUser = {
  id: string
  email: string
  name: string
  avatar_url: string
  roles: Role[]
  is_super_admin: boolean
  is_active: boolean
  created_at: string
}
export type UsersPageResponse = {
  success: boolean
  data: { users: ManagedUser[]; nextOffset: number | null; total: number }
}
export type ManagedUserResponse = { success: boolean; data: { user: ManagedUser } }
