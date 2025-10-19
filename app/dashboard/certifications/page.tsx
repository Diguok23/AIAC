"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Star, Users } from "lucide-react"
import { EnrollmentConfirmationDialog } from "@/components/enrollment-confirmation-dialog"

interface Certification {
  id: string
  title: string
  description: string
  level: string
  category: string
  duration: string | null
  price: number
  rating: number | null
  students: number | null
  instructor: string | null
}

export default function CertificationsPage() {
  const supabase = createClientComponentClient()
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [enrolledCertifications, setEnrolledCertifications] = useState<string[]>([])

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        const response = await fetch("/api/certifications")
        const data = await response.json()
        setCertifications(data.certifications || [])
        setFilteredCertifications(data.certifications || [])

        // Get current user's enrollments
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const enrollmentsResponse = await fetch(`/api/user-enrollments?user_id=${user.id}`)
          const enrollmentsData = await enrollmentsResponse.json()
          const enrolledIds = enrollmentsData.enrollments?.map((e: any) => e.certification_id) || []
          setEnrolledCertifications(enrolledIds)
        }
      } catch (error) {
        console.error("Error loading certifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCertifications()
  }, [supabase])

  useEffect(() => {
    let filtered = certifications

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (cert) =>
          cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter((cert) => cert.level === selectedLevel)
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((cert) => cert.category === selectedCategory)
    }

    setFilteredCertifications(filtered)
  }, [searchTerm, selectedLevel, selectedCategory, certifications])

  const categories = Array.from(new Set(certifications.map((c) => c.category)))
  const levels = Array.from(new Set(certifications.map((c) => c.level)))

  const handleEnrollClick = (certification: Certification) => {
    setSelectedCertification(certification)
    setConfirmationOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
        <p className="text-muted-foreground">Browse and enroll in our professional certification programs</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Level Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedLevel === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel("all")}
            >
              All Levels
            </Button>
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </Button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCertifications.length} of {certifications.length} certifications
      </p>

      {/* Certifications Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCertifications.map((certification) => {
          const isEnrolled = enrolledCertifications.includes(certification.id)

          return (
            <Card key={certification.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="line-clamp-2">{certification.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{certification.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{certification.level}</Badge>
                  <Badge variant="outline">{certification.category}</Badge>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  {certification.instructor && (
                    <p className="text-muted-foreground">
                      <strong>Instructor:</strong> {certification.instructor}
                    </p>
                  )}
                  {certification.duration && (
                    <p className="text-muted-foreground">
                      <strong>Duration:</strong> {certification.duration}
                    </p>
                  )}
                </div>

                {/* Rating and Students */}
                {(certification.rating || certification.students) && (
                  <div className="flex gap-4 text-sm">
                    {certification.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{certification.rating}</span>
                      </div>
                    )}
                    {certification.students && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{certification.students} students</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="pt-2 border-t">
                  <div className="text-2xl font-bold">KES {certification.price.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">+ 16% DST tax</p>
                </div>
              </CardContent>

              <div className="p-4 border-t bg-muted/50">
                <Button
                  className="w-full"
                  onClick={() => handleEnrollClick(certification)}
                  disabled={isEnrolled}
                  variant={isEnrolled ? "secondary" : "default"}
                >
                  {isEnrolled ? "Already Enrolled" : "Enroll Now"}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCertifications.length === 0 && (
        <Card className="py-12">
          <div className="text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No certifications found matching your criteria</p>
          </div>
        </Card>
      )}

      {/* Enrollment Confirmation Dialog */}
      <EnrollmentConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        certification={selectedCertification}
      />
    </div>
  )
}
