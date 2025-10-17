import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const certificationId = searchParams.get("certification_id")

    // First, check if user is enrolled in this certification
    if (certificationId) {
      const { data: enrollment, error: enrollError } = await supabase
        .from("user_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("certification_id", certificationId)
        .maybeSingle()

      if (enrollError) throw enrollError
      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
      }
    }

    let query = supabase
      .from("course_schedule")
      .select("*")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })

    if (certificationId) {
      query = query.eq("certification_id", certificationId)
    }

    const { data: schedules, error } = await query

    if (error) throw error

    return NextResponse.json({ schedules: schedules || [] })
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: schedule, error } = await supabase.from("course_schedule").insert(body).select().single()

    if (error) throw error

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}
