import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: billingData, error } = await supabase
      .from("user_billing")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) throw error

    if (!billingData) {
      return NextResponse.json({
        totalRevenue: 0,
        totalPaid: 0,
        outstandingTotal: 0,
        transactions: [],
        monthlyStats: [],
      })
    }

    // Fetch user profiles
    const { data: userProfiles } = await supabase.from("user_profiles").select("id, full_name, user_id")

    // Get auth users
    let authUsers: any[] = []
    try {
      const { data: users } = await supabase.auth.admin.listUsers()
      authUsers = users?.users || []
    } catch (err) {
      console.log("Could not fetch auth users:", err)
    }

    const formattedTransactions = billingData.map((bill: any) => {
      const userProfile = (userProfiles || []).find((p: any) => p.id === bill.user_id)
      const authUser = authUsers.find((u) => u.id === userProfile?.user_id)

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
    return NextResponse.json({
      totalRevenue: 0,
      totalPaid: 0,
      outstandingTotal: 0,
      transactions: [],
      monthlyStats: [],
    })
  }
}
