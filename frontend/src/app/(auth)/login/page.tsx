"use client"

import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import apiClient from "@/lib/apiClient"

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true)
    setError("")
    try {
      await apiClient.post("/auth/login", { email: loginEmail, password: loginPassword })
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      router.push("/")
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(email, password)
  }

  const oneClickLogin = (roleEmail: string) => {
    handleLogin(roleEmail, "password123")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access VendorBridge</p>
        </div>
        
        <form className="space-y-4" onSubmit={onSubmit}>
          {error && (
            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
              <Link href="#" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pr-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-9 w-9 px-3 text-muted-foreground hover:text-foreground flex items-center justify-center"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </button>
            </div>
          </div>
          
          <button disabled={isLoading} type="submit" className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or test accounts</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button disabled={isLoading} onClick={() => oneClickLogin("admin@vendorbridge.com")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Admin
          </button>
          <button disabled={isLoading} onClick={() => oneClickLogin("officer@vendorbridge.com")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Officer
          </button>
          <button disabled={isLoading} onClick={() => oneClickLogin("manager@vendorbridge.com")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Manager
          </button>
          <button disabled={isLoading} onClick={() => oneClickLogin("vendor@infra-supplies.com")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Vendor
          </button>
        </div>
      </div>
    </div>
  )
}
