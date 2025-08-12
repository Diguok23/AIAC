import Header from "@/components/header"
import Hero from "@/components/hero"
import About from "@/components/about"
import Certifications from "@/components/certifications"
import Benefits from "@/components/benefits"
import Testimonials from "@/components/testimonials"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <Certifications />
        <Benefits />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
