"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Filter, ArrowRight, Paperclip, X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function RFQsPage() {
  const { activeRole } = useAuth()
  const queryClient = useQueryClient()
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [selectedRfq, setSelectedRfq] = useState<any>(null)

  // Create RFQ State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [category, setCategory] = useState("Hardware")
  const [deadline, setDeadline] = useState("")
  const [invitedVendorIds, setInvitedVendorIds] = useState<string[]>([])
  const [createError, setCreateError] = useState("")

  // Submit Quote State
  const [amount, setAmount] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [remarks, setRemarks] = useState("")
  const [quoteError, setQuoteError] = useState("")

  const { data: rfqsData, isLoading: rfqsLoading } = useQuery({
    queryKey: ['rfqs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rfqs')
      return data.rfqs
    }
  })

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/vendors')
      return data.vendors
    },
    enabled: activeRole !== "VENDOR"
  })

  const createRfqMutation = useMutation({
    mutationFn: async (newRfq: any) => {
      const { data } = await apiClient.post('/rfqs', newRfq)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
      setIsCreateOpen(false)
      setTitle("")
      setDescription("")
      setQuantity("")
      setCategory("Hardware")
      setDeadline("")
      setInvitedVendorIds([])
      setCreateError("")
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.message || "Failed to create RFQ.")
    }
  })

  const submitQuoteMutation = useMutation({
    mutationFn: async (quote: any) => {
      const { data } = await apiClient.post('/quotations', quote)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      setIsQuoteOpen(false)
      setAmount("")
      setDeliveryTime("")
      setRemarks("")
      setQuoteError("")
    },
    onError: (err: any) => {
      setQuoteError(err.response?.data?.message || "Failed to submit quote.")
    }
  })

  const handleActionClick = (rfq: any) => {
    if (activeRole === "VENDOR") {
      setSelectedRfq(rfq)
      setIsQuoteOpen(true)
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Append quantity to description since there's no quantity field in backend
    const fullDescription = quantity ? `${description}\n\nRequested Quantity: ${quantity}` : description;
    
    createRfqMutation.mutate({
      title,
      description: fullDescription,
      category,
      deadline,
      status: "Published",
      invitedVendorIds
    })
  }

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitQuoteMutation.mutate({
      rfqId: selectedRfq.id,
      amount: parseFloat(amount),
      deliveryTime: parseInt(deliveryTime, 10),
      remarks
    })
  }

  const toggleVendorSelection = (id: string) => {
    setInvitedVendorIds(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests for Quotation</h1>
          <p className="text-muted-foreground mt-1">Create and manage your RFQs.</p>
        </div>
        {(activeRole === "ADMIN" || activeRole === "OFFICER") && (
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

      {rfqsLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rfqsData?.length > 0 ? rfqsData.map((rfq: any, index: number) => (
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
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{rfq.description}</p>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between text-sm border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Deadline</span>
                    <span className="font-medium">{new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground text-xs">Category</span>
                    <span className="font-medium">{rfq.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center p-6 pt-0">
                <button 
                  onClick={() => handleActionClick(rfq)}
                  disabled={activeRole !== "VENDOR"}
                  className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  {activeRole === "VENDOR" ? "Submit Quotation" : "View Details"} <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center p-12 text-muted-foreground border rounded-xl border-dashed">
              No RFQs found.
            </div>
          )}
        </div>
      )}

      {/* RFQ Creation Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background text-foreground border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Create New RFQ</h2>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  {createError && (
                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                      {createError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">RFQ Title</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g., Q4 Hardware Refresh" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Product or service details..." className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity</label>
                      <input required value={quantity} onChange={e => setQuantity(e.target.value)} type="number" placeholder="100" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                        <option>Hardware</option>
                        <option>Software</option>
                        <option>Office Supplies</option>
                        <option>Services</option>
                        <option>IT</option>
                        <option>Furniture</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline</label>
                    <input required value={deadline} onChange={e => setDeadline(e.target.value)} type="date" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign Vendors</label>
                    <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                      {vendorsData?.map((v: any) => (
                        <label key={v.id} className="flex items-center space-x-2 p-1 hover:bg-muted rounded-md cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={invitedVendorIds.includes(v.id)}
                            onChange={() => toggleVendorSelection(v.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{v.companyName} ({v.vendorCode})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-2 bg-muted/20">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                  <button type="submit" disabled={createRfqMutation.isPending} className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 inline-flex items-center">
                    {createRfqMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publish RFQ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quotation Submission Modal */}
      <AnimatePresence>
        {isQuoteOpen && selectedRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background text-foreground border rounded-xl shadow-lg w-full max-w-lg"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Submit Quotation</h2>
                <button onClick={() => setIsQuoteOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleQuoteSubmit}>
                <div className="p-6 space-y-4">
                  {quoteError && (
                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                      {quoteError}
                    </div>
                  )}
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm font-medium text-muted-foreground">RFQ Reference</p>
                    <p className="font-semibold">{selectedRfq.title} ({selectedRfq.rfqNumber})</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Pricing (₹)</label>
                    <input required value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" placeholder="Enter total amount..." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimated Delivery (Days)</label>
                    <input required value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} type="number" placeholder="e.g., 14" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes / Terms</label>
                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Payment terms, warranty notes..." className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]" />
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-2 bg-muted/20">
                  <button type="button" onClick={() => setIsQuoteOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                  <button type="submit" disabled={submitQuoteMutation.isPending} className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 inline-flex items-center">
                    {submitQuoteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Quote
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
