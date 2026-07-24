-- ============================================================================
-- Migration 011: Connected Ecosystem Event Stream
-- Gives every portal a shared role vocabulary and a canonical cross-portal
-- event log without changing existing UI-facing tables.
-- ============================================================================

ALTER TYPE portal_role ADD VALUE IF NOT EXISTS 'student';
ALTER TYPE portal_role ADD VALUE IF NOT EXISTS 'gate';
ALTER TYPE portal_role ADD VALUE IF NOT EXISTS 'driver';

CREATE TABLE IF NOT EXISTS ecosystem_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT NOT NULL,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  actor_id    TEXT,
  actor_role  portal_role,
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE ecosystem_events IS 'Canonical cross-portal activity stream for ShikshaSetu. Existing portals keep their UI tables, while this table connects events across teacher, parent, student, gate, driver, and admin workflows.';

CREATE INDEX IF NOT EXISTS idx_ecosystem_events_student_time
  ON ecosystem_events (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ecosystem_events_type_time
  ON ecosystem_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ecosystem_events_actor
  ON ecosystem_events (actor_role, actor_id);
