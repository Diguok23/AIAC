import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create admin client with service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Create storage bucket for document uploads if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "documents")

    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket("documents", {
        public: false,
        allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
        fileSizeLimit: 5242880, // 5MB
      })

      if (bucketError) {
        console.error("Error creating storage bucket:", bucketError)
        return NextResponse.json({ error: "Failed to create storage bucket" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully. Storage bucket is ready for document uploads.",
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json({ error: "Failed to setup database" }, { status: 500 })
  }
}
