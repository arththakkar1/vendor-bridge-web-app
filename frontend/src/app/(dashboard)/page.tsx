"use client"

import { motion, Variants } from "framer-motion"
import { Users, FileText, CheckSquare, ReceiptText, ArrowUpRight, ArrowDownRight, Briefcase, FileSignature } from "lucide-react"
import { MOCK_RFQS, MOCK_APPROVALS, MOCK_VENDORS } from "@/lib/dummyData"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { activeRole } = useAuth()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  // Define role-based cards
  const renderCards = () => {
    if (activeRole === "Vendor") {
      return (
        <>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Assigned RFQs</h3>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground mt-1 text-emerald-500 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                2 new this week
              </p>
            </div>
          </motion.div>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Pending Quotes</h3>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground mt-1">Due in 2 days</p>
            </div>
          </motion.div>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Active POs</h3>
              <FileSignature className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">Pending delivery</p>
            </div>
          </motion.div>
        </>
      )
    }

    if (activeRole === "Manager") {
      return (
        <>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Pending Approvals</h3>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{MOCK_APPROVALS.length}</div>
              <p className="text-xs text-muted-foreground mt-1 text-rose-500 flex items-center">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                Delayed by 2 days
              </p>
            </div>
          </motion.div>
        </>
      )
    }

    // Default: Admin & Procurement Officer
    return (
      <>
        <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Vendors</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{MOCK_VENDORS.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +2 from last month
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active RFQs</h3>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{MOCK_RFQS.filter(r => r.status === "Published").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention soon</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Approvals</h3>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{MOCK_APPROVALS.length}</div>
            <p className="text-xs text-muted-foreground mt-1 text-rose-500 flex items-center">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              Delayed by 2 days
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Spend (YTD)</h3>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">$1,234,567</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +12% vs last year
            </p>
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {activeRole === "Vendor" ? "Supplier Portal" : "Dashboard"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {activeRole === "Vendor" 
            ? "Manage your assigned RFQs, submit quotes, and track purchase orders."
            : "Overview of procurement activities and pending tasks."}
        </p>
      </div>

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {renderCards()}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-4">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activities</h3>
            <p className="text-sm text-muted-foreground">Latest updates from the platform.</p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted">
                    <span className="flex h-full w-full items-center justify-center font-medium">PO</span>
                  </span>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Purchase Order Generated</p>
                    <p className="text-sm text-muted-foreground">PO-2026-890{i} created for TechCorp</p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">Just now</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {activeRole !== "Vendor" && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-3">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Action Items</h3>
              <p className="text-sm text-muted-foreground">Tasks requiring your attention.</p>
            </div>
            <div className="p-6 pt-0">
               <div className="space-y-4">
                  {MOCK_APPROVALS.map(approval => (
                    <div key={approval.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{approval.rfqTitle}</p>
                        <p className="text-xs text-muted-foreground">Needs Approval • ${approval.amount.toLocaleString("en-US")}</p>
                      </div>
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-8 px-3 hover:bg-primary/90">
                        Review
                      </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
