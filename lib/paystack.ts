import { createServerSupabaseClient } from "./supabase"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = "https://api.paystack.co"

export type PaymentData = {
  email: string
  amount: number // amount in kobo/cents
  reference?: string
  metadata?: Record<string, any>
  callback_url?: string
  currency?: string
}

export type PaymentVerificationResponse = {
  status: boolean
  message: string
  data?: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    metadata: any
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string
      metadata: any
      risk_action: string
    }
  }
}

export async function initializePayment(data: PaymentData) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        callback_url: data.callback_url || "https://apmih.college/payment/verify",
        currency: data.currency || "KSH", // Default to KSH if not specified
      }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error initializing payment:", error)
    throw new Error("Failed to initialize payment")
  }
}

export async function verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Error verifying payment:", error)
    throw new Error("Failed to verify payment")
  }
}

export async function savePaymentToDatabase(paymentData: any) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if payments table exists, create if not
    const { error: tableCheckError } = await supabase.from("payments").select().limit(1)

    if (tableCheckError && tableCheckError.code === "42P01") {
      // Table doesn't exist, create it
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          application_id UUID REFERENCES applications(id),
          reference TEXT NOT NULL UNIQUE,
          amount NUMERIC NOT NULL,
          currency TEXT NOT NULL,
          email TEXT NOT NULL,
          status TEXT NOT NULL,
          payment_date TIMESTAMP WITH TIME ZONE,
          metadata JSONB
        )
      `)
    }

    // Get the original currency and amount from metadata if available
    const currency = paymentData.metadata?.original_currency || paymentData.currency || "KSH"
    const amount = paymentData.metadata?.original_amount || paymentData.amount / 100

    const { data, error } = await supabase.from("payments").insert({
      application_id: paymentData.metadata?.application_id,
      reference: paymentData.reference,
      amount: amount,
      currency: currency,
      email: paymentData.customer.email,
      status: paymentData.status,
      payment_date: paymentData.paid_at,
      metadata: paymentData,
    })

    if (error) throw error

    // If payment is successful, update application status
    if (paymentData.status === "success" && paymentData.metadata?.application_id) {
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "payment_received" })
        .eq("id", paymentData.metadata.application_id)

      if (updateError) throw updateError
    }

    return data
  } catch (error) {
    console.error("Error saving payment to database:", error)
    throw new Error("Failed to save payment information")
  }
}
