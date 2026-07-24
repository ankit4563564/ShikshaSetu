-- ============================================================================
-- Migration 001: Enums & People
-- Creates custom types and the core people tables (students, teachers,
-- guardians) plus the guardian_access M:N join table.
-- ============================================================================

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Custom Enum Types
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TYPE portal_role AS ENUM ('teacher', 'parent', 'admin');

CREATE TYPE evidence_status AS ENUM ('on_track', 'worth_watching', 'needs_attention');

CREATE TYPE gate_pass_status AS ENUM ('pending', 'approved', 'used', 'expired', 'rejected');

CREATE TYPE alert_action_status AS ENUM ('unseen', 'seen', 'action_taken', 'resolved');

CREATE TYPE guardian_relationship AS ENUM (
  'mother', 'father',
  'grandmother', 'grandfather',
  'aunt', 'uncle',
  'legal_guardian', 'other'
);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Teachers
-- (Created before students because students.class_teacher_id references this)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE teachers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE,                              -- links to Supabase Auth (nullable until real auth)
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  phone         TEXT,
  subjects      TEXT[]      DEFAULT '{}',                  -- e.g. {'Math','Science'}
  is_class_teacher BOOLEAN DEFAULT FALSE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE teachers IS 'School teaching staff. Links to Supabase Auth via auth_user_id when real auth is wired.';

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Students
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE students (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name       TEXT        NOT NULL,
  last_name        TEXT        NOT NULL,
  display_name     TEXT        NOT NULL,                   -- what appears in the UI
  grade            TEXT        NOT NULL,                   -- e.g. '8', '10A'
  section          TEXT,                                    -- e.g. 'A', 'B'
  roll_number      TEXT,
  date_of_birth    DATE,
  avatar_url       TEXT,
  class_teacher_id UUID        REFERENCES teachers(id)
                               ON DELETE SET NULL,         -- Option A: simple FK
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE students IS 'Every enrolled student. class_teacher_id is the assigned class teacher (Option A); subject teachers are inferred from grades.recorded_by.';
COMMENT ON COLUMN students.class_teacher_id IS 'The class/homeroom teacher for this student. Subject teachers are inferred from grades.recorded_by.';

CREATE INDEX idx_students_grade_section ON students (grade, section);
CREATE INDEX idx_students_class_teacher ON students (class_teacher_id);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Guardians (parents / family members)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE guardians (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id       UUID UNIQUE,                          -- links to Supabase Auth
  first_name         TEXT        NOT NULL,
  last_name          TEXT        NOT NULL,
  email              TEXT        UNIQUE,
  phone              TEXT,
  preferred_language TEXT        DEFAULT 'en',              -- ISO 639-1 code
  avatar_url         TEXT,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE guardians IS 'Parents and other guardians. One guardian can have multiple children; one child can have multiple guardians (PRD Â§17).';

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Guardian â†” Student access (M:N join)
-- PRD Â§17: multiple guardians per student, multiple children per guardian.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE guardian_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id       UUID        NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  student_id        UUID        NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
  relationship      guardian_relationship NOT NULL,
  is_primary        BOOLEAN     DEFAULT FALSE,             -- primary contact for emergency escalation (PRD Â§14)
  can_view_wellness BOOLEAN     DEFAULT TRUE,              -- false = limited view for secondary guardians (PRD Â§17)
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_guardian_student UNIQUE (guardian_id, student_id)
);

COMMENT ON TABLE guardian_access IS 'M:N join between guardians and students. Supports multi-child parents and multi-guardian students (PRD Â§17).';
COMMENT ON COLUMN guardian_access.is_primary IS 'Primary guardian = first emergency contact. If unreachable, secondary guardians are escalated to (PRD Â§14).';
COMMENT ON COLUMN guardian_access.can_view_wellness IS 'False for secondary guardians who get attendance/bus/general updates but not sensitive wellness data (PRD Â§17).';

CREATE INDEX idx_guardian_access_guardian ON guardian_access (guardian_id);
CREATE INDEX idx_guardian_access_student  ON guardian_access (student_id);


-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- TODO: Row-Level Security Policies (Phase 10)
--
-- teachers:
--   - Teachers can read their own row.
--   - Admins can read/write all.
--
-- students:
--   - Teachers can read students where class_teacher_id = auth.uid()
--     OR where they have a grades row (subject teacher).
--   - Guardians can read students linked via guardian_access.
--   - Admins can read all.
--
-- guardians:
--   - Guardians can read/update their own row.
--   - Teachers can read guardians linked to their students.
--   - Admins can read all.
--
-- guardian_access:
--   - Guardians can read rows where guardian_id = their id.
--   - Teachers can read rows for their students.
--   - Admins can read/write all.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- ============================================================================
-- Migration 002: Academic & Wellness Data
-- Daily input tables: attendance, homework, grades, mood check-ins.
-- ============================================================================

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Attendance
-- One row per student per day. Powers attendance mismatch alerts (PRD Â§14).
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

COMMENT ON TABLE attendance IS 'Daily attendance record per student. Unique on (student_id, date). Powers the attendance mismatch alert (PRD Â§14).';

CREATE INDEX idx_attendance_student     ON attendance (student_id);
CREATE INDEX idx_attendance_date        ON attendance (date);
CREATE INDEX idx_attendance_student_date ON attendance (student_id, date DESC);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Homework
-- Tracks assignment + submission status per student.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Grades
-- Per-assessment scores. Supports per-subject trend analysis (PRD Â§6.1).
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

COMMENT ON TABLE grades IS 'Individual assessment scores. recorded_by infers the subject teacher (Option A). Supports per-subject trend analysis (PRD Â§6.1).';

CREATE INDEX idx_grades_student       ON grades (student_id);
CREATE INDEX idx_grades_student_subj  ON grades (student_id, subject);
CREATE INDEX idx_grades_assessment_dt ON grades (assessment_date);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Mood Check-ins
-- Daily student wellness signal (PRD Â§6.2).
-- Anonymous to peers, linked internally for pattern detection.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE mood_checkins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mood_value     SMALLINT    NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
  mood_label     TEXT        NOT NULL,                     -- e.g. 'happy', 'anxious', 'calm', 'sad', 'angry'
  note           TEXT,                                      -- private optional note
  checked_in_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE mood_checkins IS 'Daily mood check-ins. Anonymous to peers, linked internally for the Insight Engine pattern detection (PRD Â§6.2).';
COMMENT ON COLUMN mood_checkins.mood_value IS '1 = very low / distressed, 5 = very happy / great. Used for trend calculations.';
COMMENT ON COLUMN mood_checkins.note IS 'Private student note â€” never exposed publicly, only synthesized into evidence bullets.';

CREATE INDEX idx_mood_student      ON mood_checkins (student_id);
CREATE INDEX idx_mood_student_time ON mood_checkins (student_id, checked_in_at DESC);


-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- ============================================================================
-- Migration 003: Insight Engine, Safety & Communication
-- Evidence logs, status flags, false-positive corrections, gate passes,
-- bus locations, chat messages (with sender validation trigger), and
-- notifications.
-- ============================================================================

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Evidence Logs
-- Structured evidence produced by the rules engine (PRD Â§5).
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE evidence_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  source_type  TEXT        NOT NULL CHECK (source_type IN (
                             'attendance', 'homework', 'grades',
                             'mood', 'voice_log', 'peer_report'
                           )),
  headline     TEXT        NOT NULL,                       -- one-line plain-language summary
  bullets      JSONB       NOT NULL DEFAULT '[]',          -- array of evidence strings
  raw_data     JSONB,                                      -- the input data that produced this evidence
  generated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE evidence_logs IS 'Structured evidence the rules engine produces from raw data. Each row represents one source contributing to a student assessment (PRD Â§5).';
COMMENT ON COLUMN evidence_logs.bullets IS 'JSONB array of plain-language evidence strings, e.g. ["Missed 2 of 5 homework submissions", "Math score down 13 pts"]';

CREATE INDEX idx_evidence_student    ON evidence_logs (student_id);
CREATE INDEX idx_evidence_student_ts ON evidence_logs (student_id, generated_at DESC);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Status Flags
-- On Track / Worth Watching / Needs Attention per student (PRD Â§3, Â§5).
-- Includes alert accountability lifecycle (PRD Â§13).
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE status_flags (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID                NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status                evidence_status     NOT NULL,
  triggered_by_evidence UUID                REFERENCES evidence_logs(id) ON DELETE SET NULL,
  action_status         alert_action_status NOT NULL DEFAULT 'unseen',
  acted_by              UUID                REFERENCES teachers(id) ON DELETE SET NULL,
  acted_at              TIMESTAMPTZ,
  resolved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ         DEFAULT now() NOT NULL
);

COMMENT ON TABLE status_flags IS 'Current and historical status flags per student. action_status tracks the Seen â†’ Action Taken â†’ Resolved lifecycle (PRD Â§13).';

CREATE INDEX idx_status_flags_student  ON status_flags (student_id);
CREATE INDEX idx_status_flags_active   ON status_flags (student_id) WHERE resolved_at IS NULL;

-- Only one active (unresolved) flag per student at any time.
CREATE UNIQUE INDEX uq_status_flags_one_active
  ON status_flags (student_id)
  WHERE resolved_at IS NULL;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- False-Positive Corrections
-- "Mark as False Positive" feedback loop (PRD Â§6.2, Â§13).
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE false_positive_corrections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_flag_id  UUID        NOT NULL REFERENCES status_flags(id) ON DELETE CASCADE,
  corrected_by    UUID        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  reason          TEXT,                                    -- optional explanation
  corrected_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE false_positive_corrections IS 'Logs when a teacher marks a status flag as a false positive (PRD Â§6.2, Â§13). Used to measure and reduce false-positive rate.';

CREATE INDEX idx_fpc_status_flag ON false_positive_corrections (status_flag_id);
CREATE INDEX idx_fpc_teacher     ON false_positive_corrections (corrected_by);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Gate Passes
-- Time-limited, single-use pickup passes (PRD Â§6.3).
-- Full audit trail: who requested, who approved, when used.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE gate_passes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID             NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  requested_by         UUID             NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  approved_by          UUID             REFERENCES teachers(id) ON DELETE SET NULL,
  status               gate_pass_status NOT NULL DEFAULT 'pending',
  pickup_window_start  TIMESTAMPTZ      NOT NULL,
  pickup_window_end    TIMESTAMPTZ      NOT NULL,
  pass_code            VARCHAR(6)       UNIQUE,            -- generated on approval, 6-digit single-use code
  reason               TEXT,
  used_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ      DEFAULT now() NOT NULL,

  CONSTRAINT chk_gate_pass_window CHECK (pickup_window_end > pickup_window_start)
);

