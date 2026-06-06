"use client"

import { motion } from "framer-motion"
import { MOCK_QUOTATIONS, MOCK_RFQS, MOCK_VENDORS } from "@/lib/dummyData"
import { Search, GitCompare } from "lucide-react"

export default function QuotationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground mt-1">Review vendor bids and compare quotations.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search quotations..."
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button className="ml-auto inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            <GitCompare className="mr-2 h-4 w-4" /> Compare Selected
          </button>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quote ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">RFQ</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendor</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Delivery</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {MOCK_QUOTATIONS.map((quote, index) => {
                const vendor = MOCK_VENDORS.find(v => v.id === quote.vendorId)
                const rfq = MOCK_RFQS.find(r => r.id === quote.rfqId)
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={quote.id} 
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                  >
                    <td className="p-4 align-middle font-medium">{quote.id.toUpperCase()}</td>
                    <td className="p-4 align-middle">{rfq?.rfqNumber}</td>
                    <td className="p-4 align-middle">{vendor?.companyName}</td>
                    <td className="p-4 align-middle font-semibold">${quote.amount.toLocaleString("en-US")}</td>
                    <td className="p-4 align-middle">{quote.deliveryTime}</td>
                    <td className="p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${quote.status === 'Under Review' ? 'border-transparent bg-secondary text-secondary-foreground' : 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'}`}>
                        {quote.status}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
