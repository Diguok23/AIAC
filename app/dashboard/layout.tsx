"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null

    const initAuth = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Session error:", error)
          if (!isRedirecting) {
            setIsRedirecting(true)
            router.replace("/login")
          }
          return
        }

        if (!session?.user) {
          if (!isRedirecting) {
            setIsRedirecting(true)
            router.replace("/login")
          }
          return
        }

        // Fetch user profile to check admin status
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("user_id", session.user.id)
          .single()

        if (profileError) {
          console.error("Error fetching user profile:", profileError)
          // Handle case where profile might not exist yet (e.g., new user before trigger runs)
          // For now, assume not admin if profile fetch fails
          setUser({ ...session.user, is_admin: false })
        } else {
          setUser({ ...session.user, is_admin: profile?.is_admin || false })
        }

        setIsLoading(false)

        // Set up auth state listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return

          if (event === "SIGNED_OUT" || !session) {
            setUser(null)
            if (!isRedirecting) {
              setIsRedirecting(true)
              router.replace("/login")
            }
          } else if (session?.user) {
            // Re-fetch profile on auth state change to get admin status
            const { data: updatedProfile, error: updatedProfileError } = await supabase
              .from("user_profiles")
              .select("is_admin")
              .eq("user_id", session.user.id)
              .single()

            if (updatedProfileError) {
              console.error("Error fetching updated user profile:", updatedProfileError)
              setUser({ ...session.user, is_admin: false })
            } else {
              setUser({ ...session.user, is_admin: updatedProfile?.is_admin || false })
            }
            setIsLoading(false)
          }
        })

        authSubscription = subscription
      } catch (error) {
        if (!mounted) return
        console.error("Auth initialization error:", error)
        if (!isRedirecting) {
          setIsRedirecting(true)
          router.replace("/login")
        }
      }
    }

    initAuth()

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [router, pathname, isRedirecting])

  // Show loading while checking auth
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-gray-600">{isRedirecting ? "Redirecting..." : "Loading dashboard..."}</span>
        </div>
      </div>
    )
  }

  // Don't render if no user
  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} /> {/* Pass user to sidebar for conditional rendering */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <DashboardHeader user={user} />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
