import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create admin client with service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if we already have certifications
    const { data: existingCerts, error: countError } = await supabase.from("certifications").select("id").limit(1)

    if (countError && countError.code !== "42P01") {
      throw countError
    }

    // If we already have certifications, don't seed again
    if (existingCerts && existingCerts.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Certifications already exist, skipping seed",
        count: existingCerts.length,
      })
    }

    // Comprehensive certification data - 130+ certifications
    const certifications = [
      // Cruise Ship & Maritime Certifications (25 programs)
      {
        title: "Cruise Ship Hospitality Management",
        description:
          "Comprehensive training in managing hospitality services aboard cruise ships, including guest relations, service standards, and team leadership in maritime environments.",
        category: "cruise",
        level: "Advanced",
        price: 165,
        slug: "cruise-ship-hospitality-management",
      },
      {
        title: "Maritime Food Safety & Sanitation",
        description:
          "Specialized certification in food safety protocols and sanitation standards specific to maritime environments and cruise operations, ensuring compliance with international health regulations.",
        category: "cruise",
        level: "Intermediate",
        price: 120,
        slug: "maritime-food-safety-sanitation",
      },
      {
        title: "Cruise Ship Security Management",
        description:
          "Training in security protocols, risk assessment, and emergency procedures for cruise ship personnel and maritime security operations.",
        category: "cruise",
        level: "Advanced",
        price: 150,
        slug: "cruise-ship-security-management",
      },
      {
        title: "Guest Services Excellence for Cruise Ships",
        description:
          "Focused training on delivering exceptional guest experiences, handling complaints, and exceeding customer expectations in cruise environments.",
        category: "cruise",
        level: "All Levels",
        price: 95,
        slug: "cruise-guest-services-excellence",
      },
      {
        title: "Maritime Emergency Response & Crisis Management",
        description:
          "Comprehensive training in emergency protocols, crisis management, and passenger safety procedures for cruise operations.",
        category: "cruise",
        level: "Intermediate",
        price: 135,
        slug: "maritime-emergency-response",
      },
      {
        title: "Cruise Ship Entertainment Coordination",
        description:
          "Training in planning, coordinating, and managing entertainment programs and activities aboard cruise ships.",
        category: "cruise",
        level: "Intermediate",
        price: 125,
        slug: "cruise-entertainment-coordination",
      },
      {
        title: "Maritime Environmental Management",
        description:
          "Certification in environmental compliance, waste management, and sustainability practices for cruise operations.",
        category: "cruise",
        level: "Advanced",
        price: 140,
        slug: "maritime-environmental-management",
      },
      {
        title: "Cruise Ship Revenue Management",
        description:
          "Advanced training in revenue optimization, pricing strategies, and financial management for cruise operations.",
        category: "cruise",
        level: "Advanced",
        price: 155,
        slug: "cruise-revenue-management",
      },
      {
        title: "Maritime Communications & Languages",
        description:
          "Specialized training in maritime communications, international protocols, and multilingual guest services.",
        category: "cruise",
        level: "Intermediate",
        price: 110,
        slug: "maritime-communications-languages",
      },
      {
        title: "Cruise Ship Spa & Wellness Management",
        description:
          "Comprehensive training in managing spa services, wellness programs, and health facilities aboard cruise ships.",
        category: "cruise",
        level: "Intermediate",
        price: 130,
        slug: "cruise-spa-wellness-management",
      },
      {
        title: "Maritime Port Operations & Logistics",
        description:
          "Training in port procedures, logistics coordination, and shore excursion management for cruise operations.",
        category: "cruise",
        level: "Intermediate",
        price: 125,
        slug: "maritime-port-operations",
      },
      {
        title: "Cruise Ship Retail Management",
        description:
          "Specialized certification in managing onboard retail operations, inventory control, and sales optimization.",
        category: "cruise",
        level: "Intermediate",
        price: 115,
        slug: "cruise-retail-management",
      },
      {
        title: "Maritime Medical & Health Services",
        description:
          "Training in providing medical services, health protocols, and emergency medical care in maritime environments.",
        category: "cruise",
        level: "Advanced",
        price: 175,
        slug: "maritime-medical-health-services",
      },
      {
        title: "Cruise Ship Casino Operations",
        description:
          "Comprehensive training in casino management, gaming regulations, and responsible gambling practices for cruise ships.",
        category: "cruise",
        level: "Intermediate",
        price: 135,
        slug: "cruise-casino-operations",
      },
      {
        title: "Maritime Cultural Sensitivity & Diversity",
        description:
          "Training in cultural awareness, diversity management, and international guest relations for cruise professionals.",
        category: "cruise",
        level: "All Levels",
        price: 100,
        slug: "maritime-cultural-sensitivity",
      },
      {
        title: "Cruise Ship Photography & Media Services",
        description:
          "Specialized training in photography services, media production, and digital content creation for cruise operations.",
        category: "cruise",
        level: "Intermediate",
        price: 120,
        slug: "cruise-photography-media",
      },
      {
        title: "Maritime Housekeeping & Cabin Management",
        description:
          "Comprehensive training in housekeeping operations, cabin services, and quality standards for cruise ships.",
        category: "cruise",
        level: "Entry-Level",
        price: 85,
        slug: "maritime-housekeeping-cabin",
      },
      {
        title: "Cruise Ship Youth & Family Programs",
        description:
          "Training in developing and managing youth programs, family activities, and childcare services aboard cruise ships.",
        category: "cruise",
        level: "Intermediate",
        price: 115,
        slug: "cruise-youth-family-programs",
      },
      {
        title: "Maritime Culinary Arts & Food Service",
        description:
          "Advanced culinary training specific to maritime environments, including menu planning and large-scale food production.",
        category: "cruise",
        level: "Advanced",
        price: 160,
        slug: "maritime-culinary-arts",
      },
      {
        title: "Cruise Ship Bar & Beverage Management",
        description:
          "Comprehensive training in beverage operations, bar management, and responsible alcohol service for cruise ships.",
        category: "cruise",
        level: "Intermediate",
        price: 125,
        slug: "cruise-bar-beverage-management",
      },
      {
        title: "Maritime Safety Officer Certification",
        description:
          "Advanced certification for safety officers, including safety protocols, risk assessment, and emergency response coordination.",
        category: "cruise",
        level: "Advanced",
        price: 180,
        slug: "maritime-safety-officer",
      },
      {
        title: "Cruise Ship Shore Excursion Management",
        description:
          "Training in planning, coordinating, and managing shore excursions and destination experiences for cruise passengers.",
        category: "cruise",
        level: "Intermediate",
        price: 130,
        slug: "cruise-shore-excursion-management",
      },
      {
        title: "Maritime Technology & Digital Systems",
        description:
          "Training in maritime technology systems, digital operations, and technology integration for cruise operations.",
        category: "cruise",
        level: "Advanced",
        price: 145,
        slug: "maritime-technology-digital",
      },
      {
        title: "Cruise Ship Guest Relations Management",
        description:
          "Advanced training in guest relations, complaint resolution, and customer satisfaction management for cruise operations.",
        category: "cruise",
        level: "Advanced",
        price: 140,
        slug: "cruise-guest-relations-management",
      },
      {
        title: "Maritime Leadership & Team Management",
        description:
          "Comprehensive leadership training for maritime professionals, focusing on team management and operational excellence.",
        category: "cruise",
        level: "Advanced",
        price: 165,
        slug: "maritime-leadership-team-management",
      },

      // Executive & Management Certifications (20 programs)
      {
        title: "Certified Hotel Administrator (CHA)",
        description:
          "Premier certification for hotel general managers and hospitality executives, covering all aspects of hotel operations and management.",
        category: "executive",
        level: "Executive",
        price: 165,
        slug: "certified-hotel-administrator",
      },
      {
        title: "Certified Hospitality Manager (CHM)",
        description:
          "Comprehensive certification for hospitality managers focusing on leadership, operations, and strategic management.",
        category: "executive",
        level: "Advanced",
        price: 150,
        slug: "certified-hospitality-manager",
      },
      {
        title: "Certified Hospitality Facilities Executive (CHFE)",
        description:
          "Specialized certification for executives responsible for facilities management in hospitality settings.",
        category: "executive",
        level: "Executive",
        price: 145,
        slug: "certified-hospitality-facilities-executive",
      },
      {
        title: "Certified Food & Beverage Executive (CFBE)",
        description:
          "Advanced certification for food and beverage directors and executives in the hospitality industry.",
        category: "executive",
        level: "Executive",
        price: 160,
        slug: "certified-food-beverage-executive",
      },
      {
        title: "Certified Rooms Division Executive (CRDE)",
        description:
          "Specialized certification for executives managing rooms division operations in hotels and resorts.",
        category: "executive",
        level: "Executive",
        price: 155,
        slug: "certified-rooms-division-executive",
      },
      {
        title: "Executive Leadership Development",
        description:
          "Comprehensive program for developing executive leadership skills, strategic thinking, and organizational management capabilities.",
        category: "executive",
        level: "Executive",
        price: 175,
        slug: "executive-leadership-development",
      },
      {
        title: "Strategic Hospitality Management",
        description:
          "Advanced certification in strategic planning, business development, and organizational leadership for hospitality executives.",
        category: "executive",
        level: "Executive",
        price: 170,
        slug: "strategic-hospitality-management",
      },
      {
        title: "Hospitality Finance & Revenue Management",
        description:
          "Executive-level training in financial management, revenue optimization, and profitability analysis for hospitality operations.",
        category: "executive",
        level: "Executive",
        price: 165,
        slug: "hospitality-finance-revenue-management",
      },
      {
        title: "Global Hospitality Operations Management",
        description:
          "Advanced certification for executives managing multi-property or international hospitality operations.",
        category: "executive",
        level: "Executive",
        price: 180,
        slug: "global-hospitality-operations",
      },
      {
        title: "Hospitality Brand Management & Marketing",
        description:
          "Executive certification in brand strategy, marketing leadership, and customer experience management.",
        category: "executive",
        level: "Executive",
        price: 170,
        slug: "hospitality-brand-management",
      },
      {
        title: "Hospitality Human Resources Executive",
        description:
          "Advanced HR management certification for hospitality executives, covering talent management and organizational development.",
        category: "executive",
        level: "Executive",
        price: 160,
        slug: "hospitality-hr-executive",
      },
      {
        title: "Hospitality Technology Leadership",
        description:
          "Executive certification in technology strategy, digital transformation, and innovation management for hospitality.",
        category: "executive",
        level: "Executive",
        price: 175,
        slug: "hospitality-technology-leadership",
      },
      {
        title: "Sustainable Hospitality Management",
        description:
          "Executive training in sustainability practices, environmental management, and corporate social responsibility.",
        category: "executive",
        level: "Executive",
        price: 155,
        slug: "sustainable-hospitality-management",
      },
      {
        title: "Hospitality Crisis Management & Risk Assessment",
        description:
          "Advanced certification in crisis management, risk assessment, and business continuity planning for hospitality executives.",
        category: "executive",
        level: "Executive",
        price: 165,
        slug: "hospitality-crisis-management",
      },
      {
        title: "International Hospitality Development",
        description:
          "Executive certification in international expansion, market development, and cross-cultural management.",
        category: "executive",
        level: "Executive",
        price: 185,
        slug: "international-hospitality-development",
      },
      {
        title: "Hospitality Investment & Asset Management",
        description:
          "Advanced training in hospitality investment analysis, asset management, and portfolio optimization.",
        category: "executive",
        level: "Executive",
        price: 190,
        slug: "hospitality-investment-asset-management",
      },
      {
        title: "Luxury Hospitality Management",
        description:
          "Specialized executive certification for luxury hotel and resort management, focusing on premium service delivery.",
        category: "executive",
        level: "Executive",
        price: 195,
        slug: "luxury-hospitality-management",
      },
      {
        title: "Hospitality Mergers & Acquisitions",
        description:
          "Executive training in M&A strategy, due diligence, and integration management for hospitality companies.",
        category: "executive",
        level: "Executive",
        price: 200,
        slug: "hospitality-mergers-acquisitions",
      },
      {
        title: "Hospitality Innovation & Entrepreneurship",
        description:
          "Executive certification in innovation management, entrepreneurship, and new business development in hospitality.",
        category: "executive",
        level: "Executive",
        price: 180,
        slug: "hospitality-innovation-entrepreneurship",
      },
      {
        title: "Hospitality Performance Management",
        description:
          "Advanced certification in performance measurement, KPI management, and operational excellence for hospitality executives.",
        category: "executive",
        level: "Executive",
        price: 165,
        slug: "hospitality-performance-management",
      },

      // Business & Finance Certifications (15 programs)
      {
        title: "Project Management Professional (PMP)",
        description:
          "Internationally recognized certification for project management professionals across all industries.",
        category: "business",
        level: "Advanced",
        price: 180,
        slug: "project-management-professional",
      },
      {
        title: "Financial Management Certification",
        description:
          "Comprehensive training in financial planning, analysis, budgeting, and financial decision-making.",
        category: "business",
        level: "Advanced",
        price: 165,
        slug: "financial-management-certification",
      },
      {
        title: "Business Analysis Professional",
        description:
          "Certification for professionals who analyze business needs and develop solutions to business problems.",
        category: "business",
        level: "Intermediate",
        price: 150,
        slug: "business-analysis-professional",
      },
      {
        title: "Supply Chain Management",
        description:
          "Specialized certification in managing the flow of goods and services, including procurement, logistics, and distribution.",
        category: "business",
        level: "Intermediate",
        price: 145,
        slug: "supply-chain-management",
      },
      {
        title: "Risk Management Professional",
        description:
          "Training in identifying, assessing, and controlling threats to an organization's capital and earnings.",
        category: "business",
        level: "Advanced",
        price: 155,
        slug: "risk-management-professional",
      },
      {
        title: "Human Resources Management",
        description:
          "Comprehensive certification in HR practices, employee relations, talent acquisition, and workforce development.",
        category: "business",
        level: "Intermediate",
        price: 140,
        slug: "human-resources-management",
      },
      {
        title: "Business Intelligence & Analytics",
        description:
          "Advanced certification in business intelligence tools, data analytics, and decision support systems.",
        category: "business",
        level: "Advanced",
        price: 170,
        slug: "business-intelligence-analytics",
      },
      {
        title: "Corporate Finance & Investment",
        description:
          "Specialized training in corporate finance, investment analysis, and capital structure management.",
        category: "business",
        level: "Advanced",
        price: 175,
        slug: "corporate-finance-investment",
      },
      {
        title: "International Business Management",
        description: "Certification in global business practices, international trade, and cross-cultural management.",
        category: "business",
        level: "Advanced",
        price: 160,
        slug: "international-business-management",
      },
      {
        title: "Quality Management & Six Sigma",
        description:
          "Comprehensive training in quality management systems, process improvement, and Six Sigma methodologies.",
        category: "business",
        level: "Advanced",
        price: 155,
        slug: "quality-management-six-sigma",
      },
      {
        title: "Business Process Management",
        description: "Certification in process analysis, optimization, and business process reengineering.",
        category: "business",
        level: "Intermediate",
        price: 145,
        slug: "business-process-management",
      },
      {
        title: "Entrepreneurship & Small Business Management",
        description: "Training in entrepreneurship, startup management, and small business operations.",
        category: "business",
        level: "Intermediate",
        price: 135,
        slug: "entrepreneurship-small-business",
      },
      {
        title: "Contract Management & Negotiation",
        description: "Specialized certification in contract law, negotiation strategies, and vendor management.",
        category: "business",
        level: "Intermediate",
        price: 140,
        slug: "contract-management-negotiation",
      },
      {
        title: "Business Ethics & Compliance",
        description: "Training in business ethics, regulatory compliance, and corporate governance.",
        category: "business",
        level: "Intermediate",
        price: 130,
        slug: "business-ethics-compliance",
      },
      {
        title: "Change Management & Organizational Development",
        description:
          "Advanced certification in change management, organizational transformation, and leadership development.",
        category: "business",
        level: "Advanced",
        price: 165,
        slug: "change-management-organizational-development",
      },

      // Information Technology Certifications (15 programs)
      {
        title: "Certified Information Systems Security Professional (CISSP)",
        description:
          "Advanced certification for IT security professionals focusing on cybersecurity, risk management, and security architecture.",
        category: "it",
        level: "Advanced",
        price: 195,
        slug: "certified-information-systems-security-professional",
      },
      {
        title: "Certified Cloud Computing Specialist",
        description:
          "Specialized training in cloud architecture, deployment models, service delivery, and security in cloud environments.",
        category: "it",
        level: "Advanced",
        price: 185,
        slug: "certified-cloud-computing-specialist",
      },
      {
        title: "Data Science & Analytics",
        description:
          "Comprehensive certification in data analysis, statistical methods, machine learning, and data visualization.",
        category: "it",
        level: "Advanced",
        price: 190,
        slug: "data-science-analytics",
      },
      {
        title: "Full Stack Web Development",
        description:
          "Training in both front-end and back-end web development, including modern frameworks and best practices.",
        category: "it",
        level: "Intermediate",
        price: 175,
        slug: "full-stack-web-development",
      },
      {
        title: "Network Administration & Security",
        description:
          "Certification for professionals managing computer networks, including configuration, maintenance, and security.",
        category: "it",
        level: "Intermediate",
        price: 160,
        slug: "network-administration-security",
      },
      {
        title: "Cybersecurity Specialist",
        description:
          "Focused training on protecting systems, networks, and programs from digital attacks and implementing security measures.",
        category: "it",
        level: "Advanced",
        price: 180,
        slug: "cybersecurity-specialist",
      },
      {
        title: "IT Service Management (ITIL)",
        description:
          "Certification in designing, delivering, managing, and improving the way IT is used within an organization.",
        category: "it",
        level: "Intermediate",
        price: 150,
        slug: "it-service-management-itil",
      },
      {
        title: "Database Administration & Management",
        description: "Comprehensive training in database design, administration, optimization, and data management.",
        category: "it",
        level: "Advanced",
        price: 170,
        slug: "database-administration-management",
      },
      {
        title: "Mobile Application Development",
        description:
          "Training in mobile app development for iOS and Android platforms, including native and cross-platform solutions.",
        category: "it",
        level: "Intermediate",
        price: 165,
        slug: "mobile-application-development",
      },
      {
        title: "Artificial Intelligence & Machine Learning",
        description:
          "Advanced certification in AI technologies, machine learning algorithms, and intelligent system development.",
        category: "it",
        level: "Advanced",
        price: 200,
        slug: "artificial-intelligence-machine-learning",
      },
      {
        title: "DevOps & Continuous Integration",
        description: "Training in DevOps practices, continuous integration/deployment, and infrastructure automation.",
        category: "it",
        level: "Advanced",
        price: 180,
        slug: "devops-continuous-integration",
      },
      {
        title: "IT Project Management",
        description:
          "Specialized project management certification for IT professionals, covering technology project lifecycle.",
        category: "it",
        level: "Advanced",
        price: 170,
        slug: "it-project-management",
      },
      {
        title: "Systems Analysis & Design",
        description: "Certification in systems analysis, design methodologies, and software engineering principles.",
        category: "it",
        level: "Intermediate",
        price: 155,
        slug: "systems-analysis-design",
      },
      {
        title: "IT Governance & Risk Management",
        description: "Advanced training in IT governance frameworks, risk assessment, and compliance management.",
        category: "it",
        level: "Advanced",
        price: 175,
        slug: "it-governance-risk-management",
      },
      {
        title: "Blockchain Technology & Cryptocurrency",
        description:
          "Specialized certification in blockchain technology, cryptocurrency systems, and distributed ledger applications.",
        category: "it",
        level: "Advanced",
        price: 185,
        slug: "blockchain-technology-cryptocurrency",
      },

      // Healthcare & Wellness Certifications (10 programs)
      {
        title: "Healthcare Administration",
        description:
          "Comprehensive certification for professionals managing healthcare facilities, departments, and services.",
        category: "healthcare",
        level: "Advanced",
        price: 170,
        slug: "healthcare-administration",
      },
      {
        title: "Public Health Management",
        description:
          "Training in public health program development, implementation, and evaluation at community and population levels.",
        category: "healthcare",
        level: "Advanced",
        price: 165,
        slug: "public-health-management",
      },
      {
        title: "Mental Health Professional",
        description:
          "Certification for professionals providing mental health services, including assessment, treatment planning, and intervention.",
        category: "healthcare",
        level: "Advanced",
        price: 160,
        slug: "mental-health-professional",
      },
      {
        title: "Wellness Program Coordinator",
        description:
          "Specialized training in developing and implementing wellness programs in workplace and community settings.",
        category: "healthcare",
        level: "Intermediate",
        price: 140,
        slug: "wellness-program-coordinator",
      },
      {
        title: "Healthcare Quality Management",
        description:
          "Certification in quality improvement methodologies, patient safety initiatives, and regulatory compliance in healthcare settings.",
        category: "healthcare",
        level: "Advanced",
        price: 155,
        slug: "healthcare-quality-management",
      },
      {
        title: "Health Information Management",
        description:
          "Training in health information systems, medical records management, and healthcare data analytics.",
        category: "healthcare",
        level: "Intermediate",
        price: 150,
        slug: "health-information-management",
      },
      {
        title: "Healthcare Finance & Revenue Cycle",
        description:
          "Specialized certification in healthcare financial management, billing, and revenue cycle optimization.",
        category: "healthcare",
        level: "Advanced",
        price: 165,
        slug: "healthcare-finance-revenue-cycle",
      },
      {
        title: "Patient Experience & Care Coordination",
        description: "Training in patient experience management, care coordination, and healthcare service delivery.",
        category: "healthcare",
        level: "Intermediate",
        price: 145,
        slug: "patient-experience-care-coordination",
      },
      {
        title: "Healthcare Compliance & Risk Management",
        description: "Certification in healthcare regulations, compliance management, and risk mitigation strategies.",
        category: "healthcare",
        level: "Advanced",
        price: 160,
        slug: "healthcare-compliance-risk-management",
      },
      {
        title: "Telehealth & Digital Health Services",
        description:
          "Training in telehealth technologies, remote patient monitoring, and digital health service delivery.",
        category: "healthcare",
        level: "Intermediate",
        price: 155,
        slug: "telehealth-digital-health-services",
      },

      // Sales & Marketing Certifications (10 programs)
      {
        title: "Certified Hospitality Sales Professional (CHSP)",
        description:
          "Comprehensive certification for hospitality sales professionals focusing on effective sales strategies and techniques.",
        category: "sales",
        level: "Intermediate",
        price: 125,
        slug: "certified-hospitality-sales-professional",
      },
      {
        title: "Certification in Hotel Industry Analytics (CHIA)",
        description:
          "Specialized certification in data analytics and performance metrics specific to the hospitality industry.",
        category: "sales",
        level: "Intermediate",
        price: 135,
        slug: "certification-hotel-industry-analytics",
      },
      {
        title: "Digital Marketing Specialist",
        description:
          "Comprehensive training in digital marketing strategies, social media management, content creation, and analytics.",
        category: "sales",
        level: "Intermediate",
        price: 145,
        slug: "digital-marketing-specialist",
      },
      {
        title: "Customer Relationship Management",
        description:
          "Certification in CRM strategies, customer retention techniques, and relationship-building approaches.",
        category: "sales",
        level: "Intermediate",
        price: 130,
        slug: "customer-relationship-management",
      },
      {
        title: "Sales Leadership & Management",
        description:
          "Advanced certification for sales managers and directors focusing on team leadership, strategy development, and performance management.",
        category: "sales",
        level: "Advanced",
        price: 155,
        slug: "sales-leadership-management",
      },
      {
        title: "Brand Management & Marketing Strategy",
        description:
          "Training in brand development, marketing strategy, and brand positioning for hospitality and service industries.",
        category: "sales",
        level: "Advanced",
        price: 160,
        slug: "brand-management-marketing-strategy",
      },
      {
        title: "Revenue Management & Pricing Strategy",
        description:
          "Specialized certification in revenue optimization, dynamic pricing, and yield management techniques.",
        category: "sales",
        level: "Advanced",
        price: 165,
        slug: "revenue-management-pricing-strategy",
      },
      {
        title: "Event Marketing & Promotion",
        description:
          "Training in event marketing, promotional strategies, and experiential marketing for hospitality businesses.",
        category: "sales",
        level: "Intermediate",
        price: 140,
        slug: "event-marketing-promotion",
      },
      {
        title: "Social Media Marketing & Content Creation",
        description:
          "Comprehensive training in social media strategy, content creation, and online community management.",
        category: "sales",
        level: "Intermediate",
        price: 135,
        slug: "social-media-marketing-content",
      },
      {
        title: "Market Research & Consumer Analytics",
        description:
          "Certification in market research methodologies, consumer behavior analysis, and data-driven marketing decisions.",
        category: "sales",
        level: "Advanced",
        price: 150,
        slug: "market-research-consumer-analytics",
      },

      // Training & Instruction Certifications (8 programs)
      {
        title: "Certified Hospitality Instructor (CHI)",
        description: "Advanced certification for professionals who train and educate hospitality staff and students.",
        category: "training",
        level: "Advanced",
        price: 145,
        slug: "certified-hospitality-instructor",
      },
      {
        title: "Certified Hospitality Department Trainer (CHDT)",
        description: "Specialized certification for department-level trainers in hospitality settings.",
        category: "training",
        level: "Intermediate",
        price: 130,
        slug: "certified-hospitality-department-trainer",
      },
      {
        title: "Corporate Training Specialist",
        description:
          "Certification for professionals who develop and deliver training programs in corporate environments.",
        category: "training",
        level: "Intermediate",
        price: 140,
        slug: "corporate-training-specialist",
      },
      {
        title: "E-Learning Development & Design",
        description:
          "Specialized training in designing, developing, and implementing online learning programs and materials.",
        category: "training",
        level: "Intermediate",
        price: 135,
        slug: "e-learning-development-design",
      },
      {
        title: "Instructional Design & Curriculum Development",
        description:
          "Certification in creating effective learning experiences through systematic design of instructional materials.",
        category: "training",
        level: "Advanced",
        price: 150,
        slug: "instructional-design-curriculum",
      },
      {
        title: "Adult Learning & Professional Development",
        description:
          "Training in adult learning principles, professional development strategies, and continuing education programs.",
        category: "training",
        level: "Advanced",
        price: 145,
        slug: "adult-learning-professional-development",
      },
      {
        title: "Training Program Management",
        description:
          "Certification in managing training programs, measuring effectiveness, and continuous improvement of learning initiatives.",
        category: "training",
        level: "Advanced",
        price: 155,
        slug: "training-program-management",
      },
      {
        title: "Workplace Learning & Development",
        description:
          "Comprehensive training in workplace learning strategies, skill development, and employee training programs.",
        category: "training",
        level: "Intermediate",
        price: 140,
        slug: "workplace-learning-development",
      },

      // Frontline & Service Certifications (12 programs)
      {
        title: "Certified Hospitality Supervisor (CHS)",
        description: "Essential certification for supervisors and team leaders in the hospitality industry.",
        category: "frontline",
        level: "Intermediate",
        price: 95,
        slug: "certified-hospitality-supervisor",
      },
      {
        title: "Certified Guest Service Professional (CGSP)",
        description: "Focused certification on delivering exceptional guest service in hospitality settings.",
        category: "frontline",
        level: "Entry-Level",
        price: 85,
        slug: "certified-guest-service-professional",
      },
      {
        title: "Certified Breakfast Attendant",
        description: "Specialized training for breakfast service staff in hotels and restaurants.",
        category: "frontline",
        level: "Entry-Level",
        price: 60,
        slug: "certified-breakfast-attendant",
      },
      {
        title: "Certified Front Desk Representative",
        description: "Comprehensive training for front desk staff in hotels and hospitality establishments.",
        category: "frontline",
        level: "Entry-Level",
        price: 75,
        slug: "certified-front-desk-representative",
      },
      {
        title: "Certified Guestroom Attendant",
        description: "Specialized training for housekeeping and room attendant staff.",
        category: "frontline",
        level: "Entry-Level",
        price: 65,
        slug: "certified-guestroom-attendant",
      },
      {
        title: "Certified Kitchen Cook",
        description: "Professional certification for kitchen staff and cooks in hospitality settings.",
        category: "frontline",
        level: "Entry-Level",
        price: 90,
        slug: "certified-kitchen-cook",
      },
      {
        title: "Certified Restaurant Server",
        description: "Professional certification for restaurant service staff focusing on service excellence.",
        category: "frontline",
        level: "Entry-Level",
        price: 70,
        slug: "certified-restaurant-server",
      },
      {
        title: "Customer Service Excellence",
        description:
          "Comprehensive training in customer service principles, communication skills, and problem-solving techniques.",
        category: "frontline",
        level: "Entry-Level",
        price: 80,
        slug: "customer-service-excellence",
      },
      {
        title: "Certified Concierge Professional",
        description: "Training for concierge staff in providing personalized guest services and local area expertise.",
        category: "frontline",
        level: "Intermediate",
        price: 100,
        slug: "certified-concierge-professional",
      },
      {
        title: "Certified Valet & Bell Services",
        description: "Specialized training for valet parking and bell service staff in hospitality establishments.",
        category: "frontline",
        level: "Entry-Level",
        price: 70,
        slug: "certified-valet-bell-services",
      },
      {
        title: "Certified Maintenance Technician",
        description: "Training for maintenance and engineering staff in hospitality facilities management.",
        category: "frontline",
        level: "Intermediate",
        price: 110,
        slug: "certified-maintenance-technician",
      },
      {
        title: "Certified Security Officer",
        description: "Professional certification for security personnel in hospitality and entertainment venues.",
        category: "frontline",
        level: "Intermediate",
        price: 105,
        slug: "certified-security-officer",
      },

      // Social Sciences & Education Certifications (8 programs)
      {
        title: "Educational Leadership",
        description:
          "Advanced certification for education professionals seeking leadership roles in schools, colleges, and educational institutions.",
        category: "social",
        level: "Advanced",
        price: 160,
        slug: "educational-leadership",
      },
      {
        title: "Counseling Psychology",
        description:
          "Professional certification in counseling techniques, psychological assessment, and therapeutic interventions.",
        category: "social",
        level: "Advanced",
        price: 165,
        slug: "counseling-psychology",
      },
      {
        title: "Social Work Professional",
        description:
          "Comprehensive training for social workers focusing on case management, community resources, and client advocacy.",
        category: "social",
        level: "Intermediate",
        price: 140,
        slug: "social-work-professional",
      },
      {
        title: "Community Development",
        description: "Certification in community-based initiatives, program development, and social impact assessment.",
        category: "social",
        level: "Intermediate",
        price: 130,
        slug: "community-development",
      },
      {
        title: "Conflict Resolution & Mediation",
        description:
          "Specialized training in mediation, negotiation, and conflict management techniques for various settings.",
        category: "social",
        level: "Intermediate",
        price: 125,
        slug: "conflict-resolution-mediation",
      },
      {
        title: "Child Development Specialist",
        description:
          "Certification focusing on child development theories, assessment methods, and intervention strategies.",
        category: "social",
        level: "Intermediate",
        price: 135,
        slug: "child-development-specialist",
      },
      {
        title: "Nonprofit Management & Administration",
        description: "Training in nonprofit organization management, fundraising, and program administration.",
        category: "social",
        level: "Advanced",
        price: 150,
        slug: "nonprofit-management-administration",
      },
      {
        title: "Research Methods & Data Analysis",
        description:
          "Certification in research methodologies, statistical analysis, and data interpretation for social sciences.",
        category: "social",
        level: "Advanced",
        price: 155,
        slug: "research-methods-data-analysis",
      },

      // Administration & Leadership Certifications (7 programs)
      {
        title: "Administrative Leadership",
        description:
          "Comprehensive training for administrative professionals seeking to develop leadership skills and advance their careers.",
        category: "admin",
        level: "Intermediate",
        price: 130,
        slug: "administrative-leadership",
      },
      {
        title: "Office Management Professional",
        description:
          "Certification for professionals managing office operations, procedures, and staff in various organizational settings.",
        category: "admin",
        level: "Intermediate",
        price: 125,
        slug: "office-management-professional",
      },
      {
        title: "Executive Assistant Certification",
        description:
          "Specialized training for executive assistants focusing on advanced administrative skills, communication, and project management.",
        category: "admin",
        level: "Intermediate",
        price: 120,
        slug: "executive-assistant-certification",
      },
      {
        title: "Operations Management",
        description:
          "Certification in managing the production and delivery of products and services, focusing on efficiency and effectiveness.",
        category: "admin",
        level: "Advanced",
        price: 145,
        slug: "operations-management",
      },
      {
        title: "Organizational Development",
        description:
          "Training in planned, organization-wide efforts to increase organizational effectiveness and health.",
        category: "admin",
        level: "Advanced",
        price: 150,
        slug: "organizational-development",
      },
      {
        title: "Public Administration",
        description:
          "Certification for professionals in government and public sector organizations focusing on policy implementation and public service delivery.",
        category: "admin",
        level: "Advanced",
        price: 155,
        slug: "public-administration",
      },
      {
        title: "Records Management & Information Governance",
        description:
          "Specialized training in records management, information governance, and data compliance for administrative professionals.",
        category: "admin",
        level: "Intermediate",
        price: 135,
        slug: "records-management-information-governance",
      },
    ]

    // Insert certifications into database
    const { error: insertError } = await supabase.from("certifications").insert(certifications)

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      success: true,
      message: "Certifications seeded successfully",
      count: certifications.length,
    })
  } catch (error) {
    console.error("Error seeding certifications:", error)
    return NextResponse.json({ error: "Failed to seed certifications" }, { status: 500 })
  }
}
