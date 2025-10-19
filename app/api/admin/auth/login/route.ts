import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate email domain
    if (!email.endsWith("@apmih.college")) {
      return NextResponse.json(
        { error: "Only @apmih.college email addresses are allowed for admin login" },
        { status: 401 },
      )
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Get admin user record
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("auth_user_id", data.user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 401 })
    }

    if (!adminUser.is_active) {
      return NextResponse.json({ error: "Admin account is inactive" }, { status: 401 })
    }

    // Update last login
    await supabaseAdmin.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminUser.id)

    // Create activity log
    await supabaseAdmin.from("admin_activity_logs").insert([
      {
        admin_id: adminUser.id,
        action: "LOGIN",
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent"),
      },
    ])

    return NextResponse.json(
      {
        message: "Login successful",
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.full_name,
          role: adminUser.role,
        },
        session: data.session,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
