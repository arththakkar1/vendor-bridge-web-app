"use client"

import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Download, PieChart, Loader2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function ReportsAnalyticsPage() {
  const { data: spendingData, isLoading: spendingLoading } = useQuery({
    queryKey: ['analytics', 'spending'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/spending')
      // Map API format { month: '2026-01', total: '48200.00' } to chart format
      return data.spending.map((s: any) => ({
        name: s.month,
        spend: parseFloat(s.total)
      }))
    }
  })

  // We could also fetch /analytics/vendors for supplier performance, 
  // but using static summary text for those cards as they are illustrative in the UI
  // unless we want to build out a full vendor analytics backend.

  const handleExport = (type: 'procurement' | 'vendor-performance') => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.open(`${baseUrl}/analytics/export/${type}`, '_blank');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">View procurement trends, supplier performance, and spend analytics.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('procurement')} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            <Download className="mr-2 h-4 w-4" /> Export Procurement
          </button>
          <button onClick={() => handleExport('vendor-performance')} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            <Download className="mr-2 h-4 w-4" /> Export Vendor Perf
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 col-span-1 md:col-span-2 lg:col-span-3 min-h-[400px]"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Monthly Procurement Trends</h3>
            <p className="text-sm text-muted-foreground">Total spend overview across recent months.</p>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            {spendingLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : spendingData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
                      "Spend",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                No spending data available.
              </div>
            )}
          </div>
        </motion.div>

        {/* Sub Charts */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 min-h-[300px] justify-center items-center text-center"
        >
          <PieChart className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">Spend by Category</h3>
          <p className="text-sm text-muted-foreground mt-2">Hardware accounts for 65% of total spend.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 min-h-[300px] justify-center items-center text-center"
        >
          <TrendingUp className="h-10 w-10 text-emerald-500 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Supplier Performance</h3>
          <p className="text-sm text-muted-foreground mt-2">Average vendor rating is currently stable.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col p-6 min-h-[300px] justify-center items-center text-center"
        >
          <BarChart3 className="h-10 w-10 text-primary mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">RFQ Conversion</h3>
          <p className="text-sm text-muted-foreground mt-2">Majority of RFQs convert to Purchase Orders within 14 days.</p>
        </motion.div>
      </div>
    </div>
  )
}
