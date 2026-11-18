import type { ComponentType } from "react"
import { Link, useLocation } from "react-router"
import {
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  PanelLeftCloseIcon,
  PlugIcon,
  UsersIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { canViewUsers } from "@/lib/permissions"
import { UserAvatar } from "@/components/app/user-avatar"
import { useAppSelector } from "@/store"

type NavItem = {
  title: string
  to: string
  icon: ComponentType<{ className?: string }>
}

/** The three default options. */
const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", to: "/", icon: LayoutDashboardIcon },
  { title: "Campaigns", to: "/campaigns", icon: MegaphoneIcon },
  { title: "Connected accounts", to: "/accounts", icon: PlugIcon },
]

/** Listed with the others, but only for dev / super_admin accounts whose is_super_admin is on. */
const USERS_ITEM: NavItem = { title: "Users", to: "/users", icon: UsersIcon }

export function AppSidebar() {
  const { pathname } = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const { isMobile, setOpenMobile, toggleSidebar } = useSidebar()

  // On phones, picking a menu item closes the sidebar (the hamburger brings it back).
  // On bigger screens it stays open.
  const closeSidebarOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  if (user === null) return null

  const navItems = canViewUsers(user) ? [...NAV_ITEMS, USERS_ITEM] : NAV_ITEMS

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link to="/" />} onClick={closeSidebarOnMobile}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                  D
                </div>
                <span className="text-base font-semibold tracking-tight">AdSync</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Button variant="ghost" size="icon" aria-label="Close sidebar" onClick={toggleSidebar}>
            <PanelLeftCloseIcon />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.to}
                    render={<Link to={item.to} />}
                    onClick={closeSidebarOnMobile}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Profile: clicking it opens the settings page. */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Settings"
              isActive={pathname === "/settings"}
              render={<Link to="/settings" />}
              onClick={closeSidebarOnMobile}
            >
              <UserAvatar user={user} className="size-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name !== "" ? user.name : user.email}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
