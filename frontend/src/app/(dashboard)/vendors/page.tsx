"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOCK_VENDORS } from "@/lib/dummyData"
import { Search, Plus, MoreHorizontal, Filter, X } from "lucide-react"

export default function VendorsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage your suppliers and vendors.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search vendors..."
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </button>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">GST Number</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rating</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {MOCK_VENDORS.map((vendor, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={vendor.id} 
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle font-medium">{vendor.companyName}</td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col">
                      <span>{vendor.contactName}</span>
                      <span className="text-xs text-muted-foreground">{vendor.email}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{vendor.category}</td>
                  <td className="p-4 align-middle text-muted-foreground font-mono text-xs">{vendor.gstNumber}</td>
                  <td className="p-4 align-middle">{vendor.rating} / 5.0</td>
                  <td className="p-4 align-middle">
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${vendor.status === 'Active' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                      {vendor.status}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card text-card-foreground border rounded-xl shadow-lg w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Add New Vendor</h2>
                <button onClick={() => setIsAddOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <input type="text" placeholder="e.g. TechCorp Electronics" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Person</label>
                    <input type="text" placeholder="e.g. John Smith" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GST Number</label>
                    <input type="text" placeholder="e.g. 27ABCDE1234F1Z5" className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono uppercase" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option>Hardware</option>
                    <option>Software</option>
                    <option>Office Supplies</option>
                    <option>Services</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2 bg-muted/20 mt-auto">
                <button onClick={() => setIsAddOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                <button 
                  onClick={() => {
                    alert("Success! Vendor added successfully.")
                    setIsAddOpen(false)
                  }} 
                  className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Vendor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
