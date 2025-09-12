"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { LayoutDashboard, BookOpen, Award, Calendar, FileText, Settings, User, Menu, GraduationCap } from "lucide-react"

interface DashboardSidebarProps {
  user?: any
}

const navigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        title: "My Courses",
        href: "/dashboard/courses",
        icon: BookOpen,
      },
      {
        title: "Certifications",
        href: "/dashboard/certifications",
        icon: Award,
      },
      {
        title: "Schedule",
        href: "/dashboard/schedule",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Progress",
    items: [
      {
        title: "Applications",
        href: "/dashboard/applications",
        icon: FileText,
      },
      {
        title: "Certificates",
        href: "/dashboard/certificates",
        icon: GraduationCap,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: User,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
]

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">APMIH</span>
            <span className="truncate text-xs">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function MobileSidebar({ user }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">APMIH</span>
              <span className="truncate text-xs">Dashboard</span>
            </div>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-4 py-4">
              {navigation.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h4>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
