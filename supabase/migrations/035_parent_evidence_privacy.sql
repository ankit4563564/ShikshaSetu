-- ============================================================================
-- Migration 035: Parent Evidence Privacy (Phase E P0 Remediation)
-- Adds is_parent_visible column to evidence_logs (default FALSE),
-- adds performance index, and enforces parent visibility filter in RLS policies.
-- ============================================================================

-- 1. Add is_parent_visible column with default FALSE
ALTER TABLE evidence_logs 
ADD COLUMN IF NOT EXISTS is_parent_visible BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN evidence_logs.is_parent_visible IS 'Explicit flag determining whether an evidence log entry is visible in the Parent Portal. Internal notes remain FALSE by default.';

-- 2. Index for parent evidence lookup performance
CREATE INDEX IF NOT EXISTS idx_evidence_logs_parent_visible 
ON evidence_logs (student_id, is_parent_visible, generated_at DESC);

-- 3. Update RLS Policy for Parent Access to evidence_logs
DROP POLICY IF EXISTS evidence_logs_select_parent ON evidence_logs;

CREATE POLICY evidence_logs_select_parent ON evidence_logs 
FOR SELECT 
USING (
  school_id = current_user_school_id()
  AND is_parent_visible = TRUE
  AND is_guardian_of_student_strict(student_id)
);
