"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, ClipboardList, CheckSquare, FileSignature, ReceiptText, Activity, UserCog, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Role } from "@/lib/dummyData"

// Define base links
const ALL_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: UserCog }, // Added for Admin
  { name: "Vendors", href: "/vendors", icon: Users },
  { name: "RFQs", href: "/rfqs", icon: FileText },
  { name: "Quotations", href: "/quotations", icon: ClipboardList },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Purchase Orders", href: "/purchase-orders", icon: FileSignature },
  { name: "Invoices", href: "/invoices", icon: ReceiptText },
  { name: "Reports & Analytics", href: "/reports-analytics", icon: BarChart3 },
  { name: "Activity Logs", href: "/activity-logs", icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()
  const { activeRole } = useAuth()

  // Filter links based on strictly defined role responsibilities
  const getNavItems = (role: Role) => {
    switch (role) {
      case "Admin":
        return ALL_LINKS.filter(item => 
          ["Dashboard", "Users", "Vendors", "Reports & Analytics", "Activity Logs"].includes(item.name)
        )
      case "Procurement Officer":
        return ALL_LINKS.filter(item => 
          ["Dashboard", "RFQs", "Quotations", "Purchase Orders", "Invoices"].includes(item.name)
        )
      case "Vendor":
        return ALL_LINKS.filter(item => 
          ["Dashboard", "RFQs", "Quotations", "Purchase Orders"].includes(item.name)
        )
      case "Manager":
        return ALL_LINKS.filter(item => 
          ["Dashboard", "Approvals", "Activity Logs", "Reports & Analytics"].includes(item.name)
        )
      default:
        return []
    }
  }

  const navItems = getNavItems(activeRole)

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg tracking-tight">VendorBridge</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