COMMENT ON TABLE gate_passes IS 'Secure gate-pass management (PRD Â§6.3). Each pass is time-limited and single-use with a 6-digit pass_code generated on approval.';

CREATE INDEX idx_gate_passes_student ON gate_passes (student_id);
CREATE INDEX idx_gate_passes_status  ON gate_passes (status) WHERE status IN ('pending', 'approved');

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Bus Locations
-- Simulated GPS pings for transport tracking (PRD Â§6.3).
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE bus_locations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_identifier TEXT              NOT NULL,                -- e.g. 'BUS-001'
  latitude       DOUBLE PRECISION  NOT NULL,
  longitude      DOUBLE PRECISION  NOT NULL,
  speed_kmh      NUMERIC(5,1),
  heading        NUMERIC(5,1),                             -- degrees 0-360
  recorded_at    TIMESTAMPTZ       DEFAULT now() NOT NULL
);

COMMENT ON TABLE bus_locations IS 'GPS pings for bus tracking (PRD Â§6.3). In demo mode these are simulated coordinates moving along an OSRM route.';

CREATE INDEX idx_bus_loc_bus_time ON bus_locations (bus_identifier, recorded_at DESC);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Chat Messages
-- Single chat thread per student between teacher and parent (PRD Â§6.4).
-- sender_id is polymorphic â€” validated by trigger below.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL,                    -- references teachers.id OR guardians.id
  sender_role     portal_role NOT NULL CHECK (sender_role IN ('teacher', 'parent')),
  content         TEXT        NOT NULL CHECK (length(content) > 0),
  is_context_flag BOOLEAN     DEFAULT FALSE,               -- true = parent "heads-up" quick note (PRD Â§16)
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE chat_messages IS 'Per-student chat thread between teacher and parent (PRD Â§6.4). sender_id is polymorphic, validated by trg_validate_chat_sender.';
COMMENT ON COLUMN chat_messages.is_context_flag IS 'True for parent quick-notes like "Rahul had a rough morning" (PRD Â§16 two-way context flagging).';

CREATE INDEX idx_chat_student      ON chat_messages (student_id);
CREATE INDEX idx_chat_student_time ON chat_messages (student_id, created_at DESC);
CREATE INDEX idx_chat_sender       ON chat_messages (sender_id);

-- â”€â”€ Sender validation trigger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Ensures sender_id actually exists in the correct table for the given
-- sender_role. Prevents silently inserting a mismatched or nonexistent sender.

