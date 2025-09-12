"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, Calendar, TrendingUp, Clock, Users } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

type UserEnrollment = Database["public"]["Tables"]["user_enrollments"]["Row"]
type Certification = Database["public"]["Tables"]["certifications"]["Row"]

interface EnrollmentWithCertification extends UserEnrollment {
  certifications: Certification
}

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCertification[]>([])
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificates: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch user enrollments with certification details
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("user_enrollments")
        .select(`
          *,
          certifications (*)
        `)
        .eq("user_id", session.user.id)

      if (enrollmentsError) throw enrollmentsError

      setEnrollments(enrollmentsData || [])

      // Calculate stats
      const totalEnrollments = enrollmentsData?.length || 0
      const completedCourses = enrollmentsData?.filter((e) => e.status === "completed").length || 0
      const inProgressCourses = enrollmentsData?.filter((e) => e.status === "active").length || 0

      setStats({
        totalEnrollments,
        completedCourses,
        inProgressCourses,
        certificates: completedCourses, // Assuming completed courses = certificates
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const recentEnrollments = enrollments.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Active learning paths</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressCourses}</div>
            <p className="text-xs text-muted-foreground">Courses in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">Certificates earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>Your latest course enrollments and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollments Yet</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a certification.</p>
                <Button asChild>
                  <Link href="/dashboard/certifications">Browse Certifications</Link>
                </Button>
              </div>
            ) : (
              recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{enrollment.certifications.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Enrolled on {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={enrollment.status === "completed" ? "default" : "secondary"}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/courses/${enrollment.certification_id}`}>Continue</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/dashboard/certifications">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Certifications
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/dashboard/applications">
                <Calendar className="mr-2 h-4 w-4" />
                View Applications
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/dashboard/certificates">
                <Award className="mr-2 h-4 w-4" />
                My Certificates
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/dashboard/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Track your progress across all enrolled certifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{enrollment.certifications.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{enrollment.certifications.duration || "Self-paced"}</span>
                        <Users className="h-3 w-3 ml-2" />
                        <span>{enrollment.certifications.level || "All levels"}</span>
                      </div>
                    </div>
                    <Badge variant={enrollment.status === "completed" ? "default" : "secondary"}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  <Progress
                    value={enrollment.status === "completed" ? 100 : enrollment.progress_percentage || 0}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{enrollment.progress_percentage || 0}% complete</span>
                    <span>
                      {enrollment.status === "completed"
                        ? "Completed"
                        : `${enrollment.progress_percentage || 0}% remaining`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
