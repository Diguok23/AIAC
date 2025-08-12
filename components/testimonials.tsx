import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Michael Johnson",
      role: "Food & Beverage Manager, Royal Caribbean",
      image: "/images/student-pair.jpeg",
      content:
        "The Food Safety & Sanitation certification from APMIH was instrumental in securing my position with Royal Caribbean. The curriculum was comprehensive and directly applicable to my daily responsibilities.",
      initials: "MJ",
    },
    {
      name: "Sarah Williams",
      role: "Guest Services Director, Norwegian Cruise Line",
      image: "/images/student-woman.jpeg",
      content:
        "After completing the Guest Services Excellence program, I was promoted within three months. The practical training and industry insights provided by APMIH are unmatched in the industry.",
      initials: "SW",
    },
    {
      name: "David Chen",
      role: "Hospitality Manager, Carnival Cruise Line",
      image: "/images/student-man.jpeg",
      content:
        "The Cruise Ship Hospitality Management certification gave me the competitive edge I needed. The instructors' real-world experience and connections helped me land my dream job.",
      initials: "DC",
    },
  ]

  return (
    <section id="testimonials" className="py-16 bg-navy-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Success Stories</h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-300">
            Hear from our graduates who have successfully advanced their careers in the cruise ship hospitality
            industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-navy-800 border-none">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="italic">{testimonial.content}</p>
              </CardContent>
              <CardFooter className="flex items-center gap-4 border-t border-navy-700 pt-4">
                <Avatar>
                  <AvatarImage src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-300">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
