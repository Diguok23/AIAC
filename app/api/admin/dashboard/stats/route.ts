import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get total students
    const { count: studentCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

    // Get total courses
    const { count: courseCount } = await supabase.from("certifications").select("*", { count: "exact", head: true })

    // Get total enrollments
    const { count: enrollmentCount } = await supabase
      .from("user_enrollments")
      .select("*", { count: "exact", head: true })

    // Get total certificates
    const { count: certificateCount } = await supabase.from("certificates").select("*", { count: "exact", head: true })

    // Get total revenue from completed transactions
    const { data: transactionData, error: transactionError } = await supabase
      .from("billing_transactions")
      .select("total_amount")
      .eq("status", "completed")

    const totalRevenue = (transactionData || []).reduce((sum, t) => sum + (t.total_amount || 0), 0)

    // Mock monthly revenue trend data
    const monthlyRevenue = [
      { month: "Jan", revenue: 0 },
      { month: "Feb", revenue: 0 },
      { month: "Mar", revenue: 0 },
      { month: "Apr", revenue: 0 },
      { month: "May", revenue: totalRevenue },
      { month: "Jun", revenue: totalRevenue },
    ]

    // Mock enrollment trend
    const enrollmentTrend = [
      { month: "Jan", enrollments: 0 },
      { month: "Feb", enrollments: 5 },
      { month: "Mar", enrollments: 12 },
      { month: "Apr", enrollments: 8 },
      { month: "May", enrollments: 15 },
      { month: "Jun", enrollments: enrollmentCount || 0 },
    ]

    // Get certificate distribution
    const { data: certData } = await supabase.from("certificates").select("is_revoked")

    const activeCerts = (certData || []).filter((c) => !c.is_revoked).length
    const revokedCerts = (certData || []).filter((c) => c.is_revoked).length

    const certificatesByStatus = [
      { name: "Active", value: activeCerts },
      { name: "Revoked", value: revokedCerts },
    ]

    return NextResponse.json({
      totalStudents: studentCount || 0,
      totalInstructors: 0,
      totalCourses: courseCount || 0,
      totalEnrollments: enrollmentCount || 0,
      totalRevenue,
      totalCertificates: certificateCount || 0,
      pendingVerifications: 0,
      activeEnrollments: enrollmentCount || 0,
      monthlyRevenue,
      enrollmentTrend,
      certificatesByStatus,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      {
        totalStudents: 0,
        totalInstructors: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        totalCertificates: 0,
        pendingVerifications: 0,
        activeEnrollments: 0,
        monthlyRevenue: [],
        enrollmentTrend: [],
        certificatesByStatus: [],
      },
      { status: 200 },
    )
  }
}
