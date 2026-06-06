"use client"

import { motion } from "framer-motion"
import { MOCK_PURCHASE_ORDERS, MOCK_VENDORS } from "@/lib/dummyData"
import { Search, Printer, Download, Mail } from "lucide-react"

export default function PurchaseOrdersPage() {
  const simulateAction = (action: string, po: string) => {
    alert(`Success! ${action} for ${po} triggered.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage issued POs.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search POs..."
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">PO Number</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendor</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Issued</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {MOCK_PURCHASE_ORDERS.map((po, index) => {
                const vendor = MOCK_VENDORS.find(v => v.id === po.vendorId)
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={po.id} 
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">{po.poNumber}</td>
                    <td className="p-4 align-middle">{vendor?.companyName}</td>
                    <td className="p-4 align-middle">{po.date}</td>
                    <td className="p-4 align-middle font-semibold">₹{po.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="p-4 align-middle">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary text-primary-foreground">
                        {po.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle flex gap-2">
                      <button 
                        onClick={() => simulateAction("Print", po.poNumber)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8" 
                        title="Print"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => simulateAction("Download PDF", po.poNumber)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8" 
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => simulateAction("Email to Vendor", po.poNumber)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8" 
                        title="Email Vendor"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
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
