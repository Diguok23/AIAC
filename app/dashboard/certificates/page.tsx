"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Download, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Enrollment {
  id: string
  certification_id: string
  status: "pending" | "active" | "completed"
  progress: number
  created_at: string
  certificate_issued: boolean
  certificate_url: string | null
  certifications: {
    title: string
    category: string
  }
}

export default function DashboardCertificatesPage() {
  const [completedEnrollments, setCompletedEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchCompletedEnrollments = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!mounted || !currentUser) {
          setIsLoading(false)
          return
        }

        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("user_enrollments")
          .select(`
            id,
            certification_id,
            status,
            progress,
            created_at,
            certificate_issued,
            certificate_url,
            certifications:certification_id (
              title,
              category
            )
          `)
          .eq("user_id", currentUser.id)
          .eq("status", "completed") // Only fetch completed courses
          .order("created_at", { ascending: false })

        if (!mounted) return

        if (enrollmentsError) {
          console.error("Error fetching completed enrollments:", enrollmentsError)
          toast({
            title: "Error",
            description: "Failed to load your completed certifications.",
            variant: "destructive",
          })
        }

        setCompletedEnrollments(enrollmentsData || [])
      } catch (error) {
        if (mounted) {
          console.error("Error fetching completed enrollments data:", error)
          toast({
            title: "Error",
            description: "An unexpected error occurred while loading certifications.",
            variant: "destructive",
          })
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCompletedEnrollments()

    return () => {
      mounted = false
    }
  }, [])

  const handleDownloadCertificate = (url: string) => {
    if (url) {
      window.open(url, "_blank")
    } else {
      toast({
        title: "Certificate Not Available",
        description: "The certificate URL is not set. Please contact support.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>

      <Card>
        <CardHeader>
          <CardTitle>Earned Certifications</CardTitle>
          <CardDescription>Download your professional certificates upon course completion.</CardDescription>
        </CardHeader>
        <CardContent>
          {completedEnrollments.length > 0 ? (
            <div className="space-y-4">
              {completedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{enrollment.certifications.title}</p>
                      <p className="text-xs text-muted-foreground">{enrollment.certifications.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs text-purple-700 bg-purple-50 border-purple-200">
                      COMPLETED
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!enrollment.certificate_issued || !enrollment.certificate_url}
                      onClick={() => handleDownloadCertificate(enrollment.certificate_url || "")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates earned yet</h3>
              <p className="mt-1 text-sm text-gray-500">Complete courses to earn your professional certifications.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/courses">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View My Courses
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
