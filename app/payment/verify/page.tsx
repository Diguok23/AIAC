"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PaymentVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const reference = searchParams?.get("reference")

    if (!reference) {
      setError("Payment reference is missing")
      setVerifying(false)
      return
    }

    // Verify the payment only once when the component mounts or reference changes
    let isMounted = true
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?reference=${reference}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Payment verification failed")
        }

        if (isMounted) {
          if (data.status && data.data) {
            setPaymentStatus(data.data.status === "success" ? "success" : "failed")
            setPaymentDetails(data.data)
          } else {
            setPaymentStatus("failed")
            setError(data.message || "Payment verification failed")
          }
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        if (isMounted) {
          setPaymentStatus("failed")
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
  const formatCurrency = (amount, currency) => {
    const currencySymbol = currency === "USD" ? "$" : "KSh"
    return `${currencySymbol}${Number.parseFloat(amount).toLocaleString()}`
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
                  : paymentStatus === "success"
                    ? "Your payment was successful"
                    : "Payment verification failed"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {verifying ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p>Please wait while we verify your payment...</p>
                </div>
              ) : paymentStatus === "success" ? (
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
                          {formatCurrency(
                            paymentDetails.metadata?.original_amount || paymentDetails.amount / 100,
                            paymentDetails.metadata?.original_currency || paymentDetails.currency,
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Reference:</span> {paymentDetails.reference}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(paymentDetails.paid_at).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Currency:</span>{" "}
                          {paymentDetails.metadata?.original_currency || paymentDetails.currency}
                        </p>
                      </div>
                    </div>
                  )}
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
                <Button onClick={() => router.push(paymentStatus === "success" ? "/" : "/payment")}>
                  {paymentStatus === "success" ? "Return to Home" : "Try Again"}
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
