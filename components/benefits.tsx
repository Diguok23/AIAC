import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Globe, Award, Clock, DollarSign, Briefcase } from "lucide-react"

export default function Benefits() {
  const benefits = [
    {
      title: "Professional Growth",
      description:
        "IIHM credentials are valued by leading cruise and hospitality brands, giving you a strong advantage for promotions and higher-level roles.",
      icon: <TrendingUp className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Worldwide Credibility",
      description:
        "IIHM certifications hold global recognition, enabling you to pursue exciting hospitality opportunities across international cruise fleets.",
      icon: <Globe className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Cruise Industry Mastery",
      description:
        "Develop advanced, industry-focused skills designed specifically for the fast-paced and unique world of cruise hospitality.",
      icon: <Award className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Learn Your Way",
      description:
        "Select from flexible study formats—including online, blended, or on-campus training—to suit your lifestyle and pace.",
      icon: <Clock className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Higher Earning Potential",
      description:
        "Graduates with IIHM certifications often secure better-paying roles, earning more than non-certified staff in similar positions.",
      icon: <DollarSign className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Job Placement Assistance",
      description:
        "Our dedicated placement team partners with major cruise lines to connect IIHM graduates with rewarding and long-term career opportunities.",
      icon: <Briefcase className="h-8 w-8 text-navy-900" />,
    },
  ]

  return (
    <section id="benefits" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900">Benefits of IIHM Certification</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our certification programs provide valuable skills and opportunities for professionals pursuing successful careers in cruise ship hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-t-4 border-amber-500">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full">{benefit.icon}</div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
