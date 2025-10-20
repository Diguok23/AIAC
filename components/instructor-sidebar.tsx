"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BookOpen, BarChart3, Users, Settings, LogOut, Home } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function InstructorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [instructor, setInstructor] = useState<{ fullName: string; email: string } | null>(null)

  useEffect(() => {
    const fetchInstructor = async () => {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("full_name, email")
          .eq("user_id", session.user.id)
          .single()

        if (profile) {
          setInstructor({ fullName: profile.full_name, email: profile.email })
        }
      }
    }

    fetchInstructor()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.auth.signOut()
    router.push("/login")
  }

  const menuItems = [
    {
      title: "Dashboard",
      url: "/instructor",
      icon: Home,
    },
    {
      title: "My Courses",
      url: "/instructor/courses",
      icon: BookOpen,
    },
    {
      title: "Students",
      url: "/instructor/students",
      icon: Users,
    },
    {
      title: "Analytics",
      url: "/instructor/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/instructor/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold">I</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-sm">Instructor</h2>
            <p className="text-xs text-muted-foreground truncate">{instructor?.email || "Loading..."}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white md:bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
