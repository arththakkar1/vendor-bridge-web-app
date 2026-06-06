"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

export function Navbar() {
  const { activeRole, user } = useAuth()
  console.log(user)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 relative">
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
        
        <div className="relative">
          <button 
            className="relative h-8 w-8 rounded-full border bg-muted flex items-center justify-center hover:bg-accent transition-colors focus:outline-none"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-md outline-none z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold">Notification Center</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">3 New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">Invoice Generated</p>
                  <p className="text-xs text-muted-foreground mt-1">Invoice INV-2026-992 was auto-generated for TechCorp.</p>
                  <p className="text-[10px] text-muted-foreground mt-2">Just now</p>
                </div>
                <div className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">Approval Required</p>
                  <p className="text-xs text-muted-foreground mt-1">Q3 Laptop Procurement requires your approval.</p>
                  <p className="text-[10px] text-muted-foreground mt-2">10 mins ago</p>
                </div>
                <div className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">New Quotation Received</p>
                  <p className="text-xs text-muted-foreground mt-1">TechCorp Electronics submitted a bid for RFQ-2026-001.</p>
                  <p className="text-[10px] text-muted-foreground mt-2">1 hour ago</p>
                </div>
              </div>
              <div className="p-2 border-t text-center">
                <button className="text-xs text-primary font-medium hover:underline">Mark all as read</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium leading-none">
              {user?.name || "User"}
            </span>
            <span className="text-xs text-muted-foreground">{activeRole}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium uppercase">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : "U"}
          </div>
        </div>
      </div>
    </header>
  )
}
