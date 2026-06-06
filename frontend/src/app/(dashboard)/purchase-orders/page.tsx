"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOCK_PURCHASE_ORDERS, MOCK_VENDORS } from "@/lib/dummyData"
import { Search, Printer, Download, Mail, Plus, X } from "lucide-react"

export default function PurchaseOrdersPage() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [subtotal, setSubtotal] = useState(0)

  const simulateAction = (action: string, po: string) => {
    alert(`Success! ${action} for ${po} triggered.`)
  }

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage issued POs.</p>
        </div>
        <button 
          onClick={() => setIsGenerateOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Generate PO
        </button>
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

      {/* Generate PO Modal */}
      <AnimatePresence>
        {isGenerateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card text-card-foreground border rounded-xl shadow-lg w-full max-w-lg flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Generate Purchase Order</h2>
                <button onClick={() => setIsGenerateOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Approved Quotation</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option>QT-2026-9901 (TechCorp Electronics)</option>
                    <option>QT-2026-9902 (OfficeSupplies Inc)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PO Number</label>
                    <input type="text" defaultValue="PO-2026-005" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Delivery Date</label>
                    <input type="date" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery Address</label>
                  <textarea rows={2} placeholder="Enter shipping address..." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Terms</label>
                  <textarea rows={2} placeholder="e.g. Net 30, Payment upon delivery..." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="border-t pt-4 mt-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Amount (₹)</label>
                    <input 
                      type="number" 
                      value={subtotal || ''}
                      onChange={(e) => setSubtotal(Number(e.target.value))}
                      placeholder="Enter confirmed amount..." 
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm" 
                    />
                  </div>
                  {subtotal > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Grand Total</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2 bg-muted/20">
                <button onClick={() => setIsGenerateOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                <button 
                  onClick={() => {
                    alert("Success! Purchase Order Generated.")
                    setIsGenerateOpen(false)
                  }} 
                  className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create PO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
