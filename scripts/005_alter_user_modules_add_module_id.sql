-- This script assumes you might have existing data in user_modules
-- If you have existing data and want to migrate it, this will be more complex.
-- For a fresh setup, you might drop and recreate the table.
-- This script will add module_id and remove module_title/module_order.

-- First, add the new module_id column (nullable initially)
ALTER TABLE public.user_modules
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE;

-- If you have existing data and want to populate module_id based on module_title,
-- you would need a more complex migration script here.
-- For now, we'll assume new entries will use module_id.

-- Remove the old columns if they are no longer needed after migration
-- CAUTION: Only run these if you are sure you have migrated data or are starting fresh.
ALTER TABLE public.user_modules
DROP COLUMN IF EXISTS module_title,
DROP COLUMN IF EXISTS module_order;

-- Add a unique constraint if module_id is now the primary identifier for a user's module progress
-- This constraint ensures a user can only have one progress entry per module in a course.
ALTER TABLE public.user_modules
ADD CONSTRAINT unique_user_course_module UNIQUE (user_id, course_id, module_id);
