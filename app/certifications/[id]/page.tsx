"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Star, Users, Clock, Award, CheckCircle, AlertCircle } from "lucide-react"
import CourseEnrollmentButton from "@/components/course-enrollment-button"

interface Module {
  id: string
  title: string
  description: string
  order_num: number
}

interface LearningOutcome {
  id: string
  outcome: string
}

interface Prerequisite {
  id: string
  prerequisite: string
}

interface Review {
  id: string
  rating: number
  comment: string
  user_name: string
  created_at: string
}

interface Certification {
  id: string
  title: string
  description: string
  long_description: string
  category: string
  level: string
  price: number
  duration: string
  instructor: string
  instructor_bio: string
  rating: number
  student_count: number
  modules: Module[]
  learning_outcomes: LearningOutcome[]
  prerequisites: Prerequisite[]
  reviews: Review[]
}

export default function CertificationDetailPage() {
  const params = useParams()
  const [certification, setCertification] = useState<Certification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCertification() {
      try {
        setLoading(true)
        setError(null)

        const id = Array.isArray(params.id) ? params.id[0] : params.id
        const response = await fetch(`/api/certifications/${encodeURIComponent(id)}`)

        if (!response.ok) {
          throw new Error("Failed to load certification")
        }

        const data = await response.json()
        setCertification(data.certification)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load certification")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadCertification()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !certification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
            <CardTitle>Error Loading Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || "Certification not found"}</p>
            <Button asChild className="mt-4">
              <a href="/certifications">Back to Certifications</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="mb-4">{certification.category}</Badge>
              <h1 className="text-4xl font-bold mb-2">{certification.title}</h1>
              <p className="text-xl text-gray-600">{certification.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-2">KES {certification.price}</div>
              <CourseEnrollmentButton courseId={certification.id} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-sm text-gray-600">Rating</div>
                    <div className="text-xl font-bold">{certification.rating}/5</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Students</div>
                    <div className="text-xl font-bold">{certification.student_count}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="text-xl font-bold">{certification.duration}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-600">Level</div>
                    <div className="text-xl font-bold capitalize">{certification.level}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="outcomes">Learning Outcomes</TabsTrigger>
            <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{certification.long_description}</p>

                {/* Instructor Section */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">About the Instructor</h3>
                  <div className="space-y-2">
                    <h4 className="font-medium">{certification.instructor}</h4>
                    <p className="text-gray-600 text-sm">{certification.instructor_bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            {certification.modules && certification.modules.length > 0 ? (
              certification.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{module.description}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-600">No modules available yet</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Learning Outcomes Tab */}
          <TabsContent value="outcomes" className="space-y-4">
            {certification.learning_outcomes && certification.learning_outcomes.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {certification.learning_outcomes.map((outcome) => (
                      <li key={outcome.id} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{outcome.outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-600">No learning outcomes defined yet</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Prerequisites Tab */}
          <TabsContent value="prerequisites" className="space-y-4">
            {certification.prerequisites && certification.prerequisites.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {certification.prerequisites.map((prereq) => (
                      <li key={prereq.id} className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{prereq.prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-600">No prerequisites required</CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {certification.reviews && certification.reviews.length > 0 ? (
              certification.reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{review.user_name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-600">
                  No reviews yet. Be the first to review!
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
