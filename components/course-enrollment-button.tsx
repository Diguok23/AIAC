"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CourseEnrollmentButtonProps {
  courseId: string
  isEnrolled?: boolean
}

export default function CourseEnrollmentButton({ courseId, isEnrolled = false }: CourseEnrollmentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(isEnrolled)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login?redirect=/dashboard/certifications")
        return
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from("user_enrollments")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("certification_id", courseId)
        .maybeSingle()

      if (existingEnrollment) {
        // Already enrolled, go to dashboard
        router.push("/dashboard/certifications")
        return
      }

      // Enroll in the course
      const { error } = await supabase.from("user_enrollments").insert({
        user_id: session.user.id,
        certification_id: courseId,
        progress: 0,
        status: "enrolled",
        enrolled_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        certificate_issued: false,
      })

      if (error) throw error

      // Get all modules for this course
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("id")
        .eq("certification_id", courseId)
        .order("order_num")

      if (modulesError) throw modulesError

      // Create user_modules entries for each module (initially not completed)
      if (modules && modules.length > 0) {
        const userModules = modules.map((module) => ({
          user_id: session.user.id,
          course_id: courseId,
          module_id: module.id,
          is_completed: false,
        }))

        const { error: insertError } = await supabase.from("user_modules").insert(userModules)

        if (insertError) throw insertError
      }

      setEnrolled(true)
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in this course",
      })

      // Redirect to dashboard
      router.push("/dashboard/certifications")
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "There was an error enrolling in this course",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewCourse = () => {
    router.push("/dashboard/certifications")
  }

  if (enrolled) {
    return <Button onClick={handleViewCourse}>View Course</Button>
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} size="lg">
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Enroll Now
    </Button>
  )
}
