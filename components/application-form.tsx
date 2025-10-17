"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Upload, AlertCircle } from "lucide-react"
import { countries } from "@/lib/countries"

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
  postalCode: string
  country: string

  // Education & Experience
  highestEducation: string
  institutionName: string
  graduationYear: string
  workExperience: string
  currentEmployer: string
  currentPosition: string

  // Program Selection
  programCategory: string
  programName: string
  startDate: string
  studyMode: string

  // Documents
  resume: File | null
  educationCertificate: File | null
  idDocument: File | null
  additionalDocuments: File | null

  // Agreement
  termsAccepted: boolean
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  nationality: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  highestEducation: "",
  institutionName: "",
  graduationYear: "",
  workExperience: "",
  currentEmployer: "",
  currentPosition: "",
  programCategory: "",
  programName: "",
  startDate: "",
  studyMode: "",
  resume: null,
  educationCertificate: null,
  idDocument: null,
  additionalDocuments: null,
  termsAccepted: false,
}

const programCategories = [
  "Cruise & Maritime",
  "Hotel Management",
  "Food Service",
  "Customer Service",
  "Event Management",
  "Restaurant Management",
  "Marketing",
]

const programs: Record<string, string[]> = {
  "Cruise & Maritime": [
    "Cruise Ship Hospitality Management",
    "Maritime Guest Services",
    "Cruise Operations Specialist",
    "Onboard Entertainment Management",
  ],
  "Hotel Management": [
    "Hotel Operations Management",
    "Front Office Management",
    "Luxury Hotel Management",
    "Boutique Hotel Operations",
  ],
  "Food Service": [
    "Food Safety and Hygiene",
    "Culinary Management",
    "Restaurant Service Excellence",
    "Banquet Operations",
  ],
  "Customer Service": [
    "Customer Service Excellence",
    "Guest Relations Management",
    "Complaint Resolution Specialist",
    "Service Quality Management",
  ],
  "Event Management": [
    "Event Planning and Management",
    "Conference & Convention Management",
    "Wedding Planning Specialist",
    "Corporate Events Management",
  ],
  "Restaurant Management": [
    "Restaurant Management",
    "Kitchen Operations Management",
    "Food & Beverage Management",
    "Quick Service Restaurant Management",
  ],
  Marketing: [
    "Hospitality Marketing",
    "Digital Marketing for Hotels",
    "Revenue Management",
    "Brand Management in Hospitality",
  ],
}

const educationLevels = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Certificate",
]

const studyModes = ["Full-Time", "Part-Time", "Online", "Hybrid"]

