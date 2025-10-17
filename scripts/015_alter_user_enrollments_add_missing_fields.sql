-- This script ensures all required columns exist in user_enrollments table

-- Add columns if they don't exist (PostgreSQL 9.1+)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_enrollments' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE user_enrollments ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_enrollments' AND column_name = 'due_date'
    ) THEN
        ALTER TABLE user_enrollments ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_enrollments' AND constraint_name = 'user_enrollments_status_check'
    ) THEN
        ALTER TABLE user_enrollments 
        ADD CONSTRAINT user_enrollments_status_check 
        CHECK (status IN ('active', 'completed', 'paused', 'dropped'));
    END IF;
END $$;
