"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState("")
  const [showResendButton, setShowResendButton] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          console.error("Session check error:", error)
        }

        if (session?.user) {
          console.log("User already logged in, redirecting to dashboard")
          router.push("/dashboard")
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        if (!isMounted) return
        console.error("Session check error:", error)
        setIsCheckingAuth(false)
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setShowResendButton(false)

    try {
      const supabase = createSupabaseClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
          setError(
            "Your email has not been verified. Please check your inbox or click 'Resend verification email' below.",
          )
          setShowResendButton(true)
          return
        }
        throw error
      }

      if (data?.session?.user) {
        console.log("Login successful, redirecting to dashboard")
        // Small delay to ensure session is properly set
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to sign in. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerificationEmail = async () => {
    setIsResending(true)
    setError("")

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      })

      if (error) throw error

      setResendSuccess(true)
      setShowResendButton(false)
    } catch (error: any) {
      console.error("Error resending verification email:", error)
      setError(error.message || "Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!name.trim()) {
      setError("Please enter your name")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createSupabaseClient()

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      })

      if (error) throw error

      if (data?.user) {
        setActiveTab("login")
        setError("Registration successful! Please check your email to verify your account before signing in.")
        setEmail("")
        setPassword("")
        setName("")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-gray-600">Checking authentication...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Learner Portal</CardTitle>
              <CardDescription className="text-center">Access your courses and track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant={error.includes("successful") ? "default" : "destructive"} className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{error.includes("successful") ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {resendSuccess && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Email Sent</AlertTitle>
                    <AlertDescription>Verification email has been resent. Please check your inbox.</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/reset-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  {showResendButton && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Haven't received the verification email?</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={resendVerificationEmail}
                        disabled={isResending}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Resend verification email"
                        )}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
