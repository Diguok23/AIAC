import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function Contact() {
  return (
    <section id="contact" className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Contact Us</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Need more information about our certification courses? Contact our admissions specialists today..
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <form className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium">
                    First Name
                  </label>
                  <Input id="first-name" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input id="last-name" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" type="email" placeholder="john.doe@example.com" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input id="phone" type="tel" placeholder="(216) 46-7770" />
              </div>

              <div className="space-y-2">
                <label htmlFor="program" className="text-sm font-medium">
                  Program of Interest
                </label>
                <select
                  id="program"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a program</option>
                  <option value="cruise-ship-hospitality">Cruise Ship Hospitality Management</option>
                  <option value="food-safety">Food Safety & Sanitation</option>
                  <option value="maritime-security">Maritime Security Management</option>
                  <option value="guest-services">Guest Services Excellence</option>
                  <option value="emergency-response">Emergency Response & Crisis Management</option>
                  <option value="leadership">Hospitality Leadership Certification</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Please provide any additional information or questions..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Inquiry
              </Button>
            </form>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        353 Harbor Boulevard
                        <br />
                        Miami, FL 33132
                        <br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Toll-Free: +122345678234567
                        <br />
                        International: +1 (305) 23456789
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Admissions: applications@iihminstitute.com
                        <br />
                        General Inquiries: info@iihminstitute.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Office Hours</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Monday - Friday: 9:00 AM - 5:00 PM EST
                        <br />
                        Saturday: 10:00 AM - 2:00 PM EST
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="h-[250px] sm:h-[300px] bg-gray-200 rounded-lg overflow-hidden">
              {/* This would be replaced with an actual map component */}
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <p className="text-gray-600">Interactive Map Would Be Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
