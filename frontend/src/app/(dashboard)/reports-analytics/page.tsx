"use client"

import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Download } from "lucide-react"

export default function ReportsAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">View procurement trends, supplier performance, and spend analytics.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for actual charts */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 min-h-[300px] justify-center items-center text-center"
        >
          <BarChart3 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">Spend by Category</h3>
          <p className="text-sm text-muted-foreground mt-2">Chart visualization will be rendered here.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 min-h-[300px] justify-center items-center text-center"
        >
          <TrendingUp className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">Supplier Performance Trend</h3>
          <p className="text-sm text-muted-foreground mt-2">Chart visualization will be rendered here.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 min-h-[300px] justify-center items-center text-center"
        >
          <BarChart3 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">RFQ Conversion Rate</h3>
          <p className="text-sm text-muted-foreground mt-2">Chart visualization will be rendered here.</p>
        </motion.div>
      </div>
    </div>
  )
}
