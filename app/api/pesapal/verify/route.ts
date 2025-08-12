import { type NextRequest, NextResponse } from "next/server"
import { getPesapalAuthToken, getTransactionStatus, savePesapalPaymentToDatabase } from "@/lib/pesapal"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const merchantReference = searchParams.get("OrderMerchantReference")

    if (!orderTrackingId) {
      return NextResponse.json({ error: "Order tracking ID is required" }, { status: 400 })
    }

    // Get authentication token
    const authResponse = await getPesapalAuthToken()

    if (!authResponse.token) {
      return NextResponse.json({ error: "Failed to authenticate with Pesapal" }, { status: 500 })
    }

    // Get transaction status
    const transactionStatus = await getTransactionStatus(authResponse.token, orderTrackingId)

    // Update payment in database
    const paymentUpdateData = {
      order_tracking_id: orderTrackingId,
      merchant_reference: merchantReference,
      status: transactionStatus.status,
      payment_method: transactionStatus.payment_method,
      amount: transactionStatus.amount,
      payment_date: transactionStatus.created_date,
      metadata: transactionStatus,
    }

    await savePesapalPaymentToDatabase(paymentUpdateData)

    return NextResponse.json({
      status: true,
      data: transactionStatus,
    })
  } catch (error) {
    console.error("Error verifying Pesapal payment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to verify payment",
      },
      { status: 500 },
    )
  }
}
