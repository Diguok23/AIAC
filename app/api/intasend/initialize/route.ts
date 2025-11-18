import { type NextRequest, NextResponse } from "next/server"
import { initializeIntasendPayment } from "@/lib/intasend"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      amount,
      currency = "USD",
      applicationId,
      certificationId,
      userId,
      programName,
      firstName,
      lastName,
      phoneNumber,
    } = body

    if (!email || !amount) {
      return NextResponse.json({ error: "Email and amount are required" }, { status: 400 })
    }

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const paymentData = {
      first_name: firstName || "Customer",
      last_name: lastName || "Payment",
      email,
      phone_number: phoneNumber,
      amount: Number(amount),
      currency: "USD", // Force USD currency
      invoice_id: `APMIH_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    }

    const response = await initializeIntasendPayment(paymentData)

    // Store payment info in database
    const { saveIntasendPaymentToDatabase } = await import("@/lib/intasend")
    await saveIntasendPaymentToDatabase({
      application_id: applicationId,
      certification_id: certificationId,
      invoice_id: response.billing.invoice_id,
      amount: response.billing.amount,
      currency: response.billing.currency,
      email: response.billing.email,
      state: response.billing.state,
      metadata: {
        program_name: programName,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        user_id: userId, // Added user_id to metadata
        certification_id: certificationId, // Ensure certification_id is in metadata
      },
    })

    return NextResponse.json({
      status: true,
      data: {
        authorization_url: response.billing.hosted_invoice_url,
        invoice_id: response.billing.invoice_id,
      },
    })
  } catch (error) {
    console.error("Error initializing Intasend payment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to initialize payment",
      },
      { status: 500 },
    )
  }
}
