import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Fetch application data
    const { data: application, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single()

    if (error) {
      console.error("Error fetching application:", error)
      return NextResponse.json({ error: "Failed to fetch application details" }, { status: 500 })
    }

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Separately fetch the certification price based on program name
    let programPrice = null
    if (application.program_name) {
      const { data: certification, error: certError } = await supabase
        .from("certifications")
        .select("price")
        .eq("title", application.program_name)
        .single()

      if (!certError && certification) {
        programPrice = certification.price
      } else {
        console.log("Could not find certification price:", certError)
        // Set a default price if we can't find the certification
        programPrice = 100
      }
    }

    return NextResponse.json({
      ...application,
      program_price: programPrice,
    })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "An error occurred while fetching application details" }, { status: 500 })
  }
}