export default function ApplicationForm() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")
  const searchParamsProcessed = useRef(false)

  const totalSteps = 5

  useEffect(() => {
    // Only process search params once on mount
    if (!searchParamsProcessed.current) {
      const category = searchParams.get("category")
      const program = searchParams.get("program")

      if (category || program) {
        setFormData((prev) => ({
          ...prev,
          ...(category && { programCategory: category }),
          ...(program && { programName: program }),
        }))
      }
      searchParamsProcessed.current = true
    }
  }, []) // Empty dependency array - run once on mount

  const handleInputChange = (field: keyof FormData, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
        if (!formData.nationality) newErrors.nationality = "Nationality is required"
        break

      case 2:
        if (!formData.address.trim()) newErrors.address = "Address is required"
        if (!formData.city.trim()) newErrors.city = "City is required"
        if (!formData.country) newErrors.country = "Country is required"
        break

      case 3:
        if (!formData.highestEducation) newErrors.highestEducation = "Education level is required"
        if (!formData.institutionName.trim()) newErrors.institutionName = "Institution name is required"
        if (!formData.graduationYear) newErrors.graduationYear = "Graduation year is required"
        break

      case 4:
        if (!formData.programCategory) newErrors.programCategory = "Program category is required"
        if (!formData.programName) newErrors.programName = "Program is required"
        if (!formData.startDate) newErrors.startDate = "Start date is required"
        if (!formData.studyMode) newErrors.studyMode = "Study mode is required"
        break

      case 5:
        if (!formData.resume) newErrors.resume = "Resume is required"
        if (!formData.educationCertificate) newErrors.educationCertificate = "Education certificate is required"
        if (!formData.idDocument) newErrors.idDocument = "ID document is required"
        if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setSubmitStatus("loading")
    setSubmitMessage("")

    try {
      // Create FormData for file upload
      const submitFormData = new FormData()

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitFormData.append(key, value)
        } else if (typeof value === "boolean") {
          submitFormData.append(key, value.toString())
        } else if (value) {
          submitFormData.append(key, value.toString())
        }
      })

      const response = await fetch("/api/submit-application", {
        method: "POST",
        body: submitFormData,
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus("success")
        setSubmitMessage("Application submitted successfully! We will contact you soon.")
        // Reset form
        setFormData(initialFormData)
        setCurrentStep(1)
      } else {
        setSubmitStatus("error")
        setSubmitMessage(data.error || "Failed to submit application. Please try again.")
      }
    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage("Network error. Please check your connection and try again.")
      console.error("Submit error:", error)
    }
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Certification Application</CardTitle>
          <CardDescription>
            Step {currentStep} of {totalSteps}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {submitStatus !== "idle" && (
            <Alert variant={submitStatus === "success" ? "default" : "destructive"}>
              {submitStatus === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{submitMessage}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.doe@example.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">
                  Nationality <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Information</h3>
              <div className="space-y-2">
                <Label htmlFor="address">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street"
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Education & Experience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Education & Experience</h3>
              <div className="space-y-2">
                <Label htmlFor="highestEducation">
                  Highest Education Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.highestEducation}
                  onValueChange={(value) => handleInputChange("highestEducation", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.highestEducation && <p className="text-sm text-red-500">{errors.highestEducation}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionName">
                    Institution Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange("institutionName", e.target.value)}
                    placeholder="University Name"
                  />
                  {errors.institutionName && <p className="text-sm text-red-500">{errors.institutionName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">
                    Graduation Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                    placeholder="2020"
                  />
                  {errors.graduationYear && <p className="text-sm text-red-500">{errors.graduationYear}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workExperience">Work Experience</Label>
                <Textarea
                  id="workExperience"
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange("workExperience", e.target.value)}
                  placeholder="Describe your relevant work experience..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEmployer">Current Employer</Label>
                  <Input
                    id="currentEmployer"
                    value={formData.currentEmployer}
                    onChange={(e) => handleInputChange("currentEmployer", e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPosition">Current Position</Label>
                  <Input
                    id="currentPosition"
                    value={formData.currentPosition}
                    onChange={(e) => handleInputChange("currentPosition", e.target.value)}
                    placeholder="Job Title"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Program Selection */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Program Selection</h3>
              <div className="space-y-2">
                <Label htmlFor="programCategory">
                  Program Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.programCategory}
                  onValueChange={(value) => {
                    handleInputChange("programCategory", value)
                    handleInputChange("programName", "") // Reset program when category changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {programCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programCategory && <p className="text-sm text-red-500">{errors.programCategory}</p>}
              </div>
              {formData.programCategory && (
                <div className="space-y-2">
                  <Label htmlFor="programName">
                    Program <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.programName}
                    onValueChange={(value) => handleInputChange("programName", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs[formData.programCategory]?.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.programName && <p className="text-sm text-red-500">{errors.programName}</p>}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Preferred Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studyMode">
                    Study Mode <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.studyMode} onValueChange={(value) => handleInputChange("studyMode", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select study mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.studyMode && <p className="text-sm text-red-500">{errors.studyMode}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <div className="space-y-2">
                <Label htmlFor="resume">
                  Resume/CV <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange("resume", e.target.files?.[0] || null)}
                  />
                  <Upload className="h-4 w-4 text-gray-500" />
                </div>
                {formData.resume && (
                  <Badge variant="secondary" className="mt-1">
                    {formData.resume.name}
                  </Badge>
                )}
                {errors.resume && <p className="text-sm text-red-500">{errors.resume}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="educationCertificate">
                  Education Certificate <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="educationCertificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("educationCertificate", e.target.files?.[0] || null)}
                  />
                  <Upload className="h-4 w-4 text-gray-500" />
                </div>
                {formData.educationCertificate && (
                  <Badge variant="secondary" className="mt-1">
                    {formData.educationCertificate.name}
                  </Badge>
                )}
                {errors.educationCertificate && <p className="text-sm text-red-500">{errors.educationCertificate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="idDocument">
                  ID Document (Passport/National ID) <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="idDocument"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("idDocument", e.target.files?.[0] || null)}
                  />
                  <Upload className="h-4 w-4 text-gray-500" />
                </div>
                {formData.idDocument && (
                  <Badge variant="secondary" className="mt-1">
                    {formData.idDocument.name}
                  </Badge>
                )}
                {errors.idDocument && <p className="text-sm text-red-500">{errors.idDocument}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalDocuments">Additional Documents (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="additionalDocuments"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileChange("additionalDocuments", e.target.files?.[0] || null)}
                  />
                  <Upload className="h-4 w-4 text-gray-500" />
                </div>
                {formData.additionalDocuments && (
                  <Badge variant="secondary" className="mt-1">
                    {formData.additionalDocuments.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the terms and conditions and confirm that all information provided is accurate{" "}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted}</p>}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitStatus === "loading"}>
                {submitStatus === "loading" ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
