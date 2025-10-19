import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: instructors, error } = await supabase.from("instructors").select(`
        id,
        user_id,
        bio,
        expertise,
        status,
        total_courses,
        total_students,
        average_rating,
        created_at,
        auth.users(email, user_metadata)
      `)

    if (error) throw error

    const formattedInstructors = (instructors || []).map((instructor: any) => ({
      id: instructor.id,
      email: instructor.auth?.users?.[0]?.email || "N/A",
      fullName: instructor.auth?.users?.[0]?.user_metadata?.full_name || "N/A",
      bio: instructor.bio,
      expertise: instructor.expertise,
      status: instructor.status,
      totalCourses: instructor.total_courses || 0,
      totalStudents: instructor.total_students || 0,
      averageRating: instructor.average_rating || 0,
      createdAt: instructor.created_at,
    }))

    return NextResponse.json(formattedInstructors)
  } catch (error) {
    console.error("Fetch instructors error:", error)
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 })
  }
}
