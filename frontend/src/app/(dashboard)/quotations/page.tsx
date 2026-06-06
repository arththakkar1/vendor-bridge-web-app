"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, GitCompare, X, Award, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"
import { useAuth } from "@/contexts/auth-context"

export default function QuotationsPage() {
  const { activeRole } = useAuth()
  const queryClient = useQueryClient()
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: quotationsData, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/quotations')
      return data.quotations || []
    }
  })

  const selectQuoteMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      const { data } = await apiClient.post('/quotations/select', { quotationId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      setIsCompareOpen(false)
      setSelectedQuotes([])
    }
  })

  const minAmount = quotationsData && quotationsData.length > 0 
    ? Math.min(...quotationsData.map((q: any) => parseFloat(q.amount))) 
    : 0

  const toggleSelect = (id: string) => {
    setSelectedQuotes(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    )
  }

  const handleCompare = () => {
    if (selectedQuotes.length > 0) setIsCompareOpen(true)
  }

  const handleNominate = (id: string) => {
    selectQuoteMutation.mutate(id)
  }

  const filteredQuotations = quotationsData?.filter((quote: any) => {
    const searchLower = searchTerm.toLowerCase();
    const vendorName = quote.vendor?.companyName?.toLowerCase() || '';
    const rfqTitle = quote.rfq?.title?.toLowerCase() || '';
    const quoteNumber = quote.quotationNumber?.toLowerCase() || '';
    return vendorName.includes(searchLower) || rfqTitle.includes(searchLower) || quoteNumber.includes(searchLower);
  });

  return (
    <div className="flex flex-col gap-6 relative">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button 
            onClick={handleCompare}
            disabled={selectedQuotes.length === 0}
            className="ml-auto inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <GitCompare className="mr-2 h-4 w-4" /> Compare Selected ({selectedQuotes.length})
          </button>
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[40px]"></th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quote ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">RFQ</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendor</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Delivery</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredQuotations?.length > 0 ? filteredQuotations.map((quote: any, index: number) => {
                  const amount = parseFloat(quote.amount);
                  const isLowest = amount === minAmount && amount > 0;
                  const isSelected = selectedQuotes.includes(quote.id)

                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={quote.id} 
                      className={`border-b transition-colors hover:bg-muted/50 ${isLowest ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : ''}`}
                    >
                      <td className="p-4 align-middle">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelect(quote.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-4 align-middle font-medium">{quote.quotationNumber}</td>
                      <td className="p-4 align-middle">{quote.rfq?.rfqNumber || quote.rfqId}</td>
                      <td className="p-4 align-middle">{quote.vendor?.companyName || quote.vendorId}</td>
                      <td className="p-4 align-middle font-semibold flex items-center gap-2">
                        ₹{amount.toLocaleString("en-IN")}
                        {isLowest && <Award className="h-4 w-4 text-emerald-600" />}
                      </td>
                      <td className="p-4 align-middle">{quote.deliveryTime} Days</td>
                      <td className="p-4 align-middle">
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${quote.status === 'Under_Review' ? 'border-transparent bg-secondary text-secondary-foreground' : 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'}`}>
                          {quote.status.replace('_', ' ')}
                        </div>
                      </td>
                    </motion.tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-muted-foreground">No quotations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Compare Modal */}
      <AnimatePresence>
        {isCompareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background text-foreground border rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Side-by-Side Comparison</h2>
                <button onClick={() => setIsCompareOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedQuotes.map(id => {
                    const quote = quotationsData?.find((q: any) => q.id === id)
                    if (!quote) return null;
                    const amount = parseFloat(quote.amount);

                    return (
                      <div key={id} className="border rounded-lg p-4 space-y-4 bg-muted/20 relative">
                        {amount === minAmount && (
                          <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Award className="h-3 w-3" /> BEST PRICE
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{quote.vendor?.companyName || quote.vendorId}</h3>
                          <p className="text-sm text-muted-foreground">{quote.rfq?.title || quote.rfqId}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-semibold text-lg">₹{amount.toLocaleString("en-IN")}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Delivery</p>
                            <p className="font-medium">{quote.deliveryTime} Days</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vendor Rating</p>
                            <p className="font-medium text-amber-500">{parseFloat(quote.vendor?.rating || '0').toFixed(1)} ★</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium">{quote.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <button 
                            onClick={() => handleNominate(quote.id)} 
                            disabled={selectQuoteMutation.isPending || (activeRole !== "ADMIN" && activeRole !== "OFFICER")}
                            className="w-full rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 inline-flex justify-center items-center"
                          >
                            {selectQuoteMutation.isPending && selectQuoteMutation.variables === quote.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Select & Nominate for Approval
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
