"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Role } from "@/lib/dummyData"

export default function LoginPage() {
  const { setActiveRole } = useAuth()
  const router = useRouter()

  const handleLogin = (role: Role) => {
    setActiveRole(role)
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access VendorBridge</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin("Admin"); }}>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">

          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or login as test user</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleLogin("Admin")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Admin
          </button>
          <button onClick={() => handleLogin("Procurement Officer")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Officer
          </button>
          <button onClick={() => handleLogin("Manager")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Manager
          </button>
          <button onClick={() => handleLogin("Vendor")} className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Vendor
          </button>
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/signup" className="font-medium underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
