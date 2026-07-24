-- ──────────────────────────────────────────────────────────────────────────────
-- 018: Digital Student Identity — Complete Student Profile
--
-- Closes gaps identified during the Digital Student Identity audit:
--   • academic_year on students
--   • medical_flags table for health/safety flags
--   • canteen_entry scan mode
--   • RLS for medical_flags
-- ──────────────────────────────────────────────────────────────────────────────

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Add missing columns to students table
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_year TEXT;

COMMENT ON COLUMN students.academic_year IS 'Current academic year, e.g. 2026-27';

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Medical Flags Table
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medical_flags (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  flag_type         TEXT NOT NULL CHECK (flag_type IN (
                      'allergy', 'medication', 'condition',
                      'dietary', 'physical', 'other'
                    )),
  description       TEXT NOT NULL,
  severity          TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  recorded_by       UUID REFERENCES teachers(id) ON DELETE SET NULL,
  recorded_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE medical_flags IS 'Health and safety flags for students. Displayed on Campus ID card and scan results.';
COMMENT ON COLUMN medical_flags.severity IS 'info = minor (e.g. glasses), warning = moderate (e.g. asthma), critical = emergency (e.g. severe allergy)';
COMMENT ON COLUMN medical_flags.is_active IS 'Soft delete / archival flag';

CREATE INDEX idx_medical_flags_student ON medical_flags (student_id);
CREATE INDEX idx_medical_flags_active  ON medical_flags (student_id) WHERE is_active = TRUE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Add canteen_entry to scan_mode enum
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TYPE scan_mode ADD VALUE IF NOT EXISTS 'canteen_entry';

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. RLS Policies for medical_flags
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE medical_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical flags: admins full access"
  ON medical_flags FOR ALL
  USING (is_admin());

CREATE POLICY "Medical flags: teachers read for their students"
  ON medical_flags FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE class_teacher_id = get_teacher_id()
    )
  );

CREATE POLICY "Medical flags: guardians read for their children"
  ON medical_flags FOR SELECT
  USING (is_guardian_of_student(student_id));

CREATE POLICY "Medical flags: students read own"
  ON medical_flags FOR SELECT
  USING (student_id = auth.uid()::uuid);

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Allow teachers to insert/update medical_flags
-- ──────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Medical flags: teachers insert for their students"
  ON medical_flags FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE class_teacher_id = get_teacher_id()
    )
  );

CREATE POLICY "Medical flags: teachers update their students flags"
  ON medical_flags FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM students WHERE class_teacher_id = get_teacher_id()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE class_teacher_id = get_teacher_id()
    )
  );
