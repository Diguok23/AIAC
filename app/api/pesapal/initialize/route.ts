import { type NextRequest, NextResponse } from "next/server"
import { getPesapalAuthToken, registerIPN, submitOrderToPesapal } from "@/lib/pesapal"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      amount,
      currency = "KES",
      applicationId,
      certificationId,
      programName,
      firstName,
      lastName,
      phoneNumber,
      countryCode = "KE",
    } = body

    if (!email || !amount) {
      return NextResponse.json({ error: "Email and amount are required" }, { status: 400 })
    }

    // Get authentication token
    const authResponse = await getPesapalAuthToken()

    if (!authResponse.token) {
      return NextResponse.json({ error: "Failed to authenticate with Pesapal" }, { status: 500 })
    }

    // Register IPN URL (only needs to be done once, but safe to call multiple times)
    const ipnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/pesapal/ipn`
    const ipnResponse = await registerIPN(authResponse.token, ipnUrl)

    // Create unique merchant reference
    const merchantReference = `APMIH_${Date.now()}_${Math.floor(Math.random() * 1000000)}`

    // Prepare order data
    const orderData = {
      id: merchantReference,
      currency: currency,
      amount: Number(amount),
      description: `Payment for ${programName}`,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/pesapal/verify`,
      notification_id: ipnResponse.ipn_id,
      billing_address: {
        email_address: email,
        phone_number: phoneNumber || "",
        country_code: countryCode,
        first_name: firstName || "",
        last_name: lastName || "",
      },
    }

    // Submit order to Pesapal
    const orderResponse = await submitOrderToPesapal(authResponse.token, orderData)

    if (!orderResponse.redirect_url) {
      return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
    }

    // Store payment info in our database
    const paymentInfo = {
      application_id: applicationId,
      certification_id: certificationId,
      merchant_reference: merchantReference,
      order_tracking_id: orderResponse.order_tracking_id,
      amount: amount,
      currency: currency,
      email: email,
      status: "pending",
      metadata: {
        program_name: programName,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      },
    }

    // Save to database
    const { savePesapalPaymentToDatabase } = await import("@/lib/pesapal")
    await savePesapalPaymentToDatabase(paymentInfo)

    return NextResponse.json({
      status: true,
      data: {
        authorization_url: orderResponse.redirect_url,
        order_tracking_id: orderResponse.order_tracking_id,
        merchant_reference: merchantReference,
      },
    })
  } catch (error) {
    console.error("Error initializing Pesapal payment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to initialize payment",
      },
      { status: 500 },
    )
  }
}
