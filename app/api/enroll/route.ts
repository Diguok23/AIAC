import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

export async function POST(request: Request) {
  try {
    const { certificationId, userId } = await request.json()

    if (!certificationId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("user_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("certification_id", certificationId)
      .maybeSingle()

    if (checkError) {
      console.error("Check enrollment error:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this certification" }, { status: 409 })
    }

    // Get certification details
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("id, title, description, price")
      .eq("id", certificationId)
      .single()

    if (certError || !certification) {
      console.error("Certification error:", certError)
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    // Calculate billing info
    const DST_TAX_RATE = 0.16
    const basePrice = Number.parseFloat(certification.price?.toString() || "0")
    const dstTax = basePrice * DST_TAX_RATE
    const totalAmount = basePrice + dstTax

    return NextResponse.json({
      success: true,
      billing: {
        basePrice,
        dstTax,
        totalAmount,
      },
      message: "Ready for payment",
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
