"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Upload, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface UserProfile {
  id: number
  user_id: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  address: string | null
  profile_picture_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError("Supabase is not configured")
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Get current user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError("Failed to get session")
          setLoading(false)
          return
        }

        if (!session?.user) {
          router.push("/login")
          return
        }

        setUserEmail(session.user.email)

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setError("Failed to load profile")
          setLoading(false)
          return
        }

        if (profileData) {
          setProfile(profileData)
          setFormData({
            full_name: profileData.full_name || "",
            phone_number: profileData.phone_number || "",
            address: profileData.address || "",
          })
          if (profileData.profile_picture_url) {
            setPreviewUrl(profileData.profile_picture_url)
          }
        } else {
          // Create new profile if it doesn't exist
          const newProfile = {
            user_id: session.user.id,
            full_name: session.user.user_metadata?.full_name || null,
            email: session.user.email || null,
            phone_number: null,
            address: null,
            profile_picture_url: null,
          }

          const { data: createdProfile, error: createError } = await supabase
            .from("user_profiles")
            .insert([newProfile])
            .select()
            .maybeSingle()

          if (createError) {
            console.error("Error creating profile:", createError)
            setError("Failed to initialize profile")
            setLoading(false)
            return
          }

          if (createdProfile) {
            setProfile(createdProfile)
            setFormData({
              full_name: createdProfile.full_name || "",
              phone_number: createdProfile.phone_number || "",
              address: createdProfile.address || "",
            })
          }
        }
      } catch (err) {
        console.error("Error in fetchProfile:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload JPG, PNG, GIF, or WebP")
        return
      }

      const MAX_SIZE = 5 * 1024 * 1024
      if (file.size > MAX_SIZE) {
        setError("File is too large. Maximum size is 5MB")
        return
      }

      setSelectedFile(file)
      setError(null)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadProfilePicture = async () => {
    if (!selectedFile || !profile) {
      setError("No file selected")
      return
    }

    try {
      setUploading(true)
      setError(null)

      console.log("Starting upload for file:", selectedFile.name)

      const formDataBlob = new FormData()
      formDataBlob.append("file", selectedFile)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formDataBlob,
      })

      console.log("Upload response status:", uploadResponse.status)

      const responseData = await uploadResponse.json()
      console.log("Upload response data:", responseData)

      if (!uploadResponse.ok) {
        const errorMessage = responseData.details || responseData.error || "Upload failed"
        setError(`Upload failed: ${errorMessage}`)
        setUploading(false)
        return
      }

      if (!responseData.url) {
        setError("No URL returned from upload")
        setUploading(false)
        return
      }

      console.log("File uploaded successfully:", responseData.url)

      // Update profile with new picture URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Supabase is not configured")
        setUploading(false)
        return
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ profile_picture_url: responseData.url })
        .eq("id", profile.id)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        setError("Failed to update profile picture URL")
        setUploading(false)
        return
      }

      setProfile((prev) => (prev ? { ...prev, profile_picture_url: responseData.url } : null))
      setSelectedFile(null)
      setPreviewUrl(responseData.url)
      setSuccess("Profile picture updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error uploading profile picture:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Failed to upload profile picture: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) return

    try {
      setSubmitting(true)
      setError(null)

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Supabase is not configured")
        return
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error: updateError } = await supabase.from("user_profiles").update(formData).eq("id", profile.id)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        setError("Failed to update profile")
        return
      }

      setProfile((prev) => (prev ? { ...prev, ...formData } : null))
      setEditMode(false)
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Failed to save profile")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load profile. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl || profile.profile_picture_url || undefined} alt="Profile" />
                <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-picture">Choose Image</Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <p className="text-sm text-muted-foreground">JPG, PNG, GIF or WebP (Max 5MB)</p>
            </div>

            {selectedFile && (
              <Button onClick={handleUploadProfilePicture} disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Picture
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Email Display */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email Address</Label>
              <p className="font-medium mt-1">{userEmail || profile.email || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Account Status</Label>
              <p className="font-medium mt-1 text-green-600">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </div>
          <Button variant={editMode ? "outline" : "default"} onClick={() => setEditMode(!editMode)}>
            {editMode ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="Your address..."
                rows={4}
              />
            </div>

            {editMode && (
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
