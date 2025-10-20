import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: transactions, error } = await supabase
      .from("billing_transactions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json(
        {
          totalRevenue: 0,
          totalTax: 0,
          pendingAmount: 0,
          transactions: [],
          monthlyStats: [],
        },
        { status: 200 },
      )
    }

    // Fetch user profiles
    const { data: userProfiles } = await supabase.from("user_profiles").select("id, full_name, user_id")

    // Fetch auth users for emails
    const { data: authUsers } = await supabase.auth.admin.listUsers()

    // Fetch enrollments for course names
    const { data: enrollments } = await supabase.from("user_enrollments").select("id, certification_id")

    // Fetch certifications for course titles
    const { data: certifications } = await supabase.from("certifications").select("id, title")

    const formattedTransactions = (transactions || []).map((t: any) => {
      const userProfile = userProfiles?.find((p) => p.id === t.user_id)
      const authUser = authUsers?.users?.find((u) => u.id === userProfile?.user_id)
      const enrollment = enrollments?.find((e) => e.id === t.enrollment_id)
      const course = certifications?.find((c) => c.id === enrollment?.certification_id)

      return {
        id: t.id,
        userId: t.user_id,
        userEmail: authUser?.email || "N/A",
        userName: userProfile?.full_name || "N/A",
        enrollmentId: t.enrollment_id,
        courseName: course?.title || "N/A",
        amount: t.amount || 0,
        taxAmount: t.tax_amount || 0,
        totalAmount: t.total_amount || 0,
        paymentMethod: t.payment_method,
        status: t.status || "pending",
        createdAt: t.created_at,
      }
    })

    const completed = formattedTransactions.filter((t) => t.status === "completed")
    const totalRevenue = completed.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalTax = completed.reduce((sum, t) => sum + t.taxAmount, 0)
    const pendingAmount = formattedTransactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.totalAmount, 0)

    return NextResponse.json({
      totalRevenue,
      totalTax,
      pendingAmount,
      transactions: formattedTransactions,
      monthlyStats: [],
    })
  } catch (error) {
    console.error("Fetch billing error:", error)
    return NextResponse.json(
      {
        totalRevenue: 0,
        totalTax: 0,
        pendingAmount: 0,
        transactions: [],
        monthlyStats: [],
      },
      { status: 200 },
    )
  }
}
