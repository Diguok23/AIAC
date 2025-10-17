"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface BillingItem {
  label: string
  amount: number
}

interface Certification {
  id: string
  title: string
  description: string
  price: number
  level: string
  duration: string
}

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [certification, setCertification] = useState<Certification | null>(null)
  const [error, setError] = useState<string | null>(null)

  const DST_TAX_RATE = 0.16

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase configuration is missing")
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const certificationId = searchParams.get("certification")
        if (!certificationId) {
          setError("No certification selected")
          setTimeout(() => router.push("/dashboard/certifications"), 2000)
          return
        }

        // Get current user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          setError("Not authenticated")
          setTimeout(() => router.push("/login"), 2000)
          return
        }

        // Get certification details - handle both UUID and slug
        let { data: cert, error: certError } = await supabase
          .from("certifications")
          .select("id, title, description, price, level, duration")
          .eq("id", certificationId)
          .maybeSingle()

        // If not found by ID, try by slug
        if (!cert && certError?.code !== "PGRST116") {
          const { data: certBySlug } = await supabase
            .from("certifications")
            .select("id, title, description, price, level, duration")
            .eq("slug", certificationId)
            .maybeSingle()

          cert = certBySlug
        }

        if (!cert) {
          setError("Certification not found")
          setTimeout(() => router.push("/dashboard/certifications"), 2000)
          return
        }

        setCertification(cert)
      } catch (err) {
        console.error("Error loading billing page:", err)
        setError("An unexpected error occurred")
        setTimeout(() => router.push("/dashboard/certifications"), 2000)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams, router])

  const handleEnroll = async () => {
    if (!certification) {
      toast({
        title: "Error",
        description: "Missing certification information",
        variant: "destructive",
      })
      return
    }

    setEnrolling(true)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration is missing")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificationId: certification.id,
          userId: session.user.id,
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

      setTimeout(() => {
        router.push("/dashboard/certifications")
      }, 2500)
    } catch (error) {
      console.error("Error enrolling:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete enrollment",
        variant: "destructive",
      })
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-600">{error}</p>
                <p className="text-sm text-muted-foreground mt-1">Redirecting you back...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!certification) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading certification details...</p>
      </div>
    )
  }

  const programFee = certification.price || 0
  const dstTax = programFee * DST_TAX_RATE
  const totalAmount = programFee + dstTax

  const billingItems: BillingItem[] = [
    { label: "Program Fee", amount: programFee },
    { label: `DST Tax (16%)`, amount: dstTax },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Enrollment & Payment</h1>
        <p className="text-muted-foreground">Review and confirm your enrollment details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{certification.title}</CardTitle>
          <CardDescription>{certification.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Difficulty Level</p>
              <Badge className="mt-2">{certification.level}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course Duration</p>
              <p className="font-medium mt-2">{certification.duration || "Self-paced"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
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
              <span className="font-semibold">${item.amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mt-4 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount Due</span>
              <span className="font-bold text-3xl text-green-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-blue-200 bg-blue-50">
        <Mail className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <p className="font-semibold mb-2">📧 Payment Instructions</p>
          <p className="text-sm mb-3">
            After confirming enrollment, please email our finance team at:{" "}
            <strong className="font-mono">finance@apmih.college</strong>
          </p>
          <p className="text-sm">Include:</p>
          <ul className="text-sm ml-4 mt-2 space-y-1">
            <li>• Your full name</li>
            <li>• Email address</li>
            <li>• Certification: {certification.title}</li>
            <li>• Amount due: ${totalAmount.toFixed(2)}</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          <p className="font-semibold mb-1">✓ What happens next?</p>
          <p className="text-sm">
            Once you click "Confirm Enrollment", you'll be enrolled immediately and can access course materials. Contact
            our finance team to arrange payment within 7 days to maintain active status.
          </p>
        </AlertDescription>
      </Alert>

      <div className="flex gap-3 sticky bottom-4 bg-white p-4 -mx-4 border-t">
        <Button variant="outline" onClick={() => router.back()} disabled={enrolling} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleEnroll}
          disabled={enrolling}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {enrolling ? "Processing..." : `Confirm Enrollment - $${totalAmount.toFixed(2)}`}
        </Button>
      </div>
    </div>
  )
}
