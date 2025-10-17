-- Add new columns to certifications table
ALTER TABLE public.certifications
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS instructor TEXT,
ADD COLUMN IF NOT EXISTS instructor_bio TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS features TEXT[];

-- Create learning_outcomes table
CREATE TABLE IF NOT EXISTS public.learning_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prerequisites table
CREATE TABLE IF NOT EXISTS public.prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  prerequisite TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certification_reviews table
CREATE TABLE IF NOT EXISTS public.certification_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  review_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update modules table with new columns
ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS lessons_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_cert_id ON public.learning_outcomes(certification_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_cert_id ON public.prerequisites(certification_id);
CREATE INDEX IF NOT EXISTS idx_reviews_cert_id ON public.certification_reviews(certification_id);
CREATE INDEX IF NOT EXISTS idx_certifications_slug ON public.certifications(slug);
