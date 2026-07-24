-- Migration: 006_gate_pass_audit
-- Purpose: Add audit logging support for Gate Passes and configure RLS rules

-- Add rejection_reason column to gate_passes table (PRD §6.3)
ALTER TABLE gate_passes ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS gate_pass_audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id      UUID REFERENCES gate_passes(id) ON DELETE SET NULL,
  pass_code    VARCHAR(6) NOT NULL,
  action       TEXT NOT NULL, -- 'request', 'approve', 'reject', 'cancel', 'use_success', 'use_fail_expired', 'use_fail_already_used', 'use_fail_not_found', 'use_fail_pending'
  performed_by TEXT, -- Clerk user_id or email or role
  details      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE gate_pass_audit_logs IS 'Audit logs tracking gate pass requests, approvals, and scans (PRD §6.3).';

-- Enable RLS on gate_pass_audit_logs
ALTER TABLE gate_pass_audit_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on gate_passes
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────────────────
-- RLS Policies for gate_passes
-- ──────────────────────────────────────────────────────────────────────────────

-- SELECT Policy
CREATE POLICY gate_passes_select ON gate_passes FOR SELECT
USING (
  (auth.jwt() ->> 'sub' IS NULL) OR -- Dev mode bypass
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

-- INSERT Policy
CREATE POLICY gate_passes_insert ON gate_passes FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'sub' IS NULL) OR -- Dev mode bypass
  is_guardian_of_student(student_id)
);

-- UPDATE Policy (Teachers approving/rejecting, gate staff using it)
CREATE POLICY gate_passes_update ON gate_passes FOR UPDATE
USING (
  (auth.jwt() ->> 'sub' IS NULL) OR -- Dev mode bypass
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);

-- ──────────────────────────────────────────────────────────────────────────────
-- RLS Policies for gate_pass_audit_logs
-- ──────────────────────────────────────────────────────────────────────────────

-- SELECT Policy
CREATE POLICY gate_pass_audit_logs_select ON gate_pass_audit_logs FOR SELECT
USING (
  (auth.jwt() ->> 'sub' IS NULL) OR -- Dev mode bypass
  is_admin() OR
  EXISTS (
    SELECT 1 FROM gate_passes gp
    JOIN students s ON gp.student_id = s.id
    WHERE gp.id = gate_pass_audit_logs.pass_id
    AND s.class_teacher_id = get_teacher_id()
  ) OR
  EXISTS (
    SELECT 1 FROM gate_passes gp
    JOIN guardians g ON gp.requested_by = g.id
    WHERE gp.id = gate_pass_audit_logs.pass_id
    AND g.clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Allow insertions by server actions
CREATE POLICY gate_pass_audit_logs_insert ON gate_pass_audit_logs FOR INSERT
WITH CHECK (true);
