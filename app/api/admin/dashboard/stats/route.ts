import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get total students
    const { count: studentCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

    // Get total instructors
    const { count: instructorCount } = await supabase.from("instructors").select("*", { count: "exact", head: true })

    // Get total courses
    const { count: courseCount } = await supabase.from("certifications").select("*", { count: "exact", head: true })

    // Get total enrollments
    const { count: enrollmentCount } = await supabase
      .from("user_enrollments")
      .select("*", { count: "exact", head: true })

    // Get total certificates
    const { count: certificateCount } = await supabase.from("certificates").select("*", { count: "exact", head: true })

    // Get total revenue
    const { data: transactionData } = await supabase
      .from("billing_transactions")
      .select("total_amount")
      .eq("status", "completed")

    const totalRevenue = (transactionData || []).reduce((sum, t) => sum + (t.total_amount || 0), 0)

    // Get monthly revenue trend
    const { data: monthlyData } = await supabase.rpc("get_monthly_revenue_trend")

    // Get enrollment trend
    const { data: enrollmentTrend } = await supabase.rpc("get_enrollment_trend")

    // Get certificate distribution
    const { data: certData } = await supabase.from("certificates").select("is_revoked")

    const certByStatus = [
      { name: "Active", value: (certData || []).filter((c) => !c.is_revoked).length },
      { name: "Revoked", value: (certData || []).filter((c) => c.is_revoked).length },
    ]

    return NextResponse.json({
      totalStudents: studentCount || 0,
      totalInstructors: instructorCount || 0,
      totalCourses: courseCount || 0,
      totalEnrollments: enrollmentCount || 0,
      totalRevenue,
      totalCertificates: certificateCount || 0,
      pendingVerifications: 0,
      activeEnrollments: enrollmentCount || 0,
      monthlyRevenue: monthlyData || [],
      enrollmentTrend: enrollmentTrend || [],
      certificatesByStatus: certByStatus,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
