import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { reason } = await request.json()

    // Get admin ID from session
    const adminSession = request.headers.get("x-admin-id")

    const { error } = await supabase
      .from("certificates")
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_reason: reason,
        revoked_by: adminSession,
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Certificate revoked" })
  } catch (error) {
    console.error("Revoke certificate error:", error)
    return NextResponse.json({ error: "Failed to revoke certificate" }, { status: 500 })
  }
}
