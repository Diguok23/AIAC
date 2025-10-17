"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Share2, AlertCircle, CheckCircle } from "lucide-react"

interface Certificate {
  id: string
  certification_id: string
  certificate_url?: string
  certificate_verification_code?: string
  completed_at?: string
  certifications?: { title: string }
}

export default function CertificatesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase is not configured")
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get current user
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push("/login")
          return
        }

        // Fetch completed enrollments
        const { data: enrollments, error: enrollError } = await supabase
          .from("user_enrollments")
          .select("*, certifications:certification_id(title)")
          .eq("user_id", session.user.id)
          .eq("status", "completed")
          .eq("certificate_issued", true)

        if (enrollError) throw enrollError

        setCertificates(enrollments || [])
      } catch (err) {
        console.error("Error fetching certificates:", err)
        setError("Failed to load certificates")
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground">Download and share your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No certificates yet</p>
            <p className="text-sm text-muted-foreground mt-1">Complete your courses to earn certificates</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">{cert.certifications?.title}</CardTitle>
                <CardDescription>Completed {new Date(cert.completed_at || "").toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cert.certificate_verification_code && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Verification Code:</p>
                    <p className="font-mono text-sm">{cert.certificate_verification_code}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {cert.certificate_url && (
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      const url = window.location.href
                      navigator.clipboard.writeText(
                        `Certificate: ${cert.certifications?.title}\nCode: ${cert.certificate_verification_code}\n${url}`,
                      )
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
