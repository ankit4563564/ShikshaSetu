-- Worry Jar Database Migration
-- Securely stores student worry entries with encryption support

-- Create worry_entries table
CREATE TABLE IF NOT EXISTS worry_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Encrypted on application layer before storage
  is_shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMPTZ,
  shared_with_counselor_id UUID REFERENCES teachers(id),
  counselor_viewed_at TIMESTAMPTZ,
  counselor_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete for audit trail
  
  -- Metadata
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'concerned', 'urgent')),
  tags TEXT[], -- For categorization: academic, social, family, health, etc.
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create indexes for performance
CREATE INDEX idx_worry_entries_student ON worry_entries(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_worry_entries_shared ON worry_entries(is_shared, shared_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_worry_entries_counselor ON worry_entries(shared_with_counselor_id) WHERE deleted_at IS NULL AND is_shared = true;
CREATE INDEX idx_worry_entries_created ON worry_entries(created_at DESC) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE worry_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can view and create their own worry entries
CREATE POLICY "Students can view their own worry entries"
  ON worry_entries
  FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Students can create their own worry entries"
  ON worry_entries
  FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Students can update their own worry entries"
  ON worry_entries
  FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Students can soft delete their own worry entries"
  ON worry_entries
  FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Counselors/Teachers can view shared worry entries
CREATE POLICY "Counselors can view shared worry entries"
  ON worry_entries
  FOR SELECT
  USING (
    is_shared = true AND (
      shared_with_counselor_id IN (
        SELECT id FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub'
      )
      OR
      -- Class teachers can see their students' shared worries
      student_id IN (
        SELECT id FROM students 
        WHERE class_teacher_id IN (
          SELECT id FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
      )
    )
  );

-- Counselors can respond to shared worries
CREATE POLICY "Counselors can respond to shared worry entries"
  ON worry_entries
  FOR UPDATE
  USING (
    is_shared = true AND (
      shared_with_counselor_id IN (
        SELECT id FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub'
      )
      OR
      student_id IN (
        SELECT id FROM students 
        WHERE class_teacher_id IN (
          SELECT id FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
      )
    )
  );

-- Admin can view all worry entries for oversight
CREATE POLICY "Admin can view all worry entries"
  ON worry_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE clerk_user_id = auth.jwt() ->> 'sub' 
      AND role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_worry_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_worry_entries_updated_at
  BEFORE UPDATE ON worry_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_worry_entries_updated_at();

-- Function to notify counselor when worry is shared
CREATE OR REPLACE FUNCTION notify_counselor_on_worry_share()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_shared = true AND OLD.is_shared = false THEN
    -- Insert notification for counselor
    INSERT INTO notifications (
      recipient_id,
      category,
      priority,
      title,
      message,
      action_url,
      created_at
    )
    SELECT 
      COALESCE(NEW.shared_with_counselor_id, s.class_teacher_id),
      'wellness',
      CASE WHEN NEW.priority = 'urgent' THEN 'urgent' ELSE 'high' END,
      'Student Shared a Worry',
      s.display_name || ' has shared a concern and is seeking support.',
      '/teacher?view=wellness&worry=' || NEW.id,
      NOW()
    FROM students s
    WHERE s.id = NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_counselor_on_worry_share
  AFTER UPDATE ON worry_entries
  FOR EACH ROW
  WHEN (NEW.is_shared = true AND OLD.is_shared = false)
  EXECUTE FUNCTION notify_counselor_on_worry_share();

-- Create view for worry analytics (admin/counselor dashboard)
CREATE OR REPLACE VIEW worry_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_worries,
  COUNT(*) FILTER (WHERE is_shared = true) as shared_worries,
  COUNT(*) FILTER (WHERE sentiment = 'urgent') as urgent_worries,
  COUNT(*) FILTER (WHERE counselor_response IS NOT NULL) as responded_worries,
  COUNT(DISTINCT student_id) as students_with_worries,
  ARRAY_AGG(DISTINCT unnest(tags)) FILTER (WHERE tags IS NOT NULL) as common_tags
FROM worry_entries
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant permissions
GRANT SELECT ON worry_analytics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE worry_entries IS 'Stores student worry jar entries with encryption and counselor support workflow';
COMMENT ON COLUMN worry_entries.content IS 'Encrypted worry content - encrypt on client before insert';
COMMENT ON COLUMN worry_entries.is_shared IS 'Whether student chose to share with counselor';
COMMENT ON COLUMN worry_entries.sentiment IS 'Auto-detected or manually set sentiment for triage';
COMMENT ON COLUMN worry_entries.tags IS 'Categorization tags for analytics and filtering';
