"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Certification {
  id: string
  title: string
}

interface SpecialApplication {
  id: string
  certification_id: string
  application_type: string
  reason: string
  status: string
  created_at: string
  certifications?: { title: string }
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<Certification[]>([])
  const [applications, setApplications] = useState<SpecialApplication[]>([])
  const [userId, setUserId] = useState<string>("")

  // Form state
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [applicationType, setApplicationType] = useState<string>("")
  const [reason, setReason] = useState<string>("")

  const applicationTypes = [
    { value: "special_exam", label: "Special Exam Request" },
    { value: "module_exemption", label: "Module Exemption" },
    { value: "exam_card", label: "Exam Card Request" },
    { value: "financial_aid", label: "Financial Aid" },
    { value: "defer", label: "Defer Course" },
    { value: "appeal", label: "Appeal" },
    { value: "credit_transfer", label: "Credit Transfer" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          toast({
            title: "Error",
            description: "Supabase is not configured",
            variant: "destructive",
          })
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get current user
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push("/login")
          return
        }

        setUserId(session.user.id)

        // Fetch user's enrolled courses
        const { data: enrollments, error: enrollError } = await supabase
          .from("user_enrollments")
          .select(
            `
            certification_id,
            certifications:certification_id(id, title)
          `,
          )
          .eq("user_id", session.user.id)
          .eq("status", "enrolled")

        if (enrollError) throw enrollError

        const courses = enrollments?.map((e: any) => e.certifications) || []
        setEnrolledCourses(courses)

        // Fetch user's applications
        const { data: apps, error: appsError } = await supabase
          .from("special_applications")
          .select("*, certifications:certification_id(title)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (appsError) throw appsError

        setApplications(apps || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load applications page",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourse || !applicationType || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase not configured")

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error } = await supabase.from("special_applications").insert({
        user_id: userId,
        certification_id: selectedCourse,
        application_type: applicationType,
        reason,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Application submitted successfully",
      })

      // Reset form
      setSelectedCourse("")
      setApplicationType("")
      setReason("")

      // Refresh applications
      const { data: apps } = await supabase
        .from("special_applications")
        .select("*, certifications:certification_id(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      setApplications(apps || [])
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Special Requests</h1>
        <p className="text-muted-foreground">Submit special requests for your courses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New Request</CardTitle>
            <CardDescription>Submit a special request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrolledCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Request Type</label>
                <Select value={applicationType} onValueChange={setApplicationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reason</label>
                <Textarea
                  placeholder="Explain your request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>{applications.length} total applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{app.certifications?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {applicationTypes.find((t) => t.value === app.application_type)?.label}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{app.reason}</p>
                      <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
