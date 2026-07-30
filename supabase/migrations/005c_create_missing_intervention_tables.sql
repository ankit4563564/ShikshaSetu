-- ============================================================================
-- Migration 005c: Create Missing Intervention Tables (Idempotent)
-- Creates only the missing tables from migration 005
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Interventions
-- Tracks support interventions for students
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS interventions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id          UUID        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  signal_id           TEXT,                                     -- ID of the support signal that triggered this
  signal_type         TEXT,                                     -- homework_gap, attendance_decline, etc.
  title               TEXT        NOT NULL,
  description         TEXT,
  status              TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')),
  time_saved_minutes  INTEGER,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE interventions IS 'Support interventions triggered by signals and approved by teachers.';

CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions (student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_teacher ON interventions (teacher_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions (status);

-- ──────────────────────────────────────────────────────────────────────────────
-- Intervention Milestones
-- Tracks progress of interventions
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS intervention_milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID        NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  actor           TEXT,                                     -- teacher, student, system
  actor_id        UUID,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE intervention_milestones IS 'Milestones tracking intervention progress.';

CREATE INDEX IF NOT EXISTS idx_milestones_intervention ON intervention_milestones (intervention_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Student Support Tasks
-- Tasks assigned to students as part of interventions
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS student_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  intervention_id UUID        REFERENCES interventions(id) ON DELETE SET NULL,
  title           TEXT        NOT NULL,
  description     TEXT,
  category        TEXT        NOT NULL CHECK (category IN ('academic', 'wellness', 'intervention')),
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  status          TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE student_tasks IS 'Tasks assigned to students as part of support interventions.';

CREATE INDEX IF NOT EXISTS idx_tasks_student ON student_tasks (student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_intervention ON student_tasks (intervention_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON student_tasks (status);
