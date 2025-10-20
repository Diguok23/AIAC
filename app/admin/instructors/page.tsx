"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Search, CheckCircle2, XCircle, UserPlus } from "lucide-react"
import { toast } from "sonner"

interface Instructor {
  id: string
  email: string
  fullName: string
  bio?: string
  expertise?: string
  status: "pending" | "approved" | "rejected"
  totalCourses: number
  totalStudents: number
  averageRating: number
  createdAt: string
}

interface Student {
  id: string
  email: string
  fullName: string
  phone: string
  enrollmentCount: number
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([])
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoteFormData, setPromoteFormData] = useState({ bio: "", expertise: "" })

  useEffect(() => {
    fetchInstructors()
    fetchStudents()
  }, [])

  useEffect(() => {
    const filtered = instructors.filter(
      (instructor) =>
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredInstructors(filtered)
  }, [searchTerm, instructors])

  const fetchInstructors = async () => {
    try {
      const response = await fetch("/api/admin/instructors")
      const data = await response.json()
      setInstructors(data)
    } catch (error) {
      console.error("Failed to fetch instructors:", error)
      toast.error("Failed to load instructors")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students")
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

  const handlePromoteToInstructor = async () => {
    if (!selectedStudent) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/promote-to-instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          bio: promoteFormData.bio,
          expertise: promoteFormData.expertise,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("User promoted to instructor successfully")
        setShowPromoteDialog(false)
        setSelectedStudent(null)
        setPromoteFormData({ bio: "", expertise: "" })
        fetchInstructors()
      } else {
        toast.error(data.error || "Failed to promote user")
      }
    } catch (error) {
      console.error("Error promoting to instructor:", error)
      toast.error("An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedInstructor) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/instructors/${selectedInstructor.id}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Instructor approved successfully")
        setSelectedInstructor(null)
        fetchInstructors()
      } else {
        toast.error("Failed to approve instructor")
      }
    } catch (error) {
      console.error("Error approving instructor:", error)
      toast.error("An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedInstructor) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/instructors/${selectedInstructor.id}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Instructor rejected")
        setSelectedInstructor(null)
        fetchInstructors()
      } else {
        toast.error("Failed to reject instructor")
      }
    } catch (error) {
      console.error("Error rejecting instructor:", error)
      toast.error("An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Instructors</h1>
        <p className="text-muted-foreground">Manage instructor accounts and approvals</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => setShowPromoteDialog(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Promote Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell className="font-medium">{instructor.email}</TableCell>
                    <TableCell>{instructor.fullName}</TableCell>
                    <TableCell>{instructor.expertise || "N/A"}</TableCell>
                    <TableCell>{instructor.totalCourses}</TableCell>
                    <TableCell>{instructor.totalStudents}</TableCell>
                    <TableCell>{instructor.averageRating.toFixed(1)}/5.0</TableCell>
                    <TableCell>
                      <Badge variant={instructor.status === "approved" ? "default" : "secondary"}>
                        {instructor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {instructor.status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedInstructor(instructor)}>
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredInstructors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No instructors found</div>
          )}
        </CardContent>
      </Card>

      {selectedInstructor && (
        <Dialog open={!!selectedInstructor} onOpenChange={() => setSelectedInstructor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Instructor Application</DialogTitle>
              <DialogDescription>Review and approve or reject this instructor application</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-sm text-muted-foreground">{selectedInstructor.fullName}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{selectedInstructor.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <p className="text-sm text-muted-foreground">{selectedInstructor.bio || "Not provided"}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Expertise</label>
                <p className="text-sm text-muted-foreground">{selectedInstructor.expertise || "Not provided"}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleApprove} disabled={isProcessing} className="flex-1 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button onClick={handleReject} disabled={isProcessing} variant="destructive" className="flex-1 gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showPromoteDialog && (
        <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Promote Student to Instructor</DialogTitle>
              <DialogDescription>Select a student and provide instructor details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Student</label>
                <select
                  value={selectedStudent?.id || ""}
                  onChange={(e) => {
                    const student = students.find((s) => s.id === e.target.value)
                    setSelectedStudent(student || null)
                  }}
                  className="w-full border rounded-md p-2 mt-1"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      value={promoteFormData.bio}
                      onChange={(e) => setPromoteFormData({ ...promoteFormData, bio: e.target.value })}
                      placeholder="Enter instructor bio..."
                      className="w-full border rounded-md p-2 mt-1 h-24"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Expertise</label>
                    <input
                      type="text"
                      value={promoteFormData.expertise}
                      onChange={(e) => setPromoteFormData({ ...promoteFormData, expertise: e.target.value })}
                      placeholder="Enter areas of expertise..."
                      className="w-full border rounded-md p-2 mt-1"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPromoteDialog(false)
                    setSelectedStudent(null)
                    setPromoteFormData({ bio: "", expertise: "" })
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePromoteToInstructor}
                  disabled={isProcessing || !selectedStudent}
                  className="flex-1 gap-2"
                >
                  {isProcessing ? "Promoting..." : "Promote to Instructor"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
