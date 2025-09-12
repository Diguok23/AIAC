"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Bell, LogOut, Settings, User } from "lucide-react"
import { MobileSidebar } from "./dashboard-sidebar"
import type { Database } from "@/lib/database.types"

interface DashboardHeaderProps {
  user: any
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="hidden md:flex" />
        <MobileSidebar user={user} />
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User"}
          </h1>
          <p className="text-sm text-gray-600 hidden sm:block">Manage your courses and track your progress</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.full_name || user?.email} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
