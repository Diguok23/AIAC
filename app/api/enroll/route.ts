import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { certificationId, userId } = await request.json()

    if (!certificationId || !userId) {
      return NextResponse.json({ error: "Certification ID and User ID are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Check if already enrolled
    const { data: existing, error: existingError } = await supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("certification_id", certificationId)
      .maybeSingle()

    if (existingError) {
      console.error("Check existing enrollment error:", existingError)
    }

    if (existing) {
      return NextResponse.json({ error: "Already enrolled in this certification" }, { status: 409 })
    }

    // Get certification details
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("*")
      .eq("id", certificationId)
      .maybeSingle()

    if (certError || !certification) {
      console.error("Certification fetch error:", certError)
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    // Create enrollment with correct status values
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 90)

    const { data: enrollment, error: enrollError } = await supabase
      .from("user_enrollments")
      .insert({
        user_id: userId,
        certification_id: certificationId,
        status: "active",
        progress: 0,
        payment_status: "pending",
        due_date: dueDate.toISOString(),
      })
      .select()
      .single()

    if (enrollError) {
      console.error("Enrollment creation error:", enrollError)
      return NextResponse.json({ error: "Failed to create enrollment: " + enrollError.message }, { status: 500 })
    }

    // Get modules for this certification
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("certification_id", certificationId)
      .order("order_num")

    if (modulesError) {
      console.error("Modules fetch error:", modulesError)
    }

    // Create user_modules entries if modules exist
    if (modules && modules.length > 0) {
      const userModules = modules.map((module) => ({
        user_id: userId,
        module_id: module.id,
        is_completed: false,
      }))

      const { error: moduleInsertError } = await supabase.from("user_modules").insert(userModules)

      if (moduleInsertError) {
        console.error("User modules insert error:", moduleInsertError)
      }
    }

    return NextResponse.json({
      success: true,
      enrollment,
      message: "Enrolled successfully",
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ error: "Internal server error: " + String(error) }, { status: 500 })
  }
}
