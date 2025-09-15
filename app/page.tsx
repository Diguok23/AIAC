import Header from "@/components/header"
import Hero from "@/components/hero"
import About from "@/components/about"
import Benefits from "@/components/benefits"
import Certifications from "@/components/certifications"
import Testimonials from "@/components/testimonials"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <Benefits />
        <Certifications />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
