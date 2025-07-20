import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardSchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events & Deadlines</CardTitle>
          <CardDescription>View your personalized learning schedule and important dates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming events or deadlines</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your schedule is clear! Check back later for new course milestones or events.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/dashboard/courses">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  View My Courses
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
