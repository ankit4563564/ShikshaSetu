-- ============================================================================
-- Migration 002: Academic & Wellness Data
-- Daily input tables: attendance, homework, grades, mood check-ins.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Attendance
-- One row per student per day. Powers attendance mismatch alerts (PRD §14).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date        DATE        NOT NULL,
  status      TEXT        NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by   UUID        REFERENCES teachers(id) ON DELETE SET NULL,
  notes       TEXT,
  marked_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_attendance_student_date UNIQUE (student_id, date)
);

COMMENT ON TABLE attendance IS 'Daily attendance record per student. Unique on (student_id, date). Powers the attendance mismatch alert (PRD §14).';

CREATE INDEX idx_attendance_student     ON attendance (student_id);
CREATE INDEX idx_attendance_date        ON attendance (date);
CREATE INDEX idx_attendance_student_date ON attendance (student_id, date DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- Homework
-- Tracks assignment + submission status per student.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE homework (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject       TEXT        NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  due_date      DATE        NOT NULL,
  submitted_at  TIMESTAMPTZ,                               -- null = not yet submitted
  is_submitted  BOOLEAN     GENERATED ALWAYS AS (submitted_at IS NOT NULL) STORED,
  assigned_by   UUID        REFERENCES teachers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE homework IS 'Per-student homework assignments. is_submitted is a generated column derived from submitted_at.';

CREATE INDEX idx_homework_student    ON homework (student_id);
CREATE INDEX idx_homework_due_date   ON homework (due_date);
CREATE INDEX idx_homework_student_sub ON homework (student_id, is_submitted);

-- ──────────────────────────────────────────────────────────────────────────────
-- Grades
-- Per-assessment scores. Supports per-subject trend analysis (PRD §6.1).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE grades (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject          TEXT        NOT NULL,
  assessment_name  TEXT        NOT NULL,                    -- e.g. 'Unit Test 3', 'Mid-Term'
  score            NUMERIC(6,2) NOT NULL,
  max_score        NUMERIC(6,2) NOT NULL,
  assessment_date  DATE        NOT NULL,
  recorded_by      UUID        REFERENCES teachers(id) ON DELETE SET NULL,  -- infers subject teacher
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT chk_grades_score_positive   CHECK (score >= 0),
  CONSTRAINT chk_grades_max_positive     CHECK (max_score > 0),
  CONSTRAINT chk_grades_score_le_max     CHECK (score <= max_score)
);

COMMENT ON TABLE grades IS 'Individual assessment scores. recorded_by infers the subject teacher (Option A). Supports per-subject trend analysis (PRD §6.1).';

CREATE INDEX idx_grades_student       ON grades (student_id);
CREATE INDEX idx_grades_student_subj  ON grades (student_id, subject);
CREATE INDEX idx_grades_assessment_dt ON grades (assessment_date);

-- ──────────────────────────────────────────────────────────────────────────────
-- Mood Check-ins
-- Daily student wellness signal (PRD §6.2).
-- Anonymous to peers, linked internally for pattern detection.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE mood_checkins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mood_value     SMALLINT    NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
  mood_label     TEXT        NOT NULL,                     -- e.g. 'happy', 'anxious', 'calm', 'sad', 'angry'
  note           TEXT,                                      -- private optional note
  checked_in_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE mood_checkins IS 'Daily mood check-ins. Anonymous to peers, linked internally for the Insight Engine pattern detection (PRD §6.2).';
COMMENT ON COLUMN mood_checkins.mood_value IS '1 = very low / distressed, 5 = very happy / great. Used for trend calculations.';
COMMENT ON COLUMN mood_checkins.note IS 'Private student note — never exposed publicly, only synthesized into evidence bullets.';

CREATE INDEX idx_mood_student      ON mood_checkins (student_id);
CREATE INDEX idx_mood_student_time ON mood_checkins (student_id, checked_in_at DESC);


-- ──────────────────────────────────────────────────────────────────────────────
-- TODO: Row-Level Security Policies (Phase 10)
--
-- attendance:
--   - Teachers can read/write for their students.
--   - Guardians can read for their children (via guardian_access).
--   - Admins can read all.
--
-- homework:
--   - Teachers can read/write for their students.
--   - Guardians can read for their children.
--   - Admins can read all.
--
-- grades:
--   - Teachers can read/write for their students.
--   - Guardians can read for their children.
--   - Admins can read all.
--
-- mood_checkins:
--   - Students can insert their own.
--   - Teachers can read for their students (synthesized, not raw).
--   - Guardians can read ONLY if guardian_access.can_view_wellness = true.
--   - Admins can read aggregate only, not individual raw check-ins.
-- ──────────────────────────────────────────────────────────────────────────────
