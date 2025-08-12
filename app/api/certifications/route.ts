import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

    const { data: certifications, error } = await supabase
      .from("certifications")
      .select("*")
      .order("category")
      .order("title")

    if (error) {
      console.error("Error fetching certifications:", error)
      return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 })
    }

    return NextResponse.json({ certifications: certifications || [] })
  } catch (error) {
    console.error("Error fetching certifications:", error)
    return NextResponse.json({ error: "An error occurred while fetching certifications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const body = await request.json()

    const { data, error } = await supabase.from("certifications").insert([body]).select()

    if (error) {
      console.error("Error creating certification:", error)
      return NextResponse.json({ error: "Failed to create certification" }, { status: 500 })
    }

    return NextResponse.json({ certification: data[0] })
  } catch (error) {
    console.error("Error creating certification:", error)
    return NextResponse.json({ error: "An error occurred while creating certification" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const body = await request.json()
    const { id, ...updateData } = body

    const { data, error } = await supabase.from("certifications").update(updateData).eq("id", id).select()

    if (error) {
      console.error("Error updating certification:", error)
      return NextResponse.json({ error: "Failed to update certification" }, { status: 500 })
    }

    return NextResponse.json({ certification: data[0] })
  } catch (error) {
    console.error("Error updating certification:", error)
    return NextResponse.json({ error: "An error occurred while updating certification" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Certification ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("certifications").delete().eq("id", id)

    if (error) {
      console.error("Error deleting certification:", error)
      return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting certification:", error)
    return NextResponse.json({ error: "An error occurred while deleting certification" }, { status: 500 })
  }
}
