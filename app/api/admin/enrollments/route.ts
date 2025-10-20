import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Fetch directly from user_enrollments
    const { data: enrollments, error } = await supabase
      .from("user_enrollments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching enrollments:", error)
      return NextResponse.json(
        {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          totalStudents: 0,
          enrollments: [],
        },
        { status: 200 },
      )
    }

    // Fetch user profiles
    const { data: userProfiles } = await supabase.from("user_profiles").select("id, full_name, user_id")

    // Fetch certifications
    const { data: certifications } = await supabase.from("certifications").select("id, title")

    // Fetch auth users for emails
    const { data: authUsers } = await supabase.auth.admin.listUsers()

    const formattedEnrollments = (enrollments || []).map((e: any) => {
      const userProfile = userProfiles?.find((p) => p.id === e.user_id)
      const authUser = authUsers?.users?.find((u) => u.id === userProfile?.user_id)
      const course = certifications?.find((c) => c.id === e.certification_id)

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
    return NextResponse.json(
      {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        totalStudents: 0,
        enrollments: [],
      },
      { status: 200 },
    )
  }
}