CREATE OR REPLACE FUNCTION fn_validate_chat_sender()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_role = 'teacher' THEN
    IF NOT EXISTS (SELECT 1 FROM teachers WHERE id = NEW.sender_id) THEN
      RAISE EXCEPTION 'chat_messages.sender_id % does not exist in teachers', NEW.sender_id;
    END IF;
  ELSIF NEW.sender_role = 'parent' THEN
    IF NOT EXISTS (SELECT 1 FROM guardians WHERE id = NEW.sender_id) THEN
      RAISE EXCEPTION 'chat_messages.sender_id % does not exist in guardians', NEW.sender_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'chat_messages.sender_role must be teacher or parent, got %', NEW.sender_role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_chat_sender
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION fn_validate_chat_sender();

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Notifications
-- Unified notification feed across all event types (PRD Â§6.4).
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID        NOT NULL,                    -- teacher.id or guardian.id
  recipient_role  portal_role NOT NULL,
  student_id      UUID        REFERENCES students(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  body            TEXT,
  category        TEXT        NOT NULL CHECK (category IN (
                                'academic', 'wellness', 'safety', 'chat', 'system'
                              )),
  is_read         BOOLEAN     DEFAULT FALSE NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE notifications IS 'Unified notification feed (PRD Â§6.4). Covers academic alerts, wellness flags, gate-pass status, bus proximity, and system messages.';

CREATE INDEX idx_notif_recipient       ON notifications (recipient_id, recipient_role);
CREATE INDEX idx_notif_recipient_unread ON notifications (recipient_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_student         ON notifications (student_id);


-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- TODO: Row-Level Security Policies (Phase 10)
--
-- evidence_logs:
--   - Teachers can read for their students.
--   - Admins can read all.
--   - Guardians: evidence is never exposed directly â€” only via status_flags
--     and the AI narration layer.
--
-- status_flags:
--   - Teachers can read/update (action_status) for their students.
--   - Guardians can read current flag for their children.
--   - Admins can read all.
--
-- false_positive_corrections:
--   - Teachers can insert for their students' flags.
--   - Admins can read all.
--
-- gate_passes:
--   - Guardians can insert (request) for their children.
--   - Teachers/admins can update (approve/reject).
--   - Gate staff (admin role) can update (mark as used).
--
-- bus_locations:
--   - Public read for now (simulated data).
--   - In production: restrict to guardians with children on that bus route.
--
-- chat_messages:
--   - Teachers can read/write for their students.
--   - Guardians can read/write for their children.
--
-- notifications:
--   - Users can read their own notifications only.
--   - System can insert for any recipient.
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Migration: 004_clerk_auth_mapping
-- Purpose: Support linking Clerk User IDs to teachers, guardians, and admins tables

-- 1. Add clerk_user_id column to teachers
ALTER TABLE teachers ADD COLUMN clerk_user_id TEXT UNIQUE;
COMMENT ON COLUMN teachers.clerk_user_id IS 'Unique Clerk User ID (user_...) linked to this teacher record.';

-- 2. Add clerk_user_id column to guardians
ALTER TABLE guardians ADD COLUMN clerk_user_id TEXT UNIQUE;
COMMENT ON COLUMN guardians.clerk_user_id IS 'Unique Clerk User ID (user_...) linked to this guardian record.';

-- 3. Create admins table
CREATE TABLE admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE admins IS 'System administrators. Links to Clerk via clerk_user_id.';
-- Migration: 005_row_level_security
-- Purpose: Implement Row-Level Security (RLS) policies matching Clerk authentication roles.
-- Ensures parents can only read their children's data, teachers can only read their class's students, and admins can read everything.

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 1. Helper Functions for RLS Policies
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

-- Check if current authenticated Clerk user is an Admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql;

-- Get the Teacher UUID of the current authenticated Clerk user
CREATE OR REPLACE FUNCTION get_teacher_id() 
RETURNS uuid SECURITY DEFINER AS $$
DECLARE
  t_id uuid;
BEGIN
  SELECT id INTO t_id FROM teachers
  WHERE clerk_user_id = auth.jwt() ->> 'sub';
  RETURN t_id;
END;
$$ LANGUAGE plpgsql;

-- Get the Guardian UUID of the current authenticated Clerk user
CREATE OR REPLACE FUNCTION get_guardian_id() 
RETURNS uuid SECURITY DEFINER AS $$
DECLARE
  g_id uuid;
BEGIN
  SELECT id INTO g_id FROM guardians
  WHERE clerk_user_id = auth.jwt() ->> 'sub';
  RETURN g_id;
END;
$$ LANGUAGE plpgsql;

-- Check if current authenticated Clerk user is a linked guardian of a student
CREATE OR REPLACE FUNCTION is_guardian_of_student(student_id_param uuid) 
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM guardian_access ga
    JOIN guardians g ON ga.guardian_id = g.id
    WHERE g.clerk_user_id = auth.jwt() ->> 'sub'
    AND ga.student_id = student_id_param
  );
END;
$$ LANGUAGE plpgsql;


-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- 2. Enable RLS and create policies for each table
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

-- â”€â”€ Table: students â”€â”€
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_select ON students FOR SELECT
USING (
  is_admin() OR
  class_teacher_id = get_teacher_id() OR
  is_guardian_of_student(id)
);

CREATE POLICY students_all_admin ON students FOR ALL
USING (is_admin());


-- â”€â”€ Table: teachers â”€â”€
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY teachers_select ON teachers FOR SELECT
USING (
  is_admin() OR
  clerk_user_id = auth.jwt() ->> 'sub' OR
  -- A parent can select class teachers of their students
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.class_teacher_id = teachers.id 
    AND is_guardian_of_student(s.id)
  )
);

CREATE POLICY teachers_all_admin ON teachers FOR ALL
USING (is_admin());


-- â”€â”€ Table: guardians â”€â”€
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY guardians_select ON guardians FOR SELECT
USING (
  is_admin() OR
  clerk_user_id = auth.jwt() ->> 'sub' OR
  -- Teachers can view guardians of students in their class
  EXISTS (
    SELECT 1 FROM guardian_access ga
    JOIN students s ON ga.student_id = s.id
    WHERE ga.guardian_id = guardians.id 
    AND s.class_teacher_id = get_teacher_id()
  )
);

CREATE POLICY guardians_all_admin ON guardians FOR ALL
USING (is_admin());


-- â”€â”€ Table: guardian_access â”€â”€
ALTER TABLE guardian_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY guardian_access_select ON guardian_access FOR SELECT
USING (
  is_admin() OR
  -- Guardian can read their own access mappings
  guardian_id = get_guardian_id() OR
  -- Teacher can read access mapping for their students
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);

CREATE POLICY guardian_access_all_admin ON guardian_access FOR ALL
USING (is_admin());


-- â”€â”€ Table: attendance â”€â”€
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY attendance_select ON attendance FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY attendance_modify_teacher ON attendance FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- â”€â”€ Table: homework â”€â”€
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY homework_select ON homework FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY homework_modify_teacher ON homework FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- â”€â”€ Table: grades â”€â”€
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY grades_select ON grades FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY grades_modify_teacher ON grades FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- â”€â”€ Table: mood_checkins â”€â”€
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY mood_checkins_select ON mood_checkins FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  -- Guardians can only select mood records if they have primary wellness viewing consent enabled
  (
    is_guardian_of_student(student_id) AND
    EXISTS (
      SELECT 1 FROM guardian_access ga
      JOIN guardians g ON ga.guardian_id = g.id
      WHERE g.clerk_user_id = auth.jwt() ->> 'sub'
      AND ga.student_id = mood_checkins.student_id
      AND ga.can_view_wellness = TRUE
    )
  )
);

CREATE POLICY mood_checkins_all_admin ON mood_checkins FOR ALL
USING (is_admin());


-- â”€â”€ Table: chat_messages â”€â”€
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
WITH CHECK (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);


-- â”€â”€ Table: status_flags â”€â”€
ALTER TABLE status_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY status_flags_select ON status_flags FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY status_flags_modify ON status_flags FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- â”€â”€ Table: false_positive_corrections â”€â”€
ALTER TABLE false_positive_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY false_positive_corrections_select ON false_positive_corrections FOR SELECT
USING (
  is_admin() OR
  -- Teachers can view corrections belonging to status flags of their students
  EXISTS (
    SELECT 1 FROM status_flags sf
    JOIN students s ON sf.student_id = s.id
    WHERE sf.id = status_flag_id
    AND s.class_teacher_id = get_teacher_id()
  )
);

CREATE POLICY false_positive_corrections_insert ON false_positive_corrections FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM status_flags sf
    JOIN students s ON sf.student_id = s.id
    WHERE sf.id = status_flag_id
    AND s.class_teacher_id = get_teacher_id()
  )
);
-- Migration: 006_gate_pass_audit
-- Purpose: Add audit logging support for Gate Passes and configure RLS rules

-- Add rejection_reason column to gate_passes table (PRD Â§6.3)
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

COMMENT ON TABLE gate_pass_audit_logs IS 'Audit logs tracking gate pass requests, approvals, and scans (PRD Â§6.3).';

-- Enable RLS on gate_pass_audit_logs
ALTER TABLE gate_pass_audit_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on gate_passes
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- RLS Policies for gate_passes
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- RLS Policies for gate_pass_audit_logs
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
-- ============================================================================
-- Migration 007: School Calendar & Class Climate
-- Exam periods, holidays, and class-wide mood/engagement tracking (PRD Â§16)
-- ============================================================================

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- School Calendar
-- Exam periods and holidays to suppress false alarms during high-stress periods
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE school_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exam_period', 'holiday', 'break')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  suppress_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE school_calendar IS 'School calendar with exam periods and holidays. Used by rule engine to suppress false alarms during predictable high-stress periods (PRD Â§16).';
COMMENT ON COLUMN school_calendar.suppress_alerts IS 'If true, the rule engine will suppress or adjust flags during this period to avoid false-alarm floods.';

