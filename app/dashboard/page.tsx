import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Award, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Fetch user enrollments
  const { data: enrollments } = await supabase
    .from("user_enrollments")
    .select(`
      *,
      certifications (
        id,
        title,
        description,
        duration,
        price
      )
    `)
    .eq("user_id", session.user.id)

  // Fetch user applications
  const { data: applications } = await supabase.from("applications").select("*").eq("user_id", session.user.id)

  const stats = [
    {
      title: "Active Courses",
      value: enrollments?.filter((e) => e.status === "active").length || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Completed Courses",
      value: enrollments?.filter((e) => e.status === "completed").length || 0,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Applications",
      value: applications?.length || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Progress",
      value: `${Math.round((enrollments?.reduce((acc, e) => acc + (e.progress || 0), 0) || 0) / Math.max(enrollments?.length || 1, 1))}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to Your Learning Journey</h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Continue your professional development with our hospitality management programs.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>My Courses</span>
            </CardTitle>
            <CardDescription>Your enrolled certification programs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments && enrollments.length > 0 ? (
              enrollments.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{enrollment.certifications?.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">Progress: {enrollment.progress || 0}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <Badge
                    variant={enrollment.status === "active" ? "default" : "secondary"}
                    className="ml-4 flex-shrink-0"
                  >
                    {enrollment.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No courses enrolled yet</p>
                <Button asChild>
                  <Link href="/certifications">Browse Certifications</Link>
                </Button>
              </div>
            )}
            {enrollments && enrollments.length > 3 && (
              <div className="pt-4 border-t">
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/dashboard/courses">View All Courses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Applications</span>
            </CardTitle>
            <CardDescription>Your certification applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications && applications.length > 0 ? (
              applications.slice(0, 3).map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">Application #{application.id.slice(0, 8)}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted: {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      application.status === "approved"
                        ? "default"
                        : application.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                    className="ml-4 flex-shrink-0"
                  >
                    {application.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No applications submitted yet</p>
                <Button asChild>
                  <Link href="/apply">Submit Application</Link>
                </Button>
              </div>
            )}
            {applications && applications.length > 3 && (
              <div className="pt-4 border-t">
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/dashboard/applications">View All Applications</Link>
                </Button>
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/certifications">
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Browse Courses</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/apply">
                <Users className="h-6 w-6" />
                <span className="text-sm">Apply Now</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/dashboard/schedule">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">View Schedule</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/dashboard/certificates">
                <Award className="h-6 w-6" />
                <span className="text-sm">Certificates</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
