import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: certificates, error } = await supabase
      .from("certificates")
      .select(`
        id,
        certificate_number,
        user_id,
        certification_id,
        issue_date,
        expiry_date,
        is_revoked,
        file_url,
        user_profiles(full_name, email),
        certifications(title)
      `)
      .order("issue_date", { ascending: false })

    if (error) throw error

    const formattedCerts = (certificates || []).map((cert: any) => ({
      id: cert.id,
      certificateNumber: cert.certificate_number,
      studentName: cert.user_profiles?.full_name || "N/A",
      studentEmail: cert.user_profiles?.email || "N/A",
      courseName: cert.certifications?.title || "N/A",
      issueDate: cert.issue_date,
      expiryDate: cert.expiry_date,
      isRevoked: cert.is_revoked,
      fileUrl: cert.file_url,
    }))

    return NextResponse.json(formattedCerts)
  } catch (error) {
    console.error("Fetch certificates error:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}
