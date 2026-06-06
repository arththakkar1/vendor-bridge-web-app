"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { Role } from "@/lib/dummyData"

interface AuthContextType {
  activeRole: Role
  setActiveRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to Admin for testing all features
  const [activeRole, setActiveRole] = useState<Role>("Admin")

  return (
    <AuthContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
