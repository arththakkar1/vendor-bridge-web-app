"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Printer, Download, Mail, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: purchaseOrdersData, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/purchase-orders')
      return data.purchaseOrders || []
    }
  })

  const handlePdfDownload = (id: string) => {
    // We open the API endpoint in a new tab to let the browser handle the PDF stream
    window.open(`http://localhost:5000/api/v1/purchase-orders/${id}/pdf`, '_blank')
  }

  const simulateAction = (action: string, po: string) => {
    alert(`Action: ${action} for ${po} triggered.`)
  }

  const filteredPOs = purchaseOrdersData?.filter((po: any) => {
    const searchLower = searchTerm.toLowerCase();
    const poNumber = po.poNumber?.toLowerCase() || '';
    const vendorName = po.vendor?.companyName?.toLowerCase() || '';
    return poNumber.includes(searchLower) || vendorName.includes(searchLower);
  });

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage automatically generated POs.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search POs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                {filteredPOs?.length > 0 ? filteredPOs.map((po: any, index: number) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={po.id} 
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">{po.poNumber}</td>
                    <td className="p-4 align-middle">{po.vendor?.companyName || po.vendorId}</td>
                    <td className="p-4 align-middle">{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 align-middle font-semibold">₹{parseFloat(po.totalAmount).toLocaleString("en-IN")}</td>
                    <td className="p-4 align-middle">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary text-primary-foreground">
                        {po.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle flex gap-2">
                      <button 
                        onClick={() => handlePdfDownload(po.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8" 
                        title="Print / View PDF"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handlePdfDownload(po.id)}
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
                )) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No purchase orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
