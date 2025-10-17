import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { id } = params

    // Decode the URL parameter
    const decodedId = decodeURIComponent(id)

    // Check if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isUUID = uuidRegex.test(decodedId)

    let certification = null

    if (isUUID) {
      // Search by ID (UUID)
      const { data, error } = await supabase.from("certifications").select("*").eq("id", decodedId).maybeSingle()

      if (error) throw error
      certification = data
    } else {
      // Search by title (slug-like search)
      const { data, error } = await supabase.from("certifications").select("*").eq("title", decodedId).maybeSingle()

      if (error) throw error
      certification = data

      // If not found by exact title, try case-insensitive search
      if (!certification) {
        const { data: certifications, error: searchError } = await supabase
          .from("certifications")
          .select("*")
          .ilike("title", `%${decodedId}%`)

        if (searchError) throw searchError
        certification = certifications?.[0] || null
      }
    }

    if (!certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    // Fetch all related data in parallel
    const [{ data: modules }, { data: outcomes }, { data: prerequisites }, { data: reviews }] = await Promise.all([
      supabase.from("modules").select("*").eq("certification_id", certification.id).order("order_num"),
      supabase.from("learning_outcomes").select("*").eq("certification_id", certification.id).order("order_num"),
      supabase.from("prerequisites").select("*").eq("certification_id", certification.id).order("order_num"),
      supabase.from("certification_reviews").select("*").eq("certification_id", certification.id),
    ])

    // Fetch lessons for each module
    const modulesWithLessons = await Promise.all(
      (modules || []).map(async (module) => {
        const { data: lessons } = await supabase
          .from("lessons")
          .select("*")
          .eq("module_id", module.id)
          .order("order_num")

        return {
          ...module,
          lessons: lessons || [],
        }
      }),
    )

    return NextResponse.json({
      ...certification,
      modules: modulesWithLessons,
      learning_outcomes: outcomes || [],
      prerequisites: prerequisites || [],
      reviews: reviews || [],
    })
  } catch (error) {
    console.error("Error fetching certification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
