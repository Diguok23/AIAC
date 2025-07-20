import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Fetch all users from Supabase Auth
    const {
      data: { users },
      error: authError,
    } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Error fetching users:", authError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Optionally, fetch user_enrollments for each user to show their courses
    const { data: enrollments, error: enrollmentsError } = await supabase.from("user_enrollments").select(`
        user_id,
        certification_id,
        status,
        progress,
        due_date,
        certificate_issued,
        certifications:certification_id (
          id,
          title,
          category,
          level
        )
      `)

    if (enrollmentsError) {
      console.error("Error fetching enrollments for users:", enrollmentsError)
      // Continue without enrollments if there's an error fetching them
    }

    const usersWithEnrollments = users.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      enrollments: enrollments?.filter((e) => e.user_id === user.id) || [],
    }))

    return NextResponse.json({ users: usersWithEnrollments })
  } catch (error) {
    console.error("An error occurred while fetching users:", error)
    return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 })
  }
}
