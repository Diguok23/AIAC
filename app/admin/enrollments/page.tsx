"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Download } from "lucide-react"

interface Enrollment {
  id: string
  studentEmail: string
  studentName: string
  courseName: string
  price: number
  taxAmount: number
  totalAmount: number
  status: "active" | "completed" | "dropped"
  paymentStatus: "pending" | "paid" | "failed"
  startDate: string
  dueDate: string
  progress: number
}

interface EnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalStudents: number
  enrollments: Enrollment[]
}

export default function EnrollmentsPage() {
  const [stats, setStats] = useState<EnrollmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [paymentFilter, setPaymentFilter] = useState<string>("")
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    if (!stats) return

    let filtered = stats.enrollments

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((e) => e.status === statusFilter)
    }

    if (paymentFilter) {
      filtered = filtered.filter((e) => e.paymentStatus === paymentFilter)
    }

    setFilteredEnrollments(filtered)
  }, [searchTerm, statusFilter, paymentFilter, stats])

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/admin/enrollments")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!stats) return

    const csv = [
      [
        "Email",
        "Name",
        "Course",
        "Amount",
        "Tax",
        "Total",
        "Status",
        "Payment Status",
        "Start Date",
        "Due Date",
        "Progress",
      ],
      ...filteredEnrollments.map((e) => [
        e.studentEmail,
        e.studentName,
        e.courseName,
        e.price,
        e.taxAmount,
        e.totalAmount,
        e.status,
        e.paymentStatus,
        new Date(e.startDate).toLocaleDateString(),
        new Date(e.dueDate).toLocaleDateString(),
        `${e.progress}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "enrollments.csv"
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load enrollments</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">All enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedEnrollments}</div>
            <p className="text-xs text-muted-foreground">Finished courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Enrollments</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tax (16%)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.studentEmail}</TableCell>
                    <TableCell>{enrollment.studentName}</TableCell>
                    <TableCell>{enrollment.courseName}</TableCell>
                    <TableCell>KES {enrollment.price.toLocaleString()}</TableCell>
                    <TableCell>KES {enrollment.taxAmount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">KES {enrollment.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enrollment.status === "active"
                            ? "default"
                            : enrollment.status === "completed"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={enrollment.paymentStatus === "paid" ? "default" : "secondary"}>
                        {enrollment.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{enrollment.progress}%</TableCell>
                    <TableCell>{new Date(enrollment.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredEnrollments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No enrollments found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
