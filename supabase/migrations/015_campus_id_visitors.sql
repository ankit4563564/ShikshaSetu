-- ════════════════════════════════════════════════════════════════════════════
-- Migration 015: Visitor Identity Framework
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Create holder_type enum
DO $$ BEGIN
  CREATE TYPE campus_holder_type AS ENUM (
    'student', 'visitor', 'staff', 'vendor', 'temporary_guest', 'emergency_visitor'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create campus_card_holders table
CREATE TABLE IF NOT EXISTS campus_card_holders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_type       campus_holder_type NOT NULL DEFAULT 'visitor',
  student_id        UUID REFERENCES students(id) ON DELETE CASCADE,
  external_name     TEXT,
  external_photo_url TEXT,
  external_phone    TEXT,
  valid_from        TIMESTAMPTZ,
  valid_until       TIMESTAMPTZ,
  sponsored_by      UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_card_holders_holder_type ON campus_card_holders(holder_type);
CREATE INDEX IF NOT EXISTS idx_card_holders_student_id ON campus_card_holders(student_id);
CREATE INDEX IF NOT EXISTS idx_card_holders_valid_until ON campus_card_holders(valid_until);

-- 4. Add optional holder_id to campus_cards (null = student-only card, backward compatible)
ALTER TABLE campus_cards
  ADD COLUMN IF NOT EXISTS holder_id UUID REFERENCES campus_card_holders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campus_cards_holder_id ON campus_cards(holder_id);

-- 5. RLS policies for campus_card_holders
ALTER TABLE campus_card_holders ENABLE ROW LEVEL SECURITY;

CREATE POLICY card_holders_select_authenticated ON campus_card_holders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY card_holders_all_admin ON campus_card_holders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.uid())
  );
