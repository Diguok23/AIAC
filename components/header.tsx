"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogIn, UserPlus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're in a preview environment
        if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          setIsLoading(false)
          return
        }

        const { createSupabaseClient } = await import("@/lib/supabase")
        const supabase = createSupabaseClient()

        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))

        const {
          data: { session },
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any

        setUser(session?.user || null)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, newSession) => {
          setUser(newSession?.user || null)
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // Fail silently in preview environment
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

      const { createSupabaseClient } = await import("@/lib/supabase")
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout by clearing state
      setUser(null)
      router.push("/")
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">A</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-navy-700">APMIH</span>
                <span className="ml-2 hidden text-sm text-muted-foreground lg:inline-block">
                  American Professional Management Institute of Hospitality
                </span>
              </div>
              <div className="sm:hidden">
                <span className="text-lg font-bold text-navy-700">APMIH</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/certifications"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/certifications") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Certifications
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Testimonials
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Contact
            </Link>

            {!isLoading &&
              (user ? (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" asChild size="sm">
                    <Link href="/dashboard">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} size="sm">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" asChild size="sm">
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/login">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </div>
              ))}

            <Link href="/apply">
              <Button className="ml-2" size="sm">
                Apply Now
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link
              href="/"
              className={`block py-3 text-base font-medium transition-colors ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/certifications"
              className={`block py-3 text-base font-medium transition-colors ${
                isActive("/certifications") ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
              onClick={toggleMenu}
            >
              Certifications
            </Link>
            <Link
              href="#about"
              className="block py-3 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link
              href="#testimonials"
              className="block py-3 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={toggleMenu}
            >
              Testimonials
            </Link>
            <Link
              href="#contact"
              className="block py-3 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={toggleMenu}
            >
              Contact
            </Link>

            <div className="pt-4 border-t space-y-3">
              {!isLoading &&
                (user ? (
                  <>
                    <Link href="/dashboard" className="block" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link href="/login" className="block" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/login" className="block" onClick={toggleMenu}>
                      <Button className="w-full justify-start">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ))}

              <Link href="/apply" className="block" onClick={toggleMenu}>
                <Button className="w-full justify-start">Apply Now</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
