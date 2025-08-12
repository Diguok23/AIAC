"use client"

import { CalendarDays, Clock, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardSchedulePage() {
  // Placeholder for schedule data - in a real app, this would be fetched from Supabase
  const upcomingEvents = [
    {
      id: "1",
      title: "Module 1 Review Session",
      date: "2025-08-10",
      time: "10:00 AM - 11:00 AM",
      location: "Online (Zoom)",
      course: "Hospitality Management Fundamentals",
    },
    {
      id: "2",
      title: "Guest Lecture: Hotel Operations",
      date: "2025-08-15",
      time: "02:00 PM - 03:30 PM",
      location: "Campus Auditorium",
      course: "Advanced Hotel Operations",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>

      {upcomingEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.course}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Check back later for new study sessions, lectures, or workshops.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/courses">Browse Courses</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
