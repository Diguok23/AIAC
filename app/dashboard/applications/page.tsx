"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Application {
  id: string
  program_name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  certification_id?: string
}

export default function DashboardApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchApplications = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!mounted || !currentUser) {
          setIsLoading(false)
          return
        }

        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select("*")
          .eq("email", currentUser.email)
          .order("created_at", { ascending: false })

        if (!mounted) return

        if (applicationsError) {
          console.error("Error fetching applications:", applicationsError)
          toast({
            title: "Error",
            description: "Failed to load your applications.",
            variant: "destructive",
          })
        }

        setApplications(applicationsData || [])
      } catch (error) {
        if (mounted) {
          console.error("Error fetching applications data:", error)
          toast({
            title: "Error",
            description: "An unexpected error occurred while loading applications.",
            variant: "destructive",
          })
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      mounted = false
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
    }

    const colors: Record<string, string> = {
      pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
      approved: "text-green-700 bg-green-50 border-green-200",
      rejected: "text-red-700 bg-red-50 border-red-200",
    }

    return (
      <Badge variant={variants[status] || "outline"} className={`text-xs ${colors[status] || ""}`}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Track the status of your certification applications</CardTitle>
          <CardDescription>View all your submitted applications here.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <p className="text-sm font-medium">{application.program_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(application.status)}
                    {application.status === "approved" && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard/certifications">Start Course</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by browsing our certifications and submitting an application.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/certifications">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Certifications
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
