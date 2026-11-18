import { createApi } from "@reduxjs/toolkit/query/react"

import type {
  EmailBody,
  Role,
  LoginBody,
  ManagedUserResponse,
  MessageResponse,
  ProfileBody,
  ResetPasswordBody,
  SignUpBody,
  SignUpResponse,
  UserResponse,
  UsersPageResponse,
  VerifyEmailBody,
} from "@/types/auth"
import { axiosBaseQuery } from "./axios-base-query"

export const USERS_PAGE_SIZE = 30

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  endpoints: (build) => ({
    me: build.query<UserResponse, void>({
      query: () => ({ url: "/auth/me", method: "GET", body: null }),
    }),
    signUp: build.mutation<SignUpResponse, SignUpBody>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
    }),
    login: build.mutation<UserResponse, LoginBody>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    updateProfile: build.mutation<UserResponse, ProfileBody>({
      query: ({ id, name, date_of_birth, avatar }) => {
        const form = new FormData()
        form.append("name", name)
        form.append("date_of_birth", date_of_birth)
        if (avatar !== null) form.append("avatar", avatar)
        return { url: `/user/${id}`, method: "PATCH", body: form }
      },
    }),
    listUsers: build.infiniteQuery<UsersPageResponse, void, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.data.nextOffset,
      },
      query: ({ pageParam }) => ({
        url: `/user?offset=${pageParam}&limit=${USERS_PAGE_SIZE}`,
        method: "GET",
        body: null,
      }),
    }),
    updateUser: build.mutation<ManagedUserResponse, { id: string; roles: Role[]; is_super_admin: boolean; is_active: boolean }>({
      query: ({ id, roles, is_super_admin, is_active }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: { roles, is_super_admin, is_active },
      }),
    }),
    logout: build.mutation<MessageResponse, void>({
      query: () => ({ url: "/auth/logout", method: "POST", body: null }),
    }),
    forgotPassword: build.mutation<MessageResponse, EmailBody>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: build.mutation<MessageResponse, ResetPasswordBody>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    verifyEmail: build.mutation<UserResponse, VerifyEmailBody>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    resendVerification: build.mutation<MessageResponse, EmailBody>({
      query: (body) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const {
  useMeQuery,
  useSignUpMutation,
  useLoginMutation,
  useListUsersInfiniteQuery,
  useUpdateUserMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = baseApi
