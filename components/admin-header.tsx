"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LogOut, User, Settings } from "lucide-react"

interface AdminHeaderProps {
  admin: {
    email: string
    fullName: string
  }
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    setLoading(true)
    localStorage.removeItem("adminSession")
    router.push("/admin/login")
  }

  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between h-16 px-4 gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">{admin.fullName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{admin.fullName}</p>
                <p className="text-xs text-muted-foreground">{admin.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{admin.fullName}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={loading}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{loading ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
