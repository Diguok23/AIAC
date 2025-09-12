"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Clock, Users, Award, BookOpen } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"

type Certification = Database["public"]["Tables"]["certifications"]["Row"]
type UserEnrollment = Database["public"]["Tables"]["user_enrollments"]["Row"]
type Application = Database["public"]["Tables"]["applications"]["Row"]

interface CertificationWithEnrollment extends Certification {
  user_enrollments?: UserEnrollment[]
  applications?: Application[]
  isEnrolled?: boolean
  hasApplied?: boolean
  applicationStatus?: string
}

export default function DashboardCertificationsPage() {
  const [certifications, setCertifications] = useState<CertificationWithEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [enrolling, setEnrolling] = useState<number | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch certifications with user enrollments and applications
      const { data: certificationsData, error: certError } = await supabase.from("certifications").select(`
          *,
          user_enrollments!inner(
            id,
            user_id,
            certification_id,
            enrollment_date,
            status
          ),
          applications!inner(
            id,
            user_id,
            certification_id,
            status
          )
        `)

      if (certError) throw certError

      // Also fetch all certifications to show available ones
      const { data: allCertifications, error: allError } = await supabase.from("certifications").select("*")

      if (allError) throw allError

      // Process the data to add enrollment and application status
      const processedCertifications = allCertifications.map((cert) => {
        const enrollment = certificationsData?.find(
          (c) => c.id === cert.id && c.user_enrollments?.some((e) => e.user_id === session.user.id),
        )
        const application = certificationsData?.find(
          (c) => c.id === cert.id && c.applications?.some((a) => a.user_id === session.user.id),
        )

        return {
          ...cert,
          isEnrolled: !!enrollment,
          hasApplied: !!application,
          applicationStatus: application?.applications?.[0]?.status || null,
          user_enrollments: enrollment?.user_enrollments || [],
          applications: application?.applications || [],
        }
      })

      setCertifications(processedCertifications)
    } catch (error) {
      console.error("Error fetching certifications:", error)
      toast({
        title: "Error",
        description: "Failed to load certifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (certificationId: number) => {
    setEnrolling(certificationId)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to enroll in courses",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("user_enrollments").insert({
        user_id: session.user.id,
        certification_id: certificationId,
        enrollment_date: new Date().toISOString(),
        status: "active",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Successfully enrolled in certification!",
      })

      // Refresh the certifications list
      fetchCertifications()
    } catch (error) {
      console.error("Error enrolling:", error)
      toast({
        title: "Error",
        description: "Failed to enroll in certification",
        variant: "destructive",
      })
    } finally {
      setEnrolling(null)
    }
  }

  const handleApply = async (certificationId: number) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase.from("applications").insert({
        user_id: session.user.id,
        certification_id: certificationId,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Application Submitted",
        description: "Your application has been submitted for review",
      })

      fetchCertifications()
    } catch (error) {
      console.error("Error applying:", error)
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      })
    }
  }

  const filteredCertifications = certifications.filter(
    (cert) =>
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const enrolledCertifications = filteredCertifications.filter((cert) => cert.isEnrolled)
  const availableCertifications = filteredCertifications.filter(
    (cert) => !cert.isEnrolled && cert.applicationStatus === "approved",
  )
  const allCertifications = filteredCertifications
  const completedCertifications = enrolledCertifications.filter((cert) =>
    cert.user_enrollments?.some((e) => e.status === "completed"),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Certifications</h1>
          <p className="text-gray-600 mt-1">Manage your certifications and explore new opportunities</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrolled">Enrolled ({enrolledCertifications.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableCertifications.length})</TabsTrigger>
          <TabsTrigger value="browse">Browse ({allCertifications.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCertifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-4">
          {enrolledCertifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrolled Certifications</h3>
                <p className="text-gray-600 text-center mb-4">
                  You haven't enrolled in any certifications yet. Browse available certifications to get started.
                </p>
                <Button onClick={() => document.querySelector('[value="available"]')?.click()}>
                  Browse Available Certifications
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCertifications.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                      <Badge variant="secondary">Enrolled</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{cert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{cert.duration || "Self-paced"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{cert.level || "All levels"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => (window.location.href = `/dashboard/courses/${cert.id}`)}>
                      Continue Learning
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {availableCertifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Certifications</h3>
                <p className="text-gray-600 text-center">
                  No certifications are currently available for enrollment. Check back later or browse all
                  certifications.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableCertifications.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{cert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{cert.duration || "Self-paced"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{cert.level || "All levels"}</span>
                      </div>
                    </div>
                    {cert.price && <div className="text-2xl font-bold text-primary mb-2">${cert.price}</div>}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleEnroll(cert.id)} disabled={enrolling === cert.id}>
                      {enrolling === cert.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allCertifications.map((cert) => (
              <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                    {cert.isEnrolled && <Badge variant="secondary">Enrolled</Badge>}
                    {cert.hasApplied && !cert.isEnrolled && (
                      <Badge variant={cert.applicationStatus === "approved" ? "default" : "outline"}>
                        {cert.applicationStatus}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">{cert.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{cert.duration || "Self-paced"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{cert.level || "All levels"}</span>
                    </div>
                  </div>
                  {cert.price && <div className="text-2xl font-bold text-primary mb-2">${cert.price}</div>}
                </CardContent>
                <CardFooter>
                  {cert.isEnrolled ? (
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={() => (window.location.href = `/dashboard/courses/${cert.id}`)}
                    >
                      Continue Learning
                    </Button>
                  ) : cert.applicationStatus === "approved" ? (
                    <Button className="w-full" onClick={() => handleEnroll(cert.id)} disabled={enrolling === cert.id}>
                      {enrolling === cert.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  ) : cert.hasApplied ? (
                    <Button className="w-full bg-transparent" variant="outline" disabled>
                      Application {cert.applicationStatus}
                    </Button>
                  ) : (
                    <Button className="w-full bg-transparent" variant="outline" onClick={() => handleApply(cert.id)}>
                      Apply First
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCertifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Certifications</h3>
                <p className="text-gray-600 text-center">
                  You haven't completed any certifications yet. Keep learning to earn your first certificate!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedCertifications.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                      <Badge variant="default">Completed</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{cert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{cert.duration || "Self-paced"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{cert.level || "All levels"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={() => (window.location.href = `/dashboard/certificates/${cert.id}`)}
                    >
                      View Certificate
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
