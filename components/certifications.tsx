"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  AlertCircle,
  Ship,
  Building,
  TrendingUp,
  Computer,
  Heart,
  BookOpen,
  Users,
  Settings,
} from "lucide-react"
import Link from "next/link"

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  slug: string
}

const categoryIcons = {
  cruise: Ship,
  executive: Building,
  business: TrendingUp,
  it: Computer,
  healthcare: Heart,
  sales: TrendingUp,
  training: BookOpen,
  frontline: Users,
  social: BookOpen,
  admin: Settings,
}

const categoryNames = {
  cruise: "Cruise & Maritime",
  executive: "Executive & Management",
  business: "Business & Finance",
  it: "Information Technology",
  healthcare: "Healthcare & Wellness",
  sales: "Sales & Marketing",
  training: "Training & Instruction",
  frontline: "Frontline & Service",
  social: "Social Sciences",
  admin: "Administration",
}

export default function CertificationsSection() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("")

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/certifications")
      const data = await response.json()

      if (response.ok && data.certifications) {
        setCertifications(data.certifications)

        // Set first category as active
        const categories = [...new Set(data.certifications.map((cert: Certification) => cert.category))]
        if (categories.length > 0) {
          setActiveCategory(categories[0])
        }
      } else {
        setError(data.error || "Failed to fetch certifications")
      }
    } catch (err) {
      console.error("Error fetching certifications:", err)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Group certifications by category
  const certificationsByCategory = certifications.reduce(
    (acc, cert) => {
      if (!acc[cert.category]) {
        acc[cert.category] = []
      }
      acc[cert.category].push(cert)
      return acc
    },
    {} as Record<string, Certification[]>,
  )

  const categories = Object.keys(certificationsByCategory)

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Loading certifications...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
            <p className="mt-4 text-red-600">{error}</p>
            <Button onClick={fetchCertifications} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (certifications.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600">No certifications available yet.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Certifications</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advance your career with our comprehensive certification programs designed for hospitality and cruise ship
            professionals
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-5 mb-8">
            {categories.slice(0, 5).map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || BookOpen
              return (
                <TabsTrigger key={category} value={category} className="flex items-center gap-2 text-xs md:text-sm">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {categoryNames[category as keyof typeof categoryNames] || category}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {categoryNames[category as keyof typeof categoryNames] || category}
                </h3>
                <p className="text-gray-600">
                  {certificationsByCategory[category].length} certification programs available
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {certificationsByCategory[category].map((cert) => (
                  <Card key={cert.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="mb-2">
                          {cert.level}
                        </Badge>
                        <span className="text-2xl font-bold text-blue-600">${cert.price}</span>
                      </div>
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {cert.description}
                      </CardDescription>
                      <div className="flex gap-2">
                        <Button asChild className="flex-1">
                          <Link href={`/apply?program=${encodeURIComponent(cert.title)}&category=${cert.category}`}>
                            Apply Now
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/certifications/${cert.slug}`}>Learn More</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/certifications">View All Certifications</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
