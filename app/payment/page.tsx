"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PesapalPaymentForm from "@/components/pesapal-payment-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [applicationData, setApplicationData] = useState<any>(null)
  const [certificationData, setCertificationData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const applicationId = searchParams?.get("applicationId")
    const certificationId = searchParams?.get("certificationId")

    if (!applicationId && !certificationId) {
      setError(
        "Application ID or Certification ID is required. Please return to the application form or certifications page.",
      )
      setLoading(false)
      return
    }

    // Fetch data based on what's provided
    let isMounted = true
    const fetchData = async () => {
      try {
        if (applicationId) {
          const response = await fetch(`/api/applications/${applicationId}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to fetch application data")
          }
          const data = await response.json()
          if (isMounted) {
            setApplicationData(data)
          }
        }

        if (certificationId) {
          const response = await fetch(`/api/certifications/${certificationId}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to fetch certification data")
          }
          const data = await response.json()
          if (isMounted) {
            setCertificationData(data)
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        if (isMounted) {
          setError(error.message || "Failed to load payment details")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading payment details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>There was a problem loading the payment page</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/apply")} className="w-full">
                  Return to Application Form
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Determine payment details based on available data
  const paymentData = applicationData || certificationData
  const programName = applicationData?.program_name || certificationData?.title || "Certification Program"
  const amount = applicationData?.program_price || certificationData?.price || 100
  const email = applicationData?.email || ""
  const firstName = applicationData?.first_name || ""
  const lastName = applicationData?.last_name || ""

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">
              Please review your information and complete the payment to finalize your enrollment.
            </p>
          </div>

          {paymentData && (
            <PesapalPaymentForm
              applicationId={applicationData?.id}
              certificationId={certificationData?.id}
              programName={programName}
              amount={amount}
              email={email}
              firstName={firstName}
              lastName={lastName}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
