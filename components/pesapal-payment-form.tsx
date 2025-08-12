"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PesapalPaymentFormProps {
  applicationId?: string
  certificationId?: string
  programName: string
  amount: number
  email: string
  firstName?: string
  lastName?: string
}

export default function PesapalPaymentForm({
  applicationId,
  certificationId,
  programName,
  amount,
  email,
  firstName = "",
  lastName = "",
}: PesapalPaymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currency, setCurrency] = useState("KES")
  const [customAmount, setCustomAmount] = useState(amount.toString())
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amountError, setAmountError] = useState("")

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomAmount(value)

    // Validate amount
    if (!value || isNaN(Number(value))) {
      setAmountError("Please enter a valid amount")
    } else if (Number(value) <= 0) {
      setAmountError("Amount must be greater than 0")
    } else {
      setAmountError("")
    }
  }

  const handlePayment = async () => {
    // Validate amount before proceeding
    if (!customAmount || isNaN(Number(customAmount)) || Number(customAmount) <= 0) {
      setAmountError("Please enter a valid amount")
      return
    }

    if (!phoneNumber) {
      setError("Phone number is required for Pesapal payments")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/pesapal/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Number(customAmount),
          currency,
          applicationId,
          certificationId,
          programName,
          firstName,
          lastName,
          phoneNumber,
          countryCode: currency === "KES" ? "KE" : "UG", // Default country codes
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Redirect to Pesapal checkout page
      if (data.data && data.data.authorization_url) {
        window.location.href = data.data.authorization_url
      } else {
        throw new Error("No authorization URL returned from payment provider")
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      setError(error.message || "An error occurred while processing your payment")
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case "KES":
        return "KSh"
      case "UGX":
        return "UGX"
      case "USD":
        return "$"
      default:
        return curr
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Complete Your Payment</CardTitle>
        <CardDescription>Secure payment for {programName} via Pesapal</CardDescription>
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
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KES">KES (Kenyan Shillings)</SelectItem>
              <SelectItem value="UGX">UGX (Ugandan Shillings)</SelectItem>
              <SelectItem value="USD">USD (US Dollars)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              value={customAmount}
              onChange={handleAmountChange}
              className="pl-12"
              placeholder="Enter payment amount"
            />
            <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(currency)}</span>
          </div>
          {amountError && <p className="text-sm text-red-500">{amountError}</p>}
          <p className="text-xs text-gray-500">Please enter the exact amount for your selected program.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <CreditCard className="h-4 w-4" />
            <span>Secure payment powered by Pesapal</span>
          </div>
          <p className="text-xs text-gray-500">
            Your payment information is processed securely. We support Mobile Money, Bank transfers, and Card payments.
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
            `Pay ${getCurrencySymbol(currency)}${customAmount}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
