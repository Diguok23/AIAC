"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface IntasendPaymentFormProps {
  applicationId?: string
  certificationId?: string
  programName: string
  amount: number
  email: string
  firstName?: string
  lastName?: string
  userId?: string
}

export default function IntasendPaymentForm({
  applicationId,
  certificationId,
  programName,
  amount,
  email,
  firstName = "",
  lastName = "",
  userId,
}: IntasendPaymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [customAmount, setCustomAmount] = useState(amount.toString())
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amountError, setAmountError] = useState("")

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomAmount(value)

    if (!value || isNaN(Number(value))) {
      setAmountError("Please enter a valid amount")
    } else if (Number(value) <= 0) {
      setAmountError("Amount must be greater than 0")
    } else {
      setAmountError("")
    }
  }

  const handlePayment = async () => {
    if (!customAmount || isNaN(Number(customAmount)) || Number(customAmount) <= 0) {
      setAmountError("Please enter a valid amount")
      return
    }

    if (!phoneNumber) {
      setError("Phone number is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/intasend/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Number(customAmount),
          currency: "USD",
          applicationId,
          certificationId,
          programName,
          firstName,
          lastName,
          phoneNumber,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      if (data.data && data.data.authorization_url) {
        window.location.href = data.data.authorization_url
      } else {
        throw new Error("No payment URL returned from provider")
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      setError(error.message || "An error occurred while processing your payment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Complete Your Payment</CardTitle>
        <CardDescription>Secure payment for {programName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="program">Program</Label>
          <Input id="program" value={programName} disabled />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={firstName} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={lastName} disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., +254700000000"
            required
          />
          <p className="text-xs text-gray-500">Required for payment processing</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <div className="relative">
            <Input
              id="amount"
              value={customAmount}
              onChange={handleAmountChange}
              className="pl-8"
              placeholder="Enter payment amount"
            />
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          </div>
          {amountError && <p className="text-sm text-red-500">{amountError}</p>}
          <p className="text-xs text-gray-500">Please enter the exact amount for your selected program.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <CreditCard className="h-4 w-4" />
            <span>Secure payment powered by Intasend</span>
          </div>
          <p className="text-xs text-gray-500">
            We accept all payment methods including cards, mobile money, and bank transfers. Your payment information is
            processed securely.
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handlePayment} disabled={isLoading || !phoneNumber} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${customAmount}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
