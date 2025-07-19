"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { clearUserId } from "@/lib/auth"
import { HomeIcon, LogOutIcon, MenuIcon } from "lucide-react"

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    clearUserId()
    router.push("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Hamburger menu for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:bg-muted"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-lg font-semibold text-foreground hover:bg-transparent hover:text-primary"
        >
          <HomeIcon className="h-6 w-6 text-accent" /> {/* Using accent for icon */}
          <span>Family Docs</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
      >
        <LogOutIcon className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </header>
  )
}
