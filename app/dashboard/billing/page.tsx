"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Certification {
  id: string
  title: string
  description: string
  price: number
  level: string
  duration: string
}

interface BillingItem {
  label: string
  amount: number
}

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [certification, setCertification] = useState<Certification | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [pageReady, setPageReady] = useState(false)
  const hasInitialized = useRef(false)

  const DST_TAX_RATE = 0.16

  useEffect(() => {
    // Only run once
    if (hasInitialized.current) return
    hasInitialized.current = true

    const initializePage = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase configuration is missing")
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get current user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError("Authentication failed")
          setLoading(false)
          setTimeout(() => router.push("/login"), 1500)
          return
        }

        if (!session?.user) {
          setError("Please log in to continue")
          setLoading(false)
          setTimeout(() => router.push("/login"), 1500)
          return
        }

        setUserId(session.user.id)

        // Get certification ID from URL
        const certificationId = searchParams.get("certification")
        if (!certificationId) {
          setError("No certification selected. Redirecting...")
          setLoading(false)
          setTimeout(() => router.push("/dashboard/certifications"), 1500)
          return
        }

        // Fetch certification by ID
        let { data: cert, error: certError } = await supabase
          .from("certifications")
          .select("id, title, description, price, level, duration")
          .eq("id", certificationId)
          .single()

        // If not found by ID, try by slug
        if (certError) {
          const { data: certBySlug, error: slugError } = await supabase
            .from("certifications")
            .select("id, title, description, price, level, duration")
            .eq("slug", certificationId)
            .single()

          if (slugError || !certBySlug) {
            setError("Certification not found")
            setLoading(false)
            setTimeout(() => router.push("/dashboard/certifications"), 1500)
            return
          }
          cert = certBySlug
        }

        if (!cert) {
          setError("Certification not found")
          setLoading(false)
          setTimeout(() => router.push("/dashboard/certifications"), 1500)
          return
        }

        setCertification({
          id: cert.id,
          title: cert.title || "",
          description: cert.description || "",
          price: cert.price || 0,
          level: cert.level || "Beginner",
          duration: cert.duration || "Self-paced",
        })

        setLoading(false)
        setPageReady(true)
      } catch (err) {
        console.error("Error loading billing page:", err)
        setError("An unexpected error occurred")
        setLoading(false)
        setTimeout(() => router.push("/dashboard/certifications"), 1500)
      }
    }

    initializePage()
  }, [searchParams, router])

  const handleEnroll = useCallback(async () => {
    if (!certification || !userId) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      })
      return
    }

    setEnrolling(true)

    try {
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificationId: certification.id,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Enrollment response error:", data)
        throw new Error(data.error || "Failed to enroll")
      }

      toast({
        title: "Success!",
        description:
          "Enrollment confirmed! You will receive an email shortly with payment instructions. You can now access course materials.",
      })

      // Wait before redirecting
      setTimeout(() => {
        router.push("/dashboard/certifications")
      }, 2000)
    } catch (error) {
      console.error("Error enrolling:", error)
      setEnrolling(false)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete enrollment",
        variant: "destructive",
      })
    }
  }, [certification, userId, router])

  const handleCancel = useCallback(() => {
    router.push("/dashboard/certifications")
  }, [router])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground font-medium">Loading billing information...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !pageReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-start">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-600">{error || "Loading..."}</p>
                <p className="text-sm text-red-600/70 mt-1">Redirecting you back...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No certification found
  if (!certification) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">Certification not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate amounts
  const programFee = certification.price || 0
  const dstTax = programFee * DST_TAX_RATE
  const totalAmount = programFee + dstTax

  const billingItems: BillingItem[] = [
    { label: "Program Fee", amount: programFee },
    { label: `DST Tax (16%)`, amount: dstTax },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Enrollment & Payment</h1>
        <p className="text-muted-foreground">Review and confirm your enrollment details</p>
      </div>

      {/* Certification Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl">{certification.title}</CardTitle>
          <CardDescription className="text-base mt-2">{certification.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Difficulty Level</p>
              <Badge className="mt-1 text-sm">{certification.level}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Course Duration</p>
              <p className="font-semibold text-sm mt-1">{certification.duration || "Self-paced"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Cost Breakdown
          </CardTitle>
          <CardDescription>Itemized billing summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {billingItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
              <span className="text-muted-foreground font-medium">{item.label}</span>
              <span className="font-semibold text-lg">${item.amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg mt-6 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount Due</span>
              <span className="font-bold text-4xl text-green-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Alert className="border-blue-200 bg-blue-50 border-l-4 border-l-blue-600">
        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
        <AlertDescription className="ml-2 text-blue-900">
          <p className="font-bold text-base mb-3">📧 Payment Instructions</p>
          <p className="text-sm mb-3">After confirming enrollment, please email our finance team at:</p>
          <p className="font-mono bg-white px-3 py-2 rounded border border-blue-200 text-sm font-semibold text-blue-900 mb-3 inline-block">
            finance@apmih.college
          </p>
          <p className="text-sm font-semibold mt-3 mb-2">Include in your email:</p>
          <ul className="text-sm ml-4 space-y-1">
            <li>✓ Your full name</li>
            <li>✓ Email address</li>
            <li>
              ✓ Certification: <span className="font-medium">{certification.title}</span>
            </li>
            <li>
              ✓ Amount due: <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* What Happens Next */}
      <Alert className="border-green-200 bg-green-50 border-l-4 border-l-green-600">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        <AlertDescription className="ml-2 text-green-900">
          <p className="font-bold text-base mb-2">✓ What happens next?</p>
          <p className="text-sm">
            Once you click "Confirm Enrollment", you'll be enrolled immediately and can access course materials. Contact
            our finance team to arrange payment within 7 days to maintain active status.
          </p>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={enrolling}
          className="flex-1 text-base py-6 bg-transparent"
        >
          Cancel
        </Button>
        <Button
          onClick={handleEnroll}
          disabled={enrolling}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-base py-6 font-semibold"
        >
          {enrolling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Confirm Enrollment - ${totalAmount.toFixed(2)}</>
          )}
        </Button>
      </div>
    </div>
  )
}
