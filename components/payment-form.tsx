"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface PaymentFormProps {
  applicationId: string
  programName: string
  amount: number
  email: string
}

export default function PaymentForm({ applicationId, programName, amount, email }: PaymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currency, setCurrency] = useState("KSH")
  const [customAmount, setCustomAmount] = useState(amount.toString())
  const [amountError, setAmountError] = useState("")

  const handleAmountChange = (e) => {
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

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Number(customAmount),
          applicationId,
          programName,
          currency: currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Redirect to Paystack checkout page
      if (data.data && data.data.authorization_url) {
        window.location.href = data.data.authorization_url
      } else {
        throw new Error("No authorization URL returned from payment provider")
      }
    } catch (error) {
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

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <RadioGroup value={currency} onValueChange={setCurrency} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="KSH" id="ksh" />
              <Label htmlFor="ksh">KSH (Kenyan Shillings)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="USD" id="usd" />
              <Label htmlFor="usd">USD (US Dollars)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              value={customAmount}
              onChange={handleAmountChange}
              className="pl-8"
              placeholder="Enter payment amount"
            />
            <span className="absolute left-3 top-2.5 text-gray-500">{currency === "KSH" ? "KSh" : "$"}</span>
          </div>
          {amountError && <p className="text-sm text-red-500">{amountError}</p>}
          <p className="text-xs text-gray-500">Please enter the exact amount for your selected program.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <CreditCard className="h-4 w-4" />
            <span>Secure payment powered by Paystack</span>
          </div>
          <p className="text-xs text-gray-500">
            Your payment information is processed securely. We do not store your credit card details.
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handlePayment} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${currency === "KSH" ? "KSh" : "$"}${customAmount}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
