"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { SidebarProvider } from "@/components/ui/sidebar"

interface AdminSession {
  id: string
  email: string
  fullName: string
  role: string
  token: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionStr = localStorage.getItem("adminSession")
    if (!sessionStr && !pathname.includes("/admin/login") && !pathname.includes("/admin/signup")) {
      router.push("/admin/login")
      return
    }

    if (sessionStr) {
      try {
        setAdmin(JSON.parse(sessionStr))
      } catch (err) {
        console.error("Failed to parse admin session:", err)
        router.push("/admin/login")
      }
    }
    setLoading(false)
  }, [router, pathname])

  // Show login/signup pages without layout
  if (pathname === "/admin/login" || pathname === "/admin/signup") {
    return children
  }

  if (loading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AdminSidebar admin={admin} />
        <div className="flex-1 flex flex-col">
          <AdminHeader admin={admin} />
          <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
