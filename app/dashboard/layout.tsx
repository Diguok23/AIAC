"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const handleAuthRedirect = useCallback(() => {
    if (!authChecked) return // Don't redirect until we've checked auth

    setIsLoading(true)
    router.push("/login")
  }, [router, authChecked])

  useEffect(() => {
    let isMounted = true
    let authSubscription: any = null

    const initializeAuth = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          console.error("Session error:", error)
          setAuthChecked(true)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          setIsLoading(false)
        } else {
          setUser(null)
          setIsLoading(false)
        }

        setAuthChecked(true)

        // Set up auth listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return

          console.log("Auth state changed:", event, !!session)

          if (event === "SIGNED_OUT" || !session) {
            setUser(null)
            setIsLoading(false)
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            setUser(session.user)
            setIsLoading(false)
          }
        })

        authSubscription = subscription
      } catch (error) {
        if (!isMounted) return
        console.error("Auth initialization error:", error)
        setAuthChecked(true)
        setIsLoading(false)
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  // Redirect to login if no user after auth check is complete
  useEffect(() => {
    if (authChecked && !user && !isLoading) {
      handleAuthRedirect()
    }
  }, [authChecked, user, isLoading, handleAuthRedirect])

  // Show loading while checking auth or if redirecting
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-gray-600">
            {!authChecked ? "Checking authentication..." : "Loading dashboard..."}
          </span>
        </div>
      </div>
    )
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-gray-600">Redirecting to login...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader user={user} />
      <div className="flex-grow flex">
        <DashboardSidebar />
        <main className="flex-grow p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
