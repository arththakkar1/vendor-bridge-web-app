"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Mail, FileDown, Printer, Loader2, Check } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient()

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await apiClient.get('/invoices')
      return data.invoices || []
    }
  })

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/invoices/${id}/pay`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
    }
  })

  const emailMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/invoices/${id}/email`)
      return data
    }
  })

  const handlePdfDownload = (id: string) => {
    window.open(`http://localhost:5000/api/v1/invoices/${id}/pdf`, '_blank')
  }

  const handlePay = (id: string) => {
    payMutation.mutate(id)
  }

  const handleEmail = (id: string) => {
    emailMutation.mutate(id, {
      onSuccess: () => alert("Success! Invoice emailed to vendor."),
      onError: (err: any) => alert(err.response?.data?.message || "Failed to email invoice.")
    })
  }

  const filteredInvoices = invoicesData?.filter((invoice: any) => {
    const searchLower = searchTerm.toLowerCase();
    const invNumber = invoice.invoiceNumber?.toLowerCase() || '';
    const vendorName = invoice.purchaseOrder?.vendor?.companyName?.toLowerCase() || '';
    return invNumber.includes(searchLower) || vendorName.includes(searchLower);
  });

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage vendor billing and payments.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search invoices..."
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Invoice #</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendor</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Due Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredInvoices?.length > 0 ? filteredInvoices.map((invoice: any, index: number) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={invoice.id} 
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">{invoice.invoiceNumber}</td>
                    <td className="p-4 align-middle">{invoice.purchaseOrder?.vendor?.companyName || 'Vendor'}</td>
                    <td className="p-4 align-middle">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="p-4 align-middle font-semibold">₹{parseFloat(invoice.totalAmount).toLocaleString("en-IN")}</td>
                    <td className="p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${invoice.status === 'Paid' ? 'border-transparent bg-emerald-500/10 text-emerald-600' : 'border-transparent bg-secondary text-secondary-foreground'}`}>
                        {invoice.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle flex gap-2">
                      <button 
                        onClick={() => handlePdfDownload(invoice.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8" 
                        title="Print / View PDF"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handlePdfDownload(invoice.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8" 
                        title="Download PDF"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEmail(invoice.id)}
                        disabled={emailMutation.isPending && emailMutation.variables === invoice.id}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 disabled:opacity-50" 
                        title="Email Vendor"
                      >
                        {emailMutation.isPending && emailMutation.variables === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      </button>
                      {invoice.status !== 'Paid' && (
                        <button 
                          onClick={() => handlePay(invoice.id)}
                          disabled={payMutation.isPending && payMutation.variables === invoice.id}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-8 px-3 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 ml-2 transition-colors disabled:opacity-50"
                        >
                          {payMutation.isPending && payMutation.variables === invoice.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No invoices found.</td>
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
