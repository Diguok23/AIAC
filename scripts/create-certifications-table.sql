-- Create certifications table that is referenced by user_enrollments
CREATE TABLE IF NOT EXISTS certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certifications_category ON certifications(category);
CREATE INDEX IF NOT EXISTS idx_certifications_slug ON certifications(slug);

-- Enable Row Level Security
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
CREATE POLICY "Certifications are viewable by everyone" ON certifications
  FOR SELECT USING (true);
