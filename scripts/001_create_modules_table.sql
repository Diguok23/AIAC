CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certification_id UUID REFERENCES public.certifications(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_num INT NOT NULL,
  CONSTRAINT unique_module_order_per_certification UNIQUE (certification_id, order_num)
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read modules"
ON public.modules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow service role to insert modules"
ON public.modules FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to update modules"
ON public.modules FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Allow service role to delete modules"
ON public.modules FOR DELETE
TO service_role
USING (true);
