"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  FileText,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Enrollment {
  id: string
  certification_id: string
  status: string
  progress: number
  enrolled_at: string
  due_date: string | null
  certifications: {
    id: string
    title: string
    category: string
    level: string
    duration: string | null
    instructor: string | null
  } | null
}

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        setUserId(user.id)

        // Fetch user enrollments
        const response = await fetch(`/api/user-enrollments?user_id=${user.id}`)
        const data = await response.json()

        if (data.enrollments) {
          setEnrollments(data.enrollments)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const stats = [
    {
      title: "Active Courses",
      value: enrollments.filter((e) => e.status === "in_progress").length.toString(),
      description: "Currently enrolled",
      icon: BookOpen,
      trend: `${enrollments.length} total`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Completed Certifications",
      value: enrollments.filter((e) => e.status === "completed").length.toString(),
      description: "Certificates earned",
      icon: Award,
      trend: "Keep learning!",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Average Progress",
      value:
        enrollments.length > 0
          ? `${Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)}%`
          : "0%",
      description: "Course completion",
      icon: TrendingUp,
      trend: "On track",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Enrollments",
      value: enrollments.length.toString(),
      description: "All time",
      icon: Users,
      trend: "Lifetime learning",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const recentActivity = enrollments
    .sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
    .slice(0, 4)
    .map((enrollment, index) => ({
      id: index + 1,
      type: enrollment.status === "completed" ? "completion" : "enrollment",
      title:
        enrollment.status === "completed"
          ? `Completed: ${enrollment.certifications?.title}`
          : `Enrolled in: ${enrollment.certifications?.title}`,
      description:
        enrollment.status === "completed"
          ? `Earned certificate with ${enrollment.progress}% score`
          : `Course in progress - ${enrollment.progress}% complete`,
      time: new Date(enrollment.enrolled_at).toLocaleDateString(),
      icon: enrollment.status === "completed" ? CheckCircle : BookOpen,
      color: enrollment.status === "completed" ? "text-green-600" : "text-blue-600",
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening with your learning journey today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Current Courses
            </CardTitle>
            <CardDescription>Your active learning paths</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No courses enrolled yet</p>
                <Button asChild>
                  <Link href="/dashboard/certifications">Browse Certifications</Link>
                </Button>
              </div>
            ) : (
              <>
                {enrollments.slice(0, 3).map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="space-y-3 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{enrollment.certifications?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          by {enrollment.certifications?.instructor || "Expert Instructor"}
                        </p>
                      </div>
                      <Badge variant={enrollment.status === "completed" ? "default" : "secondary"}>
                        {enrollment.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                    {enrollment.due_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Due: {new Date(enrollment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/dashboard/courses/${enrollment.certification_id}`}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/certifications">
                    View All Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            ) : (
              <>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/dashboard/certifications">
                <Award className="h-6 w-6 mb-2" />
                Browse Certifications
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/dashboard/applications">
                <FileText className="h-6 w-6 mb-2" />
                View Applications
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/dashboard/certificates">
                <CheckCircle className="h-6 w-6 mb-2" />
                My Certificates
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/dashboard/profile">
                <Users className="h-6 w-6 mb-2" />
                Update Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
