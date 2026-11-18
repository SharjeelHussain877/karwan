import { useEffect, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { UserAvatar } from "@/components/app/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { getErrorMessage } from "@/lib/errors"
import { canManageUsers } from "@/lib/permissions"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  baseApi,
  useListUsersInfiniteQuery,
  useUpdateUserMutation,
} from "@/store/api"
import type { ManagedUser, Role } from "@/types/auth"

const ROW_HEIGHT = 64
const HEADER_HEIGHT = 40
const FIRST_LOAD_ROWS = 2
const NEXT_PAGE_ROWS = 2
const LOAD_AHEAD = 5

const COLUMNS =
  "grid grid-cols-[minmax(0,1fr)_10rem_9rem_6rem] items-center gap-4 px-4"

const rowBorder = (first: boolean) => (first ? "" : "border-t")

function SkeletonRow({ first }: { first: boolean }) {
  return (
    <div
      role="row"
      aria-hidden="true"
      className={`${COLUMNS} h-full ${rowBorder(first)}`}
    >
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-[18px] w-8 rounded-full" />
        <Skeleton className="h-5 w-9 rounded-full" />
      </div>
      <Skeleton className="h-[18px] w-8 rounded-full" />
      <Skeleton className="h-[18px] w-8 rounded-full" />
    </div>
  )
}

export function UsersPage() {
  "use no memo"

  const me = useAppSelector((state) => state.auth.user)
  const { data, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useListUsersInfiniteQuery()
  const dispatch = useAppDispatch()
  const [updateUser] = useUpdateUserMutation()
  const [busyId, setBusyId] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const users: ManagedUser[] =
    data === undefined ? [] : data.pages.flatMap((page) => page.data.users)
  const firstLoad = data === undefined && !error
  const tailRows = hasNextPage ? NEXT_PAGE_ROWS : 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: users.length + tailRows,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
    scrollMargin: HEADER_HEIGHT,
    getItemKey: (index) =>
      index < users.length ? users[index].id : `loading-${index}`,
  })
  const virtualRows = virtualizer.getVirtualItems()
  const lastVisible =
    virtualRows.length > 0 ? virtualRows[virtualRows.length - 1].index : -1

  useEffect(() => {
    if (
      lastVisible >= users.length - LOAD_AHEAD &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage()
    }
  }, [
    lastVisible,
    users.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  if (me === null) return null

  const canEdit = canManageUsers(me)

  const save = async (
    user: ManagedUser,
    next: { roles: Role[]; is_super_admin: boolean; is_active: boolean },
    message: string
  ) => {
    setBusyId(user.id)
    const result = await updateUser({ id: user.id, ...next })
    setBusyId("")

    if (result.error) {
      toast(getErrorMessage(result.error))
      return
    }

    const saved = result.data.data.user
    dispatch(
      baseApi.util.updateQueryData("listUsers", undefined, (draft) => {
        for (const page of draft.pages) {
          const index = page.data.users.findIndex((row) => row.id === saved.id)
          if (index !== -1) page.data.users[index] = saved
        }
      })
    )
    toast(message)
  }

  const renderUser = (user: ManagedUser, first: boolean) => {
    const editable = canEdit
    const busy = busyId === user.id
    const isDev = user.roles.includes("dev")

    return (
      <div role="row" className={`${COLUMNS} h-full ${rowBorder(first)}`}>
        <div role="cell" className="flex min-w-0 items-center gap-2">
          <UserAvatar user={user} className="size-9" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user.name !== "" ? user.name : user.email}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div role="cell" className="flex items-center gap-1 text-sm">
          <Badge variant="success">user</Badge>
          {editable ? (
            <Switch
              checked={isDev}
              disabled={busy}
              title="Dev role"
              aria-label={`dev role for ${user.email}`}
              onCheckedChange={(checked) =>
                void save(
                  user,
                  {
                    roles: checked ? ["user", "dev"] : ["user"],
                    is_super_admin: user.is_super_admin,
                    is_active: user.is_active,
                  },
                  `Dev role ${checked ? "added to" : "removed from"} ${user.email}`
                )
              }
            />
          ) : null}
          {isDev && <Badge variant="warning">dev</Badge>}
        </div>

        <div role="cell">
          {editable ? (
            <Switch
              checked={user.is_super_admin}
              disabled={busy}
              aria-label={`is_super_admin for ${user.email}`}
              onCheckedChange={(checked) =>
                void save(
                  user,
                  {
                    roles: user.roles,
                    is_super_admin: checked,
                    is_active: user.is_active,
                  },
                  `Super admin access turned ${checked ? "on" : "off"} for ${user.email}`
                )
              }
            />
          ) : (
            <span className="text-sm">
              {user.is_super_admin ? "true" : "false"}
            </span>
          )}
        </div>

        <div role="cell">
          {editable ? (
            <Switch
              checked={user.is_active}
              disabled={busy}
              aria-label={`Active for ${user.email}`}
              onCheckedChange={(checked) =>
                void save(
                  user,
                  {
                    roles: user.roles,
                    is_super_admin: user.is_super_admin,
                    is_active: checked,
                  },
                  `Account ${checked ? "activated" : "deactivated"}: ${user.email}`
                )
              }
            />
          ) : (
            <span className="text-sm">
              {user.is_active ? "Active" : "Inactive"}
            </span>
          )}
        </div>
      </div>
    )
  }

  const showTable = firstLoad || (!error && users.length > 0)

  let body
  if (firstLoad) {
    body = Array.from({ length: FIRST_LOAD_ROWS }, (_, index) => (
      <div key={index} style={{ height: ROW_HEIGHT }}>
        <SkeletonRow first={index === 0} />
      </div>
    ))
  } else {
    body = (
      <div
        role="rowgroup"
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualRows.map((row) => (
          <div
            key={row.key}
            data-index={row.index}
            className="absolute top-0 left-0 w-full"
            style={{
              height: ROW_HEIGHT,
              transform: `translateY(${row.start - HEADER_HEIGHT}px)`,
            }}
          >
            {row.index < users.length ? (
              renderUser(users[row.index], row.index === 0)
            ) : (
              <SkeletonRow first={false} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-2 text-muted-foreground">
        {canEdit
          ? "Everyone else on AdSync. Add or remove the dev role, turn is_super_admin on or off, or deactivate an account."
          : "Everyone else on AdSync. Only a super admin can make changes."}
      </p>

      {showTable ? (
        <div role="table" className="mt-8 overflow-hidden rounded-xl border">
          <div
            ref={scrollRef}
            className="max-h-[calc(100svh-17rem)] overflow-auto"
          >
            <div className="min-w-[42rem]">
              <div
                role="row"
                style={{ height: HEADER_HEIGHT }}
                className={`${COLUMNS} sticky top-0 z-10 border-b bg-background text-sm font-medium text-muted-foreground`}
              >
                <span role="columnheader">User</span>
                <span role="columnheader">Roles</span>
                <span role="columnheader">is_super_admin</span>
                <span role="columnheader">Active</span>
              </div>
              {body}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <UsersIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">
            {error ? "Couldn't load users" : "No data yet"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {error
              ? getErrorMessage(error)
              : "Users will show up here once they join AdSync."}
          </p>
        </div>
      )}
    </div>
  )
}
