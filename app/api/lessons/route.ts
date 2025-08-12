import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("module_id")

    let query = supabase.from("lessons").select("*").order("order_num")

    if (moduleId) {
      query = query.eq("module_id", moduleId)
    }

    const { data: lessons, error } = await query

    if (error) {
      console.error("Error fetching lessons:", error)
      return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
    }

    return NextResponse.json({ lessons: lessons || [] })
  } catch (error) {
    console.error("An error occurred while fetching lessons:", error)
    return NextResponse.json({ error: "An error occurred while fetching lessons" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const body = await request.json()

    const { data, error } = await supabase.from("lessons").insert([body]).select()

    if (error) {
      console.error("Error creating lesson:", error)
      return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
    }

    return NextResponse.json({ lesson: data[0] })
  } catch (error) {
    console.error("An error occurred while creating lesson:", error)
    return NextResponse.json({ error: "An error occurred while creating lesson" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Lesson ID is required for update" }, { status: 400 })
    }

    const { data, error } = await supabase.from("lessons").update(updateData).eq("id", id).select()

    if (error) {
      console.error("Error updating lesson:", error)
      return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
    }

    return NextResponse.json({ lesson: data[0] })
  } catch (error) {
    console.error("An error occurred while updating lesson:", error)
    return NextResponse.json({ error: "An error occurred while updating lesson" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Lesson ID is required for deletion" }, { status: 400 })
    }

    const { error } = await supabase.from("lessons").delete().eq("id", id)

    if (error) {
      console.error("Error deleting lesson:", error)
      return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("An error occurred while deleting lesson:", error)
    return NextResponse.json({ error: "An error occurred while deleting lesson" }, { status: 500 })
  }
}
