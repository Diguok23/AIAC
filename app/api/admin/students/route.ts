import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Fetch user profiles with their data
    const { data: students, error: studentsError } = await supabase
      .from("user_profiles")
      .select("id, full_name, phone, country, created_at, user_id")

    if (studentsError) {
      console.error("Error fetching student profiles:", studentsError)
      return NextResponse.json([], { status: 200 })
    }

    // Get emails from auth table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Error fetching auth users:", authError)
    }

    // Fetch enrollments for each student
    const { data: enrollments, error: enrollmentsError } = await supabase.from("user_enrollments").select("user_id")

    // Fetch transactions for revenue calculation
    const { data: transactions, error: transactionsError } = await supabase
      .from("billing_transactions")
      .select("user_id, total_amount")

    const formattedStudents = (students || []).map((student: any) => {
      const authUser = authUsers?.users?.find((u) => u.id === student.user_id)
      const studentEnrollments = (enrollments || []).filter((e) => e.user_id === student.id)
      const studentTransactions = (transactions || []).filter((t) => t.user_id === student.id)
      const totalSpent = studentTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)

      return {
        id: student.id,
        email: authUser?.email || "N/A",
        fullName: student.full_name || "N/A",
        phone: student.phone || "N/A",
        country: student.country || "N/A",
        enrollmentCount: studentEnrollments.length,
        totalSpent,
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
