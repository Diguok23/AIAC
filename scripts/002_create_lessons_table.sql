CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_num INT NOT NULL,
  CONSTRAINT unique_lesson_order_per_module UNIQUE (module_id, order_num)
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow service role to insert lessons"
ON public.lessons FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to update lessons"
ON public.lessons FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Allow service role to delete lessons"
ON public.lessons FOR DELETE
TO service_role
USING (true);
