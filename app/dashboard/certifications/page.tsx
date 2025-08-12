"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, BookOpen, Clock, CheckCircle, AlertCircle, Download, Eye, Play, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  duration: string | null // Added duration
}

interface UserEnrollment {
  id: string
  certification_id: string
  status: "not_started" | "in_progress" | "completed" | "suspended"
  progress: number
  enrolled_at: string
  started_at?: string | null
  completed_at?: string | null
  due_date?: string | null // Added due_date
  certificate_issued?: boolean // Added certificate_issued
  certificate_url?: string | null // Added certificate_url
  certifications: Certification // Changed to Certification type
}

interface Application {
  id: string
  certification_id: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  program_name: string
}

export default function DashboardCertificationsPage() {
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [availableCertifications, setAvailableCertifications] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("enrolled")
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch user enrollments
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("user_enrollments")
          .select(`
            id,
            certification_id,
            status,
            progress,
            enrolled_at,
            started_at,
            completed_at,
            due_date,
            certificate_issued,
            certificate_url,
            certifications:certification_id (
              id,
              title,
              description,
              category,
              level,
              price,
              duration
            )
          `)
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false })

        if (enrollmentsError) {
          console.error("Error fetching enrollments:", enrollmentsError)
        } else {
          setEnrollments(enrollmentsData || [])
        }

        // Fetch user applications
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select("id, certification_id, status, created_at, program_name")
          .eq("email", user.email)
          .order("created_at", { ascending: false })

        if (applicationsError) {
          console.error("Error fetching applications:", applicationsError)
        } else {
          setApplications(applicationsData || [])
        }

        // Fetch all available certifications
        const { data: certificationsData, error: certificationsError } = await supabase
          .from("certifications")
          .select("*")
          .order("category")
          .order("title")

        if (certificationsError) {
          console.error("Error fetching certifications:", certificationsError)
        } else {
          setAvailableCertifications(certificationsData || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load certifications data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "active":
      case "in_progress": // Added in_progress
        return <Play className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "suspended":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      not_started: "outline", // Added not_started
      active: "default",
      in_progress: "default", // Added in_progress
      completed: "secondary",
      suspended: "destructive",
      approved: "default",
      rejected: "destructive",
    }

    const colors: Record<string, string> = {
      pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
      not_started: "text-gray-700 bg-gray-50 border-gray-200", // Added not_started
      active: "text-blue-700 bg-blue-50 border-blue-200",
      in_progress: "text-blue-700 bg-blue-50 border-blue-200", // Added in_progress
      completed: "text-green-700 bg-green-50 border-green-200",
      suspended: "text-red-700 bg-red-50 border-red-200",
      approved: "text-green-700 bg-green-50 border-green-200",
      rejected: "text-red-700 bg-red-50 border-red-200",
    }

    return (
      <Badge variant={variants[status] || "outline"} className={`text-xs ${colors[status] || ""}`}>
        {status.toUpperCase().replace(/_/g, " ")} {/* Format status for display */}
      </Badge>
    )
  }

  const handleStartCourse = async (certificationId: string) => {
    try {
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificationId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start course")
      }

      toast({
        title: "Success!",
        description: "Course started successfully",
      })

      // Refresh the page data
      window.location.reload()
    } catch (error) {
      console.error("Error starting course:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start course",
        variant: "destructive",
      })
    }
  }

  const getApprovedApplications = () => {
    return applications.filter((app) => app.status === "approved")
  }

  const getUnenrolledApprovedCertifications = () => {
    const approvedApps = getApprovedApplications()
    const enrolledIds = enrollments.map((e) => e.certification_id)

    return approvedApps.filter((app) => !enrolledIds.includes(app.certification_id))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-gray-600">Loading your certifications...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Certifications</h1>
        <p className="text-muted-foreground">Manage your enrolled courses and track your progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrolled">
            Enrolled ({enrollments.filter((e) => e.status !== "completed").length})
          </TabsTrigger>
          <TabsTrigger value="available">Available ({getUnenrolledApprovedCertifications().length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({enrollments.filter((e) => e.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        {/* Enrolled Courses */}
        <TabsContent value="enrolled" className="space-y-4">
          {enrollments.filter((e) => e.status !== "completed").length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments
                .filter((enrollment) => enrollment.status !== "completed")
                .map((enrollment) => (
                  <Card key={enrollment.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{enrollment.certifications.category}</Badge>
                        {getStatusIcon(enrollment.status)}
                      </div>
                      <CardTitle className="text-lg">{enrollment.certifications.title}</CardTitle>
                      <CardDescription>{enrollment.certifications.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Level: {enrollment.certifications.level}</span>
                          {enrollment.certifications.duration && (
                            <span>Duration: {enrollment.certifications.duration}</span>
                          )}
                        </div>
                        {(enrollment.status === "active" || enrollment.status === "in_progress") && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </span>
                          {getStatusBadge(enrollment.status)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {enrollment.status === "active" || enrollment.status === "in_progress" ? (
                        <Button asChild className="flex-1">
                          <Link href={`/dashboard/courses/${enrollment.certification_id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Continue
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1 bg-transparent" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          {enrollment.status === "pending"
                            ? "Pending Approval"
                            : enrollment.status === "not_started"
                              ? "Not Started"
                              : "Suspended"}
                        </Button>
                      )}
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/certifications/${enrollment.certification_id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enrolled courses</h3>
              <p className="mt-1 text-sm text-gray-500">Apply for certifications to start your learning journey.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/certifications">Browse Certifications</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Available Courses (Approved Applications) */}
        <TabsContent value="available" className="space-y-4">
          {getUnenrolledApprovedCertifications().length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getUnenrolledApprovedCertifications().map((application) => {
                const certification = availableCertifications.find((c) => c.id === application.certification_id)
                if (!certification) return null

                return (
                  <Card key={application.id} className="flex flex-col border-green-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{certification.category}</Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <CardTitle className="text-lg">{certification.title}</CardTitle>
                      <CardDescription>{certification.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Level: {certification.level}</span>
                          {certification.duration && <span>Duration: {certification.duration}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Approved: {new Date(application.created_at).toLocaleDateString()}
                          </span>
                          {getStatusBadge("approved")}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleStartCourse(certification.id)}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Course
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/certifications/${certification.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No approved applications</h3>
              <p className="mt-1 text-sm text-gray-500">Submit applications for certifications to unlock courses.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/apply">Submit Application</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications" className="space-y-4">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{application.program_name}</CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                    <CardDescription>
                      Applied on {new Date(application.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                      <span className="text-sm">
                        {application.status === "pending" && "Your application is being reviewed"}
                        {application.status === "approved" && "Application approved! You can now start the course"}
                        {application.status === "rejected" && "Application was not approved"}
                      </span>
                    </div>
                  </CardContent>
                  {application.status === "approved" && (
                    <CardFooter>
                      <Button onClick={() => handleStartCourse(application.certification_id)}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Course
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications submitted</h3>
              <p className="mt-1 text-sm text-gray-500">Submit your first application to get started.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/apply">Submit Application</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Completed Courses */}
        <TabsContent value="completed" className="space-y-4">
          {enrollments.filter((e) => e.status === "completed").length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments
                .filter((enrollment) => enrollment.status === "completed")
                .map((enrollment) => (
                  <Card key={enrollment.id} className="flex flex-col border-green-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{enrollment.certifications.category}</Badge>
                        <Award className="h-4 w-4 text-green-500" />
                      </div>
                      <CardTitle className="text-lg">{enrollment.certifications.title}</CardTitle>
                      <CardDescription>{enrollment.certifications.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Level: {enrollment.certifications.level}</span>
                          {enrollment.certifications.duration && (
                            <span>Duration: {enrollment.certifications.duration}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Completed:{" "}
                            {enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : "N/A"}
                          </span>
                          {getStatusBadge("completed")}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        disabled={!enrollment.certificate_issued}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Certificate
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/certifications/${enrollment.certification_id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No completed certifications</h3>
              <p className="mt-1 text-sm text-gray-500">Complete your enrolled courses to earn certificates.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/courses">View My Courses</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
