import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
    const { id } = params

    // Fetch certification details
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("*")
      .eq("id", id)
      .single()

    if (certError || !certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    // Fetch modules with lessons
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("*")
      .eq("certification_id", id)
      .order("order_num")

    if (modulesError) throw modulesError

    // Fetch lessons for each module
    const modulesWithLessons = []
    if (modules) {
      for (const module of modules) {
        const { data: lessons, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("module_id", module.id)
          .order("order_num")

        if (!lessonsError) {
          // Fetch materials for each lesson
          const lessonsWithMaterials = []
          for (const lesson of lessons || []) {
            const { data: materials, error: materialsError } = await supabase
              .from("course_materials")
              .select("*")
              .eq("lesson_id", lesson.id)
              .order("order_num")

            lessonsWithMaterials.push({
              ...lesson,
              materials: materialsError ? [] : materials || [],
            })
          }

          modulesWithLessons.push({
            ...module,
            lessons: lessonsWithMaterials,
          })
        }
      }
    }

    // Fetch assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("*")
      .eq("certification_id", id)
      .order("due_date")

    // Fetch exams
    const { data: exams, error: examsError } = await supabase
      .from("exams")
      .select("*")
      .eq("certification_id", id)
      .order("exam_date")

    return NextResponse.json({
      certification,
      modules: modulesWithLessons,
      assignments: assignmentsError ? [] : assignments || [],
      exams: examsError ? [] : exams || [],
    })
  } catch (error) {
    console.error("Error fetching course content:", error)
    return NextResponse.json({ error: "Failed to fetch course content" }, { status: 500 })
  }
}
