import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: instructors, error } = await supabase.from("instructors").select("*")

    if (error) {
      console.error("Error fetching instructors:", error)
      return NextResponse.json([], { status: 200 })
    }

    // Get auth users
    const { data: authUsers } = await supabase.auth.admin.listUsers()

    const formattedInstructors = (instructors || []).map((instructor: any) => {
      const authUser = authUsers?.users?.find((u) => u.id === instructor.user_id)

      return {
        id: instructor.id,
        email: authUser?.email || "N/A",
        fullName: authUser?.user_metadata?.full_name || "N/A",
        bio: instructor.bio || "",
        expertise: instructor.expertise || "",
        status: instructor.status || "pending",
        totalCourses: instructor.total_courses || 0,
        totalStudents: instructor.total_students || 0,
        averageRating: instructor.average_rating || 0,
        createdAt: instructor.created_at,
      }
    })

    return NextResponse.json(formattedInstructors)
  } catch (error) {
    console.error("Fetch instructors error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
