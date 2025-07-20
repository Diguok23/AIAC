-- Add the user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN user_id UUID;
    END IF;
END
$$;

-- Add NOT NULL constraint to user_id
-- This assumes that for existing profiles, user_id will be populated by the trigger
-- or a separate migration. If you have existing profiles that need user_id,
-- you might need to temporarily set it to NULLABLE or run a data migration first.
ALTER TABLE public.user_profiles
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint to user_id to ensure one profile per user
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
