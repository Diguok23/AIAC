import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Fetch from user_billing instead of billing_transactions
    const { data: billingData, error } = await supabase
      .from("user_billing")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching billing data:", error)
      return NextResponse.json(
        {
          totalRevenue: 0,
          totalBilled: 0,
          totalPaid: 0,
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

    const formattedTransactions = (billingData || []).map((bill: any) => {
      const userProfile = userProfiles?.find((p) => p.id === bill.user_id)
      const authUser = authUsers?.users?.find((u) => u.id === userProfile?.user_id)

      return {
        id: bill.id,
        userId: bill.user_id,
        userEmail: authUser?.email || "N/A",
        userName: userProfile?.full_name || "N/A",
        totalSpent: bill.total_spent || 0,
        totalPaid: bill.total_paid || 0,
        outstandingBalance: (bill.total_spent || 0) - (bill.total_paid || 0),
        status: bill.payment_status || "pending",
        lastPaymentDate: bill.last_payment_date,
        updatedAt: bill.updated_at,
      }
    })

    const totalRevenue = formattedTransactions.reduce((sum, t) => sum + t.totalSpent, 0)
    const totalPaid = formattedTransactions.reduce((sum, t) => sum + t.totalPaid, 0)
    const outstandingTotal = formattedTransactions.reduce((sum, t) => sum + t.outstandingBalance, 0)

    return NextResponse.json({
      totalRevenue,
      totalPaid,
      outstandingTotal,
      transactions: formattedTransactions,
      monthlyStats: [],
    })
  } catch (error) {
    console.error("Fetch billing error:", error)
    return NextResponse.json(
      {
        totalRevenue: 0,
        totalBilled: 0,
        totalPaid: 0,
        transactions: [],
        monthlyStats: [],
      },
      { status: 200 },
    )
  }
}
