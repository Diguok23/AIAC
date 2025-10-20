import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: courses, error } = await supabase.from("certifications").select("*")

    if (error) throw error

    if (!courses) {
      return NextResponse.json([])
    }

    // Fetch enrollments
    const { data: enrollments } = await supabase.from("user_enrollments").select("certification_id")

    const formattedCourses = courses.map((course: any) => {
      const courseEnrollments = (enrollments || []).filter((e: any) => e.certification_id === course.id)

      return {
        id: course.id,
        title: course.title || "N/A",
        description: course.description || "",
        price: course.price || 0,
        level: course.level || "Beginner",
        status: course.status || "draft",
        instructorId: course.instructor_id,
        instructorName: "N/A",
        enrollmentCount: courseEnrollments.length,
        rating: 0,
        createdAt: course.created_at,
      }
    })

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error("Fetch courses error:", error)
    return NextResponse.json([])
  }
}
