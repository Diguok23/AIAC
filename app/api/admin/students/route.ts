import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Fetch directly from user_profiles
    const { data: students, error: studentsError } = await supabase
      .from("user_profiles")
      .select("id, full_name, phone_number, address, created_at, user_id")

    if (studentsError) {
      console.error("Error fetching student profiles:", studentsError)
      return NextResponse.json([], { status: 200 })
    }

    // Get emails from auth table
    const { data: authUsers } = await supabase.auth.admin.listUsers()

    // Fetch enrollments for each student
    const { data: enrollments } = await supabase.from("user_enrollments").select("user_id")

    // Fetch billing data
    const { data: billing } = await supabase.from("user_billing").select("user_id, total_spent")

    const formattedStudents = (students || []).map((student: any) => {
      const authUser = authUsers?.users?.find((u) => u.id === student.user_id)
      const studentEnrollments = (enrollments || []).filter((e) => e.user_id === student.id)
      const billingRecord = (billing || []).find((b) => b.user_id === student.id)

      return {
        id: student.id,
        email: authUser?.email || "N/A",
        fullName: student.full_name || "N/A",
        phone: student.phone_number || "N/A",
        address: student.address || "N/A",
        enrollmentCount: studentEnrollments.length,
        totalSpent: billingRecord?.total_spent || 0,
        verificationStatus: authUser ? "verified" : "pending",
        createdAt: student.created_at,
      }
    })

    return NextResponse.json(formattedStudents)
  } catch (error) {
    console.error("Fetch students error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
