"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null

    const checkAuthAndFetchProfile = async () => {
      setIsLoading(true)
      setIsRedirecting(false) // Reset redirecting state on new check

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          console.error("Supabase session error:", sessionError)
          toast({
            title: "Authentication Error",
            description: "Unable to verify your session. Please sign in again.",
            variant: "destructive",
          })
          setIsRedirecting(true)
          router.replace("/login")
          return
        }

        if (!session?.user) {
          console.log("No active session found — redirecting to /login")
          setIsRedirecting(true)
          router.replace("/login")
          return
        }

        // Fetch user profile to get full_name and is_admin
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name, is_admin")
          .eq("user_id", session.user.id)
          .single()

        if (!mounted) return

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 means "No rows found", which is fine for new users
          console.error("Error fetching user profile:", profileError)
          toast({
            title: "Profile Load Error",
            description: "Failed to load your profile details.",
            variant: "destructive",
          })
          // Even if profile fails, if session exists, we allow access but log error
          setUser({ ...session.user, full_name: session.user.email, is_admin: false })
        } else {
          setUser({ ...session.user, ...profileData })
        }
      } catch (error) {
        console.error("An unexpected error occurred during auth check:", error)
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
        setIsRedirecting(true)
        router.replace("/login")
      } finally {
        if (mounted && !isRedirecting) {
          setIsLoading(false)
        }
      }
    }

    checkAuthAndFetchProfile()

    // Set up a listener for auth state changes
    const { data: listenerData } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // Re-run auth check on sign in/out to update user state or redirect
        checkAuthAndFetchProfile()
      }
    })

    authSubscription = listenerData.subscription // Assign the actual subscription object

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe() // Correctly unsubscribe
      }
    }
  }, [router, supabase, isRedirecting]) // isRedirecting added to dependencies to prevent re-running if already redirecting

  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DashboardHeader user={user} />
          </header>
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
