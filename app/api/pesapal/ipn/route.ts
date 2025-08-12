import { type NextRequest, NextResponse } from "next/server"
import { getPesapalAuthToken, getTransactionStatus, savePesapalPaymentToDatabase } from "@/lib/pesapal"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const orderMerchantReference = searchParams.get("OrderMerchantReference")

    if (!orderTrackingId) {
      return NextResponse.json({ error: "Order tracking ID is required" }, { status: 400 })
    }

    // Get authentication token
    const authResponse = await getPesapalAuthToken()

    if (!authResponse.token) {
      return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 })
    }

    // Get transaction status
    const transactionStatus = await getTransactionStatus(authResponse.token, orderTrackingId)

    // Update payment in database
    const paymentUpdateData = {
      order_tracking_id: orderTrackingId,
      merchant_reference: orderMerchantReference,
      status: transactionStatus.status,
      payment_method: transactionStatus.payment_method,
      amount: transactionStatus.amount,
      payment_date: transactionStatus.created_date,
      metadata: transactionStatus,
    }

    await savePesapalPaymentToDatabase(paymentUpdateData)

    // Return success response for Pesapal
    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Error processing Pesapal IPN:", error)
    return new Response("Error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests the same way
  return GET(request)
}
