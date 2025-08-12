import { type NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, applicationId, programName, currency = "KSH" } = body

    if (!email || !amount) {
      return NextResponse.json({ error: "Email and amount are required" }, { status: 400 })
    }

    // Convert amount to the smallest currency unit (cents/kobo)
    const amountInSmallestUnit = Math.round(amount * 100)

    const paymentData = {
      email,
      amount: amountInSmallestUnit,
      reference: `APMIH_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
      metadata: {
        application_id: applicationId,
        program_name: programName,
        original_currency: currency,
        original_amount: amount,
      },
      callback_url: "https://apmih.college/payment/verify",
      currency: currency, // Use the selected currency
    }

    const response = await initializePayment(paymentData)

    if (!response.status) {
      return NextResponse.json({ error: response.message || "Payment initialization failed" }, { status: 400 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error initializing payment:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
