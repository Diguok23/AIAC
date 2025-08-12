import { createServerSupabaseClient } from "@/lib/supabase"
import { enrollUserInCourse } from "@/lib/course-utils"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const result = await enrollUserInCourse(user.id, courseId)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in enroll API:", error)
    return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
  }
}
