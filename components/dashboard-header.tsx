"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    first_name?: string
    last_name?: string
  }
}

interface DashboardHeaderProps {
  user: User
}

const getPageTitle = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 1 && segments[0] === "dashboard") {
    return "Overview"
  }

  if (segments.length >= 2) {
    const page = segments[1]
    switch (page) {
      case "certifications":
        return "Certifications"
      case "applications":
        return "Applications"
      case "schedule":
        return "Schedule"
      case "certificates":
        return "Certificates"
      case "profile":
        return "Profile"
      case "settings":
        return "Settings"
      case "courses":
        return "Courses"
      default:
        return page.charAt(0).toUpperCase() + page.slice(1)
    }
  }

  return "Dashboard"
}

const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = []

  if (segments.length === 1 && segments[0] === "dashboard") {
    return [{ label: "Overview", href: "/dashboard", isActive: true }]
  }

  breadcrumbs.push({ label: "Dashboard", href: "/dashboard", isActive: false })

  if (segments.length >= 2) {
    const page = segments[1]
    const pageTitle = getPageTitle(`/${segments.join("/")}`)
    breadcrumbs.push({
      label: pageTitle,
      href: `/${segments.join("/")}`,
      isActive: true,
    })
  }

  return breadcrumbs
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  const getUserDisplayName = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0]
    }
    if (user.user_metadata?.first_name) {
      return user.user_metadata.first_name
    }
    return user.email.split("@")[0]
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.href} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                  {breadcrumb.isActive ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto px-4">
        <p className="text-sm text-muted-foreground">
          Welcome back, <span className="font-medium">{getUserDisplayName()}</span>
        </p>
      </div>
    </header>
  )
}
