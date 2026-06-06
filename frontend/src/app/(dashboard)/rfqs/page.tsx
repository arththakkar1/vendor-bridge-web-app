"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOCK_RFQS } from "@/lib/dummyData"
import { Search, Plus, Filter, ArrowRight, Paperclip, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function RFQsPage() {
  const { activeRole } = useAuth()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [selectedRfq, setSelectedRfq] = useState<any>(null)

  const handleActionClick = (rfq: any) => {
    if (activeRole === "Vendor") {
      setSelectedRfq(rfq)
      setIsQuoteOpen(true)
    }
  }

  const simulateSubmit = (closeFn: () => void) => {
    alert("Success! Action simulated successfully.")
    closeFn()
  }

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests for Quotation</h1>
          <p className="text-muted-foreground mt-1">Create and manage your RFQs.</p>
        </div>
        {activeRole !== "Vendor" && (
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Create RFQ
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search RFQs..."
            className="w-full appearance-none bg-background pl-8 shadow-sm border rounded-md h-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_RFQS.map((rfq, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={rfq.id} 
            className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col transition-all hover:shadow-md"
          >
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{rfq.rfqNumber}</span>
                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  rfq.status === 'Published' ? 'border-transparent bg-primary text-primary-foreground' : 
                  rfq.status === 'Draft' ? 'border-transparent bg-secondary text-secondary-foreground' : 
                  'border-border text-foreground'
                }`}>
                  {rfq.status}
                </div>
              </div>
              <h3 className="font-semibold leading-none tracking-tight mt-2 text-lg">{rfq.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{rfq.description}</p>
            </div>
            <div className="p-6 pt-0 mt-auto">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-24">Quantity:</span>
                  <span className="font-medium">{rfq.quantity} units</span>
                </div>
                {rfq.attachments && rfq.attachments.length > 0 && (
                  <div className="flex items-start text-sm">
                    <span className="text-muted-foreground w-24">Attachments:</span>
                    <div className="flex flex-col gap-1">
                      {rfq.attachments.map((att, i) => (
                        <div key={i} className="flex items-center text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md w-fit">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {att}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {rfq.assignedVendors && rfq.assignedVendors.length > 0 && (
                  <div className="flex items-start text-sm">
                    <span className="text-muted-foreground w-24">Vendors:</span>
                    <div className="flex flex-wrap gap-1 flex-1">
                      {rfq.assignedVendors.map((v, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-md border">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Deadline</span>
                  <span className="font-medium">{rfq.deadline}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-muted-foreground text-xs">Invited</span>
                  <span className="font-medium">{rfq.vendorCount}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center p-6 pt-0">
              <button 
                onClick={() => handleActionClick(rfq)}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                {activeRole === "Vendor" ? "Submit Quotation" : "View Details"} <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* RFQ Creation Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card text-card-foreground border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Create New RFQ</h2>
                <button onClick={() => setIsCreateOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">RFQ Title</label>
                  <input type="text" placeholder="e.g., Q4 Hardware Refresh" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea placeholder="Product or service details..." className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <input type="number" placeholder="100" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline</label>
                    <input type="date" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachments</label>
                  <input type="file" multiple className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Vendors</label>
                  <select multiple className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]">
                    <option>TechCorp Electronics</option>
                    <option>OfficeSupplies Inc</option>
                    <option>CloudNet Services</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button onClick={() => setIsCreateOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                <button onClick={() => simulateSubmit(() => setIsCreateOpen(false))} className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">Publish RFQ</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quotation Submission Modal */}
      <AnimatePresence>
        {isQuoteOpen && selectedRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card text-card-foreground border rounded-xl shadow-lg w-full max-w-lg"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Submit Quotation</h2>
                <button onClick={() => setIsQuoteOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RFQ Reference</p>
                  <p className="font-semibold">{selectedRfq.title} ({selectedRfq.rfqNumber})</p>
                  <p className="text-sm mt-1">Requested Quantity: {selectedRfq.quantity} units</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Pricing (₹)</label>
                  <input type="number" placeholder="Enter total amount..." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Delivery (Days)</label>
                  <input type="number" placeholder="e.g., 14" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes / Terms</label>
                  <textarea placeholder="Payment terms, warranty notes..." className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]" />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button onClick={() => setIsQuoteOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                <button onClick={() => simulateSubmit(() => setIsQuoteOpen(false))} className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">Submit Quote</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
