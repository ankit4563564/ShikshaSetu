-- ============================================================================
-- Migration 038: Canonical Multi-Tenant Scoping for chat_messages
-- 1. Adds school_id column referencing schools(id)
-- 2. Safely backfills existing chat records from student's school_id / default school
-- 3. Sets NOT NULL constraint and performance indexes
-- 4. Replaces legacy RLS with strict school-scoped tenant isolation policies
-- 5. Signals PostgREST schema cache reload
-- ============================================================================

-- ── 1. Add school_id column to chat_messages ──
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;

-- ── 2. Backfill existing records ──
-- First match student's assigned school_id
UPDATE chat_messages cm
SET school_id = s.school_id
FROM students s
WHERE cm.student_id = s.id AND cm.school_id IS NULL;

-- Fallback to default school for any standalone or seed records
UPDATE chat_messages
SET school_id = get_default_school_id()
WHERE school_id IS NULL;

-- ── 3. Enforce NOT NULL & Indexes ──
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

-- ── 5. Reload PostgREST Schema Cache ──
NOTIFY pgrst, 'reload schema';
