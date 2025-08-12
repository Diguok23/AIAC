import { createServerSupabaseClient } from "@/lib/supabase"

export async function enrollUserInCourse(userId: string, courseId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("user_enrollments") // Changed from user_courses to user_enrollments
      .select("id")
      .eq("user_id", userId)
      .eq("certification_id", courseId) // Changed from course_id to certification_id
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected if not enrolled
      throw checkError
    }

    // If already enrolled, return the existing enrollment
    if (existingEnrollment) {
      return { success: true, message: "Already enrolled", id: existingEnrollment.id }
    }

    // Get course details to set up modules
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("*")
      .eq("id", courseId)
      .single()

    if (certError) throw certError

    // Calculate due date (e.g., 3 months from now, or based on certification duration if available)
    const defaultDueDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 3 months

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("user_enrollments") // Changed from user_courses to user_enrollments
      .insert({
        user_id: userId,
        certification_id: courseId, // Changed from course_id to certification_id
        progress: 0,
        status: "not_started",
        enrolled_at: new Date().toISOString(),
        due_date: defaultDueDate, // Set the due date
        certificate_issued: false, // Default to not issued
      })
      .select()
      .single()

    if (enrollError) throw enrollError

    // Fetch actual modules for this certification
    const { data: modules, error: modulesFetchError } = await supabase
      .from("modules")
      .select("id")
      .eq("certification_id", courseId)
      .order("order_num")

    if (modulesFetchError) throw modulesFetchError

    // Insert user_modules entries for each module
    if (modules && modules.length > 0) {
      const userModuleInserts = modules.map((module) => ({
        user_id: userId,
        course_id: courseId, // Keep course_id for now, but ideally should be certification_id
        module_id: module.id,
        is_completed: false,
      }))

      const { error: userModulesError } = await supabase.from("user_modules").insert(userModuleInserts)

      if (userModulesError) throw userModulesError
    }

    return { success: true, message: "Successfully enrolled", id: enrollment.id }
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return { success: false, message: error instanceof Error ? error.message : "Failed to enroll in course" }
  }
}

// Helper function to get default modules based on course category
// This function is now less critical as we fetch from the 'modules' table
// but keeping it for potential fallback or initial seeding logic.
function getDefaultModules(category: string): string[] {
  const modulesByCategory = {
    cruise: [
      "Introduction to Cruise Ship Operations",
      "Guest Relations Management",
      "Service Standards and Protocols",
      "Crisis Management",
      "Team Leadership and Management",
      "Quality Assurance and Feedback Systems",
    ],
    business: [
      "Business Fundamentals",
      "Strategic Planning",
      "Financial Management",
      "Marketing and Sales",
      "Operations Management",
      "Leadership and Team Building",
    ],
    it: [
      "IT Fundamentals",
      "Programming Basics",
      "Database Management",
      "Network Security",
      "Cloud Computing",
      "IT Project Management",
    ],
    default: [
      "Module 1: Introduction",
      "Module 2: Core Concepts",
      "Module 3: Advanced Topics",
      "Module 4: Practical Applications",
      "Module 5: Assessment and Review",
    ],
  }

  return modulesByCategory[category] || modulesByCategory.default
}
