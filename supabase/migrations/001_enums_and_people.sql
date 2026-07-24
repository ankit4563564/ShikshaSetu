-- ============================================================================
-- Migration 001: Enums & People
-- Creates custom types and the core people tables (students, teachers,
-- guardians) plus the guardian_access M:N join table.
-- ============================================================================

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────────
-- Custom Enum Types
-- ──────────────────────────────────────────────────────────────────────────────

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

-- ──────────────────────────────────────────────────────────────────────────────
-- Teachers
-- (Created before students because students.class_teacher_id references this)
-- ──────────────────────────────────────────────────────────────────────────────

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

-- ──────────────────────────────────────────────────────────────────────────────
-- Students
-- ──────────────────────────────────────────────────────────────────────────────

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

-- ──────────────────────────────────────────────────────────────────────────────
-- Guardians (parents / family members)
-- ──────────────────────────────────────────────────────────────────────────────

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

COMMENT ON TABLE guardians IS 'Parents and other guardians. One guardian can have multiple children; one child can have multiple guardians (PRD §17).';

-- ──────────────────────────────────────────────────────────────────────────────
-- Guardian ↔ Student access (M:N join)
-- PRD §17: multiple guardians per student, multiple children per guardian.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE guardian_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id       UUID        NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  student_id        UUID        NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
  relationship      guardian_relationship NOT NULL,
  is_primary        BOOLEAN     DEFAULT FALSE,             -- primary contact for emergency escalation (PRD §14)
  can_view_wellness BOOLEAN     DEFAULT TRUE,              -- false = limited view for secondary guardians (PRD §17)
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_guardian_student UNIQUE (guardian_id, student_id)
);

COMMENT ON TABLE guardian_access IS 'M:N join between guardians and students. Supports multi-child parents and multi-guardian students (PRD §17).';
COMMENT ON COLUMN guardian_access.is_primary IS 'Primary guardian = first emergency contact. If unreachable, secondary guardians are escalated to (PRD §14).';
COMMENT ON COLUMN guardian_access.can_view_wellness IS 'False for secondary guardians who get attendance/bus/general updates but not sensitive wellness data (PRD §17).';

CREATE INDEX idx_guardian_access_guardian ON guardian_access (guardian_id);
CREATE INDEX idx_guardian_access_student  ON guardian_access (student_id);


-- ──────────────────────────────────────────────────────────────────────────────
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
-- ──────────────────────────────────────────────────────────────────────────────
