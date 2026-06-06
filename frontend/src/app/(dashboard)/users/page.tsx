"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, MoreHorizontal, X, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/apiClient"

export default function UsersPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users')
      return data.data
    }
  })

  const filteredUsers = users?.filter((user: any) => {
    const searchLower = searchTerm.toLowerCase();
    const name = user.name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const role = user.role?.toLowerCase() || '';
    return name.includes(searchLower) || email.includes(searchLower) || role.includes(searchLower);
  });

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage internal system users and their roles.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full appearance-none bg-background pl-8 shadow-none border rounded-md h-9 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center text-destructive">
                    Failed to load users.
                  </td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : filteredUsers?.map((user: any, index: number) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={user.id} 
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">{user.name}</td>
                  <td className="p-4 align-middle">{user.email}</td>
                  <td className="p-4 align-middle">{user.role}</td>
                  <td className="p-4 align-middle">
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.status === 'Active' ? 'border-transparent bg-primary text-primary-foreground' : 'border-transparent bg-secondary text-secondary-foreground'}`}>
                      {user.status}
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

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card text-card-foreground border rounded-xl shadow-lg w-full max-w-md flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Add New User</h2>
                <button onClick={() => setIsAddOpen(false)} className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input type="text" placeholder="e.g. Jane Doe" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input type="email" placeholder="jane@example.com" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option>Admin</option>
                    <option>Procurement Officer</option>
                    <option>Manager</option>
                    <option>Vendor</option>
                  </select>
                </div>
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                    Set as Active User
                  </label>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2 bg-muted/20">
                <button onClick={() => setIsAddOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-accent">Cancel</button>
                <button 
                  onClick={() => {
                    alert("Success! User created successfully.")
                    setIsAddOpen(false)
                  }} 
                  className="rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
