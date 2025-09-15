import Header from "@/components/header"
import Footer from "@/components/footer"
import CertificationsPage from "@/components/certifications-page"

export default function Certifications() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <CertificationsPage />
      </main>
      <Footer />
    </div>
  )
}
