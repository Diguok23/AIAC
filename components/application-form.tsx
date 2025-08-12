"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, CheckCircle2, Upload, X, FileText, FileImage, FileCheck, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { countries } from "@/lib/countries"

// Define certification data outside component to prevent re-creation on render
const certificationCategories = [
  { id: "cruise", name: "Cruise Ship & Hospitality Certifications" },
  { id: "executive", name: "Executive & Management Certifications" },
  { id: "business", name: "Business & Finance Certifications" },
  { id: "it", name: "Information Technology Certifications" },
  { id: "admin", name: "Administration & Leadership Certifications" },
  { id: "social", name: "Social Sciences & Education Certifications" },
  { id: "healthcare", name: "Healthcare & Wellness Certifications" },
  { id: "sales", name: "Sales, Marketing & Analytics Certifications" },
  { id: "training", name: "Training & Instruction Certifications" },
  { id: "frontline", name: "Line-Level & Frontline Certifications" },
]

const certificationPrograms = {
  cruise: [
    "Cruise Ship Hospitality Management",
    "Food Safety & Sanitation for Maritime Operations",
    "Maritime Security Management",
    "Guest Services Excellence",
    "Emergency Response & Crisis Management",
    "Hospitality Leadership Certification",
  ],
  executive: [
    "Certified Hotel Administrator (CHA)",
    "Certified Hospitality Manager (CHM)",
    "Certified Hospitality Facilities Executive (CHFE)",
    "Certified Food & Beverage Executive (CFBE)",
    "Certified Rooms Division Executive (CRDE)",
    "Executive Leadership Development",
    "Strategic Management Certification",
  ],
  business: [
    "Project Management Professional (PMP)",
    "Financial Management Certification",
    "Business Analysis Professional",
    "Supply Chain Management",
    "Risk Management Professional",
    "Human Resources Management",
    "Digital Marketing Specialist",
  ],
  it: [
    "Certified Information Systems Security Professional (CISSP)",
    "Certified Cloud Computing Specialist",
    "Data Science & Analytics",
    "Full Stack Web Development",
    "Network Administration",
    "Cybersecurity Specialist",
    "IT Service Management",
    "Database Administration",
  ],
  admin: [
    "Administrative Leadership",
    "Office Management Professional",
    "Executive Assistant Certification",
    "Operations Management",
    "Organizational Development",
    "Public Administration",
    "Nonprofit Management",
  ],
  social: [
    "Educational Leadership",
    "Counseling Psychology",
    "Social Work Professional",
    "Community Development",
    "Conflict Resolution",
    "Child Development Specialist",
    "Diversity & Inclusion Management",
  ],
  healthcare: [
    "Healthcare Administration",
    "Public Health Management",
    "Mental Health Professional",
    "Wellness Program Coordinator",
    "Healthcare Quality Management",
    "Patient Care Coordination",
    "Medical Office Management",
  ],
  sales: [
    "Certified Hospitality Sales Professional (CHSP)",
    "Certification in Hotel Industry Analytics (CHIA)",
    "Digital Marketing Specialist",
    "Customer Relationship Management",
    "Sales Leadership",
    "Market Research Analyst",
  ],
  training: [
    "Certified Hospitality Instructor (CHI)",
    "Certified Hospitality Department Trainer (CHDT)",
    "Corporate Training Specialist",
    "E-Learning Development",
    "Instructional Design",
    "Training Program Management",
  ],
  frontline: [
    "Certified Hospitality Supervisor (CHS)",
    "Certified Guest Service Professional (CGSP)",
    "Certified Breakfast Attendant",
    "Certified Front Desk Representative",
    "Certified Guestroom Attendant",
    "Certified Kitchen Cook",
    "Certified Restaurant Server",
    "Customer Service Excellence",
  ],
}

