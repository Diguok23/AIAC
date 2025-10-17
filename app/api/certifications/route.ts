import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const category = searchParams.get("category")

    let query = supabase.from("certifications").select("*")

    if (id) {
      query = query.eq("id", id)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ certifications: data || [] })
  } catch (error) {
    console.error("Error fetching certifications:", error)
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const {
      title,
      description,
      category,
      level,
      price,
      duration,
      instructor,
      long_description,
      instructor_bio,
      rating,
      student_count,
    } = body

    const { data, error } = await supabase
      .from("certifications")
      .insert({
        title,
        description,
        category,
        level,
        price,
        duration,
        instructor,
        long_description,
        instructor_bio,
        rating: rating || 0,
        student_count: student_count || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating certification:", error)
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 })
  }
}
