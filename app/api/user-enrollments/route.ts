import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    let query = supabase.from("user_enrollments").select(`
        *,
        certifications:certification_id (
          id,
          title,
          category,
          level,
          duration
        )
      `)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: enrollments, error } = await query

    if (error) {
      console.error("Error fetching user enrollments:", error)
      return NextResponse.json({ error: "Failed to fetch user enrollments" }, { status: 500 })
    }

    return NextResponse.json({ enrollments: enrollments || [] })
  } catch (error) {
    console.error("An error occurred while fetching user enrollments:", error)
    return NextResponse.json({ error: "An error occurred while fetching user enrollments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { userId, certificationId, dueDate } = await request.json()

    if (!userId || !certificationId) {
      return NextResponse.json({ error: "User ID and Certification ID are required" }, { status: 400 })
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("user_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("certification_id", certificationId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: "User is already enrolled in this certification" }, { status: 409 })
    }

    // Insert new enrollment
    const { data: newEnrollment, error: enrollError } = await supabase
      .from("user_enrollments")
      .insert({
        user_id: userId,
        certification_id: certificationId,
        status: "active", // Default to active when assigned by admin
        progress: 0,
        enrolled_at: new Date().toISOString(),
        started_at: new Date().toISOString(), // Assume started immediately if assigned
        due_date: dueDate || null,
        certificate_issued: false,
      })
      .select()
      .single()

    if (enrollError) {
      console.error("Error creating user enrollment:", enrollError)
      return NextResponse.json({ error: "Failed to create user enrollment" }, { status: 500 })
    }

    // Fetch modules for the certification and create user_modules entries
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("certification_id", certificationId)
      .order("order_num")

    if (modulesError) {
      console.error("Error fetching modules for new enrollment:", modulesError)
      // Continue, but log the error as modules might not be set up yet
    }

    if (modules && modules.length > 0) {
      const userModuleInserts = modules.map((module) => ({
        user_id: userId,
        course_id: certificationId, // Using course_id as certification_id for consistency with user_modules table
        module_id: module.id,
        is_completed: false,
      }))
      const { error: userModulesInsertError } = await supabase.from("user_modules").insert(userModuleInserts)
      if (userModulesInsertError) {
        console.error("Error inserting user modules for new enrollment:", userModulesInsertError)
      }
    }

    return NextResponse.json({ enrollment: newEnrollment })
  } catch (error) {
    console.error("An error occurred while assigning course:", error)
    return NextResponse.json({ error: "An error occurred while assigning course" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Enrollment ID is required for update" }, { status: 400 })
    }

    const { data, error } = await supabase.from("user_enrollments").update(updateData).eq("id", id).select()

    if (error) {
      console.error("Error updating user enrollment:", error)
      return NextResponse.json({ error: "Failed to update user enrollment" }, { status: 500 })
    }

    return NextResponse.json({ enrollment: data[0] })
  } catch (error) {
    console.error("An error occurred while updating user enrollment:", error)
    return NextResponse.json({ error: "An error occurred while updating user enrollment" }, { status: 500 })
  }
}
