-- Migration 037: Gate Dismissal Enhancements (Phase G1.2)

-- Update status constraint on gate_passes table to support 'revoked'
ALTER TABLE gate_passes DROP CONSTRAINT IF EXISTS gate_passes_status_check;
ALTER TABLE gate_passes ADD CONSTRAINT gate_passes_status_check 
  CHECK (status IN ('pending', 'approved', 'used', 'expired', 'rejected', 'revoked'));

-- Add operation_id and guardian_id to gate_pass_audit_logs for checkout & emergency override tracking
ALTER TABLE gate_pass_audit_logs ADD COLUMN IF NOT EXISTS operation_id UUID;
ALTER TABLE gate_pass_audit_logs ADD COLUMN IF NOT EXISTS guardian_id UUID REFERENCES guardians(id);
ALTER TABLE gate_pass_audit_logs ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id);

CREATE INDEX IF NOT EXISTS idx_gate_pass_audit_op_id ON gate_pass_audit_logs (operation_id);
CREATE INDEX IF NOT EXISTS idx_gate_pass_audit_student ON gate_pass_audit_logs (student_id);
