import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: instructors, error } = await supabase.from("instructors").select("*")

    if (error) throw error

    if (!instructors) {
      return NextResponse.json([])
    }

    // Get auth users
    let authUsers: any[] = []
    try {
      const { data: users } = await supabase.auth.admin.listUsers()
      authUsers = users?.users || []
    } catch (err) {
      console.log("Could not fetch auth users:", err)
    }

    const formattedInstructors = instructors.map((instructor: any) => {
      const authUser = authUsers.find((u) => u.id === instructor.user_id)

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
    return NextResponse.json([])
  }
}
