import { createServerSupabaseClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Received application submission request")
    const supabase = createServerSupabaseClient()
    const formData = await request.formData()

    // Extract application data
    const applicationData = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      date_of_birth: formData.get("dateOfBirth") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zip_code: formData.get("zipCode") as string,
      country: formData.get("country") as string,
      program_category: formData.get("programCategory") as string,
      program_name: formData.get("programName") as string,
      start_date: formData.get("startDate") as string,
      study_mode: formData.get("studyMode") as string,
      highest_education: formData.get("highestEducation") as string,
      previous_certifications: formData.get("previousCertifications") as string,
      years_experience: formData.get("yearsExperience") as string,
      current_employer: formData.get("currentEmployer") as string,
      current_position: formData.get("currentPosition") as string,
      heard_about: formData.get("heardAbout") as string,
      questions: formData.get("questions") as string,
      status: "pending",
    }

    // After extracting application data
    console.log("Application data extracted:", {
      name: `${applicationData.first_name} ${applicationData.last_name}`,
      email: applicationData.email,
      program: applicationData.program_name,
    })

    // Insert application data into Supabase
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert(applicationData)
      .select("id")
      .single()

    if (applicationError) {
      console.error("Error inserting application:", applicationError)
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }

    const applicationId = application.id

    // After inserting application data
    console.log("Application inserted with ID:", applicationId)

    // Check if the storage bucket exists, create it if it doesn't
    const bucketName = "applicationdocuments"
    const { data: buckets } = await supabase.storage.listBuckets()

    if (!buckets?.find((bucket) => bucket.name === bucketName)) {
      console.log("Creating storage bucket:", bucketName)
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
      })

      if (bucketError) {
        console.error("Error creating storage bucket:", bucketError)
        return NextResponse.json({ error: "Failed to create storage for documents" }, { status: 500 })
      }
    }

    // Process document uploads
    const documentTypes = ["identification", "academic", "additional"]
    const documentPromises = []

    for (const type of documentTypes) {
      const files = formData.getAll(`${type}Documents`) as File[]

      for (const file of files) {
        if (!file.name) continue

        const fileExt = file.name.split(".").pop()
        const fileName = `${type}_${Date.now()}.${fileExt}`
        const filePath = `${applicationId}/${fileName}`

        try {
          // Upload file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file)

          if (uploadError) {
            console.error(`Error uploading ${type} document:`, uploadError)
            continue
          }

          // Store document reference in database
          const documentPromise = supabase.from("documents").insert({
            application_id: applicationId,
            document_type: type,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
          })

          documentPromises.push(documentPromise)
        } catch (uploadErr) {
          console.error(`Exception during ${type} document upload:`, uploadErr)
        }
      }
    }

    // Wait for all document uploads to complete
    if (documentPromises.length > 0) {
      try {
        await Promise.all(documentPromises)
      } catch (docErr) {
        console.error("Error saving document references:", docErr)
      }
    }

    // After processing document uploads
    console.log("Document uploads processed, promises count:", documentPromises.length)

    // Before returning success response
    console.log("Application submission completed successfully")

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("Error processing application submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
