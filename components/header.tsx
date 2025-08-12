"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogIn, UserPlus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient()

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession()

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
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-navy-700">
                <span className="text-navy-900">APMIH</span>
              </span>
              <span className="ml-2 hidden text-sm text-muted-foreground md:inline-block">
                American Professional Management Institute of Hospitality
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-sm font-medium ${isActive("/") ? "text-primary" : "hover:text-primary"}`}>
              Home
            </Link>
            <Link
              href="/certifications"
              className={`text-sm font-medium ${isActive("/certifications") ? "text-primary" : "hover:text-primary"}`}
            >
              Certifications
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Testimonials
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>

            {!isLoading &&
              (user ? (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" asChild>
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
              <Button className="ml-2">Apply Now</Button>
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
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link
              href="/"
              className={`block py-2 text-base font-medium ${isActive("/") ? "text-primary" : "hover:text-primary"}`}
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/certifications"
              className={`block py-2 text-base font-medium ${isActive("/certifications") ? "text-primary" : "hover:text-primary"}`}
              onClick={toggleMenu}
            >
              Certifications
            </Link>
            <Link href="#about" className="block py-2 text-base font-medium hover:text-primary" onClick={toggleMenu}>
              About
            </Link>
            <Link
              href="#testimonials"
              className="block py-2 text-base font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              Testimonials
            </Link>
            <Link href="#contact" className="block py-2 text-base font-medium hover:text-primary" onClick={toggleMenu}>
              Contact
            </Link>

            {!isLoading &&
              (user ? (
                <>
                  <Link href="/dashboard" className="block py-2" onClick={toggleMenu}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <div className="block py-2">
                    <Button variant="ghost" className="w-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className="block" onClick={toggleMenu}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/login" className="block" onClick={toggleMenu}>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ))}

            <Link href="/apply" className="block pt-2" onClick={toggleMenu}>
              <Button className="w-full">Apply Now</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
