import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const certificationId = searchParams.get("certification_id")

    let query = supabase.from("learning_outcomes").select("*")

    if (certificationId) {
      query = query.eq("certification_id", certificationId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ outcomes: data || [] })
  } catch (error) {
    console.error("Error fetching learning outcomes:", error)
    return NextResponse.json({ error: "Failed to fetch learning outcomes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase.from("learning_outcomes").insert(body).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating learning outcome:", error)
    return NextResponse.json({ error: "Failed to create learning outcome" }, { status: 500 })
  }
}
