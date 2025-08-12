import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Globe, Award, Clock, DollarSign, Briefcase } from "lucide-react"

export default function Benefits() {
  const benefits = [
    {
      title: "Career Advancement",
      description:
        "Our certifications are recognized by major cruise lines worldwide, opening doors to career advancement and higher-paying positions.",
      icon: <TrendingUp className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Global Recognition",
      description:
        "APMIH certifications are internationally recognized, allowing you to work on cruise ships around the world.",
      icon: <Globe className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Industry-Specific Expertise",
      description:
        "Gain specialized knowledge and skills specifically tailored to the unique environment of cruise ship hospitality.",
      icon: <Award className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Flexible Learning",
      description:
        "Choose from online, hybrid, or in-person learning options to fit your schedule and learning preferences.",
      icon: <Clock className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Competitive Salary",
      description:
        "Certified professionals earn significantly higher salaries compared to non-certified counterparts in the cruise industry.",
      icon: <DollarSign className="h-8 w-8 text-navy-900" />,
    },
    {
      title: "Job Placement Assistance",
      description:
        "Our career services team works directly with major cruise lines to help place our graduates in rewarding positions.",
      icon: <Briefcase className="h-8 w-8 text-navy-900" />,
    },
  ]

  return (
    <section id="benefits" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900">Benefits of APMIH Certification</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our certifications provide numerous advantages for professionals seeking careers in the cruise ship
            hospitality industry.
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
