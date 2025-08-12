import Header from "@/components/header"
import Footer from "@/components/footer"
import ApplicationForm from "@/components/application-form"
import { Suspense } from "react"

export const metadata = {
  title: "Apply Now | American Professional Management Institute of Hospitality",
  description: "Apply for certification programs at the American Professional Management Institute of Hospitality.",
}

export default function Apply() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-navy-900 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Application Form</h1>
            <p className="text-xl max-w-3xl">
              Complete the form below to apply for certification programs at the American Professional Management
              Institute of Hospitality.
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="py-16 text-center">Loading application form...</div>}>
          <ApplicationForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
