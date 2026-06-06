"use client"

import { motion } from "framer-motion"
import { MOCK_RFQS } from "@/lib/dummyData"
import { Search, Plus, Filter, ArrowRight } from "lucide-react"

export default function RFQsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests for Quotation</h1>
          <p className="text-muted-foreground mt-1">Create and manage your RFQs.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create RFQ
        </button>
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
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Deadline</span>
                  <span className="font-medium">{rfq.deadline}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-muted-foreground text-xs">Invited Vendors</span>
                  <span className="font-medium">{rfq.vendorCount}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center p-6 pt-0">
              <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
