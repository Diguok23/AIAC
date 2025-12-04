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
      <main className="flex-grow">
        <Suspense fallback={<div className="py-16 text-center">Loading application form...</div>}>
          <ApplicationForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
