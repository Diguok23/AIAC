"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Clock, Users, Award, DollarSign } from "lucide-react"
import Link from "next/link"

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  price: number
  max_participants: number
  image_url?: string
  created_at: string
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      // Check if we're in a preview environment
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Use mock data for preview
        const mockCertifications: Certification[] = [
          {
            id: "1",
            title: "Hotel Management Fundamentals",
            description:
              "Learn the essential skills needed to manage hotel operations effectively, including front desk management, housekeeping coordination, and guest services.",
            category: "Management",
            level: "Beginner",
            duration: "8 weeks",
            price: 299,
            max_participants: 25,
            image_url: "/images/hotel-management.jpg",
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "2",
            title: "Food & Beverage Service Excellence",
            description:
              "Master the art of food and beverage service in hospitality settings, covering menu planning, service techniques, and customer satisfaction.",
            category: "Food & Beverage",
            level: "Intermediate",
            duration: "6 weeks",
            price: 249,
            max_participants: 20,
            image_url: "/images/food-beverage.jpg",
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "3",
            title: "Event Planning & Management",
            description:
              "Comprehensive training in event planning, from concept to execution, including venue selection, vendor management, and event coordination.",
            category: "Events",
            level: "Advanced",
            duration: "10 weeks",
            price: 399,
            max_participants: 15,
            image_url: "/images/event-planning.jpg",
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "4",
            title: "Customer Service Excellence",
            description:
              "Develop exceptional customer service skills specific to the hospitality industry, focusing on communication, problem-solving, and guest satisfaction.",
            category: "Customer Service",
            level: "Beginner",
            duration: "4 weeks",
            price: 199,
            max_participants: 30,
            image_url: "/images/customer-service.jpg",
            created_at: "2024-01-01T00:00:00Z",
          },
        ]
        setCertifications(mockCertifications)
        setLoading(false)
        return
      }

      const response = await fetch("/api/certifications")
      if (!response.ok) {
        throw new Error("Failed to fetch certifications")
      }
      const data = await response.json()
      setCertifications(data)
    } catch (error: any) {
      console.error("Error fetching certifications:", error)
      setError("Failed to load certifications. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || cert.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || cert.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  const categories = Array.from(new Set(certifications.map((cert) => cert.category)))
  const levels = Array.from(new Set(certifications.map((cert) => cert.level)))

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-[600px] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Certifications</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCertifications}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Hospitality Certifications</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advance your career with our industry-recognized certification programs designed by hospitality experts.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
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
          <SelectTrigger className="w-full md:w-48">
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
          <SelectTrigger className="w-full md:w-48">
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
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredCertifications.length} of {certifications.length} certifications
        </p>
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertifications.map((certification) => (
          <Card key={certification.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary">{certification.category}</Badge>
                <Badge variant="outline">{certification.level}</Badge>
              </div>
              <CardTitle className="text-xl">{certification.title}</CardTitle>
              <CardDescription className="flex-1">{certification.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {certification.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  Max {certification.max_participants} participants
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />${certification.price}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">${certification.price}</span>
                <Button asChild>
                  <Link href={`/apply?certification=${certification.id}`}>
                    <Award className="h-4 w-4 mr-2" />
                    Apply Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCertifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No certifications found matching your criteria.</p>
          <Button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
              setSelectedLevel("all")
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
