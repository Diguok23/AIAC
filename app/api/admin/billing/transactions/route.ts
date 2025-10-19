import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: transactions, error } = await supabase
      .from("billing_transactions")
      .select(`
        id,
        user_id,
        enrollment_id,
        amount,
        tax_amount,
        total_amount,
        payment_method,
        status,
        created_at,
        user_profiles(full_name, email),
        user_enrollments(certification_id, certifications(title))
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const formattedTransactions = (transactions || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      userEmail: t.user_profiles?.email || "N/A",
      userName: t.user_profiles?.full_name || "N/A",
      enrollmentId: t.enrollment_id,
      courseName: t.user_enrollments?.certifications?.title || "N/A",
      amount: t.amount,
      taxAmount: t.tax_amount,
      totalAmount: t.total_amount,
      paymentMethod: t.payment_method,
      status: t.status,
      createdAt: t.created_at,
    }))

    // Calculate stats
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
    return NextResponse.json({ error: "Failed to fetch billing data" }, { status: 500 })
  }
}
