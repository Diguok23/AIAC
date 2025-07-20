"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CheckCircle, Circle, ArrowLeft, BookOpen, Award, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Lesson {
  id: string
  title: string
  content: string
  order_num: number
}

interface Module {
  id: string
  title: string
  description: string
  order_num: number
  is_completed: boolean
  lessons: Lesson[] // Added lessons to module
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  progress: number
  status: string
  duration: string | null // Added duration
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCourseAndModules = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // Fetch user enrollment details for the course
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("user_enrollments") // Changed from user_courses
          .select(`
            certification_id,
            progress,
            status,
            started_at,
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
          .eq("certification_id", params.id) // Changed from course_id
          .single()

        if (enrollmentError) throw enrollmentError

        if (!enrollmentData) {
          toast({
            title: "Course not found",
            description: "You are not enrolled in this course",
            variant: "destructive",
          })
          router.push("/dashboard/certifications") // Redirect to certifications page
          return
        }

        // Fetch modules for the certification and their associated lessons
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select(`
            id,
            title,
            description,
            order_num,
            lessons (
              id,
              title,
              content,
              order_num
            )
          `)
          .eq("certification_id", params.id)
          .order("order_num")
          .order("order_num", { foreignTable: "lessons", ascending: true }) // Order lessons within modules

        if (modulesError) throw modulesError

        // Fetch user's completion status for each module
        const { data: userModulesData, error: userModulesError } = await supabase
          .from("user_modules")
          .select("module_id, is_completed")
          .eq("user_id", session.user.id)
          .eq("course_id", params.id) // course_id here refers to certification_id

        if (userModulesError) throw userModulesError

        const userModuleCompletionMap = new Map(userModulesData?.map((um) => [um.module_id, um.is_completed]) || [])

        // Format course data
        const formattedCourse = {
          id: enrollmentData.certifications.id,
          title: enrollmentData.certifications.title,
          description: enrollmentData.certifications.description,
          category: enrollmentData.certifications.category,
          level: enrollmentData.certifications.level,
          duration: enrollmentData.certifications.duration,
          progress: enrollmentData.progress,
          status: enrollmentData.status,
        }

        // Format modules data with completion status and nested lessons
        const formattedModules = modulesData.map((module) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          order_num: module.order_num,
          is_completed: userModuleCompletionMap.get(module.id) || false,
          lessons: module.lessons || [],
        }))

        setCourse(formattedCourse)
        setModules(formattedModules)
      } catch (error) {
        console.error("Error fetching course details:", error)
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCourseAndModules()
    }
  }, [params.id, router, supabase])

  const toggleModuleCompletion = async (moduleId: string, currentStatus: boolean) => {
    setUpdating(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      // Check if user_module record exists
      const { data: existingUserModule } = await supabase
        .from("user_modules")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("course_id", params.id) // course_id here refers to certification_id
        .eq("module_id", moduleId)
        .single()

      if (existingUserModule) {
        // Update existing record
        await supabase
          .from("user_modules")
          .update({
            is_completed: !currentStatus,
            completion_date: !currentStatus ? new Date().toISOString() : null,
          })
          .eq("user_id", session.user.id)
          .eq("course_id", params.id)
          .eq("module_id", moduleId)
      } else {
        // Insert new record (should ideally not happen if modules are pre-created on enrollment)
        await supabase.from("user_modules").insert({
          user_id: session.user.id,
          course_id: params.id as string,
          module_id: moduleId,
          is_completed: true,
          completion_date: new Date().toISOString(),
        })
      }

      // Update local state
      const updatedModules = modules.map((module) =>
        module.id === moduleId ? { ...module, is_completed: !currentStatus } : module,
      )
      setModules(updatedModules)

      // Calculate new progress
      const completedModulesCount = updatedModules.filter((module) => module.is_completed).length
      const newProgress = Math.round((completedModulesCount / updatedModules.length) * 100)

      // Update course progress in user_enrollments
      await supabase
        .from("user_enrollments") // Changed from user_courses
        .update({
          progress: newProgress,
          status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
          completed_at: newProgress === 100 ? new Date().toISOString() : null, // Changed from completion_date
          started_at:
            course?.status === "not_started" && newProgress > 0
              ? new Date().toISOString()
              : course?.status === "not_started"
                ? null
                : course?.started_at, // Set started_at if not already set
        })
        .eq("user_id", session.user.id)
        .eq("certification_id", params.id) // Changed from course_id

      // Update local state
      if (course) {
        setCourse({
          ...course,
          progress: newProgress,
          status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
        })
      }

      toast({
        title: currentStatus ? "Module marked as incomplete" : "Module completed",
        description: currentStatus ? "Your progress has been updated" : "Great job! Keep going!",
      })
    } catch (error) {
      console.error("Error updating module status:", error)
      toast({
        title: "Error",
        description: "Failed to update module status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full mr-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-full max-w-md mb-8" />
        <Skeleton className="h-24 w-full mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or you're not enrolled.</p>
          <Button onClick={() => router.push("/dashboard/certifications")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certifications
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard/courses")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Courses
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{course.category}</span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {course.level}
          </span>
          {course.duration && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {course.duration}
            </span>
          )}
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
        </div>
        <p className="text-gray-600 mb-4">{course.description}</p>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Course Modules</h2>
      <div className="space-y-4">
        {modules.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {modules.map((module) => (
              <Card key={module.id} className={module.is_completed ? "border-green-200 bg-green-50" : ""}>
                <AccordionItem value={module.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <AccordionTrigger className="flex-1 text-left">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {module.order_num}. {module.title}
                          {module.is_completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </CardTitle>
                      </AccordionTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={updating}
                        onClick={(e) => {
                          e.stopPropagation() // Prevent accordion from toggling
                          toggleModuleCompletion(module.id, module.is_completed)
                        }}
                        className={module.is_completed ? "text-green-600" : "text-gray-400"}
                      >
                        {module.is_completed ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                      </Button>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      {module.lessons && module.lessons.length > 0 ? (
                        <div className="space-y-3 mt-4">
                          <h3 className="text-lg font-semibold">Lessons:</h3>
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="border rounded-md p-3 bg-white">
                              <h4 className="font-medium text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                {lesson.order_num}. {lesson.title}
                              </h4>
                              <p className="text-sm text-gray-700 mt-1">{lesson.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-4">No lessons available for this module yet.</p>
                      )}
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Modules Available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              This course doesn't have any modules yet. Check back later for updates.
            </p>
          </div>
        )}
      </div>

      {course.progress === 100 && (
        <div className="mt-8 text-center">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex justify-center items-center text-green-700">
                <Award className="h-8 w-8 mr-2" />
                Course Completed!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">Congratulations! You've completed all modules in this course.</p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button>Download Certificate</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
