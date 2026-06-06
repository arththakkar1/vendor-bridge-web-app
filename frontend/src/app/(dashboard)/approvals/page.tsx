"use client"

import { motion } from "framer-motion"
import { MOCK_APPROVALS } from "@/lib/dummyData"
import { CheckSquare, XSquare, Search } from "lucide-react"

export default function ApprovalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals Queue</h1>
          <p className="text-muted-foreground mt-1">Review and action pending procurement requests.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {MOCK_APPROVALS.map((approval, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={approval.id} 
            className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden"
          >
            <div className="p-6 md:flex items-start justify-between gap-6 border-b">
              <div className="space-y-1 mb-4 md:mb-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{approval.rfqTitle}</h3>
                  <span className="text-xs font-semibold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">{approval.status}</span>
                </div>
                <div className="text-sm text-muted-foreground flex gap-4 mt-2">
                  <span>Requested by: {approval.requestedBy}</span>
                  <span>Date: {approval.date}</span>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-muted-foreground">
                  <span className="mr-2">Timeline:</span> 
                  <span className="text-primary">{approval.timeline}</span>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2 shrink-0">
                <div className="text-2xl font-bold">₹{approval.amount.toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div className="p-6 bg-muted/30">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block">Approval Remarks</label>
                  <input
                    type="text"
                    defaultValue={approval.remarks}
                    placeholder="Enter your remarks or justification here..."
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
                    <XSquare className="mr-2 h-4 w-4" /> Reject
                  </button>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90 transition-colors">
                    <CheckSquare className="mr-2 h-4 w-4" /> Approve
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
