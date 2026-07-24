-- ──────────────────────────────────────────────────────────────────────────────
-- 019: Exams & Marks Management
--
-- Adds a proper exam entity that groups grade rows, plus a publish workflow:
--   exams (metadata) ← grades (per-student scores, now with exam_id + is_published)
--
-- Teachers create exams → enter marks → publish → parents/students see results
-- ──────────────────────────────────────────────────────────────────────────────

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Exams Table
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject         TEXT NOT NULL,
  exam_name       TEXT NOT NULL,                              -- e.g. 'Unit Test 3', 'Mid-Term'
  max_score       NUMERIC(6,2) NOT NULL,
  exam_date       DATE NOT NULL,
  class_grade     TEXT NOT NULL,                              -- e.g. '8'
  class_section   TEXT,                                       -- e.g. 'A'
  created_by      UUID REFERENCES teachers(id) ON DELETE SET NULL,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE exams IS 'Assessment/exam metadata. Each exam groups per-student grade rows.';
COMMENT ON COLUMN exams.is_published IS 'When TRUE, marks are visible to students and parents, and analytics are sent to Mission Control';

CREATE INDEX idx_exams_subject    ON exams (subject);
CREATE INDEX idx_exams_date       ON exams (exam_date DESC);
CREATE INDEX idx_exams_teacher    ON exams (created_by);
CREATE INDEX idx_exams_published  ON exams (is_published) WHERE is_published = TRUE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Add exam_id and is_published to grades
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE grades ADD COLUMN IF NOT EXISTS exam_id      UUID REFERENCES exams(id) ON DELETE SET NULL;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_grades_exam      ON grades (exam_id);
CREATE INDEX IF NOT EXISTS idx_grades_published ON grades (is_published) WHERE is_published = TRUE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. RLS Policies for exams
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Teachers: full CRUD on exams they created
CREATE POLICY "Exams: teachers insert"
  ON exams FOR INSERT
  WITH CHECK (is_admin() OR created_by = get_teacher_id());

CREATE POLICY "Exams: teachers select own"
  ON exams FOR SELECT
  USING (is_admin() OR created_by = get_teacher_id() OR is_published = TRUE);

CREATE POLICY "Exams: teachers update own"
  ON exams FOR UPDATE
  USING (is_admin() OR created_by = get_teacher_id())
  WITH CHECK (is_admin() OR created_by = get_teacher_id());

CREATE POLICY "Exams: teachers delete own"
  ON exams FOR DELETE
  USING (is_admin() OR created_by = get_teacher_id());

-- Students & guardians: read only published exams
CREATE POLICY "Exams: students read published"
  ON exams FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Exams: guardians read published"
  ON exams FOR SELECT
  USING (is_published = TRUE);

-- Admins: full access
CREATE POLICY "Exams: admins all"
  ON exams FOR ALL
  USING (is_admin());

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Update grades RLS to include publish-based visibility
-- ──────────────────────────────────────────────────────────────────────────────

-- Note: Existing grades RLS is in 005_row_level_security.sql.
-- We add additional policies for the new columns.

CREATE POLICY "Grades: students read published"
  ON grades FOR SELECT
  USING (is_published = TRUE AND student_id = auth.uid()::uuid);

CREATE POLICY "Grades: guardians read published for children"
  ON grades FOR SELECT
  USING (is_published = TRUE AND is_guardian_of_student(student_id));

CREATE POLICY "Grades: teachers read all"
  ON grades FOR SELECT
  USING (is_admin() OR student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()));

CREATE POLICY "Grades: teachers insert"
  ON grades FOR INSERT
  WITH CHECK (is_admin() OR student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()));

CREATE POLICY "Grades: teachers update"
  ON grades FOR UPDATE
  USING (is_admin() OR student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()))
  WITH CHECK (is_admin() OR student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()));

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Function: marks analytics aggregation for Mission Control
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_exam_analytics(p_exam_id UUID)
RETURNS TABLE (
  subject         TEXT,
  exam_name       TEXT,
  class_average   NUMERIC,
  highest_score   NUMERIC,
  lowest_score    NUMERIC,
  total_students  BIGINT,
  above_average   BIGINT,
  below_average   BIGINT
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.subject,
    e.exam_name,
    ROUND(AVG(g.score / g.max_score * 100), 1)::NUMERIC AS class_average,
    MAX(g.score / g.max_score * 100)::NUMERIC AS highest_score,
    MIN(g.score / g.max_score * 100)::NUMERIC AS lowest_score,
    COUNT(g.id)::BIGINT AS total_students,
    COUNT(CASE WHEN (g.score / g.max_score * 100) >= AVG(g.score / g.max_score * 100) OVER () THEN 1 END)::BIGINT AS above_average,
    COUNT(CASE WHEN (g.score / g.max_score * 100) < AVG(g.score / g.max_score * 100) OVER () THEN 1 END)::BIGINT AS below_average
  FROM exams e
  JOIN grades g ON g.exam_id = e.id
  WHERE e.id = p_exam_id
  GROUP BY e.subject, e.exam_name;
END;
$$ LANGUAGE plpgsql;
