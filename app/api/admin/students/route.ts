import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Fetch all user profiles
    const { data: profiles, error: profilesError } = await supabase.from("user_profiles").select("*")

    if (profilesError) throw profilesError

    if (!profiles || profiles.length === 0) {
      return NextResponse.json([])
    }

    // Get all auth users
    let authUsers: any[] = []
    try {
      const { data: users } = await supabase.auth.admin.listUsers()
      authUsers = users?.users || []
    } catch (err) {
      console.log("Could not fetch auth users:", err)
    }

    // Fetch all enrollments
    const { data: enrollments } = await supabase.from("user_enrollments").select("user_id")

    // Fetch all billing data
    const { data: billing } = await supabase.from("user_billing").select("user_id, total_spent")

    const students = profiles.map((profile: any) => {
      const authUser = authUsers.find((u) => u.id === profile.user_id)
      const userEnrollments = (enrollments || []).filter((e: any) => e.user_id === profile.id)
      const billingRecord = (billing || []).find((b: any) => b.user_id === profile.id)

      return {
        id: profile.id,
        email: authUser?.email || profile.email || "N/A",
        fullName: profile.full_name || "N/A",
        phone: profile.phone_number || "N/A",
        address: profile.address || "N/A",
        enrollmentCount: userEnrollments.length || 0,
        totalSpent: billingRecord?.total_spent || 0,
        verificationStatus: authUser ? "verified" : "pending",
        createdAt: profile.created_at,
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Fetch students error:", error)
    return NextResponse.json([])
  }
}
