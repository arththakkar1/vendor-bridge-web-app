"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, MoreHorizontal, Filter, X, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function VendorsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  // Form state
  const [companyName, setCompanyName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [category, setCategory] = useState("Hardware")
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/vendors')
      return data.vendors
    }
  })

  const addVendorMutation = useMutation({
    mutationFn: async (newVendor: any) => {
      const { data } = await apiClient.post('/vendors', newVendor)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      setIsAddOpen(false)
      // Reset form
      setCompanyName("")
      setContactName("")
      setEmail("")
      setPhone("")
      setGstNumber("")
      setCategory("Hardware")
      setAddress("")
      setError("")
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create vendor.")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addVendorMutation.mutate({
      companyName,
      contactName,
      email,
      phone,
      gstNumber,
      category,
      address
    })
  }

  const filteredVendors = vendorsData?.filter((vendor: any) => {
    const matchesSearch = vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="inline-flex appearance-none items-center justify-center rounded-md text-sm font-medium border bg-background h-9 pl-9 pr-8 py-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
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
                {filteredVendors?.length > 0 ? filteredVendors.map((vendor: any, index: number) => (
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
                    <td className="p-4 align-middle">{parseFloat(vendor.rating).toFixed(1)} / 5.0</td>
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
                )) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">No vendors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
              className="bg-background text-foreground border rounded-xl shadow-lg w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Add New Vendor</h2>
                <button onClick={() => setIsAddOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4">
                  {error && (
                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <input required value={companyName} onChange={e => setCompanyName(e.target.value)} type="text" placeholder="e.g. TechCorp Electronics" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Person</label>
                      <input required value={contactName} onChange={e => setContactName(e.target.value)} type="text" placeholder="e.g. John Smith" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="john@example.com" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">GST Number</label>
                      <input required value={gstNumber} onChange={e => setGstNumber(e.target.value)} type="text" placeholder="e.g. 27ABCDE1234F1Z5" className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono uppercase" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <input required value={address} onChange={e => setAddress(e.target.value)} type="text" placeholder="e.g. 101 Industrial Area, Pune" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option>Hardware</option>
                      <option>Software</option>
                      <option>Office Supplies</option>
                      <option>Services</option>
                      <option>IT</option>
                      <option>Furniture</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-2 bg-muted/20 mt-auto">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                  <button 
                    type="submit"
                    disabled={addVendorMutation.isPending}
                    className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 inline-flex items-center"
                  >
                    {addVendorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Vendor
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
