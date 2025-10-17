"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Clock, Users, Award, Star } from "lucide-react"
import Link from "next/link"

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  price: number
  currency: string
  rating?: number
  students?: number
  features?: string[]
  slug?: string
}

// Mock data
const mockCertifications: Certification[] = [
  {
    id: "1",
    title: "Hotel Operations Management",
    description:
      "Comprehensive training in hotel operations, front office management, and guest services. Learn industry best practices and develop leadership skills.",
    category: "Hotel Management",
    level: "Intermediate",
    duration: "8 weeks",
    price: 299,
    currency: "USD",
    rating: 4.8,
    students: 1250,
    features: ["Live Sessions", "Case Studies", "Industry Mentorship", "Certificate"],
    slug: "hotel-operations-management",
  },
  {
    id: "2",
    title: "Food Safety and Hygiene",
    description:
      "Essential food safety practices and hygiene standards for hospitality professionals. HACCP principles and regulatory compliance.",
    category: "Food Service",
    level: "Beginner",
    duration: "4 weeks",
    price: 149,
    currency: "USD",
    rating: 4.9,
    students: 2100,
    features: ["Self-Paced", "Interactive Modules", "Assessment", "Certificate"],
    slug: "food-safety-hygiene",
  },
  {
    id: "3",
    title: "Customer Service Excellence",
    description:
      "Advanced customer service techniques and relationship management strategies. Handle difficult situations and exceed guest expectations.",
    category: "Customer Service",
    level: "Advanced",
    duration: "6 weeks",
    price: 249,
    currency: "USD",
    rating: 4.7,
    students: 890,
    features: ["Role Playing", "Real Scenarios", "Peer Learning", "Certificate"],
    slug: "customer-service-excellence",
  },
  {
    id: "4",
    title: "Event Planning and Management",
    description:
      "Complete guide to planning and executing successful hospitality events. From corporate meetings to weddings and conferences.",
    category: "Event Management",
    level: "Intermediate",
    duration: "10 weeks",
    price: 399,
    currency: "USD",
    rating: 4.6,
    students: 650,
    features: ["Project-Based", "Industry Tools", "Portfolio Building", "Certificate"],
    slug: "event-planning-management",
  },
  {
    id: "5",
    title: "Restaurant Management",
    description:
      "Operational excellence in restaurant management and staff coordination. Menu planning, cost control, and team leadership.",
    category: "Restaurant Management",
    level: "Advanced",
    duration: "12 weeks",
    price: 449,
    currency: "USD",
    rating: 4.8,
    students: 780,
    features: ["Business Simulation", "Financial Planning", "Leadership Training", "Certificate"],
    slug: "restaurant-management",
  },
  {
    id: "6",
    title: "Hospitality Marketing",
    description:
      "Digital marketing strategies specifically designed for hospitality businesses. Social media, content marketing, and brand building.",
    category: "Marketing",
    level: "Intermediate",
    duration: "6 weeks",
    price: 199,
    currency: "USD",
    rating: 4.5,
    students: 1100,
    features: ["Campaign Creation", "Analytics", "Social Media", "Certificate"],
    slug: "hospitality-marketing",
  },
]

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedPrice, setSelectedPrice] = useState<string>("all")

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        // Check if we have Supabase configuration
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          // Use mock data for preview
          console.log("Using mock data - Supabase not configured")
          setCertifications(mockCertifications)
          setLoading(false)
          return
        }

        // Try to fetch from API
        const response = await fetch("/api/certifications")
        if (response.ok) {
          const data = await response.json()
          const certs = data.certifications || []

          // If API returns empty array, use mock data
          if (certs.length === 0) {
            console.log("API returned empty, using mock data")
            setCertifications(mockCertifications)
          } else {
            setCertifications(certs)
          }
        } else {
          // Fallback to mock data
          console.log("API failed, using mock data")
          setCertifications(mockCertifications)
        }
      } catch (error) {
        console.error("Error loading certifications:", error)
        // Use mock data on error
        setCertifications(mockCertifications)
      } finally {
        setLoading(false)
      }
    }

    loadCertifications()
  }, [])

  const safeCertifications = Array.isArray(certifications) ? certifications : []

  const filteredCertifications = safeCertifications.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || cert.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || cert.level === selectedLevel

    let matchesPrice = true
    if (selectedPrice !== "all") {
      switch (selectedPrice) {
        case "free":
          matchesPrice = cert.price === 0
          break
        case "under-200":
          matchesPrice = cert.price < 200
          break
        case "200-400":
          matchesPrice = cert.price >= 200 && cert.price <= 400
          break
        case "over-400":
          matchesPrice = cert.price > 400
          break
      }
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice
  })

  const categories = Array.from(new Set(safeCertifications.map((cert) => cert.category)))
  const levels = ["Beginner", "Intermediate", "Advanced"]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Professional Certifications</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advance your hospitality career with industry-recognized certifications designed by experts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full lg:w-32">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPrice} onValueChange={setSelectedPrice}>
          <SelectTrigger className="w-full lg:w-32">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="under-200">Under $200</SelectItem>
            <SelectItem value="200-400">$200 - $400</SelectItem>
            <SelectItem value="over-400">Over $400</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCertifications.length} of {safeCertifications.length} certifications
        </p>
        {(searchTerm || selectedCategory !== "all" || selectedLevel !== "all" || selectedPrice !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
              setSelectedLevel("all")
              setSelectedPrice("all")
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Certifications Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCertifications.map((cert) => (
          <Card key={cert.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <Badge className={getLevelColor(cert.level)}>{cert.level}</Badge>
                {cert.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{cert.rating}</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-xl leading-tight">{cert.title}</CardTitle>
              <CardDescription className="line-clamp-3">{cert.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{cert.duration}</span>
                </div>
                {cert.students && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{cert.students.toLocaleString()} students</span>
                  </div>
                )}
              </div>

              {cert.features && (
                <div className="flex flex-wrap gap-1">
                  {cert.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {cert.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{cert.features.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-2xl font-bold">
                  {cert.price === 0 ? "Free" : `$${cert.price}`}
                  {cert.price > 0 && (
                    <span className="text-sm font-normal text-muted-foreground"> {cert.currency}</span>
                  )}
                </div>
                <Button asChild>
                  <Link href={`/certifications/${cert.slug || cert.id}`}>
                    <Award className="h-4 w-4 mr-2" />
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCertifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certifications found</h3>
            <p className="text-gray-500 text-center mb-4">
              Try adjusting your search criteria or browse all available certifications.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedLevel("all")
                setSelectedPrice("all")
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
