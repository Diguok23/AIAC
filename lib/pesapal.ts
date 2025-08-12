const PESAPAL_BASE_URL =
  process.env.NODE_ENV === "production" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3"

export type PesapalPaymentData = {
  id: string
  currency: string
  amount: number
  description: string
  callback_url: string
  notification_id: string
  billing_address: {
    email_address: string
    phone_number: string
    country_code: string
    first_name: string
    middle_name?: string
    last_name: string
    line_1?: string
    line_2?: string
    city?: string
    state?: string
    postal_code?: string
  }
}

export type PesapalAuthResponse = {
  token: string
  expiryDate: string
  error?: any
  message?: string
}

export type PesapalSubmitOrderResponse = {
  order_tracking_id: string
  merchant_reference: string
  redirect_url: string
  error?: any
  message?: string
}

export type PesapalTransactionStatus = {
  payment_method: string
  amount: number
  created_date: string
  confirmation_code: string
  payment_status_description: string
  description: string
  message: string
  payment_account: string
  call_back_url: string
  status_code: number
  merchant_reference: string
  account_number: string
  status: string
  error?: any
}

// Get authentication token
export async function getPesapalAuthToken(): Promise<PesapalAuthResponse> {
  try {
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to get auth token")
    }

    return data
  } catch (error) {
    console.error("Error getting Pesapal auth token:", error)
    throw new Error("Failed to authenticate with Pesapal")
  }
}

// Register IPN URL
export async function registerIPN(token: string, ipnUrl: string) {
  try {
    const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: "GET",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to register IPN")
    }

    return data
  } catch (error) {
    console.error("Error registering IPN:", error)
    throw new Error("Failed to register IPN URL")
  }
}

// Submit order for processing
export async function submitOrderToPesapal(
  token: string,
  orderData: PesapalPaymentData,
): Promise<PesapalSubmitOrderResponse> {
  try {
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit order")
    }

    return data
  } catch (error) {
    console.error("Error submitting order to Pesapal:", error)
    throw new Error("Failed to submit order for processing")
  }
}

// Get transaction status
export async function getTransactionStatus(token: string, orderTrackingId: string): Promise<PesapalTransactionStatus> {
  try {
    const response = await fetch(
      `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to get transaction status")
    }

    return data
  } catch (error) {
    console.error("Error getting transaction status:", error)
    throw new Error("Failed to get transaction status")
  }
}

// Save payment to database
export async function savePesapalPaymentToDatabase(paymentData: any) {
  try {
    const { createServerSupabaseClient } = await import("./supabase")
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
          certification_id UUID REFERENCES certifications(id),
          reference TEXT NOT NULL UNIQUE,
          order_tracking_id TEXT,
          amount NUMERIC NOT NULL,
          currency TEXT NOT NULL,
          email TEXT NOT NULL,
          status TEXT NOT NULL,
          payment_method TEXT,
          payment_date TIMESTAMP WITH TIME ZONE,
          metadata JSONB,
          provider TEXT DEFAULT 'pesapal'
        )
      `)
    }

    const { data, error } = await supabase.from("payments").insert({
      application_id: paymentData.application_id,
      certification_id: paymentData.certification_id,
      reference: paymentData.merchant_reference,
      order_tracking_id: paymentData.order_tracking_id,
      amount: paymentData.amount,
      currency: paymentData.currency || "KES",
      email: paymentData.email,
      status: paymentData.status || "pending",
      payment_method: paymentData.payment_method,
      payment_date: paymentData.payment_date,
      metadata: paymentData,
      provider: "pesapal",
    })

    if (error) throw error

    // If payment is successful, update application status
    if (paymentData.status === "COMPLETED" && paymentData.application_id) {
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "payment_received" })
        .eq("id", paymentData.application_id)

      if (updateError) throw updateError
    }

    return data
  } catch (error) {
    console.error("Error saving Pesapal payment to database:", error)
    throw new Error("Failed to save payment information")
  }
}
