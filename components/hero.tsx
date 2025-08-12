import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative bg-navy-900 text-white">
      <div className="absolute inset-0 bg-[url('/images/hero-background.jpeg')] bg-cover bg-center opacity-20"></div>
      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            American Professional Management Institute of Hospitality
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl">
            Elevate your career with industry-recognized certifications across hospitality, business, IT, healthcare,
            and more.
          </p>
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="/certifications">Explore Certifications</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-navy-900"
              asChild
            >
              <Link href="/apply">Apply Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
