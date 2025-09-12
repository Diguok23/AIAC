"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Award, Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type UserEnrollment = Database["public"]["Tables"]["user_enrollments"]["Row"] & {
  certifications: Database["public"]["Tables"]["certifications"]["Row"]
}

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError("")

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(`Authentication error: ${userError.message}`)
        }

        if (!user) {
          throw new Error("No authenticated user found")
        }

        setUser(user)

        // Fetch enrollments with certification details
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("user_enrollments")
          .select(`
            *,
            certifications (
              id,
              title,
              description,
              duration,
              level
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (enrollmentsError) {
          console.error("Enrollments error:", enrollmentsError)
          throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`)
        }

        setEnrollments(enrollmentsData || [])
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "enrolled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back{user?.email ? `, ${user.email}` : ""}! Here's your learning progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.filter((e) => e.status === "completed").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.filter((e) => e.status === "in_progress").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Enrollments</h2>
          <Link href="/certifications">
            <Button>Browse Certifications</Button>
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments yet</h3>
              <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a certification program.</p>
              <Link href="/certifications">
                <Button>Explore Certifications</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {enrollment.certifications?.title || "Unknown Certification"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {enrollment.certifications?.description || "No description available"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(enrollment.status)}>
                        {enrollment.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPaymentStatusColor(enrollment.payment_status)}>
                        {enrollment.payment_status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Progress:</span>
                      <div className="mt-1">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-600 mt-1">{enrollment.progress}% complete</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-gray-600">{enrollment.certifications?.duration || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Level:</span>
                      <p className="text-gray-600">{enrollment.certifications?.level || "Not specified"}</p>
                    </div>
                  </div>

                  {enrollment.certificate_issued && enrollment.certificate_url && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">Certificate Available</span>
                        </div>
                        <Button size="sm" asChild>
                          <a href={enrollment.certificate_url} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
