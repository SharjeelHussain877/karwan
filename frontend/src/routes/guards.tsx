import { Loader2Icon } from "lucide-react"
import { Navigate, Outlet } from "react-router"

import { canViewUsers } from "@/lib/permissions"
import { useMeQuery } from "@/store/api"
import { useAppSelector } from "@/store"

function Splash() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

/**
 * Restores the user after a page reload. /auth/me is only requested when a
 * login happened in this browser and the user isn't already in the store.
 */
function useAuth() {
  const user = useAppSelector((state) => state.auth.user)
  const sessionActive = useAppSelector((state) => state.auth.sessionActive)
  const { isLoading } = useMeQuery(undefined, { skip: !sessionActive || user !== null })

  return { user, isLoading: sessionActive && user === null && isLoading }
}

/** Only for signed-in, email-verified users. */
export function RequireAuth() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Splash />
  return user !== null ? <Outlet /> : <Navigate to="/login" replace />
}

/** Login / signup / forgot password: signed-in users are sent home. */
export function GuestOnly() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Splash />
  return user !== null ? <Navigate to="/" replace /> : <Outlet />
}

/** The Users page: only for accounts that may see it. Everyone else goes home. */
export function RequireUsersAccess() {
  const user = useAppSelector((state) => state.auth.user)

  return user !== null && canViewUsers(user) ? <Outlet /> : <Navigate to="/" replace />
}
