import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { reason } = await request.json()

    // Update instructor status
    const { error } = await supabase
      .from("instructors")
      .update({
        status: "rejected",
        rejection_reason: reason || "Application rejected by admin",
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Instructor rejected" })
  } catch (error) {
    console.error("Reject instructor error:", error)
    return NextResponse.json({ error: "Failed to reject instructor" }, { status: 500 })
  }
}
