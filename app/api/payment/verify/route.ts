import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment, savePaymentToDatabase } from "@/lib/paystack"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    const verification = await verifyPayment(reference)

    if (!verification.status) {
      return NextResponse.json({ error: verification.message || "Payment verification failed" }, { status: 400 })
    }

    // Save payment information to database
    if (verification.data) {
      await savePaymentToDatabase(verification.data)
    }

    return NextResponse.json(verification)
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
