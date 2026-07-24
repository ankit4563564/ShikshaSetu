-- ============================================================================
-- EduSync — Complete Database Schema
-- Combined migration for Supabase Dashboard SQL Editor.
--
-- Run this ONCE against a fresh Supabase project.
-- To re-run: drop all tables and types first (see bottom of file).
-- ============================================================================


-- ============================================================================
-- MIGRATION 001: Enums & People
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enum Types
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

-- Teachers (created before students because students.class_teacher_id references this)
CREATE TABLE teachers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE,
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  phone         TEXT,
  subjects      TEXT[]      DEFAULT '{}',
  is_class_teacher BOOLEAN DEFAULT FALSE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Students
CREATE TABLE students (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name       TEXT        NOT NULL,
  last_name        TEXT        NOT NULL,
  display_name     TEXT        NOT NULL,
  grade            TEXT        NOT NULL,
  section          TEXT,
  roll_number      TEXT,
  date_of_birth    DATE,
  avatar_url       TEXT,
  class_teacher_id UUID        REFERENCES teachers(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_students_grade_section ON students (grade, section);
CREATE INDEX idx_students_class_teacher ON students (class_teacher_id);

-- Guardians
CREATE TABLE guardians (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id       UUID UNIQUE,
  first_name         TEXT        NOT NULL,
  last_name          TEXT        NOT NULL,
  email              TEXT        UNIQUE,
  phone              TEXT,
  preferred_language TEXT        DEFAULT 'en',
  avatar_url         TEXT,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Guardian ↔ Student access (M:N join)
CREATE TABLE guardian_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id       UUID        NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  student_id        UUID        NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
  relationship      guardian_relationship NOT NULL,
  is_primary        BOOLEAN     DEFAULT FALSE,
  can_view_wellness BOOLEAN     DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT uq_guardian_student UNIQUE (guardian_id, student_id)
);

CREATE INDEX idx_guardian_access_guardian ON guardian_access (guardian_id);
CREATE INDEX idx_guardian_access_student  ON guardian_access (student_id);


-- ============================================================================
-- MIGRATION 002: Academic & Wellness Data
-- ============================================================================

-- Attendance
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

CREATE INDEX idx_attendance_student      ON attendance (student_id);
CREATE INDEX idx_attendance_date         ON attendance (date);
CREATE INDEX idx_attendance_student_date ON attendance (student_id, date DESC);

-- Homework
CREATE TABLE homework (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject       TEXT        NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  due_date      DATE        NOT NULL,
  submitted_at  TIMESTAMPTZ,
  is_submitted  BOOLEAN     GENERATED ALWAYS AS (submitted_at IS NOT NULL) STORED,
  assigned_by   UUID        REFERENCES teachers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_homework_student     ON homework (student_id);
CREATE INDEX idx_homework_due_date    ON homework (due_date);
CREATE INDEX idx_homework_student_sub ON homework (student_id, is_submitted);

-- Grades
CREATE TABLE grades (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject          TEXT        NOT NULL,
  assessment_name  TEXT        NOT NULL,
  score            NUMERIC(6,2) NOT NULL,
  max_score        NUMERIC(6,2) NOT NULL,
  assessment_date  DATE        NOT NULL,
  recorded_by      UUID        REFERENCES teachers(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_grades_score_positive   CHECK (score >= 0),
  CONSTRAINT chk_grades_max_positive     CHECK (max_score > 0),
  CONSTRAINT chk_grades_score_le_max     CHECK (score <= max_score)
);

CREATE INDEX idx_grades_student       ON grades (student_id);
CREATE INDEX idx_grades_student_subj  ON grades (student_id, subject);
CREATE INDEX idx_grades_assessment_dt ON grades (assessment_date);

-- Mood Check-ins
CREATE TABLE mood_checkins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mood_value     SMALLINT    NOT NULL CHECK (mood_value BETWEEN 1 AND 5),
  mood_label     TEXT        NOT NULL,
  note           TEXT,
  checked_in_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_mood_student      ON mood_checkins (student_id);
CREATE INDEX idx_mood_student_time ON mood_checkins (student_id, checked_in_at DESC);


-- ============================================================================
-- MIGRATION 003: Insight Engine, Safety & Communication
-- ============================================================================

-- Evidence Logs
CREATE TABLE evidence_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  source_type  TEXT        NOT NULL CHECK (source_type IN (
                             'attendance', 'homework', 'grades',
                             'mood', 'voice_log', 'peer_report'
                           )),
  headline     TEXT        NOT NULL,
  bullets      JSONB       NOT NULL DEFAULT '[]',
  raw_data     JSONB,
  generated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_evidence_student    ON evidence_logs (student_id);
CREATE INDEX idx_evidence_student_ts ON evidence_logs (student_id, generated_at DESC);

-- Status Flags
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

CREATE INDEX idx_status_flags_student ON status_flags (student_id);
CREATE INDEX idx_status_flags_active  ON status_flags (student_id) WHERE resolved_at IS NULL;

CREATE UNIQUE INDEX uq_status_flags_one_active
  ON status_flags (student_id)
  WHERE resolved_at IS NULL;

-- False-Positive Corrections
CREATE TABLE false_positive_corrections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_flag_id  UUID        NOT NULL REFERENCES status_flags(id) ON DELETE CASCADE,
  corrected_by    UUID        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  reason          TEXT,
  corrected_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_fpc_status_flag ON false_positive_corrections (status_flag_id);
CREATE INDEX idx_fpc_teacher     ON false_positive_corrections (corrected_by);

-- Gate Passes
CREATE TABLE gate_passes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID             NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  requested_by         UUID             NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  approved_by          UUID             REFERENCES teachers(id) ON DELETE SET NULL,
  status               gate_pass_status NOT NULL DEFAULT 'pending',
  pickup_window_start  TIMESTAMPTZ      NOT NULL,
  pickup_window_end    TIMESTAMPTZ      NOT NULL,
  pass_code            VARCHAR(6)       UNIQUE,
  reason               TEXT,
  used_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ      DEFAULT now() NOT NULL,
  CONSTRAINT chk_gate_pass_window CHECK (pickup_window_end > pickup_window_start)
);

CREATE INDEX idx_gate_passes_student ON gate_passes (student_id);
CREATE INDEX idx_gate_passes_status  ON gate_passes (status) WHERE status IN ('pending', 'approved');

-- Bus Locations
CREATE TABLE bus_locations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_identifier TEXT              NOT NULL,
  latitude       DOUBLE PRECISION  NOT NULL,
  longitude      DOUBLE PRECISION  NOT NULL,
  speed_kmh      NUMERIC(5,1),
  heading        NUMERIC(5,1),
  recorded_at    TIMESTAMPTZ       DEFAULT now() NOT NULL
);

CREATE INDEX idx_bus_loc_bus_time ON bus_locations (bus_identifier, recorded_at DESC);

-- Chat Messages
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL,
  sender_role     portal_role NOT NULL CHECK (sender_role IN ('teacher', 'parent')),
  content         TEXT        NOT NULL CHECK (length(content) > 0),
  is_context_flag BOOLEAN     DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_chat_student      ON chat_messages (student_id);
CREATE INDEX idx_chat_student_time ON chat_messages (student_id, created_at DESC);
CREATE INDEX idx_chat_sender       ON chat_messages (sender_id);

-- Sender validation trigger: ensures sender_id exists in the correct table
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

-- Notifications
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID        NOT NULL,
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

CREATE INDEX idx_notif_recipient       ON notifications (recipient_id, recipient_role);
CREATE INDEX idx_notif_recipient_unread ON notifications (recipient_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_student         ON notifications (student_id);


-- ============================================================================
-- TODO: Row-Level Security Policies (Phase 10)
-- All tables need ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- plus per-role SELECT/INSERT/UPDATE/DELETE policies.
-- Detailed policy specs are in the individual migration files.
-- ============================================================================


-- ============================================================================
-- TEARDOWN (use only if you need to re-run from scratch)
-- Uncomment and run this block first, then re-run the full migration above.
-- ============================================================================
/*
DROP TRIGGER IF EXISTS trg_validate_chat_sender ON chat_messages;
DROP FUNCTION IF EXISTS fn_validate_chat_sender();
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS bus_locations CASCADE;
DROP TABLE IF EXISTS gate_passes CASCADE;
DROP TABLE IF EXISTS false_positive_corrections CASCADE;
DROP TABLE IF EXISTS status_flags CASCADE;
DROP TABLE IF EXISTS evidence_logs CASCADE;
DROP TABLE IF EXISTS mood_checkins CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS homework CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS guardian_access CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TYPE IF EXISTS guardian_relationship;
DROP TYPE IF EXISTS alert_action_status;
DROP TYPE IF EXISTS gate_pass_status;
DROP TYPE IF EXISTS evidence_status;
DROP TYPE IF EXISTS portal_role;
*/
