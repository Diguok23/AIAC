"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  BookOpen,
  Ship,
  Building,
  TrendingUp,
  Computer,
  Heart,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Zap,
  Download,
  CalendarIcon,
  FileText,
  X,
  Star,
} from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  slug: string
  created_at: string
  duration: string | null
  long_description?: string
  instructor?: string
  instructor_bio?: string
  rating?: number
  students?: number
}

interface Module {
  id: string
  certification_id: string
  title: string
  description: string | null
  order_num: number
  duration?: string
  lessons?: number
}

interface LearningOutcome {
  id: string
  certification_id: string
  outcome: string
  order_num: number
}

interface Prerequisite {
  id: string
  certification_id: string
  prerequisite: string
  order_num: number
}

interface Review {
  id: string
  certification_id: string
  student_name: string
  rating: number
  comment: string
  date: string
}

interface Application {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  program_name: string
  program_category: string
  status: string
  created_at: string
}

interface UserEnrollment {
  id: string
  user_id: string
  certification_id: string
  status: string
  progress: number
  enrolled_at: string
  due_date: string | null
  certificate_issued: boolean
  certificate_url: string | null
  certifications: {
    id: string
    title: string
    category: string
    level: string
    duration: string | null
  } | null
}

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  enrollments: UserEnrollment[]
}

