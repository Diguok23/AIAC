import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: enrollments, error } = await supabase
      .from("user_enrollments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!enrollments) {
      return NextResponse.json({
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        totalStudents: 0,
        enrollments: [],
      })
    }

    // Fetch user profiles
    const { data: userProfiles } = await supabase.from("user_profiles").select("id, full_name, user_id")

    // Fetch certifications
    const { data: certifications } = await supabase.from("certifications").select("id, title")

    // Get auth users
    let authUsers: any[] = []
    try {
      const { data: users } = await supabase.auth.admin.listUsers()
      authUsers = users?.users || []
    } catch (err) {
      console.log("Could not fetch auth users:", err)
    }

    const formattedEnrollments = enrollments.map((e: any) => {
      const userProfile = (userProfiles || []).find((p: any) => p.id === e.user_id)
      const authUser = authUsers.find((u) => u.id === userProfile?.user_id)
      const course = (certifications || []).find((c: any) => c.id === e.certification_id)

      return {
        id: e.id,
        studentEmail: authUser?.email || "N/A",
        studentName: userProfile?.full_name || "N/A",
        studentId: e.user_id,
        courseName: course?.title || "N/A",
        status: e.status || "active",
        paymentStatus: e.payment_status || "pending",
        progress: e.progress || 0,
        createdAt: e.created_at,
        completedAt: e.completed_at,
      }
    })

    const totalEnrollments = formattedEnrollments.length
    const activeEnrollments = formattedEnrollments.filter((e) => e.status === "active").length
    const completedEnrollments = formattedEnrollments.filter((e) => e.status === "completed").length
    const uniqueStudents = new Set(formattedEnrollments.map((e) => e.studentEmail)).size

    return NextResponse.json({
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalStudents: uniqueStudents,
      enrollments: formattedEnrollments,
    })
  } catch (error) {
    console.error("Fetch enrollments error:", error)
    return NextResponse.json({
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      totalStudents: 0,
      enrollments: [],
    })
  }
}
