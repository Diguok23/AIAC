"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Award, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

interface Certificate {
  id: string
  title: string
  issued_date: string
  certificate_url: string | null
  status: "completed" | "in_progress" | "not_started"
}

export default function DashboardCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          // Handle unauthenticated state, e.g., redirect to login
          return
        }

        const { data, error } = await supabase
          .from("user_enrollments")
          .select(`
            id,
            completed_at,
            certificate_url,
            status,
            certifications:certification_id(
              title
            )
          `)
          .eq("user_id", session.user.id)
          .eq("status", "completed") // Only fetch completed courses for certificates
          .not("certificate_url", "is", null) // Only show if a certificate URL exists

        if (error) throw error

        const formattedCertificates = data.map((item) => ({
          id: item.id,
          title: item.certifications?.title || "Unknown Certificate",
          issued_date: item.completed_at || "N/A",
          certificate_url: item.certificate_url,
          status: item.status,
        }))

        setCertificates(formattedCertificates)
      } catch (error) {
        console.error("Error fetching certificates:", error)
        toast({
          title: "Error",
          description: "Failed to load your certificates.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [supabase])

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issued_date.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Certificates</h1>

      <div className="mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search certificates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCertificates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{certificate.title}</CardTitle>
                <CardDescription>Issued on: {new Date(certificate.issued_date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium text-green-600">Completed</span>
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                {certificate.certificate_url ? (
                  <Button asChild>
                    <a href={certificate.certificate_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download Certificate
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Certificate Not Available
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">Complete courses to earn and view your certificates here.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/courses">Browse Courses</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
