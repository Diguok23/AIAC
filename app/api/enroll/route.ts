import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { certificationId } = await request.json()

    if (!certificationId) {
      return NextResponse.json({ error: "Certification ID is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })

    // Get current user from session
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user_id = sessionData.session.user.id

    // Check if user has any existing active enrollments
    const { data: activeEnrollments, error: activeEnrollmentsError } = await supabase
      .from("user_enrollments")
      .select("id, certification_id")
      .eq("user_id", user_id)
      .eq("status", "active") // Only check for active enrollments

    if (activeEnrollmentsError) {
      console.error("Error checking active enrollments:", activeEnrollmentsError)
      return NextResponse.json({ error: "Failed to check existing enrollments" }, { status: 500 })
    }

    if (activeEnrollments && activeEnrollments.length > 0) {
      // If there's an active enrollment, prevent new enrollment
      return NextResponse.json(
        {
          error:
            "You can only be enrolled in one active course at a time. Please complete your current course or contact support.",
        },
        { status: 409 },
      ) // 409 Conflict
    }

    // Check if user has an approved application for this certification
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("email", sessionData.session.user.email)
      .eq("certification_id", certificationId)
      .eq("status", "approved")
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: "No approved application found for this certification" }, { status: 403 })
    }

    // Check if user is already enrolled in THIS specific certification (redundant if only one active is allowed, but good for clarity)
    const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", user_id)
      .eq("certification_id", certificationId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this certification" }, { status: 409 })
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("user_enrollments")
      .insert({
        user_id: user_id,
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
