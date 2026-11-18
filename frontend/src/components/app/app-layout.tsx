import { MenuIcon } from "lucide-react"
import { Outlet } from "react-router"

import { AppSidebar } from "@/components/app/app-sidebar"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function useSidebarClosed(): boolean {
  const { open, openMobile, isMobile } = useSidebar()
  return isMobile ? !openMobile : !open
}

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

function PageContent() {
  const closed = useSidebarClosed()

  return (
    <main className={cn("flex-1 p-6 transition-[padding] duration-200", closed && "pt-16")}>
      <Outlet />
    </main>
  )
}

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