CREATE INDEX idx_calendar_dates ON school_calendar (start_date, end_date);
CREATE INDEX idx_calendar_type ON school_calendar (type);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Class Climate
-- Aggregate class-wide mood/engagement tracking separate from individual flags
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE class_climate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_mood_score DECIMAL(3,2), -- 1-5 scale average
  avg_engagement_score DECIMAL(3,2), -- 1-5 scale average
  total_students INTEGER NOT NULL,
  students_with_mood_data INTEGER NOT NULL,
  students_with_engagement_data INTEGER NOT NULL,
  mood_distribution JSONB DEFAULT '{}', -- { "very_positive": 5, "positive": 10, "neutral": 8, "negative": 2, "very_negative": 0 }
  engagement_distribution JSONB DEFAULT '{}', -- { "very_high": 3, "high": 12, "moderate": 7, "low": 2, "very_low": 1 }
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(class_id, date)
);

COMMENT ON TABLE class_climate IS 'Aggregate class-wide mood and engagement metrics. Separate from individual student flags to provide class-level insights (PRD Â§16).';
COMMENT ON COLUMN class_climate.avg_mood_score IS 'Average mood score across all students with mood data for the day (1-5 scale).';
COMMENT ON COLUMN class_climate.avg_engagement_score IS 'Average engagement score across all students with engagement data for the day (1-5 scale).';
COMMENT ON COLUMN class_climate.mood_distribution IS 'Distribution of mood scores across the class for the day.';
COMMENT ON COLUMN class_climate.engagement_distribution IS 'Distribution of engagement scores across the class for the day.';

CREATE INDEX idx_climate_class_date ON class_climate (class_id, date DESC);
CREATE INDEX idx_climate_date ON class_climate (date DESC);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Row Level Security
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

ALTER TABLE school_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_climate ENABLE ROW LEVEL SECURITY;

-- School calendar: read-only for all authenticated users
CREATE POLICY "calendar_read_all" ON school_calendar FOR SELECT USING (auth.role() = 'authenticated');

-- Class climate: teachers can read their own class data
CREATE POLICY "climate_read_own_class" ON class_climate FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM teachers WHERE id = class_id
  )
);

-- System can insert/update class climate data
CREATE POLICY "climate_system_write" ON class_climate FOR ALL USING (auth.role() = 'service_role');
-- ============================================================================
-- Seed Data: Comprehensive Test Dataset (15 students, 3 teachers)
-- ============================================================================
--
-- People:
--   â€¢ 3 Teachers â€” Ms. Ananya Mehra, Mr. Vikram Joshi, Ms. Kavita Deshmukh
--   â€¢ 15 Students â€” Varied patterns across all three teachers
--   â€¢ Guardians for each student
--
-- Date range: 2026-06-01 to 2026-06-15 (2 school weeks)
-- Today is conceptually 2026-06-17 so all data is "past".
-- Status Distribution: 12 On Track, 2 Worth Watching, 1 Needs Attention
-- ============================================================================

-- Clean slate (reverse dependency order)
TRUNCATE notifications, chat_messages, false_positive_corrections,
         status_flags, evidence_logs, gate_passes, bus_locations,
         mood_checkins, grades, homework, attendance,
         guardian_access, guardians, students, teachers
CASCADE;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Fixed UUIDs (makes seed idempotent and lets app code reference them)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

-- Teachers
DO $$ BEGIN PERFORM set_config('seed.teacher_mehra', 'a1000000-0000-4000-8000-000000000001', false); END $$;
DO $$ BEGIN PERFORM set_config('seed.teacher_joshi', 'a1000000-0000-4000-8000-000000000002', false); END $$;
DO $$ BEGIN PERFORM set_config('seed.teacher_deshmukh', 'a1000000-0000-4000-8000-000000000003', false); END $$;

-- Students
DO $$ BEGIN PERFORM set_config('seed.student_aarav',  'b1000000-0000-4000-8000-000000000001', false); END $$;
DO $$ BEGIN PERFORM set_config('seed.student_priya',  'b1000000-0000-4000-8000-000000000002', false); END $$;
DO $$ BEGIN PERFORM set_config('seed.student_rohan',  'b1000000-0000-4000-8000-000000000003', false); END $$;

-- Guardians
DO $$ BEGIN PERFORM set_config('seed.guardian_sunita', 'c1000000-0000-4000-8000-000000000001', false); END $$;
DO $$ BEGIN PERFORM set_config('seed.guardian_kavita', 'c1000000-0000-4000-8000-000000000002', false); END $$;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 1. TEACHERS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO teachers (id, first_name, last_name, email, phone, subjects, is_class_teacher)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Ananya', 'Mehra', 'ananya.mehra@school.edu', '+91-98765-00001', ARRAY['Math', 'Science'], TRUE),
  ('a1000000-0000-4000-8000-000000000002', 'Vikram', 'Joshi', 'vikram.joshi@school.edu', '+91-98765-00002', ARRAY['Math', 'Science'], TRUE),
  ('a1000000-0000-4000-8000-000000000003', 'Kavita', 'Deshmukh', 'kavita.deshmukh@school.edu', '+91-98765-00003', ARRAY['Math', 'Science'], TRUE);


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 2. STUDENTS (15 students across 3 teachers)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- TEACHER 1: Ms. Ananya Mehra (a1000000-0000-4000-8000-000000000001)
-- Students 1-5

INSERT INTO students (id, first_name, last_name, display_name, grade, section, roll_number, date_of_birth, class_teacher_id)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'Aarav', 'Sharma', 'Aarav Sharma', '8', 'A', '801', '2012-03-15', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'Priya', 'Patel', 'Priya Patel', '8', 'A', '802', '2012-07-22', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000003', 'Rohan', 'Singh', 'Rohan Singh', '8', 'A', '803', '2013-11-02', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000004', 'Ananya', 'Gupta', 'Ananya Gupta', '8', 'A', '804', '2012-05-10', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'Kabir', 'Khan', 'Kabir Khan', '8', 'A', '805', '2013-01-18', 'a1000000-0000-4000-8000-000000000001');

-- TEACHER 2: Mr. Vikram Joshi (a1000000-0000-4000-8000-000000000002)
-- Students 6-10

INSERT INTO students (id, first_name, last_name, display_name, grade, section, roll_number, date_of_birth, class_teacher_id)
VALUES
  ('b1000000-0000-4000-8000-000000000006', 'Diya', 'Mehta', 'Diya Mehta', '8', 'B', '806', '2012-09-05', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000007', 'Arjun', 'Reddy', 'Arjun Reddy', '8', 'B', '807', '2013-02-14', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000008', 'Meera', 'Nair', 'Meera Nair', '8', 'B', '808', '2012-11-28', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000009', 'Vihaan', 'Iyer', 'Vihaan Iyer', '8', 'B', '809', '2012-08-19', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000010', 'Zara', 'Ahmed', 'Zara Ahmed', '8', 'B', '810', '2013-04-30', 'a1000000-0000-4000-8000-000000000002');

-- TEACHER 3: Ms. Kavita Deshmukh (a1000000-0000-4000-8000-000000000003)
-- Students 11-15