interface Lesson {
  id: string
  module_id: string
  title: string
  content: string | null
  order_num: number
}

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [autoAddStatus, setAutoAddStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [setupMessage, setSetupMessage] = useState("")
  const [seedMessage, setSeedMessage] = useState("")
  const [autoAddMessage, setAutoAddMessage] = useState("")
  const [certificationCount, setCertificationCount] = useState(0)
  const [progress, setProgress] = useState(0)

  // Certifications management
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loadingCertifications, setLoadingCertifications] = useState(false)
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null)
  const [isAddingCertification, setIsAddingCertification] = useState(false)

  // Applications management
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)

  // Users management
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [isAssigningCourse, setIsAssigningCourse] = useState(false)
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<User | null>(null)
  const [assignCourseForm, setAssignCourseForm] = useState({
    certificationId: "",
    dueDate: new Date(),
  })

  // Course Content Management
  const [selectedCertForContent, setSelectedCertForContent] = useState<string>("")
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingContent, setLoadingContent] = useState(false)
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    order_num: 0,
    duration: "",
    lessons: 0,
  })
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<Module | null>(null)
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    order_num: 0,
  })

  // Learning Outcomes & Prerequisites
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>([])
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([])
  const [newOutcome, setNewOutcome] = useState("")
  const [newPrerequisite, setNewPrerequisite] = useState("")

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([])
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    student_name: "",
    rating: 5,
    comment: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Form state for certification
  const [certificationForm, setCertificationForm] = useState({
    title: "",
    description: "",
    long_description: "",
    category: "",
    level: "",
    price: 0,
    slug: "",
    duration: "",
    instructor: "",
    instructor_bio: "",
    rating: 0,
    students: 0,
  })

  const categories = [
    "cruise",
    "executive",
    "business",
    "it",
    "healthcare",
    "sales",
    "training",
    "frontline",
    "social",
    "admin",
  ]

  const levels = ["Entry-Level", "Intermediate", "Advanced", "Executive", "All Levels"]

  // Additional certifications to auto-add (updated with duration)
  const additionalCertifications = useMemo(
    () => [
      {
        title: "Luxury Resort Management Excellence",
        description:
          "Master the art of managing ultra-luxury resorts with focus on personalized service, exclusive amenities, and high-net-worth guest expectations.",
        category: "executive",
        level: "Executive",
        price: 220,
        slug: "luxury-resort-management-excellence",
        duration: "12 weeks",
      },
      {
        title: "Boutique Hotel Operations Specialist",
        description:
          "Specialized training for managing boutique hotels with emphasis on unique character, personalized service, and local cultural integration.",
        category: "executive",
        level: "Advanced",
        price: 185,
        slug: "boutique-hotel-operations-specialist",
        duration: "10 weeks",
      },
      {
        title: "Resort Activities & Recreation Management",
        description:
          "Comprehensive training in planning, organizing, and managing recreational activities and entertainment programs at resort destinations.",
        category: "frontline",
        level: "Intermediate",
        price: 135,
        slug: "resort-activities-recreation-management",
        duration: "8 weeks",
      },
    ],
    [],
  )

  const setupDatabase = async () => {
    setSetupStatus("loading")
    setSetupMessage("")
    setProgress(25)

    try {
      const response = await fetch("/api/setup-database")
      const data = await response.json()

      setProgress(100)

      if (data.success) {
        setSetupStatus("success")
        setSetupMessage(data.message)
      } else {
        setSetupStatus("error")
        setSetupMessage(data.error || "Failed to setup database")
      }
    } catch (error) {
      setSetupStatus("error")
      setSetupMessage("Network error occurred")
      console.error("Setup error:", error)
    }
  }

  const seedDatabase = async () => {
    setSeedStatus("loading")
    setSeedMessage("")
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/seed-certifications")
      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)

      if (data.success) {
        setSeedStatus("success")
        setSeedMessage(data.message)
        setCertificationCount(data.count || 0)
        fetchCertifications()
      } else {
        setSeedStatus("error")
        setSeedMessage(data.error || "Failed to seed database")
      }
    } catch (error) {
      setSeedStatus("error")
      setSeedMessage("Network error occurred")
      console.error("Seed error:", error)
    }
  }

  const autoAddCertifications = async () => {
    setAutoAddStatus("loading")
    setAutoAddMessage("")
    setProgress(0)

    try {
      let addedCount = 0
      const totalCerts = additionalCertifications.length

      for (let i = 0; i < additionalCertifications.length; i++) {
        const cert = additionalCertifications[i]

        const response = await fetch("/api/certifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cert),
        })

        if (response.ok) {
          addedCount++
        }

        setProgress(Math.round(((i + 1) / totalCerts) * 100))
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      if (addedCount > 0) {
        setAutoAddStatus("success")
        setAutoAddMessage(`Successfully added ${addedCount} additional certifications!`)
        fetchCertifications()
      } else {
        setAutoAddStatus("error")
        setAutoAddMessage("Failed to add certifications")
      }
    } catch (error) {
      setAutoAddStatus("error")
      setAutoAddMessage("Network error occurred while adding certifications")
      console.error("Auto-add error:", error)
    }
  }

  const fetchCertifications = async () => {
    setLoadingCertifications(true)
    try {
      const response = await fetch("/api/certifications")
      const data = await response.json()
      if (data.certifications) {
        setCertifications(data.certifications)
      }
    } catch (error) {
      console.error("Error fetching certifications:", error)
    } finally {
      setLoadingCertifications(false)
    }
  }

  const fetchApplications = async () => {
    setLoadingApplications(true)
    try {
      const response = await fetch("/api/applications")
      const data = await response.json()
      if (data.applications) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchModulesAndLessons = async (certId: string) => {
    setLoadingContent(true)
    try {
      // Fetch modules
      const modulesResponse = await fetch(`/api/modules?certification_id=${certId}`)
      const modulesData = await modulesResponse.json()
      setModules(modulesData.modules || [])

      // Fetch lessons
      const allLessons: Lesson[] = []
      for (const module of modulesData.modules || []) {
        const lessonsResponse = await fetch(`/api/lessons?module_id=${module.id}`)
        const lessonsData = await lessonsResponse.json()
        allLessons.push(...(lessonsData.lessons || []))
      }
      setLessons(allLessons)

      // Fetch outcomes
      const outcomesResponse = await fetch(`/api/learning-outcomes?certification_id=${certId}`)
      const outcomesData = await outcomesResponse.json()
      setLearningOutcomes(outcomesData.outcomes || [])

      // Fetch prerequisites
      const prerequisitesResponse = await fetch(`/api/prerequisites?certification_id=${certId}`)
      const prerequisitesData = await prerequisitesResponse.json()
      setPrerequisites(prerequisitesData.prerequisites || [])

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/reviews?certification_id=${certId}`)
      const reviewsData = await reviewsResponse.json()
      setReviews(reviewsData.reviews || [])
    } catch (error) {
      console.error("Error fetching course content:", error)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleSaveCertification = async () => {
    try {
      const method = editingCertification ? "PUT" : "POST"
      const body = editingCertification ? { ...certificationForm, id: editingCertification.id } : certificationForm

      const response = await fetch("/api/certifications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchCertifications()
        setEditingCertification(null)
        setIsAddingCertification(false)
        setCertificationForm({
          title: "",
          description: "",
          long_description: "",
          category: "",
          level: "",
          price: 0,
          slug: "",
          duration: "",
          instructor: "",
          instructor_bio: "",
          rating: 0,
          students: 0,
        })
      }
    } catch (error) {
      console.error("Error saving certification:", error)
    }
  }

  const handleDeleteCertification = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this certification? This will also delete associated modules and lessons.",
      )
    ) {
      try {
        const response = await fetch(`/api/certifications?id=${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchCertifications()
        }
      } catch (error) {
        console.error("Error deleting certification:", error)
      }
    }
  }

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      if (response.ok) {
        fetchApplications()
      } else {
        const errorData = await response.json()
        console.error("Failed to update application status:", errorData.error)
        alert(`Failed to update application status: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error updating application:", error)
      alert("An error occurred while updating application status.")
    }
  }

  const handleAssignCourse = async () => {
    if (!selectedUserForAssignment || !assignCourseForm.certificationId) return

    try {
      const response = await fetch("/api/user-enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForAssignment.id,
          certificationId: assignCourseForm.certificationId,
          dueDate: assignCourseForm.dueDate.toISOString(),
        }),
      })

      if (response.ok) {
        fetchUsers()
        setIsAssigningCourse(false)
        setAssignCourseForm({ certificationId: "", dueDate: new Date() })
      } else {
        const errorData = await response.json()
        alert(`Failed to assign course: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error assigning course:", error)
      alert("An error occurred while assigning the course.")
    }
  }

  const handleUpdateEnrollment = async (enrollmentId: string, updates: Partial<UserEnrollment>) => {
    try {
      const response = await fetch("/api/user-enrollments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enrollmentId, ...updates }),
      })

      if (response.ok) {
        fetchUsers()
      } else {
        const errorData = await response.json()
        alert(`Failed to update enrollment: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error updating enrollment:", error)
      alert("An error occurred while updating enrollment.")
    }
  }

  const handleSaveModule = async () => {
    if (!selectedCertForContent) return
    try {
      const method = editingModule ? "PUT" : "POST"
      const body = editingModule
        ? { ...moduleForm, id: editingModule.id }
        : { ...moduleForm, certification_id: selectedCertForContent }

      const response = await fetch("/api/modules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchModulesAndLessons(selectedCertForContent)
        setIsAddingModule(false)
        setEditingModule(null)
        setModuleForm({ title: "", description: "", order_num: 0, duration: "", lessons: 0 })
      } else {
        const errorData = await response.json()
        alert(`Failed to save module: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error saving module:", error)
      alert("An error occurred while saving the module.")
    }
  }

  const handleDeleteModule = async (id: string) => {
    if (confirm("Are you sure you want to delete this module? This will also delete all associated lessons.")) {
      try {
        const response = await fetch(`/api/modules?id=${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchModulesAndLessons(selectedCertForContent)
        } else {
          const errorData = await response.json()
          alert(`Failed to delete module: ${errorData.error || response.statusText}`)
        }
      } catch (error) {
        console.error("Error deleting module:", error)
        alert("An error occurred while deleting the module.")
      }
    }
  }

  const handleSaveLesson = async () => {
    if (!selectedModuleForLesson) return
    try {
      const method = editingLesson ? "PUT" : "POST"
      const body = editingLesson
        ? { ...lessonForm, id: editingLesson.id }
        : { ...lessonForm, module_id: selectedModuleForLesson.id }

      const response = await fetch("/api/lessons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchModulesAndLessons(selectedCertForContent)
        setIsAddingLesson(false)
        setEditingLesson(null)
        setLessonForm({ title: "", content: "", order_num: 0 })
      } else {
        const errorData = await response.json()
        alert(`Failed to save lesson: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error saving lesson:", error)
      alert("An error occurred while saving the lesson.")
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      try {
        const response = await fetch(`/api/lessons?id=${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchModulesAndLessons(selectedCertForContent)
        } else {
          const errorData = await response.json()
          alert(`Failed to delete lesson: ${errorData.error || response.statusText}`)
        }
      } catch (error) {
        console.error("Error deleting lesson:", error)
        alert("An error occurred while deleting the lesson.")
      }
    }
  }

  // Update the handleAddOutcome function to save to database
  const handleAddOutcome = async () => {
    if (newOutcome.trim() && selectedCertForContent) {
      try {
        const response = await fetch("/api/learning-outcomes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            certification_id: selectedCertForContent,
            outcome: newOutcome.trim(),
            order_num: learningOutcomes.length + 1,
          }),
        })

        if (response.ok) {
          await fetchModulesAndLessons(selectedCertForContent)
          setNewOutcome("")
        }
      } catch (error) {
        console.error("Error adding outcome:", error)
      }
    }
  }

  // Update the handleRemoveOutcome function
  const handleRemoveOutcome = async (id: string) => {
    try {
      const response = await fetch(`/api/learning-outcomes?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok && selectedCertForContent) {
        await fetchModulesAndLessons(selectedCertForContent)
      }
    } catch (error) {
      console.error("Error removing outcome:", error)
    }
  }

  // Update the handleAddPrerequisite function
  const handleAddPrerequisite = async () => {
    if (newPrerequisite.trim() && selectedCertForContent) {
      try {
        const response = await fetch("/api/prerequisites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            certification_id: selectedCertForContent,
            prerequisite: newPrerequisite.trim(),
            order_num: prerequisites.length + 1,
          }),
        })

        if (response.ok) {
          await fetchModulesAndLessons(selectedCertForContent)
          setNewPrerequisite("")
        }
      } catch (error) {
        console.error("Error adding prerequisite:", error)
      }
    }
  }

  // Update the handleRemovePrerequisite function
  const handleRemovePrerequisite = async (id: string) => {
    try {
      const response = await fetch(`/api/prerequisites?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok && selectedCertForContent) {
        await fetchModulesAndLessons(selectedCertForContent)
      }
    } catch (error) {
      console.error("Error removing prerequisite:", error)
    }
  }

  // Update the handleSaveReview function
  const handleSaveReview = async () => {
    if (!selectedCertForContent || !reviewForm.student_name.trim() || !reviewForm.comment.trim()) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certification_id: selectedCertForContent,
          student_name: reviewForm.student_name,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          review_date: reviewForm.date,
        }),
      })

      if (response.ok) {
        await fetchModulesAndLessons(selectedCertForContent)
        setIsAddingReview(false)
        setReviewForm({
          student_name: "",
          rating: 5,
          comment: "",
          date: new Date().toISOString().split("T")[0],
        })
      }
    } catch (error) {
      console.error("Error saving review:", error)
    }
  }

  // Update the handleDeleteReview function
  const handleDeleteReview = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok && selectedCertForContent) {
        await fetchModulesAndLessons(selectedCertForContent)
      }
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  const openEditCertificationDialog = (certification: Certification) => {
    setEditingCertification(certification)
    setCertificationForm({
      title: certification.title,
      description: certification.description,
      long_description: certification.long_description || "",
      category: certification.category,
      level: certification.level,
      price: certification.price,
      slug: certification.slug,
      duration: certification.duration || "",
      instructor: certification.instructor || "",
      instructor_bio: certification.instructor_bio || "",
      rating: certification.rating || 0,
      students: certification.students || 0,
    })
  }

  const openAddCertificationDialog = () => {
    setIsAddingCertification(true)
    setEditingCertification(null)
    setCertificationForm({
      title: "",
      description: "",
      long_description: "",
      category: "",
      level: "",
      price: 0,
      slug: "",
      duration: "",
      instructor: "",
      instructor_bio: "",
      rating: 0,
      students: 0,
    })
  }

  const openAssignCourseDialog = (user: User) => {
    setSelectedUserForAssignment(user)
    setIsAssigningCourse(true)
    setAssignCourseForm({ certificationId: "", dueDate: new Date() })
  }

  const openAddModuleDialog = () => {
    setIsAddingModule(true)
    setEditingModule(null)
    setModuleForm({ title: "", description: "", order_num: modules.length + 1, duration: "", lessons: 0 })
  }

  const openEditModuleDialog = (module: Module) => {
    setEditingModule(module)
    setIsAddingModule(true)
    setModuleForm({
      title: module.title,
      description: module.description || "",
      order_num: module.order_num,
      duration: module.duration || "",
      lessons: module.lessons || 0,
    })
  }

  const openAddLessonDialog = (module: Module) => {
    setSelectedModuleForLesson(module)
    setIsAddingLesson(true)
    setEditingLesson(null)
    setLessonForm({ title: "", content: "", order_num: lessons.filter((l) => l.module_id === module.id).length + 1 })
  }

  const openEditLessonDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setIsAddingLesson(true)
    setLessonForm({
      title: lesson.title,
      content: lesson.content || "",
      order_num: lesson.order_num,
    })
    const parentModule = modules.find((m) => m.id === lesson.module_id)
    if (parentModule) setSelectedModuleForLesson(parentModule)
  }

  useEffect(() => {
    fetchCertifications()
    fetchApplications()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedCertForContent) {
      fetchModulesAndLessons(selectedCertForContent)
    } else {
      setModules([])
      setLessons([])
      setLearningOutcomes([])
      setPrerequisites([])
      setReviews([])
    }
  }, [selectedCertForContent])

  const certificationCategories = [
    { name: "Cruise & Maritime", count: 25, icon: Ship, color: "bg-blue-500" },
    { name: "Executive & Management", count: 20, icon: Building, color: "bg-purple-500" },
    { name: "Business & Finance", count: 15, icon: TrendingUp, color: "bg-green-500" },
    { name: "Information Technology", count: 15, icon: Computer, color: "bg-orange-500" },
    { name: "Healthcare & Wellness", count: 10, icon: Heart, color: "bg-red-500" },
    { name: "Sales & Marketing", count: 10, icon: TrendingUp, color: "bg-indigo-500" },
    { name: "Training & Instruction", count: 8, icon: BookOpen, color: "bg-yellow-500" },
    { name: "Frontline & Service", count: 12, icon: BookOpen, color: "bg-pink-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your database, certifications, and applications for the hospitality institute
          </p>
        </div>

        <Tabs defaultValue="setup" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="course-content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Course Content
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Database Setup Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Database className="h-7 w-7" />
                    Step 1: Database Setup
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Ensure storage bucket is ready for document uploads.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={setupDatabase}
                    disabled={setupStatus === "loading"}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    size="lg"
                  >
                    {setupStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Setting up...
                      </>
                    ) : setupStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Setup Complete
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-5 w-5" />
                        Setup Storage
                      </>
                    )}
                  </Button>

                  {setupStatus === "loading" && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">Setting up storage...</p>
                    </div>
                  )}

                  {setupMessage && (
                    <Alert
                      className={
                        setupStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }
                    >
                      {setupStatus === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={setupStatus === "success" ? "text-green-800" : "text-red-800"}>
                        {setupMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Seed Data Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BookOpen className="h-7 w-7" />
                    Step 2: Seed Certifications
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Add 130+ professional certifications to your database.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={seedDatabase}
                    disabled={seedStatus === "loading"}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    size="lg"
                  >
                    {seedStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding certifications...
                      </>
                    ) : seedStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        {certificationCount} Added
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Seed Certifications
                      </>
                    )}
                  </Button>

                  {seedStatus === "loading" && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">Adding programs...</p>
                    </div>
                  )}

                  {seedMessage && (
                    <Alert
                      className={seedStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                    >
                      {seedStatus === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={seedStatus === "success" ? "text-green-800" : "text-red-800"}>
                        {seedMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Auto-Add Additional Certifications Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Zap className="h-7 w-7" />
                    Step 3: Add More Certifications
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Automatically add {additionalCertifications.length} additional specialized certifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={autoAddCertifications}
                    disabled={autoAddStatus === "loading"}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                    size="lg"
                  >
                    {autoAddStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : autoAddStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Added
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Auto-Add
                      </>
                    )}
                  </Button>

                  {autoAddStatus === "loading" && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}

                  {autoAddMessage && (
                    <Alert
                      className={
                        autoAddStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }
                    >
                      {autoAddStatus === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={autoAddStatus === "success" ? "text-green-800" : "text-red-800"}>
                        {autoAddMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Categories Preview */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Certification Categories</CardTitle>
                <CardDescription className="text-indigo-100">
                  Professional development programs across multiple industries
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {certificationCategories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">{category.name}</h4>
                        <p className="text-xs text-gray-600">{category.count}+ programs</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Manage Certifications</h2>
              <div className="flex gap-2">
                <Button onClick={fetchCertifications} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={openAddCertificationDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {loadingCertifications ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certifications.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No certifications found. Start by seeding the database.</p>
                      </div>
                    ) : (
                      certifications.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-4 flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{cert.title}</h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{cert.description}</p>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="secondary">{cert.category}</Badge>
                              <Badge variant="outline">{cert.level}</Badge>
                              <Badge variant="outline">${cert.price}</Badge>
                              {cert.duration && <Badge variant="outline">{cert.duration}</Badge>}
                              {cert.instructor && (
                                <Badge className="bg-purple-100 text-purple-800">{cert.instructor}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditCertificationDialog(cert)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteCertification(cert.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Content Tab */}
          <TabsContent value="course-content" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Manage Course Content</h2>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Select Certification</CardTitle>
                <CardDescription>Choose a certification to manage its modules, outcomes, and reviews.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select value={selectedCertForContent} onValueChange={setSelectedCertForContent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {certifications.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id}>
                        {cert.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCertForContent && (
                  <Tabs defaultValue="modules" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="modules">Modules</TabsTrigger>
                      <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                      <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    {/* Modules Tab */}
                    <TabsContent value="modules" className="space-y-4 mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Modules</h3>
                        <Button onClick={openAddModuleDialog} size="sm">
                          <Plus className="h-4 w-4 mr-2" /> Add Module
                        </Button>
                      </div>
                      {loadingContent ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : modules.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No modules for this certification.</div>
                      ) : (
                        <div className="space-y-3">
                          {modules.map((module) => (
                            <Card key={module.id} className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">
                                  {module.order_num}. {module.title}
                                </h4>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditModuleDialog(module)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDeleteModule(module.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                              <div className="flex gap-4 text-sm text-gray-500">
                                {module.duration && <span>Duration: {module.duration}</span>}
                                {module.lessons && <span>Lessons: {module.lessons}</span>}
                              </div>

                              <div className="flex justify-between items-center mt-4">
                                <h5 className="text-md font-semibold">Lessons</h5>
                                <Button variant="secondary" size="sm" onClick={() => openAddLessonDialog(module)}>
                                  <Plus className="h-4 w-4 mr-2" /> Add Lesson
                                </Button>
                              </div>
                              {lessons.filter((l) => l.module_id === module.id).length === 0 ? (
                                <p className="text-sm text-gray-500 mt-2">No lessons in this module.</p>
                              ) : (
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                  {lessons
                                    .filter((l) => l.module_id === module.id)
                                    .sort((a, b) => a.order_num - b.order_num)
                                    .map((lesson) => (
                                      <li
                                        key={lesson.id}
                                        className="flex justify-between items-center text-sm text-gray-700"
                                      >
                                        <span>
                                          {lesson.order_num}. {lesson.title}
                                        </span>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditLessonDialog(lesson)}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Learning Outcomes Tab */}
                    <TabsContent value="outcomes" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-outcome">Add Learning Outcome</Label>
                        <div className="flex gap-2">
                          <Input
                            id="new-outcome"
                            placeholder="Enter learning outcome..."
                            value={newOutcome}
                            onChange={(e) => setNewOutcome(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAddOutcome()}
                          />
                          <Button onClick={handleAddOutcome} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {learningOutcomes.map((outcome) => (
                          <div
                            key={outcome.id}
                            className="flex items-start justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{outcome.outcome}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOutcome(outcome.id)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {learningOutcomes.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No learning outcomes added yet.</p>
                        )}
                      </div>
                    </TabsContent>

                    {/* Prerequisites Tab */}
                    <TabsContent value="prerequisites" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-prerequisite">Add Prerequisite</Label>
                        <div className="flex gap-2">
                          <Input
                            id="new-prerequisite"
                            placeholder="Enter prerequisite..."
                            value={newPrerequisite}
                            onChange={(e) => setNewPrerequisite(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAddPrerequisite()}
                          />
                          <Button onClick={handleAddPrerequisite} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {prerequisites.map((prereq) => (
                          <div
                            key={prereq.id}
                            className="flex items-start justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <span className="text-sm">• {prereq.prerequisite}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePrerequisite(prereq.id)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {prerequisites.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No prerequisites added yet.</p>
                        )}
                      </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-4 mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Student Reviews</h3>
                        <Button onClick={() => setIsAddingReview(true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" /> Add Review
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {reviews.map((review) => (
                          <Card key={review.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">{review.student_name}</p>
                                <p className="text-sm text-gray-500">{review.date}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{review.comment}</p>
                          </Card>
                        ))}
                        {reviews.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-8">No reviews added yet.</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Application Management</h2>
              <Button onClick={fetchApplications} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {loadingApplications ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No applications received yet.</p>
                      </div>
                    ) : (
                      applications.map((app) => (
                        <div key={app.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {app.first_name} {app.last_name}
                              </h3>
                              <p className="text-gray-600">{app.email}</p>
                              <p className="text-sm text-gray-500">{app.program_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  app.status === "approved"
                                    ? "default"
                                    : app.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {app.status}
                              </Badge>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Application Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Name</Label>
                                        <p>
                                          {app.first_name} {app.last_name}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p>{app.email}</p>
                                      </div>
                                      <div>
                                        <Label>Phone</Label>
                                        <p>{app.phone}</p>
                                      </div>
                                      <div>
                                        <Label>Program</Label>
                                        <p>{app.program_name}</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <p>{app.status}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter className="gap-2">
                                    <Button
                                      onClick={() => handleUpdateApplicationStatus(app.id, "approved")}
                                      className="bg-green-600 hover:bg-green-700"
                                      disabled={app.status === "approved"}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleUpdateApplicationStatus(app.id, "rejected")}
                                      variant="destructive"
                                      disabled={app.status === "rejected"}
                                    >
                                      Reject
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Registered Users</h2>
              <Button onClick={fetchUsers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No registered users found.</p>
                      </div>
                    ) : (
                      users.map((user) => (
                        <div key={user.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{user.email}</h3>
                              <p className="text-gray-600 text-sm">
                                Registered: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                              {user.last_sign_in_at && (
                                <p className="text-gray-500 text-xs">
                                  Last Sign In: {new Date(user.last_sign_in_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openAssignCourseDialog(user)}>
                                  <Plus className="h-4 w-4 mr-2" /> Assign Course
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Assign Course to {selectedUserForAssignment?.email}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="assign-certification">Certification</Label>
                                    <Select
                                      value={assignCourseForm.certificationId}
                                      onValueChange={(value) =>
                                        setAssignCourseForm({ ...assignCourseForm, certificationId: value })
                                      }
                                    >
                                      <SelectTrigger id="assign-certification">
                                        <SelectValue placeholder="Select a certification" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {certifications.map((cert) => (
                                          <SelectItem key={cert.id} value={cert.id}>
                                            {cert.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="due-date">Due Date</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !assignCourseForm.dueDate && "text-muted-foreground",
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {assignCourseForm.dueDate ? (
                                            format(assignCourseForm.dueDate, "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={assignCourseForm.dueDate}
                                          onSelect={(date) =>
                                            date && setAssignCourseForm({ ...assignCourseForm, dueDate: date })
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button onClick={handleAssignCourse} disabled={!assignCourseForm.certificationId}>
                                    Assign Course
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          {user.enrollments.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-md mb-2">Enrolled Courses:</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Certificate</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {user.enrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                      <TableCell>{enrollment.certifications?.title || "N/A"}</TableCell>
                                      <TableCell>{enrollment.status}</TableCell>
                                      <TableCell>{enrollment.progress}%</TableCell>
                                      <TableCell>
                                        {enrollment.due_date ? format(new Date(enrollment.due_date), "PPP") : "N/A"}
                                      </TableCell>
                                      <TableCell>
                                        {enrollment.certificate_issued ? (
                                          <Badge className="bg-green-500">Issued</Badge>
                                        ) : (
                                          <Badge variant="outline">Pending</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="flex gap-2">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md">
                                            <DialogHeader>
                                              <DialogTitle>Edit Enrollment</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div>
                                                <Label htmlFor="edit-status">Status</Label>
                                                <Select
                                                  value={enrollment.status}
                                                  onValueChange={(value) =>
                                                    handleUpdateEnrollment(enrollment.id, { status: value })
                                                  }
                                                >
                                                  <SelectTrigger id="edit-status">
                                                    <SelectValue placeholder="Select status" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="not_started">Not Started</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div>
                                                <Label htmlFor="edit-progress">Progress</Label>
                                                <Input
                                                  id="edit-progress"
                                                  type="number"
                                                  value={enrollment.progress}
                                                  onChange={(e) =>
                                                    handleUpdateEnrollment(enrollment.id, {
                                                      progress: Number(e.target.value),
                                                    })
                                                  }
                                                />
                                              </div>
                                              <div>
                                                <Label htmlFor="edit-due-date">Due Date</Label>
                                                <Popover>
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant={"outline"}
                                                      className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !enrollment.due_date && "text-muted-foreground",
                                                      )}
                                                    >
                                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                                      {enrollment.due_date ? (
                                                        format(new Date(enrollment.due_date), "PPP")
                                                      ) : (
                                                        <span>Pick a date</span>
                                                      )}
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                      mode="single"
                                                      selected={
                                                        enrollment.due_date ? new Date(enrollment.due_date) : undefined
                                                      }
                                                      onSelect={(date) =>
                                                        date &&
                                                        handleUpdateEnrollment(enrollment.id, {
                                                          due_date: date.toISOString(),
                                                        })
                                                      }
                                                      initialFocus
                                                    />
                                                  </PopoverContent>
                                                </Popover>
                                              </div>
                                              {enrollment.status === "completed" && (
                                                <div>
                                                  <Label htmlFor="issue-certificate">Issue Certificate</Label>
                                                  <Button
                                                    onClick={() =>
                                                      handleUpdateEnrollment(enrollment.id, {
                                                        certificate_issued: !enrollment.certificate_issued,
                                                      })
                                                    }
                                                    className="w-full"
                                                    variant={enrollment.certificate_issued ? "secondary" : "default"}
                                                  >
                                                    {enrollment.certificate_issued
                                                      ? "Revoke Certificate"
                                                      : "Issue Certificate"}
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Certification Form Dialog */}
        <Dialog
          open={isAddingCertification || editingCertification !== null}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingCertification(false)
              setEditingCertification(null)
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCertification ? "Edit Certification" : "Add New Certification"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={certificationForm.title}
                  onChange={(e) => setCertificationForm({ ...certificationForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={certificationForm.description}
                  onChange={(e) => setCertificationForm({ ...certificationForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="long_description">Long Description</Label>
                <Textarea
                  id="long_description"
                  value={certificationForm.long_description}
                  onChange={(e) => setCertificationForm({ ...certificationForm, long_description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={certificationForm.category}
                    onValueChange={(value) => setCertificationForm({ ...certificationForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={certificationForm.level}
                    onValueChange={(value) => setCertificationForm({ ...certificationForm, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={certificationForm.price}
                    onChange={(e) => setCertificationForm({ ...certificationForm, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={certificationForm.slug}
                    onChange={(e) => setCertificationForm({ ...certificationForm, slug: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration (e.g., "8 weeks", "120 hours")</Label>
                <Input
                  id="duration"
                  value={certificationForm.duration}
                  onChange={(e) => setCertificationForm({ ...certificationForm, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor Name</Label>
                <Input
                  id="instructor"
                  value={certificationForm.instructor}
                  onChange={(e) => setCertificationForm({ ...certificationForm, instructor: e.target.value })}
                  placeholder="Dr. Sarah Johnson"
                />
              </div>
              <div>
                <Label htmlFor="instructor_bio">Instructor Bio</Label>
                <Textarea
                  id="instructor_bio"
                  value={certificationForm.instructor_bio}
                  onChange={(e) => setCertificationForm({ ...certificationForm, instructor_bio: e.target.value })}
                  rows={3}
                  placeholder="Brief biography of the instructor..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={certificationForm.rating}
                    onChange={(e) => setCertificationForm({ ...certificationForm, rating: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="students">Number of Students</Label>
                  <Input
                    id="students"
                    type="number"
                    value={certificationForm.students}
                    onChange={(e) => setCertificationForm({ ...certificationForm, students: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveCertification}>
                {editingCertification ? "Update" : "Create"} Certification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Module Form Dialog */}
        <Dialog
          open={isAddingModule}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingModule(false)
              setEditingModule(null)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Add New Module"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="module-title">Title</Label>
                <Input
                  id="module-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="module-order">Order</Label>
                  <Input
                    id="module-order"
                    type="number"
                    value={moduleForm.order_num}
                    onChange={(e) => setModuleForm({ ...moduleForm, order_num: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="module-duration">Duration</Label>
                  <Input
                    id="module-duration"
                    value={moduleForm.duration}
                    onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                    placeholder="1 week"
                  />
                </div>
                <div>
                  <Label htmlFor="module-lessons">Lessons</Label>
                  <Input
                    id="module-lessons"
                    type="number"
                    value={moduleForm.lessons}
                    onChange={(e) => setModuleForm({ ...moduleForm, lessons: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveModule}>{editingModule ? "Update" : "Create"} Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lesson Form Dialog */}
        <Dialog
          open={isAddingLesson}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingLesson(false)
              setEditingLesson(null)
              setSelectedModuleForLesson(null)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lesson-title">Title</Label>
                <Input
                  id="lesson-title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lesson-content">Content</Label>
                <Textarea
                  id="lesson-content"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="lesson-order">Order Number</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  value={lessonForm.order_num}
                  onChange={(e) => setLessonForm({ ...lessonForm, order_num: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveLesson}>{editingLesson ? "Update" : "Create"} Lesson</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Review Dialog */}
        <Dialog open={isAddingReview} onOpenChange={setIsAddingReview}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Student Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="review-student-name">Student Name</Label>
                <Input
                  id="review-student-name"
                  value={reviewForm.student_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, student_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="review-rating">Rating</Label>
                <Select
                  value={reviewForm.rating.toString()}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, rating: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="review-comment">Comment</Label>
                <Textarea
                  id="review-comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4}
                  placeholder="Write a review..."
                />
              </div>
              <div>
                <Label htmlFor="review-date">Date</Label>
                <Input
                  id="review-date"
                  type="date"
                  value={reviewForm.date}
                  onChange={(e) => setReviewForm({ ...reviewForm, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveReview}>Add Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
