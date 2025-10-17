"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    first_name?: string
    last_name?: string
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if we have Supabase configuration
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn("Missing Supabase environment variables")
          // Use mock user for preview
          const mockUser: User = {
            id: "demo-user-123",
            email: "demo@example.com",
            user_metadata: {
              full_name: "Demo User",
            },
          }
          setUser(mockUser)
          setIsLoading(false)
          return
        }

        // Import and use Supabase
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Auth error:", sessionError)
          setError("Authentication error")
          setIsLoading(false)
          return
        }

        if (!session?.user) {
          console.log("No session found, redirecting to login")
          router.push("/login")
          return
        }

        const userData: User = {
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: session.user.user_metadata,
        }

        setUser(userData)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (event === "SIGNED_OUT" || !newSession) {
            setUser(null)
            router.push("/login")
          } else if (newSession?.user) {
            const updatedUser: User = {
              id: newSession.user.id,
              email: newSession.user.email || "",
              user_metadata: newSession.user.user_metadata,
            }
            setUser(updatedUser)
          }
        })

        return () => subscription?.unsubscribe()
      } catch (error) {
        console.error("Auth check error:", error)
        setError("Failed to check authentication")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r bg-gray-50">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="border-b p-4">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{error || "Please log in to access the dashboard"}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
      <SidebarInset>
        <DashboardHeader user={user} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
