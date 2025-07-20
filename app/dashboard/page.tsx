"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState, useCallback } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Search,
  Plus,
  FileText,
  CalendarIcon,
  Edit,
  Trash2,
  Loader2,
  Circle,
} from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter, useSearchParams } from "next/navigation"

interface Application {
  id: string
  program_name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  certification_id?: string
}

interface Enrollment {
  id: string
  certification_id: string
  status: "not_started" | "in_progress" | "completed"
  progress: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  due_date: string | null
  certificate_issued: boolean
  certificate_url: string | null
  certifications: {
    title: string
    category: string
    level: string
    description: string
    duration_days: number | null
  }
}

interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  activeCourses: number
  completedCourses: number
  totalProgress: number
}

interface UserProfile {
  id: number
  user_id: string
  full_name: string | null
  email: string | null
  is_admin: boolean | null
}

interface Certification {
  id: string
  name: string
  description: string
  duration_days: number | null
  price: number
}

interface Module {
  id: string
  name: string
  description: string | null
  order_index: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  content: string | null
  order_index: number
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalProgress: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourseForLearning, setSelectedCourseForLearning] = useState<Enrollment | null>(null)
  const [selectedCourseModules, setSelectedCourseModules] = useState<Module[]>([])
  const [isUpdatingModule, setIsUpdatingModule] = useState(false)

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [allCertifications, setAllCertifications] = useState<Certification[]>([])
  const [isAssignCourseModalOpen, setIsAssignCourseModalOpen] = useState(false)
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<string>("")
  const [selectedCertForAssignment, setSelectedCertForAssignment] = useState<string>("")
  const [assignmentDueDate, setAssignmentDueDate] = useState<Date | undefined>(undefined)
  const [isAssigningCourse, setIsAssigningCourse] = useState(false)

  // Admin Certifications/Modules/Lessons states
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [currentCert, setCurrentCert] = useState<Certification | null>(null)
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [selectedCertForModules, setSelectedCertForModules] = useState<string>("")
  const [modulesForSelectedCert, setModulesForSelectedCert] = useState<Module[]>([])
  const [isSavingContent, setIsSavingContent] = useState(false)

  const supabase = createSupabaseClient()

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)

      // Fetch user profile to check admin status
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("user_id", currentUser.id)
        .single()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        setIsAdmin(false)
      } else {
        setIsAdmin(profile?.is_admin || false)
      }

      // Fetch user's applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("applications")
        .select("*")
        .eq("email", currentUser.email)
        .order("created_at", { ascending: false })

      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError)
      }
      setApplications(applicationsData || [])

      // Fetch user's course enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("user_enrollments")
        .select(`
          id,
          certification_id,
          progress,
          status,
          created_at,
          started_at,
          completed_at,
          due_date,
          certificate_issued,
          certificate_url,
          certifications:certification_id (
            id,
            name,
            description,
            duration_days,
            price
          )
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })

      if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError)
      }
      setEnrollments(enrollmentsData || [])

      // Calculate stats
      const totalApplications = (applicationsData || []).length
      const pendingApplications = (applicationsData || []).filter((app) => app.status === "pending").length
      const approvedApplications = (applicationsData || []).filter((app) => app.status === "approved").length
      const rejectedApplications = (applicationsData || []).filter((app) => app.status === "rejected").length

      const activeCourses = (enrollmentsData || []).filter((enrollment) => enrollment.status === "in_progress").length
      const completedCourses = (enrollmentsData || []).filter((enrollment) => enrollment.status === "completed").length
      const totalProgress =
        (enrollmentsData || []).length > 0
          ? Math.round(
              (enrollmentsData || []).reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) /
                (enrollmentsData || []).length,
            )
          : 0

      setStats({
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        activeCourses,
        completedCourses,
        totalProgress,
      })

      // Fetch data for admin sections if user is admin
      if (profile?.is_admin) {
        const { data: usersData, error: usersError } = await supabase
          .from("user_profiles")
          .select("id, user_id, full_name, email, is_admin")
          .order("full_name")

        if (usersError) console.error("Error fetching users:", usersError)
        setAllUsers(usersData || [])

        const { data: certsData, error: certsError } = await supabase
          .from("certifications")
          .select("id, name, description, duration_days, price")
          .order("name")

        if (certsError) console.error("Error fetching certifications:", certsError)
        setAllCertifications(certsData || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
      case "active":
      case "in_progress":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "completed":
        return <Award className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      in_progress: "default",
      completed: "secondary",
      not_started: "outline",
    }

    const colors: Record<string, string> = {
      pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
      approved: "text-green-700 bg-green-50 border-green-200",
      rejected: "text-red-700 bg-red-50 border-red-200",
      in_progress: "text-blue-700 bg-blue-50 border-blue-200",
      completed: "text-purple-700 bg-purple-50 border-purple-200",
      not_started: "text-gray-700 bg-gray-50 border-gray-200",
    }

    return (
      <Badge variant={variants[status] || "outline"} className={`text-xs ${colors[status] || ""}`}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    )
  }

  const handleViewCourseDetails = async (enrollment: Enrollment) => {
    setSelectedCourseForLearning(enrollment)
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select(`
          id,
          name,
          description,
          order_index,
          lessons (
            id,
            title,
            content,
            order_index
          )
        `)
        .eq("certification_id", enrollment.certification_id)
        .order("order_index")
        .order("order_index", { foreignTable: "lessons", ascending: true })

      if (modulesError) throw modulesError

      // Fetch user's completion status for each module
      const { data: userModulesData, error: userModulesError } = await supabase
        .from("user_modules")
        .select("module_id, completed")
        .eq("user_id", user.id)
        .eq("user_enrollment_id", enrollment.id) // Link to user_enrollments.id

      if (userModulesError) throw userModulesError

      const userModuleCompletionMap = new Map(userModulesData?.map((um) => [um.module_id, um.completed]) || [])

      const formattedModules = modulesData.map((module) => ({
        id: module.id,
        name: module.name,
        description: module.description,
        order_index: module.order_index,
        completed: userModuleCompletionMap.get(module.id) || false,
        lessons: module.lessons || [],
      }))
      setSelectedCourseModules(formattedModules)
    } catch (error) {
      console.error("Error fetching course modules:", error)
      toast({
        title: "Error",
        description: "Failed to load course modules.",
        variant: "destructive",
      })
    }
  }

  const toggleModuleCompletion = async (moduleId: string, currentStatus: boolean) => {
    setIsUpdatingModule(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !selectedCourseForLearning) {
        router.push("/login")
        return
      }

      // Check if user_module record exists
      const { data: existingUserModule } = await supabase
        .from("user_modules")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("user_enrollment_id", selectedCourseForLearning.id)
        .eq("module_id", moduleId)
        .single()

      if (existingUserModule) {
        // Update existing record
        await supabase
          .from("user_modules")
          .update({
            completed: !currentStatus,
          })
          .eq("id", existingUserModule.id)
      } else {
        // Insert new record (should ideally not happen if modules are pre-created on enrollment)
        await supabase.from("user_modules").insert({
          user_id: session.user.id,
          user_enrollment_id: selectedCourseForLearning.id,
          module_id: moduleId,
          completed: true,
        })
      }

      // Update local state for modules
      const updatedModules = selectedCourseModules.map((module) =>
        module.id === moduleId ? { ...module, completed: !currentStatus } : module,
      )
      setSelectedCourseModules(updatedModules)

      // Calculate new progress for the enrollment
      const completedModulesCount = updatedModules.filter((module) => module.completed).length
      const newProgress = Math.round((completedModulesCount / updatedModules.length) * 100)

      // Update course progress in user_enrollments
      await supabase
        .from("user_enrollments")
        .update({
          progress: newProgress,
          status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
        })
        .eq("id", selectedCourseForLearning.id)

      // Update local state for enrollments
      setEnrollments((prev) =>
        prev.map((enrollment) =>
          enrollment.id === selectedCourseForLearning.id
            ? {
                ...enrollment,
                progress: newProgress,
                status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
              }
            : enrollment,
        ),
      )
      setSelectedCourseForLearning((prev) =>
        prev
          ? {
              ...prev,
              progress: newProgress,
              status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started",
            }
          : null,
      )

      toast({
        title: currentStatus ? "Module marked as incomplete" : "Module completed",
        description: currentStatus ? "Your progress has been updated" : "Great job! Keep going!",
      })
    } catch (error) {
      console.error("Error updating module status:", error)
      toast({
        title: "Error",
        description: "Failed to update module status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingModule(false)
    }
  }

  // Admin Functions
  const handleAssignCourse = async () => {
    setIsAssigningCourse(true)
    try {
      if (!selectedUserForAssignment || !selectedCertForAssignment) {
        toast({
          title: "Error",
          description: "Please select a user and a certification.",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase.from("user_enrollments").insert({
        user_id: selectedUserForAssignment,
        certification_id: selectedCertForAssignment,
        status: "not_started",
        progress: 0,
        due_date: assignmentDueDate ? assignmentDueDate.toISOString() : null,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Automatically create user_modules entries for the new enrollment
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("id")
        .eq("certification_id", selectedCertForAssignment)

      if (modulesError) console.error("Error fetching modules for new enrollment:", modulesError)

      if (modules && modules.length > 0) {
        const userModulesToInsert = modules.map((module) => ({
          user_id: selectedUserForAssignment,
          user_enrollment_id: data[0].id, // Link to the newly created enrollment
          module_id: module.id,
          completed: false,
        }))
        const { error: userModulesInsertError } = await supabase.from("user_modules").insert(userModulesToInsert)
        if (userModulesInsertError) console.error("Error inserting user modules:", userModulesInsertError)
      }

      toast({
        title: "Course Assigned",
        description: "The course has been successfully assigned to the user.",
      })
      setIsAssignCourseModalOpen(false)
      setSelectedUserForAssignment("")
      setSelectedCertForAssignment("")
      setAssignmentDueDate(undefined)
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error("Error assigning course:", error)
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the course.",
        variant: "destructive",
      })
    } finally {
      setIsAssigningCourse(false)
    }
  }

  const handleEditCertification = (cert: Certification | null) => {
    setCurrentCert(cert)
    setIsCertModalOpen(true)
  }

  const handleSaveCertification = async () => {
    if (!currentCert) return

    setIsSavingContent(true)
    try {
      const { error } = await supabase.from("certifications").upsert(currentCert).select()

      if (error) throw error

      toast({ title: "Certification Saved", description: "Certification details updated successfully." })
      setIsCertModalOpen(false)
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error("Error saving certification:", error)
      toast({ title: "Error", description: "Failed to save certification.", variant: "destructive" })
    } finally {
      setIsSavingContent(false)
    }
  }

  const handleDeleteCertification = async (certId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this certification? This will also delete associated modules and lessons.",
      )
    )
      return

    try {
      // Delete associated modules and lessons first (due to foreign key constraints)
      const { error: modulesError } = await supabase.from("modules").delete().eq("certification_id", certId)

      if (modulesError) throw modulesError

      const { error } = await supabase.from("certifications").delete().eq("id", certId)

      if (error) throw error

      toast({ title: "Certification Deleted", description: "Certification and its content have been removed." })
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error("Error deleting certification:", error)
      toast({ title: "Error", description: "Failed to delete certification.", variant: "destructive" })
    }
  }

  const handleEditModule = async (module: Module | null, certId: string) => {
    setCurrentModule(module)
    setSelectedCertForModules(certId)
    setIsModuleModalOpen(true)
  }

  const handleSaveModule = async () => {
    if (!currentModule || !selectedCertForModules) return

    setIsSavingContent(true)
    try {
      const moduleToSave = { ...currentModule, certification_id: selectedCertForModules }
      const { error } = await supabase.from("modules").upsert(moduleToSave).select()

      if (error) throw error

      toast({ title: "Module Saved", description: "Module details updated successfully." })
      setIsModuleModalOpen(false)
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after save:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error saving module:", error)
      toast({ title: "Error", description: "Failed to save module.", variant: "destructive" })
    } finally {
      setIsSavingContent(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? This will also delete associated lessons.")) return

    try {
      const { error } = await supabase.from("modules").delete().eq("id", moduleId)

      if (error) throw error

      toast({ title: "Module Deleted", description: "Module and its lessons have been removed." })
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after delete:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error deleting module:", error)
      toast({ title: "Error", description: "Failed to delete module.", variant: "destructive" })
    }
  }

  const handleEditLesson = (lesson: Lesson | null, moduleId: string) => {
    setCurrentLesson(lesson)
    setCurrentModule((prev) => (prev ? { ...prev, id: moduleId } : null)) // Temporarily set module ID for context
    setIsLessonModalOpen(true)
  }

  const handleSaveLesson = async () => {
    if (!currentLesson || !currentModule?.id) return

    setIsSavingContent(true)
    try {
      const lessonToSave = { ...currentLesson, module_id: currentModule.id }
      const { error } = await supabase.from("lessons").upsert(lessonToSave).select()

      if (error) throw error

      toast({ title: "Lesson Saved", description: "Lesson details updated successfully." })
      setIsLessonModalOpen(false)
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after save:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error saving lesson:", error)
      toast({ title: "Error", description: "Failed to save lesson.", variant: "destructive" })
    } finally {
      setIsSavingContent(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

      if (error) throw error

      toast({ title: "Lesson Deleted", description: "Lesson has been removed." })
      // Refresh modules for the selected cert if it's currently being viewed
      if (selectedCertForModules) {
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select(`
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              content,
              order_index
            )
          `)
          .eq("certification_id", selectedCertForModules)
          .order("order_index")
          .order("order_index", { foreignTable: "lessons", ascending: true })

        if (modulesError) console.error("Error fetching modules after delete:", modulesError)
        setModulesForSelectedCert(modulesData || [])
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast({ title: "Error", description: "Failed to delete lesson.", variant: "destructive" })
    }
  }

  const handleIssueCertificate = async (enrollmentId: string, userId: string, certId: string) => {
    if (!confirm("Are you sure you want to issue a certificate for this enrollment?")) return

    try {
      // In a real application, you'd generate a unique certificate URL here
      // For now, we'll use a placeholder.
      const certificateUrl = `/certificates/${enrollmentId}.pdf` // Example URL

      const { error } = await supabase
        .from("user_enrollments")
        .update({
          certificate_issued: true,
          certificate_url: certificateUrl,
        })
        .eq("id", enrollmentId)
        .eq("user_id", userId)
        .eq("certification_id", certId)

      if (error) throw error

      toast({ title: "Certificate Issued", description: "Certificate marked as issued and URL updated." })
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error("Error issuing certificate:", error)
      toast({ title: "Error", description: "Failed to issue certificate.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-12 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student"}!
        </h1>
        <p className="text-muted-foreground">Here's an overview of your learning journey with APMIH.</p>
      </div>

      {/* Tabs for Dashboard Sections */}
      <Tabs value={activeTab} onValueChange={(value) => router.push(`/dashboard?tab=${value}`)}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin-users">Admin: Users</TabsTrigger>}
          {isAdmin && <TabsTrigger value="admin-certs">Admin: Certifications</TabsTrigger>}
          {isAdmin && <TabsTrigger value="admin-modules">Admin: Modules & Lessons</TabsTrigger>}
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingApplications} pending approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCourses}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedCourses}</div>
                <p className="text-xs text-muted-foreground">Certifications earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProgress}%</div>
                <p className="text-xs text-muted-foreground">Across all courses</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Button asChild className="w-full">
                <Link href="/certifications">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Certifications
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/apply">
                  <Users className="mr-2 h-4 w-4" />
                  Submit Application
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push("/dashboard?tab=my-courses")}
              >
                <Award className="mr-2 h-4 w-4" />
                My Courses
              </Button>
            </CardContent>
          </Card>

          {/* Applications Status */}
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track the status of your certification applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(application.status)}
                        <div>
                          <p className="text-sm font-medium">{application.program_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(application.status)}
                        {application.status === "approved" && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/dashboard?tab=my-courses">Start Course</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by browsing our certifications and submitting an application.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/certifications">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Browse Certifications
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>1. Apply:</strong> Submit an application for your desired certification
                </p>
                <p>
                  <strong>2. Review:</strong> Our admin team will review your application
                </p>
                <p>
                  <strong>3. Approval:</strong> Once approved, you can access the course materials
                </p>
                <p>
                  <strong>4. Learn:</strong> Complete the course at your own pace
                </p>
                <p>
                  <strong>5. Certify:</strong> Earn your professional certification upon completion
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Courses Tab Content */}
        <TabsContent value="my-courses" className="mt-6 space-y-6">
          <h2 className="text-2xl font-bold">My Enrolled Courses</h2>
          <div className="mb-6 flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-8"
                // value={searchQuery} // Add state for search if needed
                // onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="ml-4" onClick={() => router.push("/certifications")}>
              <Plus className="mr-2 h-4 w-4" />
              Enroll in New Course
            </Button>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleViewCourseDetails(enrollment)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{enrollment.certifications.name}</CardTitle>
                        <CardDescription>
                          {enrollment.certifications.category} • {enrollment.certifications.level}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{enrollment.certifications.description}</p>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress || 0} className="h-2" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span>Modules: {selectedCourseModules.length}</span> {/* Placeholder, ideally fetched */}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {enrollment.certifications.duration_days
                            ? `${enrollment.certifications.duration_days} days`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    {getStatusBadge(enrollment.status)}
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Continue
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Courses Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
              </p>
              <Button className="mt-4" onClick={() => router.push("/certifications")}>
                Browse Certifications
              </Button>
            </div>
          )}

          {/* Selected Course Details (Modules & Lessons) */}
          {selectedCourseForLearning && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedCourseForLearning.certifications.name} Modules</span>
                  <Button variant="ghost" onClick={() => setSelectedCourseForLearning(null)}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Progress: {selectedCourseForLearning.progress}% -{" "}
                  {selectedCourseForLearning.status.replace(/_/g, " ")}
                  <Progress value={selectedCourseForLearning.progress || 0} className="h-2 mt-2" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCourseModules.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {selectedCourseModules.map((module) => (
                      <Card key={module.id} className={module.completed ? "border-green-200 bg-green-50" : ""}>
                        <AccordionItem value={module.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <AccordionTrigger className="flex-1 text-left">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {module.order_index}. {module.name}
                                  {module.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                                </CardTitle>
                              </AccordionTrigger>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isUpdatingModule}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleModuleCompletion(module.id, module.completed)
                                }}
                                className={module.completed ? "text-green-600" : "text-gray-400"}
                              >
                                {module.completed ? (
                                  <CheckCircle className="h-6 w-6" />
                                ) : (
                                  <Circle className="h-6 w-6" />
                                )}
                              </Button>
                            </div>
                            <CardDescription>{module.description}</CardDescription>
                          </CardHeader>
                          <AccordionContent>
                            <CardContent className="pt-0">
                              {module.lessons && module.lessons.length > 0 ? (
                                <div className="space-y-3 mt-4">
                                  <h3 className="text-lg font-semibold">Lessons:</h3>
                                  {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="border rounded-md p-3 bg-white">
                                      <h4 className="font-medium text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        {lesson.order_index}. {lesson.title}
                                      </h4>
                                      <p className="text-sm text-gray-700 mt-1">{lesson.content}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 mt-4">No lessons available for this module yet.</p>
                              )}
                            </CardContent>
                          </AccordionContent>
                        </AccordionItem>
                      </Card>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Modules Available</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      This course doesn't have any modules yet. Check back later for updates.
                    </p>
                  </div>
                )}
              </CardContent>
              {selectedCourseForLearning.progress === 100 && (
                <CardFooter className="justify-center">
                  <Card className="bg-green-50 border-green-200 w-full">
                    <CardHeader>
                      <CardTitle className="flex justify-center items-center text-green-700">
                        <Award className="h-8 w-8 mr-2" />
                        Course Completed!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-700">Congratulations! You've completed all modules in this course.</p>
                    </CardContent>
                    <CardFooter className="justify-center">
                      {selectedCourseForLearning.certificate_issued && selectedCourseForLearning.certificate_url ? (
                        <Button asChild>
                          <a href={selectedCourseForLearning.certificate_url} target="_blank" rel="noopener noreferrer">
                            Download Certificate
                          </a>
                        </Button>
                      ) : (
                        <Button disabled>Certificate Not Yet Issued</Button>
                      )}
                    </CardFooter>
                  </Card>
                </CardFooter>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Admin: Users Tab Content */}
        {isAdmin && (
          <TabsContent value="admin-users" className="mt-6 space-y-6">
            <h2 className="text-2xl font-bold">Manage Users & Enrollments</h2>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Registered Students</CardTitle>
                <Button onClick={() => setIsAssignCourseModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Assign Course
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Courses Enrolled</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.length > 0 ? (
                      allUsers.map((u) => {
                        const userEnrollments = enrollments.filter((e) => e.user_id === u.user_id)
                        return (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.full_name || "N/A"}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              {userEnrollments.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {userEnrollments.map((e) => (
                                    <li key={e.id}>
                                      {e.certifications.name} ({e.progress}%, {e.status.replace(/_/g, " ")})
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                "No courses"
                              )}
                            </TableCell>
                            <TableCell>{u.is_admin ? "Yes" : "No"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="mr-2">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No registered users.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Admin: Certifications Tab Content */}
        {isAdmin && (
          <TabsContent value="admin-certs" className="mt-6 space-y-6">
            <h2 className="text-2xl font-bold">Manage Certifications</h2>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Certifications</CardTitle>
                <Button
                  onClick={() =>
                    handleEditCertification({ id: "", name: "", description: "", duration_days: null, price: 0 })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Certification
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Duration (Days)</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCertifications.length > 0 ? (
                      allCertifications.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-medium">{cert.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                            {cert.description}
                          </TableCell>
                          <TableCell>{cert.duration_days || "N/A"}</TableCell>
                          <TableCell>${cert.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleEditCertification(cert)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteCertification(cert.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No certifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Admin: Modules & Lessons Tab Content */}
        {isAdmin && (
          <TabsContent value="admin-modules" className="mt-6 space-y-6">
            <h2 className="text-2xl font-bold">Manage Course Content</h2>
            <Card>
              <CardHeader>
                <CardTitle>Select Certification</CardTitle>
                <CardDescription>Choose a certification to manage its modules and lessons.</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedCertForModules}
                  onValueChange={async (value) => {
                    setSelectedCertForModules(value)
                    if (value) {
                      const { data: modulesData, error: modulesError } = await supabase
                        .from("modules")
                        .select(`
                        id,
                        name,
                        description,
                        order_index,
                        lessons (
                          id,
                          title,
                          content,
                          order_index
                        )
                      `)
                        .eq("certification_id", value)
                        .order("order_index")
                        .order("order_index", { foreignTable: "lessons", ascending: true })

                      if (modulesError) console.error("Error fetching modules for selected cert:", modulesError)
                      setModulesForSelectedCert(modulesData || [])
                    } else {
                      setModulesForSelectedCert([])
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCertifications.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id}>
                        {cert.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedCertForModules && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    Modules for {allCertifications.find((c) => c.id === selectedCertForModules)?.name}
                  </CardTitle>
                  <Button
                    onClick={() =>
                      handleEditModule(
                        { id: "", name: "", description: null, order_index: (modulesForSelectedCert.length + 1) * 10 },
                        selectedCertForModules,
                      )
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add New Module
                  </Button>
                </CardHeader>
                <CardContent>
                  {modulesForSelectedCert.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                      {modulesForSelectedCert.map((module) => (
                        <Card key={module.id} className="mb-4">
                          <AccordionItem value={module.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <AccordionTrigger className="flex-1 text-left">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {module.order_index}. {module.name}
                                  </CardTitle>
                                </AccordionTrigger>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditModule(module, selectedCertForModules)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteModule(module.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <AccordionContent>
                              <CardContent className="pt-0">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-semibold">Lessons:</h3>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleEditLesson(
                                        {
                                          id: "",
                                          title: "",
                                          content: null,
                                          order_index: (module.lessons.length + 1) * 10,
                                        },
                                        module.id,
                                      )
                                    }
                                  >
                                    <Plus className="mr-2 h-4 w-4" /> Add Lesson
                                  </Button>
                                </div>
                                {module.lessons && module.lessons.length > 0 ? (
                                  <div className="space-y-3">
                                    {module.lessons.map((lesson) => (
                                      <div
                                        key={lesson.id}
                                        className="border rounded-md p-3 bg-white flex justify-between items-center"
                                      >
                                        <div>
                                          <h4 className="font-medium text-base flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            {lesson.order_index}. {lesson.title}
                                          </h4>
                                          <p className="text-sm text-gray-700 mt-1 line-clamp-1">{lesson.content}</p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditLesson(lesson, module.id)}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No lessons available for this module yet.</p>
                                )}
                              </CardContent>
                            </AccordionContent>
                          </AccordionItem>
                        </Card>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Modules Available</h3>
                      <p className="text-gray-500 max-w-md mx-auto">Add modules to this certification.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Assign Course Modal */}
      <Dialog open={isAssignCourseModalOpen} onOpenChange={setIsAssignCourseModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Course to User</DialogTitle>
            <DialogDescription>Select a user and a certification to assign.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                User
              </Label>
              <Select value={selectedUserForAssignment} onValueChange={setSelectedUserForAssignment}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certification" className="text-right">
                Certification
              </Label>
              <Select value={selectedCertForAssignment} onValueChange={setSelectedCertForAssignment}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a certification" />
                </SelectTrigger>
                <SelectContent>
                  {allCertifications.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id}>
                      {cert.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !assignmentDueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {assignmentDueDate ? format(assignmentDueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={assignmentDueDate} onSelect={setAssignmentDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAssignCourseModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleAssignCourse} disabled={isAssigningCourse}>
              {isAssigningCourse && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Edit/Add Modal */}
      <Dialog open={isCertModalOpen} onOpenChange={setIsCertModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCert?.id ? "Edit Certification" : "Add New Certification"}</DialogTitle>
            <DialogDescription>
              {currentCert?.id ? "Edit the details of this certification." : "Add a new certification to your catalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certName" className="text-right">
                Name
              </Label>
              <Input
                id="certName"
                value={currentCert?.name || ""}
                onChange={(e) => setCurrentCert((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="certDescription"
                value={currentCert?.description || ""}
                onChange={(e) => setCurrentCert((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certDuration" className="text-right">
                Duration (Days)
              </Label>
              <Input
                id="certDuration"
                type="number"
                value={currentCert?.duration_days || ""}
                onChange={(e) =>
                  setCurrentCert((prev) =>
                    prev ? { ...prev, duration_days: Number.parseInt(e.target.value) || null } : null,
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certPrice" className="text-right">
                Price
              </Label>
              <Input
                id="certPrice"
                type="number"
                value={currentCert?.price || ""}
                onChange={(e) =>
                  setCurrentCert((prev) => (prev ? { ...prev, price: Number.parseFloat(e.target.value) || 0 } : null))
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCertModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveCertification} disabled={isSavingContent}>
              {isSavingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Certification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Edit/Add Modal */}
      <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentModule?.id ? "Edit Module" : "Add New Module"}</DialogTitle>
            <DialogDescription>
              {currentModule?.id
                ? "Edit the details of this module."
                : "Add a new module to the selected certification."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="moduleName" className="text-right">
                Name
              </Label>
              <Input
                id="moduleName"
                value={currentModule?.name || ""}
                onChange={(e) => setCurrentModule((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="moduleDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="moduleDescription"
                value={currentModule?.description || ""}
                onChange={(e) => setCurrentModule((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="moduleOrder" className="text-right">
                Order Index
              </Label>
              <Input
                id="moduleOrder"
                type="number"
                value={currentModule?.order_index || ""}
                onChange={(e) =>
                  setCurrentModule((prev) =>
                    prev ? { ...prev, order_index: Number.parseInt(e.target.value) || 0 } : null,
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModuleModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveModule} disabled={isSavingContent}>
              {isSavingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Edit/Add Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentLesson?.id ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
            <DialogDescription>
              {currentLesson?.id ? "Edit the details of this lesson." : "Add a new lesson to the selected module."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lessonTitle" className="text-right">
                Title
              </Label>
              <Input
                id="lessonTitle"
                value={currentLesson?.title || ""}
                onChange={(e) => setCurrentLesson((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lessonContent" className="text-right">
                Content
              </Label>
              <Textarea
                id="lessonContent"
                value={currentLesson?.content || ""}
                onChange={(e) => setCurrentLesson((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lessonOrder" className="text-right">
                Order Index
              </Label>
              <Input
                id="lessonOrder"
                type="number"
                value={currentLesson?.order_index || ""}
                onChange={(e) =>
                  setCurrentLesson((prev) =>
                    prev ? { ...prev, order_index: Number.parseInt(e.target.value) || 0 } : null,
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLessonModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} disabled={isSavingContent}>
              {isSavingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
