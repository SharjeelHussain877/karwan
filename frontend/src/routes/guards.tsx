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

function useAuth() {
  const user = useAppSelector((state) => state.auth.user)
  const sessionActive = useAppSelector((state) => state.auth.sessionActive)
  const { isLoading } = useMeQuery(undefined, { skip: !sessionActive || user !== null })

  return { user, isLoading: sessionActive && user === null && isLoading }
}

export function RequireAuth() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Splash />
  return user !== null ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestOnly() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Splash />
  return user !== null ? <Navigate to="/" replace /> : <Outlet />
}

export function RequireUsersAccess() {
  const user = useAppSelector((state) => state.auth.user)

  return user !== null && canViewUsers(user) ? <Outlet /> : <Navigate to="/" replace />
}
