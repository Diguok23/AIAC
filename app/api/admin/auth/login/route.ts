import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate email domain
    if (!email.endsWith("@apmih.college")) {
      return NextResponse.json({ error: "Only @apmih.college email addresses are allowed" }, { status: 400 })
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Authenticate user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signInData.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Get admin user record
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select()
      .eq("auth_user_id", signInData.user.id)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ error: "Admin record not found" }, { status: 404 })
    }

    // Check if admin is active
    if (!adminData.is_active) {
      return NextResponse.json({ error: "Admin account is inactive" }, { status: 403 })
    }

    // Update last login
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminData.id)

    return NextResponse.json(
      {
        success: true,
        token: signInData.session?.access_token,
        admin: adminData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
