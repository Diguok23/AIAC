import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: certification, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching certification:", error)
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    return NextResponse.json(certification)
  } catch (error) {
    console.error("Error in certification API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
