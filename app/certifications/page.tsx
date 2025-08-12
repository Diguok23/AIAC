import Header from "@/components/header"
import Footer from "@/components/footer"
import CertificationsPage from "@/components/certifications-page"

export const metadata = {
  title: "Certifications | American Professional Management Institute of Hospitality",
  description:
    "Explore our comprehensive range of hospitality certifications for cruise ships and the hospitality industry.",
}

export default function Certifications() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-navy-900 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Professional Certifications</h1>
            <p className="text-xl max-w-3xl">
              Explore our comprehensive range of industry-recognized certifications designed for hospitality
              professionals at all career levels.
            </p>
          </div>
        </div>
        <CertificationsPage />
      </main>
      <Footer />
    </div>
  )
}
