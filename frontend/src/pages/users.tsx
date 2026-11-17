import { useEffect, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { UserAvatar } from "@/components/app/user-avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { AssignableRole, ManagedUser } from "@/types/auth"

const ASSIGNABLE_ROLES: AssignableRole[] = ["user", "dev"]

/** Every row is the same height, which is what lets the list be virtualized. */
const ROW_HEIGHT = 64
const HEADER_HEIGHT = 40
/** How many placeholder rows show before the first page arrives, and under a page still loading. */
const FIRST_LOAD_ROWS = 2
const NEXT_PAGE_ROWS = 2
/** Start loading the next page when this close to the end of what is loaded. */
const LOAD_AHEAD = 5

const COLUMNS =
  "grid grid-cols-[minmax(0,1fr)_8rem_9rem_6rem] items-center gap-4 px-4"

function isAssignableRole(value: string | null): value is AssignableRole {
  return value === "user" || value === "dev"
}

/** Rows are divided by a line on top (not below), so the list ends cleanly with no footer line. */
const rowBorder = (first: boolean) => (first ? "" : "border-t")

function SkeletonRow({ first }: { first: boolean }) {
  return (
    <div
      role="row"
      aria-hidden="true"
      className={`${COLUMNS} h-full ${rowBorder(first)}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-[18px] w-8 rounded-full" />
      <Skeleton className="h-[18px] w-8 rounded-full" />
    </div>
  )
}

export function UsersPage() {
  // The virtualizer is not compatible with the React Compiler, so this page opts out of it.
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

  // Only the rows on screen (plus a few around them) exist in the page.
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

  // Infinite loading: near the end of the loaded users, fetch the next 30.
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

  // Every change sends the user's id in the URL and their full new state as the payload.
  const save = async (
    user: ManagedUser,
    next: { role: AssignableRole; is_super_admin: boolean; is_active: boolean },
    message: string
  ) => {
    setBusyId(user.id)
    const result = await updateUser({ id: user.id, ...next })
    setBusyId("")

    if (result.error) {
      toast(getErrorMessage(result.error))
      return
    }

    // Swap the saved row into the list right away instead of reloading every page.
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
    // The super admin's own row is fixed: its role is never changed and the flag stays on.
    const editable = canEdit && user.role !== "super_admin"
    const busy = busyId === user.id
    // Rows that can be edited are never super_admin, so their role is user or dev.
    const editableRole: AssignableRole = user.role === "dev" ? "dev" : "user"

    return (
      <div role="row" className={`${COLUMNS} h-full ${rowBorder(first)}`}>
        <div role="cell" className="flex min-w-0 items-center gap-3">
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

        <div role="cell">
          {editable ? (
            <Select
              value={user.role}
              disabled={busy}
              onValueChange={(value) => {
                if (isAssignableRole(value) && value !== user.role) {
                  void save(
                    user,
                    {
                      role: value,
                      is_super_admin: user.is_super_admin,
                      is_active: user.is_active,
                    },
                    `${user.email} is now ${value}`
                  )
                }
              }}
            >
              <SelectTrigger
                className="w-28"
                aria-label={`Role for ${user.email}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-0">
                {ASSIGNABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm">{user.role}</span>
          )}
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
                    role: editableRole,
                    is_super_admin: checked,
                    is_active: user.is_active,
                  },
                  `is_super_admin ${checked ? "on" : "off"} for ${user.email}`
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
                    role: editableRole,
                    is_super_admin: user.is_super_admin,
                    is_active: checked,
                  },
                  `${user.email} is now ${checked ? "active" : "inactive"}`
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

  // No table at all unless there is something to show (or it is still loading).
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
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-2 text-muted-foreground">
        {canEdit
          ? "Everyone else on DadSmith. Change a role, turn is_super_admin on or off, or deactivate an account."
          : "Everyone else on DadSmith. Only the super admin can make changes."}
      </p>

      {showTable ? (
        /* The title, the text above and the column headings stay put; only the rows load. */
        <div role="table" className="mt-8 overflow-hidden rounded-xl border">
          <div
            ref={scrollRef}
            className="max-h-[calc(100svh-17rem)] overflow-y-auto"
          >
            <div
              role="row"
              style={{ height: HEADER_HEIGHT }}
              className={`${COLUMNS} sticky top-0 z-10 border-b bg-background text-sm font-medium text-muted-foreground`}
            >
              <span role="columnheader">User</span>
              <span role="columnheader">Role</span>
              <span role="columnheader">is_super_admin</span>
              <span role="columnheader">Active</span>
            </div>
            {body}
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
              : "Users will show up here once they join DadSmith."}
          </p>
        </div>
      )}
    </div>
  )
}
