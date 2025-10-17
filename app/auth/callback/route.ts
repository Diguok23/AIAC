import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(new URL("/login?error=auth_callback_error", requestUrl.origin))
      }

      if (data.session) {
        // Successfully authenticated, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
      }
    }

    // If no code or session, redirect to login
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_error", request.url))
  }
}
