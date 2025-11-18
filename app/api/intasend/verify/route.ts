import { type NextRequest, NextResponse } from "next/server"
import { getIntasendPaymentStatus, saveIntasendPaymentToDatabase } from "@/lib/intasend"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const invoiceId = searchParams.get("invoiceId")

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 })
    }

    const paymentStatus = await getIntasendPaymentStatus(invoiceId)

    // Update payment in database
    await saveIntasendPaymentToDatabase({
      invoice_id: paymentStatus.id,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      email: paymentStatus.email,
      state: paymentStatus.state,
      payment_method: paymentStatus.payment_method,
      updated_at: paymentStatus.updated_at,
      metadata: paymentStatus,
    })

    const metadata = paymentStatus.metadata || {}
    const certificationId = metadata.certification_id || metadata.certificationId
    const userId = metadata.user_id || metadata.userId

    if (certificationId && userId && paymentStatus.state === "COMPLETE") {
      const supabase = createServerSupabaseClient()
      
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from("user_enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("certification_id", certificationId)
        .maybeSingle()

      if (!existingEnrollment) {
          // Calculate due date (7 days from now)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 7)

        // Create enrollment
        const { error: enrollError } = await supabase
          .from("user_enrollments")
          .insert({
            user_id: userId,
            certification_id: certificationId,
            status: "active",
            progress: 0,
            payment_status: "completed",
            due_date: dueDate.toISOString(),
            certificate_issued: false,
            enrolled_at: new Date().toISOString(),
          })

        if (enrollError) {
          console.error("Failed to create enrollment after payment:", enrollError)
        } else {
          // Create user modules
          const { data: modules } = await supabase
            .from("modules")
            .select("id")
            .eq("certification_id", certificationId)

          if (modules && modules.length > 0) {
            const userModuleData = modules.map((module) => ({
              user_id: userId,
              module_id: module.id,
              is_completed: false,
              course_id: certificationId // Some tables might use course_id
            }))

            await supabase.from("user_modules").insert(userModuleData)
          }
        }
      }
    }

    return NextResponse.json({
      status: true,
      data: paymentStatus,
    })
  } catch (error) {
    console.error("Error verifying Intasend payment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to verify payment",
      },
      { status: 500 },
    )
  }
}
