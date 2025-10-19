import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Update instructor status
    const { error } = await supabase
      .from("instructors")
      .update({
        status: "approved",
        verified_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Instructor approved" })
  } catch (error) {
    console.error("Approve instructor error:", error)
    return NextResponse.json({ error: "Failed to approve instructor" }, { status: 500 })
  }
}
