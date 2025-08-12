import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
    const { searchParams } = new URL(request.url)
    const certificationId = searchParams.get("certification_id")

    let query = supabase.from("modules").select("*").order("order_num")

    if (certificationId) {
      query = query.eq("certification_id", certificationId)
    }

    const { data: modules, error } = await query

    if (error) {
      console.error("Error fetching modules:", error)
      return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
    }

    return NextResponse.json({ modules: modules || [] })
  } catch (error) {
    console.error("An error occurred while fetching modules:", error)
    return NextResponse.json({ error: "An error occurred while fetching modules" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const body = await request.json()

    const { data, error } = await supabase.from("modules").insert([body]).select()

    if (error) {
      console.error("Error creating module:", error)
      return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
    }

    return NextResponse.json({ module: data[0] })
  } catch (error) {
    console.error("An error occurred while creating module:", error)
    return NextResponse.json({ error: "An error occurred while creating module" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Module ID is required for update" }, { status: 400 })
    }

    const { data, error } = await supabase.from("modules").update(updateData).eq("id", id).select()

    if (error) {
      console.error("Error updating module:", error)
      return NextResponse.json({ error: "Failed to update module" }, { status: 500 })
    }

    return NextResponse.json({ module: data[0] })
  } catch (error) {
    console.error("An error occurred while updating module:", error)
    return NextResponse.json({ error: "An error occurred while updating module" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Module ID is required for deletion" }, { status: 400 })
    }

    const { error } = await supabase.from("modules").delete().eq("id", id)

    if (error) {
      console.error("Error deleting module:", error)
      return NextResponse.json({ error: "Failed to delete module" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("An error occurred while deleting module:", error)
    return NextResponse.json({ error: "An error occurred while deleting module" }, { status: 500 })
  }
}
