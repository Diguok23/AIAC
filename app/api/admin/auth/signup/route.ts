import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    // Validate email domain
    if (!email.endsWith("@apmih.college")) {
      return NextResponse.json({ error: "Only @apmih.college email addresses are allowed" }, { status: 400 })
    }

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create user" }, { status: 400 })
    }

    // Create admin user record
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .insert({
        auth_user_id: authData.user.id,
        email,
        full_name: fullName,
        role: "admin",
        is_active: true,
      })
      .select()
      .single()

    if (adminError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create admin record" }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully",
        admin: adminData,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Admin signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
