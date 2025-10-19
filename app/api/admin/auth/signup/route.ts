import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    // Validate email domain
    if (!email.endsWith("@apmih.college")) {
      return NextResponse.json(
        { error: "Only @apmih.college email addresses are allowed for admin registration" },
        { status: 400 },
      )
    }

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase.from("admin_users").select("id").eq("email", email).single()

    if (existingAdmin) {
      return NextResponse.json({ error: "Admin with this email already exists" }, { status: 400 })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create admin user record
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .insert([
        {
          auth_user_id: authData.user.id,
          email,
          full_name: fullName,
          role: "admin",
          is_active: true,
        },
      ])
      .select()
      .single()

    if (adminError) {
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: adminError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: "Admin account created successfully",
        admin: adminUser,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Admin signup error:", error)
    return NextResponse.json({ error: "An error occurred during signup" }, { status: 500 })
  }
}
