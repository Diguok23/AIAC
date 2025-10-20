import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { studentId, bio, expertise } = await request.json()

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("id", studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if already an instructor
    const { data: existingInstructor } = await supabase
      .from("instructors")
      .select("id")
      .eq("user_id", student.user_id)
      .single()

    if (existingInstructor) {
      return NextResponse.json({ error: "User is already an instructor" }, { status: 400 })
    }

    // Create instructor record
    const { data: newInstructor, error: insertError } = await supabase
      .from("instructors")
      .insert({
        user_id: student.user_id,
        bio: bio || "",
        expertise: expertise || "",
        status: "approved",
        total_courses: 0,
        total_students: 0,
        average_rating: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error promoting to instructor:", insertError)
      return NextResponse.json({ error: "Failed to promote user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, instructor: newInstructor })
  } catch (error) {
    console.error("Promote to instructor error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
