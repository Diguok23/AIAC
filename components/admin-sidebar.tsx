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
import { BarChart3, Users, BookOpen, DollarSign, Award, LogIn, Settings, FileText } from "lucide-react"

interface AdminSidebarProps {
  admin: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname()

  const mainMenuItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: BarChart3,
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: Users,
    },
    {
      title: "Instructors",
      url: "/admin/instructors",
      icon: LogIn,
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: BookOpen,
    },
    {
      title: "Enrollments",
      url: "/admin/enrollments",
      icon: FileText,
    },
  ]

  const managementMenuItems = [
    {
      title: "Billing",
      url: "/admin/billing",
      icon: DollarSign,
    },
    {
      title: "Certificates",
      url: "/admin/certificates",
      icon: Award,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-sm">APMIH Admin</h2>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementMenuItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  )
}
