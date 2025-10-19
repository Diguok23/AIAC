"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  BookOpen,
  FileQuestion,
  ClipboardList,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface Material {
  id: string
  title: string
  file_url: string
  file_type: string
  file_size: number
}

interface Lesson {
  id: string
  title: string
  content: string | null
  order_num: number
  materials: Material[]
}

interface Module {
  id: string
  title: string
  description: string | null
  duration: string | null
  order_num: number
  lessons: Lesson[]
}

interface Assignment {
  id: string
  title: string
  description: string | null
  instructions: string | null
  due_date: string | null
  max_score: number
  file_url: string | null
}

interface Exam {
  id: string
  title: string
  description: string | null
  exam_date: string | null
  duration_minutes: number | null
  max_score: number
}

interface CourseContent {
  certification: {
    id: string
    title: string
    description: string
    level: string
    duration: string | null
    instructor: string | null
    instructor_bio: string | null
  }
  modules: Module[]
  assignments: Assignment[]
  exams: Exam[]
}

export default function CourseLearningPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const supabase = createClientComponentClient()

  const [courseContent, setCourseContent] = useState<CourseContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/content`)
        if (!response.ok) {
          throw new Error("Failed to fetch course content")
        }
        const data = await response.json()
        setCourseContent(data)

        // Set first lesson as selected
        if (data.modules && data.modules.length > 0 && data.modules[0].lessons?.length > 0) {
          setSelectedLesson(data.modules[0].lessons[0])
        }

        // Fetch user progress
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const enrollmentResponse = await fetch(`/api/user-enrollments?user_id=${user.id}`)
          const enrollmentData = await enrollmentResponse.json()
          const enrollment = enrollmentData.enrollments?.find((e: any) => e.certification_id === courseId)
          if (enrollment) {
            setProgress(enrollment.progress)
          }
        }
      } catch (err) {
        console.error("Error fetching course content:", err)
        setError("Failed to load course content")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseContent()
  }, [courseId, supabase])

  const handleDownloadMaterial = (material: Material) => {
    const link = document.createElement("a")
    link.href = material.file_url
    link.download = material.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !courseContent) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Failed to load course content"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalLessons = courseContent.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
  const totalMaterials = courseContent.modules.reduce(
    (sum, m) => sum + (m.lessons?.reduce((lSum, l) => lSum + (l.materials?.length || 0), 0) || 0),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{courseContent.certification.title}</h1>
              <p className="text-muted-foreground mt-1">{courseContent.certification.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progress}%</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex flex-wrap gap-4 text-sm">
            {courseContent.certification.instructor && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Instructor:</span>
                <span className="font-medium">{courseContent.certification.instructor}</span>
              </div>
            )}
            {courseContent.certification.level && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{courseContent.certification.level}</Badge>
              </div>
            )}
            {courseContent.certification.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{courseContent.certification.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseContent.modules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaterials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseContent.assignments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Modules</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Materials</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            <span className="hidden sm:inline">Exams</span>
          </TabsTrigger>
        </TabsList>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Modules List */}
            <div className="lg:col-span-1 space-y-2">
              {courseContent.modules.map((module) => (
                <Card key={module.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {module.lessons?.length || 0} lessons
                        {module.duration && ` • ${module.duration}`}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {module.lessons && module.lessons.length > 0 && (
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`w-full text-left text-sm px-2 py-1 rounded transition-colors ${
                              selectedLesson?.id === lesson.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{lesson.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Lesson Details */}
            <div className="lg:col-span-2">
              {selectedLesson ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{selectedLesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Lesson Content */}
                    {selectedLesson.content && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Content</h3>
                          <div className="prose prose-sm max-w-none dark:prose-invert">{selectedLesson.content}</div>
                        </div>
                      </div>
                    )}

                    {/* Lesson Materials */}
                    {selectedLesson.materials && selectedLesson.materials.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Learning Materials</h3>
                        <div className="space-y-2">
                          {selectedLesson.materials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{material.title}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(material.file_size)}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadMaterial(material)}
                                className="flex-shrink-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!selectedLesson.content &&
                      (!selectedLesson.materials || selectedLesson.materials.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No content available for this lesson yet.</p>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a lesson to view content</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          {totalMaterials > 0 ? (
            <div className="space-y-4">
              {courseContent.modules.map(
                (module) =>
                  module.lessons &&
                  module.lessons.some((l) => l.materials && l.materials.length > 0) && (
                    <Card key={module.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {module.lessons.map(
                          (lesson) =>
                            lesson.materials &&
                            lesson.materials.length > 0 && (
                              <div key={lesson.id} className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">{lesson.title}</p>
                                <div className="space-y-1 ml-2">
                                  {lesson.materials.map((material) => (
                                    <div
                                      key={material.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                          <p className="text-sm truncate">{material.title}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {formatFileSize(material.file_size)}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDownloadMaterial(material)}
                                        className="flex-shrink-0"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ),
                        )}
                      </CardContent>
                    </Card>
                  ),
              )}
            </div>
          ) : (
            <Card className="py-12">
              <div className="text-center text-muted-foreground">
                <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No materials available yet</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          {courseContent.assignments.length > 0 ? (
            <div className="grid gap-4">
              {courseContent.assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <Badge variant="outline">Max: {assignment.max_score} pts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignment.instructions && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Instructions</h4>
                        <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                      </div>
                    )}

                    {assignment.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span>
                          Due: <strong>{formatDate(assignment.due_date)}</strong>
                        </span>
                      </div>
                    )}

                    {assignment.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = assignment.file_url!
                          link.download = assignment.title
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Assignment
                      </Button>
                    )}

                    <Button className="w-full">Submit Assignment</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <div className="text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No assignments available yet</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          {courseContent.exams.length > 0 ? (
            <div className="grid gap-4">
              {courseContent.exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{exam.title}</CardTitle>
                        <CardDescription>{exam.description}</CardDescription>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline">Max: {exam.max_score} pts</Badge>
                        <Badge variant="secondary">Pass: {exam.passing_score} pts</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      {exam.exam_date && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>Exam: {formatDate(exam.exam_date)}</span>
                        </div>
                      )}
                      {exam.duration_minutes && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span>Duration: {exam.duration_minutes} minutes</span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full" disabled={!exam.exam_date}>
                      Take Exam
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <div className="text-center text-muted-foreground">
                <FileQuestion className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No exams available yet</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
