"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Download, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Certificate {
  id: string
  title: string
  category: string
  level: string
  completed_at: string
  certificate_url?: string
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const fetchCertificates = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted || !user) return

        // Fetch completed enrollments (which represent earned certificates)
        const { data, error } = await supabase
          .from("user_enrollments")
          .select(`
            id,
            certification_id,
            completed_at,
            certifications:certification_id (
              id,
              title,
              category,
              level
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })

        if (!mounted) return

        if (error) {
          console.error("Error fetching certificates:", error)
          toast({
            title: "Error",
            description: "Failed to load certificates",
            variant: "destructive",
          })
          return
        }

        const formattedCertificates = (data || []).map((item: any) => ({
          id: item.id,
          title: item.certifications.title,
          category: item.certifications.category,
          level: item.certifications.level,
          completed_at: item.completed_at,
        }))

        setCertificates(formattedCertificates)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCertificates()

    return () => {
      mounted = false
    }
  }, [toast])

  const handleDownloadCertificate = (certificateId: string, title: string) => {
    toast({
      title: "Download Started",
      description: `${title} certificate is being downloaded`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-gray-600">Loading your certificates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground">View and download your earned certificates</p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="flex flex-col border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{certificate.category}</Badge>
                  <Award className="h-4 w-4 text-green-500" />
                </div>
                <CardTitle className="text-lg">{certificate.title}</CardTitle>
                <CardDescription>{certificate.level}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">
                  Completed: {new Date(certificate.completed_at).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1" onClick={() => handleDownloadCertificate(certificate.id, certificate.title)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-6">Complete a course to earn your first certificate!</p>
            <Button asChild>
              <Link href="/dashboard/courses">View My Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
