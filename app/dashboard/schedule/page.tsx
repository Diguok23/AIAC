"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react"

interface CourseSchedule {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  certifications?: { title: string }
}

export default function SchedulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState<CourseSchedule[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase is not configured")
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

        // Get user's enrolled courses
        const { data: enrollments, error: enrollError } = await supabase
          .from("user_enrollments")
          .select("certification_id")
          .eq("user_id", session.user.id)
          .eq("status", "enrolled")

        if (enrollError) throw enrollError

        const certIds = enrollments?.map((e) => e.certification_id) || []

        if (certIds.length === 0) {
          setSchedule([])
          return
        }

        // Fetch schedule for enrolled courses
        const { data: schedules, error: scheduleError } = await supabase
          .from("course_schedule")
          .select("*, certifications:certification_id(title)")
          .in("certification_id", certIds)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })

        if (scheduleError) throw scheduleError

        setSchedule(schedules || [])
      } catch (err) {
        console.error("Error fetching schedule:", err)
        setError("Failed to load schedule")
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
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
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">View upcoming course events and sessions</p>
      </div>

      {schedule.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No upcoming events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedule.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{event.certifications?.title}</p>
                    {event.description && <p className="text-sm mt-2">{event.description}</p>}
                  </div>
                  <div className="space-y-2 md:text-right">
                    <div className="flex items-center gap-2 md:justify-end">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2 md:justify-end">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 md:justify-end">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
