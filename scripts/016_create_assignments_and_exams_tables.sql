-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMP,
  max_score INTEGER DEFAULT 100,
  file_url VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  instructions TEXT,
  exam_date TIMESTAMP,
  duration_minutes INTEGER,
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create exam questions table
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR NOT NULL,
  options JSONB,
  correct_answer VARCHAR,
  explanation TEXT,
  order_num INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user submissions table
CREATE TABLE IF NOT EXISTS public.user_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  submission_file_url VARCHAR,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score INTEGER,
  feedback TEXT,
  status VARCHAR DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user exam attempts table
CREATE TABLE IF NOT EXISTS public.user_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  score INTEGER,
  status VARCHAR DEFAULT 'in_progress',
  answers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create materials/resources table
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  file_url VARCHAR NOT NULL,
  file_type VARCHAR,
  file_size INTEGER,
  order_num INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_assignments_module_id ON public.assignments(module_id);
CREATE INDEX idx_assignments_certification_id ON public.assignments(certification_id);
CREATE INDEX idx_exams_module_id ON public.exams(module_id);
CREATE INDEX idx_exams_certification_id ON public.exams(certification_id);
CREATE INDEX idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX idx_user_submissions_user_id ON public.user_submissions(user_id);
CREATE INDEX idx_user_exam_attempts_user_id ON public.user_exam_attempts(user_id);
CREATE INDEX idx_course_materials_lesson_id ON public.course_materials(lesson_id);
CREATE INDEX idx_course_materials_module_id ON public.course_materials(module_id);
