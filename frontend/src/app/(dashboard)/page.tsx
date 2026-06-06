"use client"

import { motion, Variants } from "framer-motion"
import { Users, FileText, CheckSquare, ReceiptText, ArrowUpRight, ArrowDownRight, Briefcase, FileSignature, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function Dashboard() {
  const { activeRole } = useAuth()

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      if (activeRole === "VENDOR") return null;
      const { data } = await apiClient.get('/analytics/dashboard');
      return data.kpis;
    },
    enabled: activeRole !== "VENDOR",
  });

  const { data: approvalsData } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data } = await apiClient.get('/approvals?limit=3');
      return data.approvals;
    },
    enabled: activeRole === "MANAGER" || activeRole === "ADMIN",
  });

  const { data: logsData } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/activity-logs?limit=3');
      return data.logs;
    },
    enabled: activeRole !== "VENDOR",
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await apiClient.get('/invoices?limit=3');
      return data.invoices || [];
    },
    enabled: activeRole !== "VENDOR",
  });

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
    if (activeRole === "VENDOR") {
      return (
        <>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Assigned RFQs</h3>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1 text-emerald-500 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                View in RFQs tab
              </p>
            </div>
          </motion.div>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Pending Quotes</h3>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">Check Quotes Tab</p>
            </div>
          </motion.div>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Active POs</h3>
              <FileSignature className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">Pending delivery</p>
            </div>
          </motion.div>
        </>
      )
    }

    if (analyticsLoading) {
      return <div className="col-span-full flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    if (activeRole === "MANAGER") {
      return (
        <>
          <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Pending Approvals</h3>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{analytics?.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                Requires your attention
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
            <div className="text-2xl font-bold">{analytics?.totalVendors || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              Active across platform
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active RFQs</h3>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{analytics?.activeRfqs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention soon</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Approvals</h3>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{analytics?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              Awaiting manager signoff
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Spend</h3>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">₹{parseFloat(analytics?.monthlySpend || '0').toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              This month
            </p>
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeRole === "VENDOR" ? "Supplier Portal" : "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeRole === "VENDOR" 
              ? "Manage your assigned RFQs, submit quotes, and track purchase orders."
              : "Overview of procurement activities and pending tasks."}
          </p>
        </div>
        {activeRole !== "VENDOR" && activeRole !== "MANAGER" && (
          <Link href="/vendors" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Link>
        )}
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
        {activeRole !== "VENDOR" && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-4">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Recent Activities</h3>
              <p className="text-sm text-muted-foreground">Latest updates from the platform.</p>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-8">
                {logsData?.map((log: any) => (
                  <div key={log.id} className="flex items-center">
                    <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted">
                      <span className="flex h-full w-full items-center justify-center font-medium text-xs">
                        {log.actionType.substring(0, 2)}
                      </span>
                    </span>
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{log.actionType.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No recent activities.</p>}
              </div>
            </div>
          </div>
        )}
        
        {activeRole !== "VENDOR" && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-3">
            {(activeRole === "ADMIN" || activeRole === "MANAGER") && (
              <>
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="font-semibold leading-none tracking-tight">Action Items</h3>
                  <p className="text-sm text-muted-foreground">Tasks requiring your attention.</p>
                </div>
                <div className="p-6 pt-0">
                   <div className="space-y-4">
                      {approvalsData?.length > 0 ? approvalsData.map((approval: any) => (
                        <div key={approval.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{approval.rfq?.title || 'Pending Approval'}</p>
                            <p className="text-xs text-muted-foreground">Needs Approval • ₹{approval.quotation?.amount?.toLocaleString("en-IN") || '0'}</p>
                          </div>
                          <Link href="/approvals" className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground h-8 px-3 hover:bg-primary/90">
                            Review
                          </Link>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">No pending approvals.</p>}
                   </div>
                </div>
              </>
            )}
            
            <div className={`flex flex-col space-y-1.5 p-6 ${(activeRole === "ADMIN" || activeRole === "MANAGER") ? "border-t mt-4" : ""}`}>
              <h3 className="font-semibold leading-none tracking-tight">Recent Invoices</h3>
            </div>
            <div className="p-6 pt-0">
               <div className="space-y-4">
                  {invoicesData?.length > 0 ? invoicesData.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{invoice.purchaseOrder?.vendor?.companyName || 'Vendor'} • ₹{parseFloat(invoice.totalAmount).toLocaleString("en-IN")}</p>
                      </div>
                      <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{invoice.status}</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No recent invoices.</p>}
               </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
