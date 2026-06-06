"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const { activeRole } = useAuth()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products, vendors, rfqs..."
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 md:w-2/3 lg:w-1/3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <button className="relative h-8 w-8 rounded-full border bg-muted flex items-center justify-center hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
        </button>
        
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium leading-none">
              {activeRole === "Vendor" ? "TechCorp User" : "Sarah Jenkins"}
            </span>
            <span className="text-xs text-muted-foreground">{activeRole}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {activeRole === "Vendor" ? "TU" : "SJ"}
          </div>
        </div>
      </div>
    </header>
  )
}
