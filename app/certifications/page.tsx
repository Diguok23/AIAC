import Header from "@/components/header"
import Footer from "@/components/footer"
import CertificationsPage from "@/components/certifications-page"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CertificationsPage />
      </main>
      <Footer />
    </div>
  )
}
