import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ isInstructor: false })
    }

    // Check if user is an instructor
    const { data: instructor, error } = await supabase
      .from("instructors")
      .select("id, status")
      .eq("user_id", userId)
      .single()

    if (error || !instructor) {
      return NextResponse.json({ isInstructor: false })
    }

    return NextResponse.json({
      isInstructor: true,
      instructorId: instructor.id,
      status: instructor.status,
    })
  } catch (error) {
    console.error("Error checking instructor status:", error)
    return NextResponse.json({ isInstructor: false })
  }
}
