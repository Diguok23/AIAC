-- Create applications table for program applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  program_category TEXT NOT NULL,
  program_name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  study_mode TEXT NOT NULL,
  highest_education TEXT NOT NULL,
  previous_certifications TEXT,
  years_experience TEXT NOT NULL,
  current_employer TEXT,
  current_position TEXT,
  heard_about TEXT,
  questions TEXT,
  status TEXT DEFAULT 'pending'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public insert access
CREATE POLICY "Anyone can create applications" ON applications
  FOR INSERT WITH CHECK (true);

-- Create RLS policy for reading own applications
CREATE POLICY "Users can view their own applications" ON applications
  FOR SELECT USING (auth.jwt() ->> 'email' = email);
