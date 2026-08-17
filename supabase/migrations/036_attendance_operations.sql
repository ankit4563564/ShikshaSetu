-- Migration 036: Attendance Operations & Idempotency Table (Phase G1.1)

CREATE TABLE IF NOT EXISTS attendance_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL UNIQUE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  actor_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  client_timestamp TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  result_status TEXT NOT NULL CHECK (result_status IN ('applied', 'ignored_stale', 'duplicate_noop'))
);

CREATE INDEX IF NOT EXISTS idx_attendance_ops_student_date ON attendance_operations (student_id, date, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_ops_school ON attendance_operations (school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_ops_op_id ON attendance_operations (operation_id);

ALTER TABLE attendance_operations ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policy
DROP POLICY IF EXISTS attendance_ops_tenant_policy ON attendance_operations;
CREATE POLICY attendance_ops_tenant_policy ON attendance_operations
  FOR ALL USING (school_id = current_user_school_id());
