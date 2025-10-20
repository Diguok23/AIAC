"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Search, Award } from "lucide-react"
import { toast } from "sonner"

interface Student {
  id: string
  email: string
  fullName: string
  phone: string
  address: string
  enrollmentCount: number
  totalSpent: number
  verificationStatus: string
  createdAt: string
}

interface Certification {
  id: string
  title: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showCertificateDialog, setShowCertificateDialog] = useState(false)
  const [selectedCertification, setSelectedCertification] = useState("")
  const [isIssuingCertificate, setIsIssuingCertificate] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchCertifications()
  }, [])

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students")
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Failed to fetch students:", error)
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const fetchCertifications = async () => {
    try {
      const response = await fetch("/api/certifications")
      const data = await response.json()
      setCertifications(data)
    } catch (error) {
      console.error("Failed to fetch certifications:", error)
    }
  }

  const handleIssueCertificate = async () => {
    if (!selectedStudent || !selectedCertification) {
      toast.error("Please select a certification")
      return
    }

    setIsIssuingCertificate(true)
    try {
      const response = await fetch("/api/admin/issue-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          certificationId: selectedCertification,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Certificate issued successfully")
        setShowCertificateDialog(false)
        setSelectedStudent(null)
        setSelectedCertification("")
      } else {
        toast.error(data.error || "Failed to issue certificate")
      }
    } catch (error) {
      console.error("Error issuing certificate:", error)
      toast.error("An error occurred")
    } finally {
      setIsIssuingCertificate(false)
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
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">Manage student accounts and enrollments</p>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.email}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.phone || "N/A"}</TableCell>
                    <TableCell>{student.address || "N/A"}</TableCell>
                    <TableCell>{student.enrollmentCount}</TableCell>
                    <TableCell>${student.totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{student.verificationStatus}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowCertificateDialog(true)
                        }}
                        className="gap-2"
                      >
                        <Award className="h-4 w-4" />
                        Issue Certificate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No students found</div>
          )}
        </CardContent>
      </Card>

      {showCertificateDialog && selectedStudent && (
        <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Issue Certificate</DialogTitle>
              <DialogDescription>
                Select a course to issue a certificate for {selectedStudent.fullName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Student</label>
                <p className="text-sm text-muted-foreground">{selectedStudent.fullName}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Select Course/Certification</label>
                <select
                  value={selectedCertification}
                  onChange={(e) => setSelectedCertification(e.target.value)}
                  className="w-full border rounded-md p-2 mt-1"
                >
                  <option value="">Choose a certification...</option>
                  {certifications.map((cert) => (
                    <option key={cert.id} value={cert.id}>
                      {cert.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCertificateDialog(false)
                    setSelectedStudent(null)
                    setSelectedCertification("")
                  }}
                  disabled={isIssuingCertificate}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleIssueCertificate}
                  disabled={isIssuingCertificate || !selectedCertification}
                  className="flex-1 gap-2"
                >
                  {isIssuingCertificate ? "Issuing..." : "Issue Certificate"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
