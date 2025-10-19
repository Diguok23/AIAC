"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface EnrollmentConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certification: {
    id: string
    title: string
    description: string
    level: string
    duration: string | null
    price: number
    instructor: string | null
  } | null
}

const TAX_RATE = 0.16

export function EnrollmentConfirmationDialog({ open, onOpenChange, certification }: EnrollmentConfirmationDialogProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)

  if (!certification) return null

  const subtotal = certification.price
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = subtotal + tax

  const handleConfirmEnrollment = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to enroll",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Create enrollment
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          certificationId: certification.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to enroll")
      }

      const data = await response.json()

      toast({
        title: "Enrollment Successful!",
        description: `You have been enrolled in ${certification.title}. Proceed to billing to confirm payment.`,
      })

      onOpenChange(false)

      // Redirect to billing page
      setTimeout(() => {
        router.push("/dashboard/billing")
      }, 1500)
    } catch (error) {
      console.error("Error confirming enrollment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enroll in course",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Enrollment</DialogTitle>
          <DialogDescription>Review the course details and pricing before confirming your enrollment</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Details */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{certification.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{certification.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{certification.level}</Badge>
              {certification.duration && <Badge variant="outline">{certification.duration}</Badge>}
              {certification.instructor && (
                <Badge variant="outline" className="text-xs">
                  {certification.instructor}
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Price Breakdown</h4>
            <div className="space-y-2 p-3 bg-muted rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Course Fee:</span>
                <span>KES {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>DST Tax (16%):</span>
                <span>KES {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Due:</span>
                <span className="text-base">KES {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Information Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              After confirming, you will be taken to the billing page where you can complete your payment to activate
              the course.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirmEnrollment} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Enrollment
                </>
              )}
            </Button>
          </div>

          {/* Payment Instructions */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">💡 What happens next?</p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>✓ You'll be taken to the billing page</li>
              <li>✓ Review the payment amount</li>
              <li>✓ Confirm once you've made the payment</li>
              <li>✓ Course will be activated immediately</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
