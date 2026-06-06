"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckSquare, XSquare, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function ApprovalsPage() {
  const queryClient = useQueryClient()
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({})
  const [actionError, setActionError] = useState<{ [key: string]: string }>({})

  const { data: approvalsData, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data } = await apiClient.get('/approvals')
      return data.approvals || []
    }
  })

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, remark }: { id: string, action: 'Approved' | 'Rejected', remark: string }) => {
      const { data } = await apiClient.post(`/approvals/${id}/action`, { action, remarks: remark })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (err: any, variables) => {
      setActionError(prev => ({
        ...prev,
        [variables.id]: err.response?.data?.message || `Failed to ${variables.action.toLowerCase()} request.`
      }))
    }
  })

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    actionMutation.mutate({ id, action, remark: remarks[id] || "" })
  }

  const handleRemarkChange = (id: string, value: string) => {
    setRemarks(prev => ({ ...prev, [id]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals Queue</h1>
          <p className="text-muted-foreground mt-1">Review and action pending procurement requests.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center p-12 border rounded-xl border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : approvalsData?.length > 0 ? (
          approvalsData.map((approval: any, index: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={approval.id} 
              className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden"
            >
              <div className="p-6 md:flex items-start justify-between gap-6 border-b">
                <div className="space-y-1 mb-4 md:mb-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{approval.quotation?.rfq?.title || 'RFQ Reference'}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      approval.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                      approval.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {approval.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-4 mt-2">
                    <span>Vendor: {approval.quotation?.vendor?.companyName}</span>
                    <span>Date: {new Date(approval.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-muted-foreground">
                    <span className="mr-2">Delivery Time:</span> 
                    <span className="text-primary">{approval.quotation?.deliveryTime} Days</span>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2 shrink-0">
                  <div className="text-2xl font-bold">₹{parseFloat(approval.quotation?.amount || '0').toLocaleString("en-IN")}</div>
                </div>
              </div>
              {approval.status === 'Pending' && (
                <div className="p-6 bg-muted/30">
                  {actionError[approval.id] && (
                    <div className="mb-4 p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                      {actionError[approval.id]}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1.5 block">Approval Remarks</label>
                      <input
                        type="text"
                        value={remarks[approval.id] || ""}
                        onChange={(e) => handleRemarkChange(approval.id, e.target.value)}
                        placeholder="Enter your remarks or justification here..."
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <button 
                        onClick={() => handleAction(approval.id, 'Rejected')}
                        disabled={actionMutation.isPending}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors disabled:opacity-50"
                      >
                        {actionMutation.isPending && actionMutation.variables?.id === approval.id && actionMutation.variables?.action === 'Rejected' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XSquare className="mr-2 h-4 w-4" />}
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAction(approval.id, 'Approved')}
                        disabled={actionMutation.isPending}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {actionMutation.isPending && actionMutation.variables?.id === approval.id && actionMutation.variables?.action === 'Approved' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare className="mr-2 h-4 w-4" />}
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground border rounded-xl border-dashed">
            No pending approvals found.
          </div>
        )}
      </div>
    </div>
  )
}
