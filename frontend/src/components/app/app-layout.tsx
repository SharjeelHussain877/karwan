import { MenuIcon } from "lucide-react"
import { Outlet } from "react-router"

import { AppSidebar } from "@/components/app/app-sidebar"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** True while the sidebar is hidden (on phones that is whenever the sheet is not open). */
function useSidebarClosed(): boolean {
  const { open, openMobile, isMobile } = useSidebar()
  return isMobile ? !openMobile : !open
}

/** When the sidebar is closed, this hamburger is all that is left on screen. */
function OpenSidebarButton() {
  const { toggleSidebar } = useSidebar()
  const closed = useSidebarClosed()

  if (!closed) return null

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Open sidebar"
      onClick={toggleSidebar}
      className="fixed top-3 left-3 z-30"
    >
      <MenuIcon />
    </Button>
  )
}

/** The page. Room is left at the top only while the hamburger is showing. */
function PageContent() {
  const closed = useSidebarClosed()

  return (
    <main className={cn("flex-1 p-6 transition-[padding] duration-200", closed && "pt-16")}>
      <Outlet />
    </main>
  )
}

/** Shell for every signed-in page: sidebar on the left, page on the right. No top bar. */
export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <OpenSidebarButton />
          <PageContent />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
