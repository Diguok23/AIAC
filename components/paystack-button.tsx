"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PaystackButtonProps {
  email: string
  amount: number
  metadata?: Record<string, any>
  text?: string
  className?: string
  onSuccess?: (reference: string) => void
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function PaystackButton({
  email,
  amount,
  metadata = {},
  text = "Pay Now",
  className = "",
  onSuccess,
  onError,
}: PaystackButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = () => {
    if (isLoading) return // Prevent multiple clicks

    setIsLoading(true)

    try {
      // Ensure PaystackPop is available
      if (!window.PaystackPop) {
        throw new Error("Paystack not loaded. Please refresh the page and try again.")
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // Convert to kobo
        currency: "NGN",
        ref: `APMIH_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        metadata,
        callback: (response) => {
          setIsLoading(false)
          if (onSuccess) onSuccess(response.reference)
        },
        onClose: () => {
          setIsLoading(false)
        },
      })

      handler.openIframe()
    } catch (error) {
      setIsLoading(false)
      if (onError) onError(error)
      console.error("Paystack error:", error)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        text
      )}
    </Button>
  )
}
