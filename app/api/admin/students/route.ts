import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: students, error } = await supabase.from("user_profiles").select(`
        id,
        email: auth.users(email),
        full_name,
        phone,
        country,
        created_at,
        user_enrollments(id),
        billing_transactions(total_amount)
      `)

    if (error) throw error

    const formattedStudents = (students || []).map((student: any) => ({
      id: student.id,
      email: student.email?.[0]?.email || "N/A",
      fullName: student.full_name,
      phone: student.phone,
      country: student.country,
      enrollmentCount: student.user_enrollments?.length || 0,
      totalSpent: (student.billing_transactions || []).reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0),
      verificationStatus: student.email ? "verified" : "pending",
      createdAt: student.created_at,
    }))

    return NextResponse.json(formattedStudents)
  } catch (error) {
    console.error("Fetch students error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