INSERT INTO students (id, first_name, last_name, display_name, grade, section, roll_number, date_of_birth, class_teacher_id)
VALUES
  ('b1000000-0000-4000-8000-000000000011', 'Advait', 'Sharma', 'Advait Sharma', '8', 'C', '811', '2012-06-12', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000012', 'Ishaan', 'Verma', 'Ishaan Verma', '8', 'C', '812', '2012-12-03', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000013', 'Navya', 'Kapoor', 'Navya Kapoor', '8', 'C', '813', '2013-03-25', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000014', 'Reyansh', 'Chauhan', 'Reyansh Chauhan', '8', 'C', '814', '2012-10-08', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000015', 'Aarohi', 'Menon', 'Aarohi Menon', '8', 'C', '815', '2012-07-17', 'a1000000-0000-4000-8000-000000000003');


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 3. GUARDIANS + ACCESS (one guardian per student for simplicity)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO guardians (id, first_name, last_name, email, phone, preferred_language)
VALUES
  ('c1000000-0000-4000-8000-000000000001', 'Sunita', 'Sharma', 'sunita.sharma@email.com', '+91-98765-10001', 'hi'),
  ('c1000000-0000-4000-8000-000000000002', 'Rajesh', 'Patel', 'rajesh.patel@email.com', '+91-98765-10002', 'en'),
  ('c1000000-0000-4000-8000-000000000003', 'Priya', 'Singh', 'priya.singh@email.com', '+91-98765-10003', 'hi'),
  ('c1000000-0000-4000-8000-000000000004', 'Amit', 'Gupta', 'amit.gupta@email.com', '+91-98765-10004', 'en'),
  ('c1000000-0000-4000-8000-000000000005', 'Fatima', 'Khan', 'fatima.khan@email.com', '+91-98765-10005', 'en'),
  ('c1000000-0000-4000-8000-000000000006', 'Neha', 'Mehta', 'neha.mehta@email.com', '+91-98765-10006', 'hi'),
  ('c1000000-0000-4000-8000-000000000007', 'Suresh', 'Reddy', 'suresh.reddy@email.com', '+91-98765-10007', 'en'),
  ('c1000000-0000-4000-8000-000000000008', 'Lakshmi', 'Nair', 'lakshmi.nair@email.com', '+91-98765-10008', 'en'),
  ('c1000000-0000-4000-8000-000000000009', 'Ravi', 'Iyer', 'ravi.iyer@email.com', '+91-98765-10009', 'en'),
  ('c1000000-0000-4000-8000-000000000010', 'Imran', 'Ahmed', 'imran.ahmed@email.com', '+91-98765-10010', 'en'),
  ('c1000000-0000-4000-8000-000000000011', 'Deepa', 'Sharma', 'deepa.sharma@email.com', '+91-98765-10011', 'hi'),
  ('c1000000-0000-4000-8000-000000000012', 'Sandeep', 'Verma', 'sandeep.verma@email.com', '+91-98765-10012', 'hi'),
  ('c1000000-0000-4000-8000-000000000013', 'Raj', 'Kapoor', 'raj.kapoor@email.com', '+91-98765-10013', 'en'),
  ('c1000000-0000-4000-8000-000000000014', 'Preeti', 'Chauhan', 'preeti.chauhan@email.com', '+91-98765-10014', 'hi'),
  ('c1000000-0000-4000-8000-000000000015', 'Ramesh', 'Menon', 'ramesh.menon@email.com', '+91-98765-10015', 'en');

INSERT INTO guardian_access (guardian_id, student_id, relationship, is_primary, can_view_wellness) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'mother', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'father', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000003', 'mother', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000004', 'father', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000005', 'mother', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000006', 'mother', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000007', 'father', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000008', 'mother', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000009', 'father', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000010', 'b1000000-0000-4000-8000-000000000010', 'father', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000011', 'b1000000-0000-4000-8000-000000000011', 'mother', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000012', 'b1000000-0000-4000-8000-000000000012', 'father', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000013', 'b1000000-0000-4000-8000-000000000013', 'father', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000014', 'b1000000-0000-4000-8000-000000000014', 'mother', TRUE, TRUE),
  ('c1000000-0000-4000-8000-000000000015', 'b1000000-0000-4000-8000-000000000015', 'father', TRUE, TRUE);


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 4. ATTENDANCE (10 school days: 2026-06-01 to 2026-06-15)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- School days (Mon-Fri, excluding weekends):
-- Wk1: Jun 1,2,3,4,5  |  Wk2: Jun 8,9,10,12,15 (Jun 11-13 are weekend)

-- Student 1: Aarav Sharma - 10/10 present
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at) SELECT 'b1000000-0000-4000-8000-000000000001'::uuid, date::date, 'present', 'a1000000-0000-4000-8000-000000000001'::uuid, NULL, (date || ' 08:30:00+05:30')::timestamptz
FROM unnest(ARRAY['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-08','2026-06-09','2026-06-10','2026-06-12','2026-06-15']) AS date;

-- Student 2: Priya Patel - 9/10 present, 1 late
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at) VALUES
  ('b1000000-0000-4000-8000-000000000002', '2026-06-01', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-01 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-02', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-02 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-03', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-03 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-04', 'late', 'a1000000-0000-4000-8000-000000000001', 'Traffic', '2026-06-04 08:50:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-05', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-05 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-08', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-08 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-09', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-09 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-10', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-10 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-12', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-12 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', '2026-06-15', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-15 08:30:00+05:30');

-- Student 3: Rohan Singh - 9/10 present, 1 absent
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at) VALUES
  ('b1000000-0000-4000-8000-000000000003', '2026-06-01', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-01 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-02', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-02 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-03', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-03 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-04', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-04 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-05', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-05 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-08', 'absent', 'a1000000-0000-4000-8000-000000000001', 'Sick', '2026-06-08 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-09', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-09 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-10', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-10 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-12', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-12 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', '2026-06-15', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-15 08:30:00+05:30');

-- Student 4: Ananya Gupta - 10/10 present
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at) SELECT 'b1000000-0000-4000-8000-000000000004'::uuid, date::date, 'present', 'a1000000-0000-4000-8000-000000000001'::uuid, NULL, (date || ' 08:30:00+05:30')::timestamptz
FROM unnest(ARRAY['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-08','2026-06-09','2026-06-10','2026-06-12','2026-06-15']) AS date;

-- Student 5: Kabir Khan - 5/10 present, 5 absent (Needs Attention)
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at) VALUES
  ('b1000000-0000-4000-8000-000000000005', '2026-06-01', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-01 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-02', 'absent', 'a1000000-0000-4000-8000-000000000001', 'Sick', '2026-06-02 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-03', 'absent', 'a1000000-0000-4000-8000-000000000001', 'Sick', '2026-06-03 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-04', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-04 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-05', 'absent', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-05 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-08', 'absent', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-08 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-09', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-09 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-10', 'absent', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-10 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-12', 'present', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-12 08:30:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', '2026-06-15', 'absent', 'a1000000-0000-4000-8000-000000000001', NULL, '2026-06-15 08:30:00+05:30');

-- Students 6-15: All 10/10 present (simplified for brevity)
WITH student_teachers AS (
  SELECT 
    unnest(ARRAY['b1000000-0000-4000-8000-000000000006','b1000000-0000-4000-8000-000000000007','b1000000-0000-4000-8000-000000000008','b1000000-0000-4000-8000-000000000009','b1000000-0000-4000-8000-000000000010','b1000000-0000-4000-8000-000000000011','b1000000-0000-4000-8000-000000000012','b1000000-0000-4000-8000-000000000013','b1000000-0000-4000-8000-000000000014','b1000000-0000-4000-8000-000000000015']::uuid[]) AS student_id,
    unnest(ARRAY['a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003']::uuid[]) AS class_teacher_id
)
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at)
SELECT st.student_id, d.date::date, 'present', st.class_teacher_id, NULL, (d.date || ' 08:30:00+05:30')::timestamptz
FROM student_teachers st,
unnest(ARRAY['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-08','2026-06-09','2026-06-10','2026-06-12','2026-06-15']) AS d(date);


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 5. HOMEWORK (4 assignments per student)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Student 1: Aarav - 4/4 submitted on time
INSERT INTO homework (student_id, subject, title, due_date, submitted_at, assigned_by) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'Math', 'Algebra Worksheet', '2026-06-01', '2026-06-01 20:00:00+05:30', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'Science', 'Lab Report', '2026-06-05', '2026-06-04 19:30:00+05:30', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'Math', 'Geometry Quiz', '2026-06-08', '2026-06-07 21:00:00+05:30', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'English', 'Essay Draft', '2026-06-12', '2026-06-11 20:15:00+05:30', 'a1000000-0000-4000-8000-000000000001');

