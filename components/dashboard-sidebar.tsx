"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LayoutDashboard, Users, Award, Settings, User, GraduationCap } from "lucide-react" // Removed FileText
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardSidebarProps {
  user: any // User object from Supabase, including is_admin
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const isAdmin = user?.is_admin || false

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "My Enrollments", // Changed from My Applications
      href: "/dashboard?tab=my-enrollments", // Link to dashboard with enrollments tab
      icon: BookOpen, // Changed icon to BookOpen for enrollments
      active: pathname === "/dashboard" && new URLSearchParams(window.location.search).get("tab") === "my-enrollments",
    },
    {
      title: "My Certificates",
      href: "/dashboard/certificates",
      icon: Award,
      active: pathname === "/dashboard/certificates",
    },
    {
      title: "My Profile",
      href: "/dashboard/profile",
      icon: User,
      active: pathname === "/dashboard/profile",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  const adminNavItems = [
    {
      title: "Manage Users",
      href: "/dashboard?tab=admin-users", // Link to dashboard with users tab
      icon: Users,
      active: pathname === "/dashboard" && new URLSearchParams(window.location.search).get("tab") === "admin-users",
    },
    {
      title: "Manage Certifications",
      href: "/dashboard?tab=admin-certs", // Link to dashboard with certifications tab
      icon: GraduationCap,
      active: pathname === "/dashboard" && new URLSearchParams(window.location.search).get("tab") === "admin-certs",
    },
    {
      title: "Manage Modules & Lessons",
      href: "/dashboard?tab=admin-modules", // Link to dashboard with modules tab
      icon: BookOpen,
      active: pathname === "/dashboard" && new URLSearchParams(window.location.search).get("tab") === "admin-modules",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-4">
          <img src="/placeholder-logo.png" alt="Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold">APMIH</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.active}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.active}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder-user.jpg"} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}</span>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Sign out")}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
