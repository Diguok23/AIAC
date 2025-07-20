"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CheckCircle, XCircle, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

interface Application {
  id: string
  full_name: string
  email: string
  phone_number: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function DashboardApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setApplications(data || [])
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load applications.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [supabase])

  const handleUpdateApplicationStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setUpdatingId(id)
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update application status.")
      }

      const updatedApplication = await response.json()

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: updatedApplication.status } : app)),
      )

      toast({
        title: "Success",
        description: `Application ${updatedApplication.status}.`,
      })
    } catch (error: any) {
      console.error("Error updating application status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update application status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredApplications = applications.filter(
    (app) =>
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Applications</h1>
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Applications</h1>

      <div className="mb-6 flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search applications..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app) => (
            <Card key={app.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{app.full_name}</CardTitle>
                <CardDescription>{app.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Phone: {app.phone_number}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      app.status === "approved"
                        ? "text-green-600"
                        : app.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </p>
                <p className="text-xs text-gray-500">Applied on: {new Date(app.created_at).toLocaleDateString()}</p>
              </CardContent>
              <CardContent className="pt-0 flex gap-2">
                {app.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateApplicationStatus(app.id, "approved")}
                      disabled={updatingId === app.id}
                    >
                      {updatingId === app.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateApplicationStatus(app.id, "rejected")}
                      disabled={updatingId === app.id}
                    >
                      {updatingId === app.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? `We couldn't find any applications matching "${searchQuery}". Try a different search term.`
              : "No applications have been submitted yet."}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
