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
            <div className="p-6 md:flex items-center justify-between gap-6">
              <div className="space-y-1 mb-4 md:mb-0">
                <h3 className="font-semibold text-lg">{approval.rfqTitle}</h3>
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span>Requested by: {approval.requestedBy}</span>
                  <span>Date: {approval.date}</span>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div className="text-2xl font-bold">${approval.amount.toLocaleString()}</div>
                <div className="flex gap-2 mt-2 md:mt-0">
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
