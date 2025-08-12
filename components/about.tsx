import { CheckCircle } from "lucide-react"

export default function About() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-navy-900 mb-6">About APMIH</h2>
            <p className="text-lg mb-6">
              The American Professional Management Institute of Hospitality (APMIH) is a premier educational institution
              dedicated to providing world-class certification programs for hospitality professionals.
            </p>
            <p className="text-lg mb-6">
              Founded by industry experts with decades of experience, APMIH offers specialized training and
              certification programs designed to meet the unique demands of the hospitality industry, with a particular
              focus on cruise ship operations.
            </p>
            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Accredited by leading hospitality industry associations</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Programs developed in collaboration with major cruise lines</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Expert instructors with extensive industry experience</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p>Flexible learning options including online and in-person courses</p>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <img src="/images/campus.jpeg" alt="APMIH Campus" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
