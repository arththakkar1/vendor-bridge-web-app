"use client"

import { motion } from "framer-motion"
import { Search, History, Filter, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function ActivityLogsPage() {
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/activity-logs')
      return data.logs || []
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground mt-1">Immutable audit ledger of all system activities.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
          <Filter className="mr-2 h-4 w-4" /> Filter Logs
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search logs by action, user, or ID..."
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Timestamp</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Performed By</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Entity ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {logsData?.length > 0 ? logsData.map((log: any, index: number) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={log.id} 
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 align-middle font-medium flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      {log.actionType.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 align-middle">{log.user?.name || log.userId}</td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{log.entityId}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {log.details}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No activity logs found.</td>
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
