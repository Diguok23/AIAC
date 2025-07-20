"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { BookOpen, Clock, ArrowRight, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  progress: number
  status: string
  last_accessed: string
  duration: string | null // Added duration
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("user_enrollments") // Changed from user_courses
          .select(`
            certification_id,
            progress,
            status,
            started_at,
            completed_at,
            certifications:certification_id(
              id,
              title,
              description,
              category,
              level,
              duration
            )
          `)
          .eq("user_id", session.user.id)
          .order("started_at", { ascending: false }) // Order by started_at

        if (error) throw error

        const formattedCourses = data.map((item) => ({
          id: item.certification_id,
          title: item.certifications.title,
          description: item.certifications.description,
          category: item.certifications.category,
          level: item.certifications.level,
          duration: item.certifications.duration,
          progress: item.progress,
          status: item.status,
          last_accessed: item.started_at || item.completed_at || "", // Use started_at or completed_at
        }))

        setCourses(formattedCourses)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load your courses",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [router, supabase])

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.level.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCourseClick = (courseId: string) => {
    router.push(`/dashboard/courses/${courseId}`)
  }

  const handleBrowseCourses = () => {
    router.push("/certifications")
  }

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Courses</h1>
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      <div className="mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="ml-4" onClick={handleBrowseCourses}>
          <Plus className="mr-2 h-4 w-4" />
          Enroll in New Course
        </Button>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCourseClick(course.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      {course.category} • {course.level}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    <span>5 modules</span> {/* Placeholder, ideally fetched */}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{course.duration || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    course.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : course.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.status === "completed"
                    ? "Completed"
                    : course.status === "in_progress"
                      ? "In Progress"
                      : "Not Started"}
                </span>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Continue
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          {searchQuery ? (
            <>
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Courses Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any courses matching "{searchQuery}". Try a different search term.
              </p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Courses Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
              </p>
              <Button className="mt-4" onClick={handleBrowseCourses}>
                Browse Courses
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
