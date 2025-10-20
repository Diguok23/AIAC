"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BookOpen, Users, TrendingUp } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface InstructorStats {
  totalCourses: number
  totalStudents: number
  averageRating: number
  totalEarnings: number
}

export default function InstructorDashboard() {
  const [stats, setStats] = useState<InstructorStats>({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Get instructor info
          const { data: instructor } = await supabase
            .from("instructors")
            .select("total_courses, total_students, average_rating")
            .eq("user_id", session.user.id)
            .single()

          if (instructor) {
            setStats({
              totalCourses: instructor.total_courses || 0,
              totalStudents: instructor.total_students || 0,
              averageRating: instructor.average_rating || 0,
              totalEarnings: 0, // Can be calculated from enrollments if needed
            })
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your teaching overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5.0</div>
            <p className="text-xs text-muted-foreground">Student ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all courses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Instructor Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You have been promoted to instructor. You can now create and manage courses, view your students, and track
            your earnings. Use the sidebar to navigate to different sections.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
