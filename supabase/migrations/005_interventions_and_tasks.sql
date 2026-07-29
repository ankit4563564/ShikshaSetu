-- ============================================================================
-- Migration 005: Interventions and Support Tasks
-- Creates tables for tracking support interventions and student tasks
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Interventions
-- Tracks support interventions for students
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE interventions (
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

CREATE INDEX idx_interventions_student ON interventions (student_id);
CREATE INDEX idx_interventions_teacher ON interventions (teacher_id);
CREATE INDEX idx_interventions_status ON interventions (status);

-- ──────────────────────────────────────────────────────────────────────────────
-- Intervention Milestones
-- Tracks progress of interventions
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE intervention_milestones (
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

CREATE INDEX idx_milestones_intervention ON intervention_milestones (intervention_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Student Support Tasks
-- Tasks assigned to students as part of interventions
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE student_tasks (
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

CREATE INDEX idx_tasks_student ON student_tasks (student_id);
CREATE INDEX idx_tasks_intervention ON student_tasks (intervention_id);
CREATE INDEX idx_tasks_status ON student_tasks (status);

-- ──────────────────────────────────────────────────────────────────────────────
-- Ecosystem Events
-- Unified event log for cross-portal observability
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE ecosystem_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT        NOT NULL,
  actor_id    UUID,
  actor_role  TEXT,                                     -- teacher, student, parent, admin, system
  student_id  UUID        REFERENCES students(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE ecosystem_events IS 'Unified event log for cross-portal observability and Connected Experience.';

CREATE INDEX idx_ecosystem_student ON ecosystem_events (student_id);
CREATE INDEX idx_ecosystem_type ON ecosystem_events (event_type);
CREATE INDEX idx_ecosystem_created ON ecosystem_events (created_at DESC);
