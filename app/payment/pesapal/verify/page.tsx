"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PesapalPaymentVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"COMPLETED" | "FAILED" | "PENDING" | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const orderTrackingId = searchParams?.get("OrderTrackingId")
    const merchantReference = searchParams?.get("OrderMerchantReference")

    if (!orderTrackingId) {
      setError("Order tracking ID is missing")
      setVerifying(false)
      return
    }

    // Verify the payment only once when the component mounts
    let isMounted = true
    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/pesapal/verify?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${merchantReference}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Payment verification failed")
        }

        if (isMounted) {
          if (data.status && data.data) {
            setPaymentStatus(data.data.status)
            setPaymentDetails(data.data)
          } else {
            setPaymentStatus("FAILED")
            setError(data.message || "Payment verification failed")
          }
        }
      } catch (error: any) {
        console.error("Error verifying payment:", error)
        if (isMounted) {
          setPaymentStatus("FAILED")
          setError(error.message || "An error occurred while verifying your payment")
        }
      } finally {
        if (isMounted) {
          setVerifying(false)
        }
      }
    }

    verifyPayment()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [searchParams])

  // Helper function to format currency
  const formatCurrency = (amount: number, currency = "KES") => {
    const currencySymbol = currency === "USD" ? "$" : currency === "UGX" ? "UGX" : "KSh"
    return `${currencySymbol} ${Number(amount).toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600"
      case "FAILED":
        return "text-red-600"
      case "PENDING":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Payment Verification</CardTitle>
              <CardDescription>
                {verifying
                  ? "Verifying your payment..."
                  : paymentStatus === "COMPLETED"
                    ? "Your payment was successful"
                    : paymentStatus === "PENDING"
                      ? "Your payment is being processed"
                      : "Payment verification failed"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {verifying ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p>Please wait while we verify your payment...</p>
                </div>
              ) : paymentStatus === "COMPLETED" ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
                    <p className="text-gray-600">
                      Thank you for your payment. Your application process is now complete.
                    </p>
                  </div>

                  {paymentDetails && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Payment Details</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Amount:</span>{" "}
                          {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                        </p>
                        <p>
                          <span className="font-medium">Reference:</span> {paymentDetails.merchant_reference}
                        </p>
                        <p>
                          <span className="font-medium">Payment Method:</span> {paymentDetails.payment_method}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(paymentDetails.created_date).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          <span className={getStatusColor(paymentDetails.status)}>{paymentDetails.status}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : paymentStatus === "PENDING" ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Loader2 className="h-12 w-12 text-yellow-600 animate-spin" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Payment Processing</h3>
                    <p className="text-gray-600">
                      Your payment is being processed. Please check back in a few minutes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-red-100 p-3 rounded-full">
                      <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Payment Failed</h3>
                    <p className="text-gray-600">
                      We couldn't verify your payment. Please try again or contact support.
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-center">
              {!verifying && (
                <Button onClick={() => router.push(paymentStatus === "COMPLETED" ? "/" : "/certifications")}>
                  {paymentStatus === "COMPLETED" ? "Return to Home" : "Try Again"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
