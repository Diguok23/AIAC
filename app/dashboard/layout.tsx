"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const supabaseClientComponent = createClientComponentClient<Database>()
  const supabaseServerComponent = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabaseServerComponent.auth.getSession()

  if (!session) {
    redirect("/login")
  }

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
        } = await supabaseClientComponent.auth.getSession()

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
        const { data: profileData, error: profileError } = await supabaseClientComponent
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
    const { data: listenerData } = supabaseClientComponent.auth.onAuthStateChange((event, session) => {
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
  }, [router, supabaseClientComponent, isRedirecting]) // isRedirecting added to dependencies to prevent re-running if already redirecting

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
      <div className="flex h-screen bg-gray-100">
        <DashboardSidebar user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