-- Student 2: Priya - 3/4 submitted
INSERT INTO homework (student_id, subject, title, due_date, submitted_at, assigned_by) VALUES
  ('b1000000-0000-4000-8000-000000000002', 'Math', 'Algebra Worksheet', '2026-06-01', '2026-06-01 22:00:00+05:30', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'Science', 'Lab Report', '2026-06-05', NULL, 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'Math', 'Geometry Quiz', '2026-06-08', '2026-06-08 08:00:00+05:30', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'English', 'Essay Draft', '2026-06-12', '2026-06-12 07:30:00+05:30', 'a1000000-0000-4000-8000-000000000001');

-- Student 3: Rohan - 3/4 submitted
INSERT INTO homework (student_id, subject, title, due_date, submitted_at, assigned_by) VALUES
  ('b1000000-0000-4000-8000-000000000003', 'Math', 'Algebra Worksheet', '2026-06-01', '2026-06-02 20:00:00+05:30', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000003', 'Science', 'Lab Report', '2026-06-05', NULL, 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000003', 'English', 'Essay Draft', '2026-06-08', '2026-06-09 21:00:00+05:30', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000003', 'Math', 'Geometry Problems', '2026-06-12', '2026-06-13 20:15:00+05:30', 'a1000000-0000-4000-8000-000000000001');

-- Student 4: Ananya - 4/4 submitted
INSERT INTO homework (student_id, subject, title, due_date, submitted_at, assigned_by)
SELECT 
  'b1000000-0000-4000-8000-000000000004'::uuid,
  unnest(ARRAY['Math', 'Science', 'Math', 'English']),
  unnest(ARRAY['Algebra Worksheet', 'Lab Report', 'Geometry Quiz', 'Essay Draft']),
  unnest(ARRAY['2026-06-01', '2026-06-05', '2026-06-08', '2026-06-12']::date[]),
  unnest(ARRAY['2026-06-01 20:00:00+05:30', '2026-06-05 20:00:00+05:30', '2026-06-08 20:00:00+05:30', '2026-06-12 20:00:00+05:30']::timestamptz[]),
  'a1000000-0000-4000-8000-000000000001'::uuid;

-- Student 5: Kabir - 0/4 submitted (Needs Attention)
INSERT INTO homework (student_id, subject, title, due_date, submitted_at, assigned_by) VALUES
  ('b1000000-0000-4000-8000-000000000005', 'Math', 'Algebra Worksheet', '2026-06-01', NULL, 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'Science', 'Lab Report', '2026-06-05', NULL, 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'History', 'Essay', '2026-06-10', NULL, 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'English', 'Reading Response', '2026-06-15', NULL, 'a1000000-0000-4000-8000-000000000001');

-- Students 6-15: All 4/4 submitted (simplified)
WITH student_teachers AS (
  SELECT 
    unnest(ARRAY['b1000000-0000-4000-8000-000000000006','b1000000-0000-4000-8000-000000000007','b1000000-0000-4000-8000-000000000008','b1000000-0000-4000-8000-000000000009','b1000000-0000-4000-8000-000000000010','b1000000-0000-4000-8000-000000000011','b1000000-0000-4000-8000-000000000012','b1000000-0000-4000-8000-000000000013','b1000000-0000-4000-8000-000000000014','b1000000-0000-4000-8000-000000000015']::uuid[]) AS student_id,
    unnest(ARRAY['a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003']::uuid[]) AS assigned_by
),
homework_templates AS (
  SELECT 
    unnest(ARRAY['Math','Science','Math','English']) AS subject,
    unnest(ARRAY['Worksheet 1','Lab 1','Worksheet 2','Reading']) AS title,
    unnest(ARRAY['2026-06-01','2026-06-05','2026-06-08','2026-06-12']::date[]) AS due_date
)
INSERT INTO homework (student_id, subject, title, due_date, submitted_at, assigned_by)
SELECT st.student_id, hw.subject, hw.title, hw.due_date, (hw.due_date || ' 20:00:00+05:30')::timestamptz, st.assigned_by
FROM student_teachers st, homework_templates hw;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 6. GRADES (3 assessments per student)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Student 1: Aarav - High grades
INSERT INTO grades (student_id, subject, assessment_name, score, max_score, assessment_date, recorded_by) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'Math', 'Quiz 1', 92, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'Science', 'Quiz 1', 88, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'Math', 'Midterm', 95, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000001');

-- Student 2: Priya - Good grades
INSERT INTO grades (student_id, subject, assessment_name, score, max_score, assessment_date, recorded_by) VALUES
  ('b1000000-0000-4000-8000-000000000002', 'Math', 'Quiz 1', 85, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'Science', 'Quiz 1', 82, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'Math', 'Midterm', 88, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000001');

-- Student 3: Rohan - Good grades
INSERT INTO grades (student_id, subject, assessment_name, score, max_score, assessment_date, recorded_by) VALUES
  ('b1000000-0000-4000-8000-000000000003', 'Math', 'Quiz 1', 88, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000003', 'Science', 'Quiz 1', 85, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000003', 'Math', 'Midterm', 82, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000001');

-- Student 4: Ananya - High grades
INSERT INTO grades (student_id, subject, assessment_name, score, max_score, assessment_date, recorded_by) VALUES
  ('b1000000-0000-4000-8000-000000000004', 'Math', 'Quiz 1', 90, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000004', 'Science', 'Quiz 1', 92, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000004', 'Math', 'Midterm', 94, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000001');

-- Student 5: Kabir - Low grades (Needs Attention)
INSERT INTO grades (student_id, subject, assessment_name, score, max_score, assessment_date, recorded_by) VALUES
  ('b1000000-0000-4000-8000-000000000005', 'Math', 'Quiz 1', 60, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'Science', 'Quiz 1', 55, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'History', 'Midterm', 40, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000001');

-- Students 6-15: All good grades (simplified)
INSERT INTO grades (student_id, subject, assessment_name, score, max_score, assessment_date, recorded_by) VALUES
  ('b1000000-0000-4000-8000-000000000006', 'Math', 'Quiz 1', 90, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000006', 'Science', 'Quiz 1', 85, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000006', 'Math', 'Midterm', 88, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000007', 'Math', 'Quiz 1', 92, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000007', 'Science', 'Quiz 1', 87, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000007', 'Math', 'Midterm', 89, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000008', 'Math', 'Quiz 1', 86, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000008', 'Science', 'Quiz 1', 91, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000008', 'Math', 'Midterm', 88, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000009', 'Math', 'Quiz 1', 90, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000009', 'Science', 'Quiz 1', 85, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000009', 'Math', 'Midterm', 87, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000010', 'Math', 'Quiz 1', 84, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000010', 'Science', 'Quiz 1', 89, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000010', 'Math', 'Midterm', 86, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000011', 'Math', 'Quiz 1', 88, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000011', 'Science', 'Quiz 1', 85, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000011', 'Math', 'Midterm', 89, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000012', 'Math', 'Quiz 1', 87, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000012', 'Science', 'Quiz 1', 88, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000012', 'Math', 'Midterm', 86, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000013', 'Math', 'Quiz 1', 90, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000013', 'Science', 'Quiz 1', 85, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000013', 'Math', 'Midterm', 89, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000014', 'Math', 'Quiz 1', 87, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000014', 'Science', 'Quiz 1', 88, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000014', 'Math', 'Midterm', 85, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000015', 'Math', 'Quiz 1', 90, 100, '2026-06-03', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000015', 'Science', 'Quiz 1', 86, 100, '2026-06-07', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000015', 'Math', 'Midterm', 89, 100, '2026-06-12', 'a1000000-0000-4000-8000-000000000003');


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 7. MOOD CHECK-INS (5 per student)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Student 1: Aarav - Happy
INSERT INTO mood_checkins (student_id, mood_value, mood_label, note, checked_in_at) VALUES
  ('b1000000-0000-4000-8000-000000000001', 5, 'Happy', NULL, '2026-06-01 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000001', 4, 'Happy', NULL, '2026-06-05 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000001', 5, 'Happy', NULL, '2026-06-08 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000001', 4, 'Happy', NULL, '2026-06-12 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000001', 5, 'Happy', NULL, '2026-06-15 09:00:00+05:30');

-- Student 2: Priya - Mixed
INSERT INTO mood_checkins (student_id, mood_value, mood_label, note, checked_in_at) VALUES
  ('b1000000-0000-4000-8000-000000000002', 4, 'Happy', NULL, '2026-06-01 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', 3, 'Neutral', NULL, '2026-06-05 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', 3, 'Neutral', NULL, '2026-06-08 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', 3, 'Neutral', NULL, '2026-06-12 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000002', 3, 'Neutral', NULL, '2026-06-15 09:00:00+05:30');

-- Student 3: Rohan - Mixed
INSERT INTO mood_checkins (student_id, mood_value, mood_label, note, checked_in_at) VALUES
  ('b1000000-0000-4000-8000-000000000003', 4, 'Happy', NULL, '2026-06-01 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', 3, 'Neutral', 'Stressed', '2026-06-05 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', 3, 'Neutral', NULL, '2026-06-08 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', 4, 'Happy', NULL, '2026-06-12 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000003', 3, 'Neutral', NULL, '2026-06-15 09:00:00+05:30');

-- Student 4: Ananya - Happy
INSERT INTO mood_checkins (student_id, mood_value, mood_label, note, checked_in_at) SELECT 'b1000000-0000-4000-8000-000000000004'::uuid, 4, 'Happy', NULL, (date || ' 09:00:00+05:30')::timestamptz
FROM unnest(ARRAY['2026-06-01','2026-06-05','2026-06-08','2026-06-12','2026-06-15']) AS date;

-- Student 5: Kabir - Low mood (Needs Attention)
INSERT INTO mood_checkins (student_id, mood_value, mood_label, note, checked_in_at) VALUES
  ('b1000000-0000-4000-8000-000000000005', 2, 'Sad', 'Not feeling well', '2026-06-01 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', 1, 'Very Sad', 'Struggling', '2026-06-05 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', 1, 'Very Sad', NULL, '2026-06-08 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', 2, 'Sad', NULL, '2026-06-12 09:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', 1, 'Very Sad', NULL, '2026-06-15 09:00:00+05:30');

-- Students 6-15: All happy/neutral (simplified)
INSERT INTO mood_checkins (student_id, mood_value, mood_label, note, checked_in_at)
SELECT student_id::uuid, 4, 'Happy', NULL, (date || ' 09:00:00+05:30')::timestamptz
FROM unnest(ARRAY[
  'b1000000-0000-4000-8000-000000000006','b1000000-0000-4000-8000-000000000007','b1000000-0000-4000-8000-000000000008','b1000000-0000-4000-8000-000000000009','b1000000-0000-4000-8000-000000000010',
  'b1000000-0000-4000-8000-000000000011','b1000000-0000-4000-8000-000000000012','b1000000-0000-4000-8000-000000000013','b1000000-0000-4000-8000-000000000014','b1000000-0000-4000-8000-000000000015'
]::uuid[]) AS student_id,
unnest(ARRAY['2026-06-01','2026-06-05','2026-06-08','2026-06-12','2026-06-15']) AS date;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 8. EVIDENCE LOGS (simplified - one per student)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO evidence_logs (id, student_id, source_type, headline, bullets, generated_at)
SELECT 
  ('e1000000' || substring(student_id::text from 9))::uuid,
  student_id::uuid,
  'attendance',
  CASE WHEN student_id = 'b1000000-0000-4000-8000-000000000005' THEN 'Severe attendance issues' ELSE 'Good attendance' END,
  CASE WHEN student_id = 'b1000000-0000-4000-8000-000000000005' THEN '["50% attendance rate", "Multiple unexcused absences"]'::jsonb ELSE '["100% attendance rate"]'::jsonb END,
  '2026-06-16 06:00:00+05:30'::timestamptz
FROM unnest(ARRAY[
  'b1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000003','b1000000-0000-4000-8000-000000000004','b1000000-0000-4000-8000-000000000005',
  'b1000000-0000-4000-8000-000000000006','b1000000-0000-4000-8000-000000000007','b1000000-0000-4000-8000-000000000008','b1000000-0000-4000-8000-000000000009','b1000000-0000-4000-8000-000000000010',
  'b1000000-0000-4000-8000-000000000011','b1000000-0000-4000-8000-000000000012','b1000000-0000-4000-8000-000000000013','b1000000-0000-4000-8000-000000000014','b1000000-0000-4000-8000-000000000015'
]::uuid[]) AS student_id;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 9. STATUS FLAGS (one per student based on rule engine results)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 12 On Track, 2 Worth Watching, 1 Needs Attention
INSERT INTO status_flags (student_id, status, triggered_by_evidence, action_status, created_at)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'on_track', 'e1000000-0000-4000-8000-000000000001'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000002', 'on_track', 'e1000000-0000-4000-8000-000000000002'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000003', 'on_track', 'e1000000-0000-4000-8000-000000000003'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000004', 'on_track', 'e1000000-0000-4000-8000-000000000004'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000005', 'needs_attention', 'e1000000-0000-4000-8000-000000000005'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000006', 'on_track', 'e1000000-0000-4000-8000-000000000006'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000007', 'on_track', 'e1000000-0000-4000-8000-000000000007'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000008', 'on_track', 'e1000000-0000-4000-8000-000000000008'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000009', 'on_track', 'e1000000-0000-4000-8000-000000000009'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000010', 'worth_watching', 'e1000000-0000-4000-8000-000000000010'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000011', 'on_track', 'e1000000-0000-4000-8000-000000000011'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000012', 'on_track', 'e1000000-0000-4000-8000-000000000012'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000013', 'worth_watching', 'e1000000-0000-4000-8000-000000000013'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000014', 'on_track', 'e1000000-0000-4000-8000-000000000014'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz),
  ('b1000000-0000-4000-8000-000000000015', 'on_track', 'e1000000-0000-4000-8000-000000000015'::uuid, 'unseen', '2026-06-16 06:00:00+05:30'::timestamptz);


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 10. GATE PASSES (sample passes)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO gate_passes (student_id, requested_by, approved_by, status, pickup_window_start, pickup_window_end, pass_code, reason, used_at, created_at)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'used', '2026-06-05 13:00:00+05:30', '2026-06-05 14:00:00+05:30', '482917', 'Dentist appointment', '2026-06-05 13:15:00+05:30', '2026-06-04 20:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000005', NULL, 'pending', '2026-06-16 12:00:00+05:30', '2026-06-16 13:00:00+05:30', NULL, 'Family event', NULL, '2026-06-15 18:00:00+05:30');


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 11. CHAT MESSAGES (sample teacher-parent communication)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO chat_messages (student_id, sender_id, sender_role, content, is_context_flag, created_at) VALUES
  ('b1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000005', 'parent', 'Kabir has been having trouble sleeping lately. He seems stressed but won''t tell me what''s wrong.', TRUE, '2026-06-10 21:00:00+05:30'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'teacher', 'Thank you for sharing that. I''ve noticed he''s been withdrawn in class too. His attendance has dropped and he hasn''t submitted homework. Can we schedule a call?', FALSE, '2026-06-11 08:00:00+05:30');


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 12. NOTIFICATIONS (sample notifications)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read, read_at, created_at) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'teacher', 'b1000000-0000-4000-8000-000000000005', 'Needs Attention: Kabir K.', 'Kabir has been flagged across attendance (50%), homework (0% submission), and mood (low scores). Immediate follow-up recommended.', 'wellness', FALSE, NULL, '2026-06-16 06:00:00+05:30'),
  ('c1000000-0000-4000-8000-000000000005', 'parent', 'b1000000-0000-4000-8000-000000000005', 'Kabir''s mid-term results', 'Kabir scored 40/100 in History. His class teacher may reach out to discuss support options.', 'academic', TRUE, '2026-06-13 19:00:00+05:30', '2026-06-13 15:00:00+05:30');


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 13. BUS LOCATIONS (sample pings)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO bus_locations (bus_identifier, latitude, longitude, speed_kmh, heading, recorded_at) VALUES
  ('BUS-001', 28.6139, 77.2090, 35.5, 45.0, '2026-06-10 07:15:00+05:30'),
  ('BUS-001', 28.6200, 77.2150, 28.0, 50.0, '2026-06-10 07:20:00+05:30'),
  ('BUS-001', 28.6280, 77.2200, 15.0, 55.0, '2026-06-10 07:25:00+05:30'),
  ('BUS-001', 28.6350, 77.2250, 0.0, 0.0, '2026-06-10 07:30:00+05:30');


-- Verification block moved to the end of the file.

-- ============================================================================
-- School Calendar Data (PRD Â§16)
-- ============================================================================

INSERT INTO school_calendar (name, type, start_date, end_date, description, suppress_alerts) VALUES
  ('Mid-Term Exams', 'exam_period', '2026-06-15', '2026-06-25', 'Mid-term examination period for all classes', true),
  ('Summer Break', 'break', '2026-07-01', '2026-07-31', 'Summer vacation period', true),
  ('Final Exams', 'exam_period', '2026-12-10', '2026-12-20', 'Final examination period for all classes', true),
  ('Winter Break', 'break', '2026-12-21', '2027-01-05', 'Winter vacation period', true),
  ('Diwali Holidays', 'holiday', '2026-10-20', '2026-10-25', 'Diwali festival holidays', true);

-- ============================================================================
-- Class Climate Data (PRD Â§16)
-- ============================================================================

-- Sample class climate data for all three teachers' classes
INSERT INTO class_climate (class_id, date, avg_mood_score, avg_engagement_score, total_students, students_with_mood_data, students_with_engagement_data, mood_distribution, engagement_distribution) VALUES
  ('a1000000-0000-4000-8000-000000000001', '2026-06-01', 4.2, 4.5, 5, 5, 5, '{"very_positive": 2, "positive": 2, "neutral": 1, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 2, "high": 2, "moderate": 1, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000001', '2026-06-05', 4.0, 4.3, 5, 5, 5, '{"very_positive": 1, "positive": 3, "neutral": 1, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 3, "moderate": 1, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000001', '2026-06-08', 3.8, 4.1, 5, 5, 5, '{"very_positive": 1, "positive": 2, "neutral": 2, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 2, "moderate": 2, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000001', '2026-06-12', 3.9, 4.2, 5, 5, 5, '{"very_positive": 1, "positive": 2, "neutral": 2, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 2, "moderate": 2, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000001', '2026-06-15', 3.6, 3.9, 5, 5, 5, '{"very_positive": 0, "positive": 2, "neutral": 2, "negative": 1, "very_negative": 0}'::jsonb, '{"very_high": 0, "high": 2, "moderate": 2, "low": 1, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000002', '2026-06-01', 4.1, 4.4, 5, 5, 5, '{"very_positive": 2, "positive": 2, "neutral": 1, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 2, "high": 2, "moderate": 1, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000002', '2026-06-05', 4.0, 4.3, 5, 5, 5, '{"very_positive": 1, "positive": 3, "neutral": 1, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 3, "moderate": 1, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000002', '2026-06-08', 3.9, 4.2, 5, 5, 5, '{"very_positive": 1, "positive": 2, "neutral": 2, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 2, "moderate": 2, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000002', '2026-06-12', 4.0, 4.3, 5, 5, 5, '{"very_positive": 1, "positive": 3, "neutral": 1, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 3, "moderate": 1, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000002', '2026-06-15', 3.8, 4.1, 5, 5, 5, '{"very_positive": 1, "positive": 2, "neutral": 2, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 2, "moderate": 2, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000003', '2026-06-01', 4.0, 4.3, 5, 5, 5, '{"very_positive": 1, "positive": 3, "neutral": 1, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 3, "moderate": 1, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000003', '2026-06-05', 3.9, 4.2, 5, 5, 5, '{"very_positive": 1, "positive": 2, "neutral": 2, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 2, "moderate": 2, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000003', '2026-06-08', 3.8, 4.1, 5, 5, 5, '{"very_positive": 1, "positive": 2, "neutral": 2, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 2, "moderate": 2, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000003', '2026-06-12', 3.9, 4.2, 5, 5, 5, '{"very_positive": 1, "positive": 2, "neutral": 2, "negative": 0, "very_negative": 0}'::jsonb, '{"very_high": 1, "high": 2, "moderate": 2, "low": 0, "very_low": 0}'::jsonb),
  ('a1000000-0000-4000-8000-000000000003', '2026-06-15', 3.7, 4.0, 5, 5, 5, '{"very_positive": 0, "positive": 2, "neutral": 2, "negative": 1, "very_negative": 0}'::jsonb, '{"very_high": 0, "high": 2, "moderate": 2, "low": 1, "very_low": 0}'::jsonb);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- Done! Verify counts.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

DO $$
DECLARE
  _t INT; _s INT; _g INT; _ga INT; _at INT; _hw INT; _gr INT; _mc INT; _el INT; _sf INT; _gp INT; _cm INT; _nt INT; _bl INT; _sc INT; _cc INT;
BEGIN
  SELECT count(*) INTO _t  FROM teachers;
  SELECT count(*) INTO _s  FROM students;
  SELECT count(*) INTO _g  FROM guardians;
  SELECT count(*) INTO _ga FROM guardian_access;
  SELECT count(*) INTO _at FROM attendance;
  SELECT count(*) INTO _hw FROM homework;
  SELECT count(*) INTO _gr FROM grades;
  SELECT count(*) INTO _mc FROM mood_checkins;
  SELECT count(*) INTO _el FROM evidence_logs;
  SELECT count(*) INTO _sf FROM status_flags;
  SELECT count(*) INTO _gp FROM gate_passes;
  SELECT count(*) INTO _cm FROM chat_messages;
  SELECT count(*) INTO _nt FROM notifications;
  SELECT count(*) INTO _bl FROM bus_locations;
  SELECT count(*) INTO _sc FROM school_calendar;
  SELECT count(*) INTO _cc FROM class_climate;

  RAISE NOTICE '
  â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
  â•‘       SEED DATA VERIFICATION            â•‘
  â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
  â•‘ Teachers:          % (expected 3)       â•‘
  â•‘ Students:          % (expected 15)      â•‘
  â•‘ Guardians:         % (expected 15)      â•‘
  â•‘ Guardian Access:   % (expected 15)      â•‘
  â•‘ Attendance:        % (expected 150)     â•‘
  â•‘ Homework:          % (expected 60)      â•‘
  â•‘ Grades:            % (expected 45)      â•‘
  â•‘ Mood Check-ins:    % (expected 75)      â•‘
  â•‘ Evidence Logs:     % (expected 15)      â•‘
  â•‘ Status Flags:      % (expected 15)      â•‘
  â•‘ Gate Passes:       % (expected 2)       â•‘
  â•‘ Chat Messages:     % (expected 2)       â•‘
  â•‘ Notifications:     % (expected 2)       â•‘
  â•‘ Bus Locations:     % (expected 4)       â•‘
  â•‘ School Calendar:   % (expected 5)       â•‘
  â•‘ Class Climate:     % (expected 15)      â•‘
  â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•',
    _t, _s, _g, _ga, _at, _hw, _gr, _mc, _el, _sf, _gp, _cm, _nt, _bl, _sc, _cc;
END $$;
