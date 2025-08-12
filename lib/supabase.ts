import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance for the browser
let supabaseInstance = null

// Create a Supabase client for browser-side usage
export const createSupabaseClient = () => {
  if (typeof window !== "undefined") {
    if (!supabaseInstance) {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: "apmih_auth_token",
        },
      })
    }
    return supabaseInstance
  }

  // For server-side usage, always create a new client
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "apmih_auth_token",
    },
  })
}

// Create a Supabase client with service role for server-side operations
export const createServerSupabaseClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}
