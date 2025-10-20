import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get counts
    const { count: studentCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

    const { count: courseCount } = await supabase.from("certifications").select("*", { count: "exact", head: true })

    const { count: enrollmentCount } = await supabase
      .from("user_enrollments")
      .select("*", { count: "exact", head: true })

    const { count: certificateCount } = await supabase.from("certificates").select("*", { count: "exact", head: true })

    // Get billing data
    const { data: billingData } = await supabase.from("user_billing").select("total_spent, total_paid")

    const totalRevenue = (billingData || []).reduce((sum, b: any) => sum + (b.total_spent || 0), 0)
    const totalPaid = (billingData || []).reduce((sum, b: any) => sum + (b.total_paid || 0), 0)

    // Get certificate distribution
    const { data: certData } = await supabase.from("certificates").select("is_revoked")

    const activeCerts = (certData || []).filter((c: any) => !c.is_revoked).length
    const revokedCerts = (certData || []).filter((c: any) => c.is_revoked).length

    return NextResponse.json({
      totalStudents: studentCount || 0,
      totalInstructors: 0,
      totalCourses: courseCount || 0,
      totalEnrollments: enrollmentCount || 0,
      totalRevenue,
      totalPaid,
      totalCertificates: certificateCount || 0,
      pendingVerifications: 0,
      activeEnrollments: enrollmentCount || 0,
      monthlyRevenue: [],
      enrollmentTrend: [],
      certificatesByStatus: [
        { name: "Active", value: activeCerts },
        { name: "Revoked", value: revokedCerts },
      ],
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
        totalPaid: 0,
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
