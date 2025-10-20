"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"
import { InstructorSidebar } from "@/components/instructor-sidebar"

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await (await import("@/lib/supabase")).default.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // Check if user is an instructor
        const response = await fetch("/api/instructor/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        })

        const data = await response.json()

        if (!data.isInstructor) {
          router.push("/dashboard")
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <InstructorSidebar />
      <main className="w-full">
        <div className="md:hidden p-4 border-b">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
