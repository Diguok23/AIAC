import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { studentId, certificationId, issueDate, expiryDate } = await request.json()

    if (!studentId || !certificationId) {
      return NextResponse.json({ error: "Student ID and Certification ID are required" }, { status: 400 })
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create certificate record
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        certificate_number: certificateNumber,
        user_id: studentId,
        certification_id: certificationId,
        issue_date: issueDate || new Date().toISOString(),
        expiry_date: expiryDate || null,
        is_revoked: false,
      })
      .select()
      .single()

    if (certError) {
      console.error("Error issuing certificate:", certError)
      return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 })
    }

    // Update enrollment to mark certificate as issued
    await supabase
      .from("user_enrollments")
      .update({
        certificate_issued: true,
        certificate_verification_code: certificateNumber,
      })
      .eq("user_id", studentId)
      .eq("certification_id", certificationId)

    return NextResponse.json({ success: true, certificate })
  } catch (error) {
    console.error("Issue certificate error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
