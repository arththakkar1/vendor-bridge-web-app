"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useRouter, usePathname } from "next/navigation";

export type Role = "ADMIN" | "OFFICER" | "VENDOR" | "MANAGER";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  activeRole: Role | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
      return data.user;
    },
    retry: false,
  });

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      queryClient.setQueryData(['auth', 'me'], null);
      router.push('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  useEffect(() => {
    const PUBLIC_ROUTES = ['/login', '/signup'];
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // Redirect unauthenticated users away from protected routes
    if (!isLoading && !user && !isPublic) {
      router.push('/login');
    }

    // Redirect authenticated users away from public routes (like login/signup)
    if (!isLoading && user && isPublic) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      activeRole: user?.role || null, 
      isLoading,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
