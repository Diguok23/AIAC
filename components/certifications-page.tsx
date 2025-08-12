"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Anchor,
  Users,
  Briefcase,
  LineChart,
  GraduationCap,
  UserCheck,
  Search,
  Code,
  Heart,
  Building,
  Loader2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CertificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [certifications, setCertifications] = useState([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([])
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setIsLoading(true)
        const supabase = createSupabaseClient()

        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)

        // Fetch all certifications
        const { data, error } = await supabase.from("certifications").select("*").order("category").order("title")

        if (error) throw error

        setCertifications(data || [])

        // If authenticated, fetch enrolled courses
        if (session) {
          const { data: enrollments, error: enrollmentsError } = await supabase
            .from("user_courses")
            .select("course_id")
            .eq("user_id", session.user.id)

          if (enrollmentsError) throw enrollmentsError

          setEnrolledCourseIds(enrollments.map((e) => e.course_id))
        }
      } catch (error) {
        console.error("Error fetching certifications:", error)
        toast({
          title: "Error",
          description: "Failed to load certifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertifications()
  }, [toast])

  const handleEnroll = async (certificationId) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "default",
      })
      router.push("/login")
      return
    }

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

      // Update enrolled courses list
      setEnrolledCourseIds((prev) => [...prev, certificationId])

      toast({
        title: "Success!",
        description: "You have successfully enrolled in this course",
        variant: "default",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error enrolling:", error)
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  // Group certifications by category
  const certificationsByCategory = certifications.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = []
    }
    acc[cert.category].push(cert)
    return acc
  }, {})

  // Get all unique levels
  const allLevels = Array.from(new Set(certifications.map((cert) => cert.level)))

  // Filter certifications based on search term, price, and level
  const filterCertifications = (certs) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading certifications...</span>
      </div>
    )
  }

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

          {/* Active filters */}
          {(searchTerm || priceFilter !== "all" || levelFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-primary">
                    ×
                  </button>
                </Badge>
              )}

              {priceFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price:{" "}
                  {priceFilter === "under100" ? "Under $100" : priceFilter === "100to150" ? "$100 - $150" : "Over $150"}
                  <button onClick={() => setPriceFilter("all")} className="ml-1 hover:text-primary">
                    ×
                  </button>
                </Badge>
              )}

              {levelFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Level: {levelFilter}
                  <button onClick={() => setLevelFilter("all")} className="ml-1 hover:text-primary">
                    ×
                  </button>
                </Badge>
              )}

              {(searchTerm || priceFilter !== "all" || levelFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setPriceFilter("all")
                    setLevelFilter("all")
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex flex-wrap justify-start mb-6 sm:mb-8 overflow-x-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm md:text-base">
              All
            </TabsTrigger>
            {Object.keys(certificationsByCategory).map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs sm:text-sm md:text-base">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Certifications Tab */}
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certifications.length > 0 ? (
                filterCertifications(certifications).map((cert) => (
                  <CertificationCard
                    key={cert.id}
                    cert={cert}
                    isEnrolled={enrolledCourseIds.includes(cert.id)}
                    onEnroll={() => handleEnroll(cert.id)}
                    isEnrolling={isEnrolling}
                    isAuthenticated={isAuthenticated}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No certifications found</h3>
                  <p className="text-gray-500">Please check back later for new offerings</p>
                </div>
              )}
            </div>

            {/* No results message */}
            {certifications.length > 0 && filterCertifications(certifications).length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No certifications found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Individual Category Tabs */}
          {Object.entries(certificationsByCategory).map(([category, certs]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filterCertifications(certs).map((cert) => (
                  <CertificationCard
                    key={cert.id}
                    cert={cert}
                    isEnrolled={enrolledCourseIds.includes(cert.id)}
                    onEnroll={() => handleEnroll(cert.id)}
                    isEnrolling={isEnrolling}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>

              {/* No results message */}
              {filterCertifications(certs).length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No certifications found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

function CertificationCard({ cert, isEnrolled, onEnroll, isEnrolling, isAuthenticated }) {
  // Helper function to get icon based on category
  const getIcon = (category) => {
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

    return icons[category] || <Award className="h-8 w-8 text-amber-500" />
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="mb-4">{getIcon(cert.category)}</div>
        <CardTitle className="text-lg sm:text-xl">{cert.title}</CardTitle>
        <CardDescription>
          <Badge variant="outline" className="mb-2">
            {cert.category.charAt(0).toUpperCase() + cert.category.slice(1)}
          </Badge>
          <div className="flex justify-between mt-2">
            <span>Level: {cert.level}</span>
          </div>
          <div className="mt-2 text-lg font-semibold text-amber-600">${cert.price}</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm sm:text-base">{cert.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button className="w-full sm:w-auto" asChild>
          <Link href={`/certifications/${cert.slug}`}>Learn More</Link>
        </Button>

        {isEnrolled ? (
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/dashboard/courses">Go to Course</Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full sm:w-auto" onClick={onEnroll} disabled={isEnrolling}>
            {isEnrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              "Enroll Now"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
