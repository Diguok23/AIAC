"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Play,
  Loader2,
  Search,
  Anchor,
  Users,
  Briefcase,
  LineChart,
  GraduationCap,
  UserCheck,
  Code,
  Heart,
  Building,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  duration: string | null
  slug: string
}

interface UserEnrollment {
  id: string
  certification_id: string
  status: "not_started" | "in_progress" | "completed" | "suspended"
  progress: number
  enrolled_at: string
  started_at?: string | null
  completed_at?: string | null
  due_date?: string | null
  certificate_issued?: boolean
  certificate_url?: string | null
  certifications: Certification
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
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [activeTab, setActiveTab] = useState("enrolled")
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

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
              duration,
              slug
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
  }, [toast, router])

  const handleEnroll = async (certificationId: string) => {
    try {
      setIsEnrolling(true)

      const response = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: certificationId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll")
      }

      toast({
        title: "Success!",
        description: "You have successfully enrolled in this course",
        variant: "default",
      })

      // Refresh the data
      window.location.reload()
    } catch (error) {
      console.error("Error enrolling:", error)
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "Failed to enroll in course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "active":
      case "in_progress":
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
      not_started: "outline",
      active: "default",
      in_progress: "default",
      completed: "secondary",
      suspended: "destructive",
      approved: "default",
      rejected: "destructive",
    }

    const colors: Record<string, string> = {
      pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
      not_started: "text-gray-700 bg-gray-50 border-gray-200",
      active: "text-blue-700 bg-blue-50 border-blue-200",
      in_progress: "text-blue-700 bg-blue-50 border-blue-200",
      completed: "text-green-700 bg-green-50 border-green-200",
      suspended: "text-red-700 bg-red-50 border-red-200",
      approved: "text-green-700 bg-green-50 border-green-200",
      rejected: "text-red-700 bg-red-50 border-red-200",
    }

    return (
      <Badge variant={variants[status] || "outline"} className={`text-xs ${colors[status] || ""}`}>
        {status.toUpperCase().replace(/_/g, " ")}
      </Badge>
    )
  }

  const getIcon = (category: string) => {
    const icons = {
      cruise: <Anchor className="h-8 w-8 text-amber-500" />,
      executive: <Briefcase className="h-8 w-8 text-amber-500" />,
      business: <LineChart className="h-8 w-8 text-amber-500" />,
      it: <Code className="h-8 w-8 text-amber-500" />,
      admin: <Building className="h-8 w-8 text-amber-500" />,
      social: <Users className="h-8 w-8 text-amber-500" />,
      healthcare: <Heart className="h-8 w-8 text-amber-500" />,
      sales: <LineChart className="h-8 w-8 text-amber-500" />,
      training: <GraduationCap className="h-8 w-8 text-amber-500" />,
      frontline: <UserCheck className="h-8 w-8 text-amber-500" />,
    }

    return icons[category as keyof typeof icons] || <Award className="h-8 w-8 text-amber-500" />
  }

  const getEnrolledCourseIds = () => {
    return enrollments.map((e) => e.certification_id)
  }

  const getApprovedApplications = () => {
    return applications.filter((app) => app.status === "approved")
  }

  const getUnenrolledApprovedCertifications = () => {
    const approvedApps = getApprovedApplications()
    const enrolledIds = getEnrolledCourseIds()
    return approvedApps.filter((app) => !enrolledIds.includes(app.certification_id))
  }

  const getAvailableForEnrollment = () => {
    const enrolledIds = getEnrolledCourseIds()
    const approvedIds = getApprovedApplications().map((app) => app.certification_id)

    return availableCertifications.filter((cert) => !enrolledIds.includes(cert.id) && approvedIds.includes(cert.id))
  }

  const getAllAvailableCertifications = () => {
    const enrolledIds = getEnrolledCourseIds()
    return availableCertifications.filter((cert) => !enrolledIds.includes(cert.id))
  }

  // Filter certifications based on search term, price, and level
  const filterCertifications = (certs: Certification[]) => {
    return certs.filter((cert) => {
      const matchesSearch =
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under100" && cert.price < 100) ||
        (priceFilter === "100to150" && cert.price >= 100 && cert.price <= 150) ||
        (priceFilter === "over150" && cert.price > 150)

      const matchesLevel = levelFilter === "all" || cert.level === levelFilter

      return matchesSearch && matchesPrice && matchesLevel
    })
  }

  const allLevels = Array.from(new Set(availableCertifications.map((cert) => cert.level)))

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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Certifications</h1>
        <p className="text-muted-foreground">Manage your enrolled courses and discover new certifications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="enrolled" className="text-xs sm:text-sm">
            Enrolled ({enrollments.filter((e) => e.status !== "completed").length})
          </TabsTrigger>
          <TabsTrigger value="available" className="text-xs sm:text-sm">
            Available ({getAvailableForEnrollment().length})
          </TabsTrigger>
          <TabsTrigger value="browse" className="text-xs sm:text-sm">
            Browse ({getAllAvailableCertifications().length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed ({enrollments.filter((e) => e.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        {/* Enrolled Courses */}
        <TabsContent value="enrolled" className="space-y-4">
          {enrollments.filter((e) => e.status !== "completed").length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {enrollments
                .filter((enrollment) => enrollment.status !== "completed")
                .map((enrollment) => (
                  <Card key={enrollment.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {enrollment.certifications.category}
                        </Badge>
                        {getStatusIcon(enrollment.status)}
                      </div>
                      <CardTitle className="text-lg leading-tight">{enrollment.certifications.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {enrollment.certifications.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pb-3">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Level: {enrollment.certifications.level}</span>
                          {enrollment.certifications.duration && (
                            <span className="text-muted-foreground">{enrollment.certifications.duration}</span>
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
                          <span className="text-xs text-muted-foreground">
                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </span>
                          {getStatusBadge(enrollment.status)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-0">
                      {enrollment.status === "active" || enrollment.status === "in_progress" ? (
                        <Button asChild className="flex-1" size="sm">
                          <Link href={`/dashboard/courses/${enrollment.certification_id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Continue
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1 bg-transparent" disabled size="sm">
                          <Clock className="mr-2 h-4 w-4" />
                          {enrollment.status === "pending"
                            ? "Pending"
                            : enrollment.status === "not_started"
                              ? "Not Started"
                              : "Suspended"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enrolled courses</h3>
              <p className="mt-1 text-sm text-gray-500">Browse available certifications to start learning.</p>
              <div className="mt-6">
                <Button onClick={() => setActiveTab("browse")}>Browse Certifications</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Available Courses (Approved Applications) */}
        <TabsContent value="available" className="space-y-4">
          {getAvailableForEnrollment().length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {getAvailableForEnrollment().map((certification) => (
                <Card key={certification.id} className="flex flex-col border-green-200">
                  <CardHeader className="pb-3">
                    <div className="mb-3">{getIcon(certification.category)}</div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {certification.category}
                      </Badge>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <CardTitle className="text-lg leading-tight">{certification.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{certification.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pb-3">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Level: {certification.level}</span>
                        {certification.duration && (
                          <span className="text-muted-foreground">{certification.duration}</span>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-amber-600">${certification.price}</div>
                      {getStatusBadge("approved")}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0">
                    <Button
                      className="flex-1"
                      onClick={() => handleEnroll(certification.id)}
                      disabled={isEnrolling}
                      size="sm"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
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

        {/* Browse All Certifications */}
        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filter Section */}
          <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search certifications..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under100">Under $100</SelectItem>
                  <SelectItem value="100to150">$100 - $150</SelectItem>
                  <SelectItem value="over150">Over $150</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {allLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filterCertifications(getAllAvailableCertifications()).length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filterCertifications(getAllAvailableCertifications()).map((certification) => {
                const isApproved = getApprovedApplications().some((app) => app.certification_id === certification.id)

                return (
                  <Card key={certification.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="mb-3">{getIcon(certification.category)}</div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {certification.category}
                        </Badge>
                        <div className="text-lg font-semibold text-amber-600">${certification.price}</div>
                      </div>
                      <CardTitle className="text-lg leading-tight">{certification.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">{certification.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pb-3">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Level: {certification.level}</span>
                          {certification.duration && (
                            <span className="text-muted-foreground">{certification.duration}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-0">
                      {isApproved ? (
                        <Button
                          className="flex-1"
                          onClick={() => handleEnroll(certification.id)}
                          disabled={isEnrolling}
                          size="sm"
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Enroll Now
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1 bg-transparent" asChild size="sm">
                          <Link
                            href={`/apply?program=${encodeURIComponent(certification.title)}&category=${certification.category}`}
                          >
                            Apply First
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/certifications/${certification.slug || certification.id}`}>
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
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No certifications found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        {/* Completed Courses */}
        <TabsContent value="completed" className="space-y-4">
          {enrollments.filter((e) => e.status === "completed").length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {enrollments
                .filter((enrollment) => enrollment.status === "completed")
                .map((enrollment) => (
                  <Card key={enrollment.id} className="flex flex-col border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {enrollment.certifications.category}
                        </Badge>
                        <Award className="h-4 w-4 text-green-500" />
                      </div>
                      <CardTitle className="text-lg leading-tight">{enrollment.certifications.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {enrollment.certifications.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pb-3">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Level: {enrollment.certifications.level}</span>
                          {enrollment.certifications.duration && (
                            <span className="text-muted-foreground">{enrollment.certifications.duration}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Completed:{" "}
                            {enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : "N/A"}
                          </span>
                          {getStatusBadge("completed")}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-0">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        disabled={!enrollment.certificate_issued}
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Certificate
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
                <Button onClick={() => setActiveTab("enrolled")}>View Enrolled Courses</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
