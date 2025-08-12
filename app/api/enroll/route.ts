import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { certificationId } = await request.json()

    if (!certificationId) {
      return NextResponse.json({ error: "Certification ID is required" }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user has an approved application for this certification
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("email", user.email)
      .eq("certification_id", certificationId)
      .eq("status", "approved")
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: "No approved application found for this certification" }, { status: 403 })
    }

    // Check if user is already enrolled
    const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("certification_id", certificationId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this certification" }, { status: 409 })
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("user_enrollments")
      .insert({
        user_id: user.id,
        certification_id: certificationId,
        status: "active",
        progress: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error("Enrollment error:", enrollmentError)
      return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      enrollment,
      message: "Successfully enrolled in certification",
    })
  } catch (error) {
    console.error("Enroll API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