export default function ApplicationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState("")
  const [submissionError, setSubmissionError] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [errors, setErrors] = useState({})

  // Initialize form data with empty values
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    // Program Selection
    programCategory: "",
    programName: "",
    startDate: "",
    studyMode: "online",

    // Education & Experience
    highestEducation: "",
    previousCertifications: "",
    yearsExperience: "",
    currentEmployer: "",
    currentPosition: "",

    // Additional Information
    heardAbout: "",
    questions: "",
    agreeToTerms: false,
  })

  // Separate state for file uploads to avoid complex state updates
  const [identificationFiles, setIdentificationFiles] = useState([])
  const [academicFiles, setAcademicFiles] = useState([])
  const [additionalFiles, setAdditionalFiles] = useState([])

  // Use a ref to track if the component is mounted
  // const isMounted = useRef(true)

  // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     isMounted.current = false
  //   }
  // }, [])

  // Update form data when searchParams are available - only once on mount
  useEffect(() => {
    const category = searchParams?.get("category")
    const program = searchParams?.get("program")

    if (category || program) {
      setFormData((prevData) => ({
        ...prevData,
        programCategory: category || prevData.programCategory,
        programName: program || prevData.programName,
      }))
    }
  }, [searchParams])

  // Memoized handlers to prevent recreation on each render
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field if it exists
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }))
  }, [])

  const handleSelectChange = useCallback((name, value) => {
    setFormData((prev) => {
      // Special handling for program category changes
      if (name === "programCategory") {
        return {
          ...prev,
          [name]: value,
          programName: "", // Reset program name when category changes
        }
      }
      return {
        ...prev,
        [name]: value,
      }
    })

    // Clear error for this field if it exists
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }))
  }, [])

  const handleCheckboxChange = useCallback((name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))

    // Clear error for this field if it exists
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }))
  }, [])

  // Simplified file upload handling without progress simulation
  const handleFileUpload = useCallback((type, e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Clear any previous upload errors
    setUploadError("")

    // Check file sizes
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024) // 5MB limit
    if (oversizedFiles.length > 0) {
      setUploadError("One or more files exceed the 5MB size limit. Please upload smaller files.")
      return
    }

    // Check file types
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      setUploadError("Only PDF, JPEG, and PNG files are allowed.")
      return
    }

    // Update the appropriate file state
    switch (type) {
      case "identification":
        setIdentificationFiles((prev) => [...prev, ...files])
        break
      case "academic":
        setAcademicFiles((prev) => [...prev, ...files])
        break
      case "additional":
        setAdditionalFiles((prev) => [...prev, ...files])
        break
    }
  }, [])

  const removeFile = useCallback((type, index) => {
    switch (type) {
      case "identification":
        setIdentificationFiles((prev) => prev.filter((_, i) => i !== index))
        break
      case "academic":
        setAcademicFiles((prev) => prev.filter((_, i) => i !== index))
        break
      case "additional":
        setAdditionalFiles((prev) => prev.filter((_, i) => i !== index))
        break
    }
  }, [])

  const validateStep = useCallback(
    (step) => {
      const newErrors = {}

      if (step === 1) {
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
        if (!formData.address.trim()) newErrors.address = "Address is required"
        if (!formData.city.trim()) newErrors.city = "City is required"
        if (!formData.state.trim()) newErrors.state = "State/Province is required"
        if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP/Postal code is required"
        if (!formData.country) newErrors.country = "Country is required"
      } else if (step === 2) {
        if (!formData.programCategory) newErrors.programCategory = "Program category is required"
        if (!formData.programName) newErrors.programName = "Program name is required"
        if (!formData.startDate) newErrors.startDate = "Preferred start date is required"
        if (!formData.studyMode) newErrors.studyMode = "Study mode is required"
      } else if (step === 3) {
        if (!formData.highestEducation) newErrors.highestEducation = "Highest education is required"
        if (!formData.yearsExperience) newErrors.yearsExperience = "Years of experience is required"
      } else if (step === 4) {
        if (identificationFiles.length === 0) {
          newErrors.identificationDocuments = "At least one identification document is required"
        }
      } else if (step === 5) {
        if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions"
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [formData, identificationFiles.length],
  )

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }, [currentStep, validateStep])

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!validateStep(currentStep)) {
        return
      }

      setIsSubmitting(true)
      setSubmissionError("")

      try {
        // Create a FormData object to send files and form data
        const submitFormData = new FormData()

        // Add all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          submitFormData.append(key, value)
        })

        // Add document files to FormData
        identificationFiles.forEach((file) => {
          submitFormData.append("identificationDocuments", file)
        })

        academicFiles.forEach((file) => {
          submitFormData.append("academicDocuments", file)
        })

        additionalFiles.forEach((file) => {
          submitFormData.append("additionalDocuments", file)
        })

        // Submit the form data to our API route
        const response = await fetch("/api/submit-application", {
          method: "POST",
          body: submitFormData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to submit application")
        }

        // Store the application ID for reference
        const appId = result.applicationId || Math.random().toString(36).substring(2, 10).toUpperCase()
        setApplicationId(appId)

        // Show success message
        setFormSubmitted(true)
        window.scrollTo(0, 0)
      } catch (error) {
        console.error("Error submitting application:", error)
        setSubmissionError(error.message || "An error occurred while submitting your application. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentStep, formData, identificationFiles, academicFiles, additionalFiles, validateStep],
  )

  // Success view
  if (formSubmitted) {
    return (
      <div className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center text-xl sm:text-2xl">Application Submitted Successfully!</CardTitle>
              <CardDescription className="text-center text-base sm:text-lg">
                Thank you for applying to the American Professional Management Institute of Hospitality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <p className="text-center text-sm sm:text-base">
                Your application for the <strong>{formData.programName}</strong> program has been received. We will
                review your application and contact you at <strong>{formData.email}</strong> with further instructions.
              </p>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Application Reference</h3>
                <p className="text-sm sm:text-base">
                  Application ID: <span className="font-mono">{applicationId}</span>
                </p>
                <p className="text-sm sm:text-base">Submitted on: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-medium text-sm sm:text-base">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base">
                  <li>Our admissions team will review your application (1-3 business days)</li>
                  <li>Proceed to payment to complete your application process</li>
                  <li>Once payment is confirmed, you will receive access to your program materials</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={() => router.push(`/payment?applicationId=${applicationId}`)}
                className="w-full sm:w-auto"
              >
                Proceed to Payment
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="w-full sm:w-auto">
                Return to Homepage
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Step {currentStep} of 5</div>
              <div className="text-xs sm:text-sm font-medium">{Math.round((currentStep / 5) * 100)}% Complete</div>
            </div>
            <Progress value={(currentStep / 5) * 100} className="h-2" />

            <CardTitle className="mt-4 sm:mt-6 text-lg sm:text-xl">
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Program Selection"}
              {currentStep === 3 && "Education & Experience"}
              {currentStep === 4 && "Document Upload"}
              {currentStep === 5 && "Review & Submit"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {currentStep === 1 && "Please provide your personal details"}
              {currentStep === 2 && "Select the certification program you wish to apply for"}
              {currentStep === 3 && "Tell us about your educational background and work experience"}
              {currentStep === 4 && "Upload required documents for your application"}
              {currentStep === 5 && "Review your information and submit your application"}
            </CardDescription>
          </CardHeader>

          {submissionError && (
            <div className="px-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submissionError}</AlertDescription>
              </Alert>
            </div>
          )}

          {uploadError && (
            <div className="px-6 pt-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            </div>
          )}

          <CardContent>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={errors.dateOfBirth ? "border-red-500" : ""}
                    />
                    {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">
                        State/Province <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={errors.state ? "border-red-500" : ""}
                      />
                      {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">
                        ZIP/Postal Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={errors.zipCode ? "border-red-500" : ""}
                      />
                      {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">
                        Country <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                        <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
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
                </div>
              )}

              {/* Step 2: Program Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="programCategory">
                      Program Category <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Select
                        value={formData.programCategory}
                        onValueChange={(value) => handleSelectChange("programCategory", value)}
                      >
                        <SelectTrigger className={errors.programCategory ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {certificationCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.programCategory && (
                        <div className="absolute right-12 top-2.5 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {formData.programCategory}
                        </div>
                      )}
                    </div>
                    {errors.programCategory && <p className="text-sm text-red-500">{errors.programCategory}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="programName">
                      Program Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.programName}
                      onValueChange={(value) => handleSelectChange("programName", value)}
                      disabled={!formData.programCategory}
                    >
                      <SelectTrigger className={errors.programName ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.programCategory &&
                          certificationPrograms[formData.programCategory]?.map((program) => (
                            <SelectItem key={program} value={program}>
                              {program}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.programName && <p className="text-sm text-red-500">{errors.programName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Preferred Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={errors.startDate ? "border-red-500" : ""}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Study Mode <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.studyMode}
                      onValueChange={(value) => handleSelectChange("studyMode", value)}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="cursor-pointer">
                          Online
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inperson" id="inperson" />
                        <Label htmlFor="inperson" className="cursor-pointer">
                          In-Person
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hybrid" id="hybrid" />
                        <Label htmlFor="hybrid" className="cursor-pointer">
                          Hybrid (Online & In-Person)
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.studyMode && <p className="text-sm text-red-500">{errors.studyMode}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Education & Experience */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="highestEducation">
                      Highest Level of Education <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.highestEducation}
                      onValueChange={(value) => handleSelectChange("highestEducation", value)}
                    >
                      <SelectTrigger className={errors.highestEducation ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high_school">High School Diploma</SelectItem>
                        <SelectItem value="associate">Associate's Degree</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="doctorate">Doctorate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.highestEducation && <p className="text-sm text-red-500">{errors.highestEducation}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previousCertifications">Previous Certifications (if any)</Label>
                    <Textarea
                      id="previousCertifications"
                      name="previousCertifications"
                      value={formData.previousCertifications}
                      onChange={handleInputChange}
                      placeholder="List any relevant certifications you currently hold"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">
                      Years of Experience in Hospitality <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.yearsExperience}
                      onValueChange={(value) => handleSelectChange("yearsExperience", value)}
                    >
                      <SelectTrigger className={errors.yearsExperience ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No experience</SelectItem>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">More than 10 years</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.yearsExperience && <p className="text-sm text-red-500">{errors.yearsExperience}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentEmployer">Current Employer (if applicable)</Label>
                    <Input
                      id="currentEmployer"
                      name="currentEmployer"
                      value={formData.currentEmployer}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPosition">Current Position (if applicable)</Label>
                    <Input
                      id="currentPosition"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Document Upload */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Please upload clear, legible copies of all required documents. Acceptable formats include PDF,
                      JPG, and PNG.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        Identification Documents <span className="text-red-500">*</span>
                        <span className="text-sm text-muted-foreground block mt-1">
                          (Passport, Driver's License, or Government-issued ID)
                        </span>
                      </Label>

                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <label
                            htmlFor="identification-upload"
                            className="flex flex-col items-center cursor-pointer w-full"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium">Click to upload identification documents</span>
                            <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max 5MB)</span>
                            <input
                              id="identification-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              multiple
                              onChange={(e) => handleFileUpload("identification", e)}
                            />
                          </label>
                        </div>

                        {identificationFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label>Uploaded Documents:</Label>
                            <div className="space-y-2">
                              {identificationFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <div className="flex items-center">
                                    <FileImage className="h-5 w-5 text-gray-500 mr-2" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile("identification", index)}
                                    className="h-8 w-8 p-0"
                                    type="button"
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {errors.identificationDocuments && (
                          <p className="text-sm text-red-500">{errors.identificationDocuments}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Academic Documents
                        <span className="text-sm text-muted-foreground block mt-1">
                          (Diplomas, Transcripts, Certificates)
                        </span>
                      </Label>

                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <label htmlFor="academic-upload" className="flex flex-col items-center cursor-pointer w-full">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium">Click to upload academic documents</span>
                            <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max 5MB)</span>
                            <input
                              id="academic-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              multiple
                              onChange={(e) => handleFileUpload("academic", e)}
                            />
                          </label>
                        </div>

                        {academicFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label>Uploaded Documents:</Label>
                            <div className="space-y-2">
                              {academicFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile("academic", index)}
                                    className="h-8 w-8 p-0"
                                    type="button"
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Additional Documents
                        <span className="text-sm text-muted-foreground block mt-1">
                          (Resume/CV, Reference Letters, Work Samples)
                        </span>
                      </Label>

                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <label
                            htmlFor="additional-upload"
                            className="flex flex-col items-center cursor-pointer w-full"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium">Click to upload additional documents</span>
                            <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max 5MB)</span>
                            <input
                              id="additional-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              multiple
                              onChange={(e) => handleFileUpload("additional", e)}
                            />
                          </label>
                        </div>

                        {additionalFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label>Uploaded Documents:</Label>
                            <div className="space-y-2">
                              {additionalFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <div className="flex items-center">
                                    <FileCheck className="h-5 w-5 text-gray-500 mr-2" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile("additional", index)}
                                    className="h-8 w-8 p-0"
                                    type="button"
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {formData.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {formData.phone}
                        </div>
                        <div>
                          <span className="font-medium">Date of Birth:</span> {formData.dateOfBirth}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="font-medium">Address:</span> {formData.address}, {formData.city},{" "}
                          {formData.state} {formData.zipCode}, {formData.country}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Program Selection</h3>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div className="sm:col-span-2">
                          <span className="font-medium">Program:</span> {formData.programName}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {certificationCategories.find((cat) => cat.id === formData.programCategory)?.name}
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span> {formData.startDate}
                        </div>
                        <div>
                          <span className="font-medium">Study Mode:</span>{" "}
                          {formData.studyMode.charAt(0).toUpperCase() + formData.studyMode.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Education & Experience</h3>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                          <span className="font-medium">Highest Education:</span>{" "}
                          {{
                            high_school: "High School Diploma",
                            associate: "Associate's Degree",
                            bachelor: "Bachelor's Degree",
                            master: "Master's Degree",
                            doctorate: "Doctorate",
                            other: "Other",
                          }[formData.highestEducation] || formData.highestEducation}
                        </div>
                        <div>
                          <span className="font-medium">Years of Experience:</span> {formData.yearsExperience}
                        </div>
                        {formData.currentEmployer && (
                          <div>
                            <span className="font-medium">Current Employer:</span> {formData.currentEmployer}
                          </div>
                        )}
                        {formData.currentPosition && (
                          <div>
                            <span className="font-medium">Current Position:</span> {formData.currentPosition}
                          </div>
                        )}
                        {formData.previousCertifications && (
                          <div className="sm:col-span-2">
                            <span className="font-medium">Previous Certifications:</span>{" "}
                            {formData.previousCertifications}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Uploaded Documents</h3>
                      <div className="mt-2 grid grid-cols-1 gap-y-2 text-sm">
                        <div>
                          <span className="font-medium">Identification Documents:</span> {identificationFiles.length}{" "}
                          file(s)
                        </div>
                        <div>
                          <span className="font-medium">Academic Documents:</span> {academicFiles.length} file(s)
                        </div>
                        <div>
                          <span className="font-medium">Additional Documents:</span> {additionalFiles.length} file(s)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heardAbout">How did you hear about us?</Label>
                    <Select
                      value={formData.heardAbout}
                      onValueChange={(value) => handleSelectChange("heardAbout", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="search">Search Engine</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="friend">Friend or Colleague</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                        <SelectItem value="event">Event or Conference</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questions">Questions or Comments</Label>
                    <Textarea
                      id="questions"
                      name="questions"
                      value={formData.questions}
                      onChange={handleInputChange}
                      placeholder="Any additional information you'd like to share with us"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleCheckboxChange("agreeToTerms", checked)}
                      className={errors.agreeToTerms ? "border-red-500" : ""}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="agreeToTerms"
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          errors.agreeToTerms ? "text-red-500" : ""
                        }`}
                      >
                        I agree to the terms and conditions <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        By checking this box, you agree to our{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </p>
                      {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious} type="button">
                Previous
              </Button>
            )}
            {currentStep < 5 ? (
              <Button onClick={handleNext} className={currentStep === 1 ? "w-full sm:w-auto" : ""} type="button">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} type="button">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
