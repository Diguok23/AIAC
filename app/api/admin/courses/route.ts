import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: courses, error } = await supabase.from("certifications").select(`
        id,
        title,
        description,
        price,
        level,
        status,
        instructor_id,
        created_at,
        user_enrollments(id),
        instructors(full_name)
      `)

    if (error) throw error

    const formattedCourses = (courses || []).map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price || 0,
      level: course.level,
      status: course.status || "draft",
      instructorId: course.instructor_id,
      instructorName: course.instructors?.full_name || "N/A",
      enrollmentCount: course.user_enrollments?.length || 0,
      rating: 0,
      createdAt: course.created_at,
    }))

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error("Fetch courses error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
