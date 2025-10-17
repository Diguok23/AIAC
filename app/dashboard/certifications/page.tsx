"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, BookOpen, Award, CheckCircle, Clock, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Certification {
  id: string
  title: string
  description: string
  price: number
  level: string
  category: string
  slug: string
  rating?: number
  students?: number
  duration?: string
}

interface UserEnrollment {
  id: string
  certification_id: string
  status: string
  progress: number
  created_at: string
  completed_at?: string
}

interface CertificationWithEnrollment extends Certification {
  enrollment?: UserEnrollment
}

export default function DashboardCertificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [available, setAvailable] = useState<Certification[]>([])
  const [inProgress, setInProgress] = useState<CertificationWithEnrollment[]>([])
  const [completed, setCompleted] = useState<CertificationWithEnrollment[]>([])

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Configuration error. Please contact support.")
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get current user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          router.push("/login")
          return
        }

        // Fetch all certifications
        const { data: certifications, error: certError } = await supabase
          .from("certifications")
          .select("*")
          .order("title")

        if (certError) {
          console.error("Error fetching certifications:", certError)
          setError("Failed to load certifications")
          return
        }

        // Fetch user enrollments
        const { data: enrollments, error: enrollError } = await supabase
          .from("user_enrollments")
          .select("*")
          .eq("user_id", session.user.id)

        if (enrollError) {
          console.error("Error fetching enrollments:", enrollError)
          setError("Failed to load enrollments")
          return
        }

        // Create a map of enrollments by certification ID
        const enrollmentMap = new Map(enrollments?.map((e) => [e.certification_id, e]))

        // Categorize certifications
        const availableCerts: Certification[] = []
        const inProgressCerts: CertificationWithEnrollment[] = []
        const completedCerts: CertificationWithEnrollment[] = []

        certifications?.forEach((cert) => {
          const enrollment = enrollmentMap.get(cert.id)

          if (enrollment) {
            const certWithEnrollment: CertificationWithEnrollment = {
              ...cert,
              enrollment,
            }

            if (enrollment.status === "completed") {
              completedCerts.push(certWithEnrollment)
            } else {
              inProgressCerts.push(certWithEnrollment)
            }
          } else {
            availableCerts.push(cert)
          }
        })

        setAvailable(availableCerts)
        setInProgress(inProgressCerts)
        setCompleted(completedCerts)
      } catch (err) {
        console.error("Error fetching certifications:", err)
        setError("An error occurred while loading certifications")
      } finally {
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [router])

  const handleEnroll = (certId: string) => {
    router.push(`/dashboard/billing?certification=${certId}`)
  }

  const AvailableCertCard = ({ certification }: { certification: Certification }) => (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col overflow-hidden border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-2 text-lg">{certification.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1 text-sm">{certification.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {certification.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex gap-4 text-sm border-t pt-4">
          {certification.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{certification.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="font-semibold text-green-600">${certification.price}</span>
          </div>
        </div>

        <Button onClick={() => handleEnroll(certification.id)} className="w-full mt-auto bg-blue-600 hover:bg-blue-700">
          Enroll Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )

  const InProgressCertCard = ({ certification }: { certification: CertificationWithEnrollment }) => (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col overflow-hidden border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-2 text-lg">{certification.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1 text-sm">{certification.description}</CardDescription>
          </div>
          <Badge className="flex-shrink-0 bg-blue-600">In Progress</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col border-t">
        {certification.enrollment && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-muted-foreground">Progress</span>
              <span className="font-bold text-blue-600">{certification.enrollment.progress}%</span>
            </div>
            <Progress value={certification.enrollment.progress} className="h-2.5" />
          </div>
        )}

        <Button asChild variant="outline" className="w-full mt-auto bg-white hover:bg-blue-50">
          <Link href={`/dashboard/courses/${certification.id}`}>
            Continue Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )

  const CompletedCertCard = ({ certification }: { certification: CertificationWithEnrollment }) => (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col overflow-hidden border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-2 text-lg">{certification.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1 text-sm">{certification.description}</CardDescription>
          </div>
          <Badge className="flex-shrink-0 bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col border-t pt-4">
        <div className="flex gap-4 text-sm">
          {certification.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{certification.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-green-600 font-medium">Certificate Earned</span>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full mt-auto bg-white hover:bg-green-50 border-green-200">
          <Link href={`/dashboard/certificates`}>
            View Certificate
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
        <p className="text-muted-foreground">
          Explore our programs and manage your learning journey. Enroll today to get started!
        </p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
          <TabsTrigger value="available" className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4" />
            Available
            <Badge
              variant="secondary"
              className="ml-1 h-6 w-6 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {available.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            In Progress
            <Badge
              variant="secondary"
              className="ml-1 h-6 w-6 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {inProgress.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4" />
            Completed
            <Badge
              variant="secondary"
              className="ml-1 h-6 w-6 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {completed.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6 mt-6">
          {available.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">No available certifications at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new programs!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {available.map((cert) => (
                <AvailableCertCard key={cert.id} certification={cert} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-6 mt-6">
          {inProgress.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">No certifications in progress</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Enroll in a certification from the Available tab to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((cert) => (
                <InProgressCertCard key={cert.id} certification={cert} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6 mt-6">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">No completed certifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">Keep working on your in-progress courses!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completed.map((cert) => (
                <CompletedCertCard key={cert.id} certification={cert} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
