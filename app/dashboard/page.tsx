"use client"

import { Calendar } from "@/components/ui/calendar"

import { CardFooter } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, BadgeIcon as Certificate, Clock, Users, TrendingUp, Award } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalCourses: number
  enrolledCourses: number
  completedCourses: number
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
}

interface RecentActivity {
  id: string
  type: "enrollment" | "completion" | "application"
  title: string
  date: string
  status?: string
}

interface Course {
  id: string
  title: string
  progress: number
}

interface ScheduleItem {
  id: string
  title: string
  start_time: string
  event_type: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [recentCourses, setRecentCourses] = useState<Course[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduleItem[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        if (!currentUser) return

        setUser(currentUser)

        // Fetch user's applications
        const { data: applications } = await supabase
          .from("applications")
          .select("*")
          .eq("email", currentUser.email)
          .order("created_at", { ascending: false })

        // Fetch user's course enrollments (if table exists)
        const { data: enrollments } = await supabase
          .from("course_enrollments")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })

        // Fetch total available courses/certifications
        const { data: certifications } = await supabase.from("certifications").select("id")

        // Calculate stats
        const totalApplications = applications?.length || 0
        const pendingApplications = applications?.filter((app) => app.status === "pending").length || 0
        const approvedApplications = applications?.filter((app) => app.status === "approved").length || 0
        const enrolledCourses = enrollments?.length || 0
        const completedCourses = enrollments?.filter((enrollment) => enrollment.status === "completed").length || 0

        setStats({
          totalCourses: certifications?.length || 0,
          enrolledCourses,
          completedCourses,
          totalApplications,
          pendingApplications,
          approvedApplications,
        })

        // Create recent activity from applications and enrollments
        const activities: RecentActivity[] = []

        // Add applications to activity
        applications?.slice(0, 3).forEach((app) => {
          activities.push({
            id: app.id,
            type: "application",
            title: `Application for ${app.certification_name || "Certification"}`,
            date: new Date(app.created_at).toLocaleDateString(),
            status: app.status,
          })
        })

        // Add enrollments to activity
        enrollments?.slice(0, 2).forEach((enrollment) => {
          activities.push({
            id: enrollment.id,
            type: enrollment.status === "completed" ? "completion" : "enrollment",
            title: `Course: ${enrollment.course_name || "Professional Course"}`,
            date: new Date(enrollment.created_at).toLocaleDateString(),
            status: enrollment.status,
          })
        })

        // Sort by date and take most recent
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecentActivity(activities.slice(0, 5))

        // Fetch user courses with error handling
        const { data: coursesData } = await supabase
          .from("user_courses")
          .select(`
            course_id,
            progress,
            status,
            last_accessed,
            certifications:course_id(
              id,
              title
            )
          `)
          .eq("user_id", currentUser.id)
          .order("last_accessed", { ascending: false })

        // Format recent courses
        const formattedCourses =
          coursesData?.slice(0, 3).map((item) => ({
            id: item.course_id,
            title: item.certifications?.title || "Unknown Course",
            progress: item.progress || 0,
          })) || []

        setRecentCourses(formattedCourses)

        // Fetch upcoming schedule items with error handling
        const { data: scheduleData } = await supabase
          .from("user_schedules")
          .select("*")
          .eq("user_id", currentUser.id)
          .gte("start_time", new Date().toISOString())
          .order("start_time")
          .limit(3)

        setUpcomingEvents(scheduleData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  const getProgressPercentage = () => {
    if (stats.enrolledCourses === 0) return 0
    return Math.round((stats.completedCourses / stats.enrolledCourses) * 100)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment":
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case "completion":
        return <Award className="h-4 w-4 text-green-500" />
      case "application":
        return <Certificate className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      completed: "default",
      in_progress: "secondary",
    }

    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-12 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student"}!
        </h1>
        <p className="text-muted-foreground">Here's an overview of your learning journey with APMIH.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Professional certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Certificate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Certifications earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingApplications} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Your overall progress across all enrolled courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Course Completion</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.enrolledCourses}</div>
                <div className="text-xs text-muted-foreground">Enrolled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.enrolledCourses - stats.completedCourses}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completedCourses}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/certifications">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Certifications
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/apply">
                <Certificate className="mr-2 h-4 w-4" />
                Submit Application
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/dashboard/courses">
                <Users className="mr-2 h-4 w-4" />
                My Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest applications and course activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by browsing our certifications or submitting an application.
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

      {/* Recent Courses */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Courses</h2>
        <Card className="mb-4">
          <CardContent className="p-0">
            {recentCourses.length > 0 ? (
              <ul className="divide-y">
                {recentCourses.map((course) => (
                  <li key={course.id} className="p-4">
                    <Link href={`/dashboard/courses/${course.id}`} className="block hover:bg-gray-50 -m-4 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{course.title}</h3>
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="mb-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">You haven't enrolled in any courses yet</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => router.push("/certifications")}
                >
                  Browse Courses
                </Button>
              </div>
            )}
          </CardContent>
          {recentCourses.length > 0 && (
            <CardFooter className="border-t px-4 py-3">
              <Button
                variant="ghost"
                className="w-full justify-center text-blue-600"
                onClick={() => router.push("/dashboard/courses")}
              >
                View All Courses
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Schedule</h2>
        <Card>
          <CardContent className="p-0">
            {upcomingEvents.length > 0 ? (
              <ul className="divide-y">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="p-4">
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          event.event_type === "class"
                            ? "bg-blue-100 text-blue-600"
                            : event.event_type === "exam"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {event.event_type === "class" ? (
                          <BookOpen className="h-4 w-4" />
                        ) : event.event_type === "exam" ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Calendar className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500">{formatDate(event.start_time)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            )}
          </CardContent>
          {upcomingEvents.length > 0 && (
            <CardFooter className="border-t px-4 py-3">
              <Button
                variant="ghost"
                className="w-full justify-center text-blue-600"
                onClick={() => router.push("/dashboard/schedule")}
              >
                View Full Schedule
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
