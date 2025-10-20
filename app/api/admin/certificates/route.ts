import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: certificates, error } = await supabase
      .from("certificates")
      .select("*")
      .order("issue_date", { ascending: false })

    if (error) {
      console.error("Error fetching certificates:", error)
      return NextResponse.json([], { status: 200 })
    }

    // Fetch user profiles
    const { data: userProfiles } = await supabase.from("user_profiles").select("id, full_name, user_id")

    // Fetch certifications
    const { data: certifications } = await supabase.from("certifications").select("id, title")

    // Fetch auth users for emails
    const { data: authUsers } = await supabase.auth.admin.listUsers()

    const formattedCerts = (certificates || []).map((cert: any) => {
      const userProfile = userProfiles?.find((p) => p.id === cert.user_id)
      const authUser = authUsers?.users?.find((u) => u.id === userProfile?.user_id)
      const course = certifications?.find((c) => c.id === cert.certification_id)

      return {
        id: cert.id,
        certificateNumber: cert.certificate_number,
        studentName: userProfile?.full_name || "N/A",
        studentEmail: authUser?.email || "N/A",
        courseName: course?.title || "N/A",
        issueDate: cert.issue_date,
        expiryDate: cert.expiry_date,
        isRevoked: cert.is_revoked || false,
        fileUrl: cert.file_url,
      }
    })

    return NextResponse.json(formattedCerts)
  } catch (error) {
    console.error("Fetch certificates error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
