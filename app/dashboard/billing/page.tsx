"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, Check, Clock, AlertCircle, Loader2, Download, AlertTriangle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

interface Enrollment {
  id: string
  certification_id: string
  status: string
  progress: number
  payment_status: string
  enrolled_at: string
  due_date: string | null
  certifications: {
    id: string
    title: string
    category: string
    level: string
    duration: string | null
    price: number
    instructor: string | null
  } | null
}

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null)

  const TAX_RATE = 0.16

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setUserId(user.id)

        const response = await fetch(`/api/user-enrollments?user_id=${user.id}`)
        const data = await response.json()

        if (data.enrollments) {
          setEnrollments(data.enrollments)
        }
      } catch (error) {
        console.error("Error loading billing data:", error)
        toast({
          title: "Error",
          description: "Failed to load billing information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, router])

  const handleConfirmPayment = async (enrollment: Enrollment) => {
    if (!userId || !enrollment.certifications) return

    setProcessingId(enrollment.id)

    try {
      // Update payment status to paid
      const response = await fetch("/api/user-enrollments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: enrollment.id,
          payment_status: "paid",
          status: "active",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to confirm payment")
      }

      // Update local state
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollment.id ? { ...e, payment_status: "paid", status: "active" } : e)),
      )

      toast({
        title: "Payment Confirmed",
        description: `You are now enrolled in ${enrollment.certifications.title}`,
      })

      setConfirmPaymentId(null)

      // Redirect to course after a short delay
      setTimeout(() => {
        router.push(`/dashboard/courses/${enrollment.certification_id}`)
      }, 1500)
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const calculateSubtotal = (price: number) => price
  const calculateTax = (price: number) => Math.round(price * TAX_RATE * 100) / 100
  const calculateTotal = (price: number) => calculateSubtotal(price) + calculateTax(price)

  const pendingEnrollments = enrollments.filter((e) => e.payment_status !== "paid")
  const activeEnrollments = enrollments.filter((e) => e.payment_status === "paid")

  const totalBalance = pendingEnrollments.reduce((sum, e) => sum + calculateTotal(e.certifications?.price || 0), 0)

  const totalPaid = activeEnrollments.reduce((sum, e) => sum + calculateTotal(e.certifications?.price || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your course enrollments and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{pendingEnrollments.length} pending payment(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{activeEnrollments.length} active course(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tax Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(TAX_RATE * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">DST (Domestic Services Tax)</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingEnrollments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="h-5 w-5" />
              Pending Payments
            </CardTitle>
            <CardDescription className="text-orange-800">
              Complete these payments to activate your courses
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pending Enrollments */}
      {pendingEnrollments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Courses Awaiting Payment</h2>
          {pendingEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{enrollment.certifications?.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {enrollment.certifications?.category} • {enrollment.certifications?.level}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Course Fee:</span>
                      <span>KES {calculateSubtotal(enrollment.certifications?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>DST Tax (16%):</span>
                      <span>KES {calculateTax(enrollment.certifications?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Due:</span>
                      <span className="text-lg">
                        KES {calculateTotal(enrollment.certifications?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  {enrollment.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Payment due: {new Date(enrollment.due_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1" onClick={() => setConfirmPaymentId(enrollment.id)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Confirm Payment
                        </Button>
                      </DialogTrigger>
                      {confirmPaymentId === enrollment.id && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Payment</DialogTitle>
                            <DialogDescription>
                              Confirm that you have completed the payment for this course
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Please ensure you have transferred KES{" "}
                                {calculateTotal(enrollment.certifications?.price || 0).toFixed(2)} to our account before
                                confirming.
                              </AlertDescription>
                            </Alert>

                            <div className="space-y-2 p-4 bg-muted rounded-lg text-sm">
                              <p>
                                <strong>Course:</strong> {enrollment.certifications?.title}
                              </p>
                              <p>
                                <strong>Amount:</strong> KES{" "}
                                {calculateTotal(enrollment.certifications?.price || 0).toFixed(2)}
                              </p>
                              <p>
                                <strong>Includes:</strong> 16% DST Tax
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 bg-transparent"
                                onClick={() => setConfirmPaymentId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={() => handleConfirmPayment(enrollment)}
                                disabled={processingId !== null}
                              >
                                {processingId === enrollment.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Confirm Payment
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>

                    <Button variant="outline" className="flex-1 bg-transparent">
                      View Invoice
                      <Download className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Courses */}
      {activeEnrollments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Active Courses
          </h2>
          {activeEnrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{enrollment.certifications?.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {enrollment.certifications?.category} • {enrollment.certifications?.level}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Course Fee:</span>
                      <span>KES {calculateSubtotal(enrollment.certifications?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>DST Tax (16%):</span>
                      <span>KES {calculateTax(enrollment.certifications?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 text-green-600">
                      <span>Amount Paid:</span>
                      <span className="text-lg">
                        KES {calculateTotal(enrollment.certifications?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Enrollment Date */}
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full" asChild>
                    <a href={`/dashboard/courses/${enrollment.certification_id}`}>Continue Learning</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {enrollments.length === 0 && (
        <Card className="py-12">
          <div className="text-center text-muted-foreground space-y-3">
            <CreditCard className="h-12 w-12 mx-auto opacity-50" />
            <p>No enrollments yet</p>
            <Button asChild>
              <a href="/dashboard/certifications">Browse Certifications</a>
            </Button>
          </div>
        </Card>
      )}

      {/* Finance Contact */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          For billing inquiries or payment assistance, contact our finance team at <strong>finance@apmih.ac.ke</strong>{" "}
          or call <strong>+254 (0) 123 456 789</strong>
        </AlertDescription>
      </Alert>
    </div>
  )
}
