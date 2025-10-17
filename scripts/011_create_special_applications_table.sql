CREATE TABLE IF NOT EXISTS special_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  application_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_special_applications_user_id ON special_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_special_applications_certification_id ON special_applications(certification_id);
CREATE INDEX IF NOT EXISTS idx_special_applications_status ON special_applications(status);
