import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const certificationId = searchParams.get("certification_id")

    let query = supabase.from("prerequisites").select("*")

    if (certificationId) {
      query = query.eq("certification_id", certificationId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ prerequisites: data || [] })
  } catch (error) {
    console.error("Error fetching prerequisites:", error)
    return NextResponse.json({ error: "Failed to fetch prerequisites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase.from("prerequisites").insert(body).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating prerequisite:", error)
    return NextResponse.json({ error: "Failed to create prerequisite" }, { status: 500 })
  }
}
