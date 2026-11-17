import { createBrowserRouter, Navigate } from "react-router"

import { AppLayout } from "@/components/app/app-layout"
import { AccountsPage } from "@/pages/accounts"
import { CampaignsPage } from "@/pages/campaigns"
import { ForgotPasswordPage } from "@/pages/forgot-password"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { ResetPasswordPage } from "@/pages/reset-password"
import { SettingsPage } from "@/pages/settings"
import { SignUpPage } from "@/pages/signup"
import { VerifyEmailPage } from "@/pages/verify-email"
import { UsersPage } from "@/pages/users"
import { GuestOnly, RequireAuth, RequireUsersAccess } from "./guards"

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/campaigns", element: <CampaignsPage /> },
          { path: "/accounts", element: <AccountsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { element: <RequireUsersAccess />, children: [{ path: "/users", element: <UsersPage /> }] },
        ],
      },
    ],
  },
  {
    element: <GuestOnly />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
