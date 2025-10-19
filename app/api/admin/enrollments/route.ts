import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: enrollments, error } = await supabase
      .from("user_enrollments")
      .select(`
        id,
        user_id,
        certification_id,
        status,
        start_date,
        due_date,
        price,
        tax_amount,
        payment_status,
        user_profiles(full_name, email),
        certifications(title)
      `)
      .order("start_date", { ascending: false })

    if (error) throw error

    const formattedEnrollments = (enrollments || []).map((e: any) => ({
      id: e.id,
      studentEmail: e.user_profiles?.email || "N/A",
      studentName: e.user_profiles?.full_name || "N/A",
      courseName: e.certifications?.title || "N/A",
      price: e.price || 0,
      taxAmount: Math.round((e.price || 0) * 0.16 * 100) / 100,
      totalAmount: (e.price || 0) + Math.round((e.price || 0) * 0.16 * 100) / 100,
      status: e.status,
      paymentStatus: e.payment_status,
      startDate: e.start_date,
      dueDate: e.due_date,
      progress: 0,
    }))

    // Calculate stats
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
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
