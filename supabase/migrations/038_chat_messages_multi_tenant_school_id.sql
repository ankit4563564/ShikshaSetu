-- ============================================================================
-- Migration 038: Canonical Multi-Tenant Scoping for chat_messages
-- 1. Ensures schools base table and default tenant exist
-- 2. Adds school_id column referencing schools(id)
-- 3. Safely backfills existing chat records from student's school_id / default school
-- 4. Sets NOT NULL constraint and performance indexes
-- 5. Replaces legacy RLS with strict school-scoped tenant isolation policies
-- 6. Signals PostgREST schema cache reload
-- ============================================================================

-- ── 1. Ensure schools table and default school exist ──
CREATE TABLE IF NOT EXISTS schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

INSERT INTO schools (id, name, slug)
VALUES ('e0000000-0000-4000-8000-000000000001', 'Greenwood High International School', 'greenwood-high')
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE FUNCTION get_default_school_id()
RETURNS UUID AS $$
  SELECT id FROM schools WHERE slug = 'greenwood-high' LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ── 2. Add school_id column to chat_messages ──
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;

-- ── 3. Backfill existing records ──
-- First match student's assigned school_id (if students table has school_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'school_id'
  ) THEN
    UPDATE chat_messages cm
    SET school_id = s.school_id
    FROM students s
    WHERE cm.student_id = s.id AND cm.school_id IS NULL;
  END IF;
END $$;

-- Fallback to default school for any standalone or seed records
UPDATE chat_messages
SET school_id = get_default_school_id()
WHERE school_id IS NULL;

-- ── 4. Enforce NOT NULL & Indexes ──
ALTER TABLE chat_messages
ALTER COLUMN school_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_school_id
ON chat_messages(school_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_school_student_time
ON chat_messages(school_id, student_id, created_at DESC);

-- ── 4. Strict Multi-Tenant Row-Level Security ──
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop legacy non-tenant policies
DROP POLICY IF EXISTS chat_messages_select ON chat_messages;
DROP POLICY IF EXISTS chat_messages_insert ON chat_messages;
DROP POLICY IF EXISTS tenant_isolation_select ON chat_messages;
DROP POLICY IF EXISTS tenant_isolation_insert ON chat_messages;
DROP POLICY IF EXISTS tenant_isolation_update ON chat_messages;
DROP POLICY IF EXISTS tenant_isolation_delete ON chat_messages;

-- A. Tenant SELECT Policy (Strict match against caller's active school tenant)
CREATE POLICY tenant_isolation_select ON chat_messages FOR SELECT
TO authenticated
USING (school_id = current_user_school_id());

-- B. Tenant INSERT Policy (Must write to caller's active school tenant)
CREATE POLICY tenant_isolation_insert ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (school_id = current_user_school_id());

-- C. Tenant UPDATE Policy
CREATE POLICY tenant_isolation_update ON chat_messages FOR UPDATE
TO authenticated
USING (school_id = current_user_school_id())
WITH CHECK (school_id = current_user_school_id());

-- D. Tenant DELETE Policy
CREATE POLICY tenant_isolation_delete ON chat_messages FOR DELETE
TO authenticated
USING (school_id = current_user_school_id());

-- ── 5. Enable Supabase Realtime Replication ──
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Table already in publication
END $$;

-- ── 6. Reload PostgREST Schema Cache ──
NOTIFY pgrst, 'reload schema';
