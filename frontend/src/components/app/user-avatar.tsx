import { cn } from "@/lib/utils"
import type { User } from "@/types/auth"

function getInitials(name: string, email: string): string {
  const fromName = name
    .split(" ")
    .filter((word) => word !== "")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)

  return (fromName !== "" ? fromName : email.slice(0, 2)).toUpperCase()
}

type Props = { user: Pick<User, "name" | "email" | "avatar_url">; className: string }

export function UserAvatar({ user, className }: Props) {
  if (user.avatar_url !== "") {
    return (
      <img
        src={user.avatar_url}
        alt={user.name !== "" ? user.name : user.email}
        className={cn("shrink-0 rounded-lg object-cover", className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold",
        className
      )}
    >
      {getInitials(user.name, user.email)}
    </div>
  )
}
