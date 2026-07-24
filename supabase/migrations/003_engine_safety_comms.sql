-- ============================================================================
-- Migration 003: Insight Engine, Safety & Communication
-- Evidence logs, status flags, false-positive corrections, gate passes,
-- bus locations, chat messages (with sender validation trigger), and
-- notifications.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Evidence Logs
-- Structured evidence produced by the rules engine (PRD §5).
-- ──────────────────────────────────────────────────────────────────────────────

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

COMMENT ON TABLE evidence_logs IS 'Structured evidence the rules engine produces from raw data. Each row represents one source contributing to a student assessment (PRD §5).';
COMMENT ON COLUMN evidence_logs.bullets IS 'JSONB array of plain-language evidence strings, e.g. ["Missed 2 of 5 homework submissions", "Math score down 13 pts"]';

CREATE INDEX idx_evidence_student    ON evidence_logs (student_id);
CREATE INDEX idx_evidence_student_ts ON evidence_logs (student_id, generated_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- Status Flags
-- On Track / Worth Watching / Needs Attention per student (PRD §3, §5).
-- Includes alert accountability lifecycle (PRD §13).
-- ──────────────────────────────────────────────────────────────────────────────

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

COMMENT ON TABLE status_flags IS 'Current and historical status flags per student. action_status tracks the Seen → Action Taken → Resolved lifecycle (PRD §13).';

CREATE INDEX idx_status_flags_student  ON status_flags (student_id);
CREATE INDEX idx_status_flags_active   ON status_flags (student_id) WHERE resolved_at IS NULL;

-- Only one active (unresolved) flag per student at any time.
CREATE UNIQUE INDEX uq_status_flags_one_active
  ON status_flags (student_id)
  WHERE resolved_at IS NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- False-Positive Corrections
-- "Mark as False Positive" feedback loop (PRD §6.2, §13).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE false_positive_corrections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_flag_id  UUID        NOT NULL REFERENCES status_flags(id) ON DELETE CASCADE,
  corrected_by    UUID        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  reason          TEXT,                                    -- optional explanation
  corrected_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE false_positive_corrections IS 'Logs when a teacher marks a status flag as a false positive (PRD §6.2, §13). Used to measure and reduce false-positive rate.';

CREATE INDEX idx_fpc_status_flag ON false_positive_corrections (status_flag_id);
CREATE INDEX idx_fpc_teacher     ON false_positive_corrections (corrected_by);

-- ──────────────────────────────────────────────────────────────────────────────
-- Gate Passes
-- Time-limited, single-use pickup passes (PRD §6.3).
-- Full audit trail: who requested, who approved, when used.
-- ──────────────────────────────────────────────────────────────────────────────

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

COMMENT ON TABLE gate_passes IS 'Secure gate-pass management (PRD §6.3). Each pass is time-limited and single-use with a 6-digit pass_code generated on approval.';

CREATE INDEX idx_gate_passes_student ON gate_passes (student_id);
CREATE INDEX idx_gate_passes_status  ON gate_passes (status) WHERE status IN ('pending', 'approved');

-- ──────────────────────────────────────────────────────────────────────────────
-- Bus Locations
-- Simulated GPS pings for transport tracking (PRD §6.3).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE bus_locations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_identifier TEXT              NOT NULL,                -- e.g. 'BUS-001'
  latitude       DOUBLE PRECISION  NOT NULL,
  longitude      DOUBLE PRECISION  NOT NULL,
  speed_kmh      NUMERIC(5,1),
  heading        NUMERIC(5,1),                             -- degrees 0-360
  recorded_at    TIMESTAMPTZ       DEFAULT now() NOT NULL
);

COMMENT ON TABLE bus_locations IS 'GPS pings for bus tracking (PRD §6.3). In demo mode these are simulated coordinates moving along an OSRM route.';

CREATE INDEX idx_bus_loc_bus_time ON bus_locations (bus_identifier, recorded_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- Chat Messages
-- Single chat thread per student between teacher and parent (PRD §6.4).
-- sender_id is polymorphic — validated by trigger below.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL,                    -- references teachers.id OR guardians.id
  sender_role     portal_role NOT NULL CHECK (sender_role IN ('teacher', 'parent')),
  content         TEXT        NOT NULL CHECK (length(content) > 0),
  is_context_flag BOOLEAN     DEFAULT FALSE,               -- true = parent "heads-up" quick note (PRD §16)
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE chat_messages IS 'Per-student chat thread between teacher and parent (PRD §6.4). sender_id is polymorphic, validated by trg_validate_chat_sender.';
COMMENT ON COLUMN chat_messages.is_context_flag IS 'True for parent quick-notes like "Rahul had a rough morning" (PRD §16 two-way context flagging).';

CREATE INDEX idx_chat_student      ON chat_messages (student_id);
CREATE INDEX idx_chat_student_time ON chat_messages (student_id, created_at DESC);
CREATE INDEX idx_chat_sender       ON chat_messages (sender_id);

-- ── Sender validation trigger ────────────────────────────────────────────────
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

-- ──────────────────────────────────────────────────────────────────────────────
-- Notifications
-- Unified notification feed across all event types (PRD §6.4).
-- ──────────────────────────────────────────────────────────────────────────────

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

COMMENT ON TABLE notifications IS 'Unified notification feed (PRD §6.4). Covers academic alerts, wellness flags, gate-pass status, bus proximity, and system messages.';

CREATE INDEX idx_notif_recipient       ON notifications (recipient_id, recipient_role);
CREATE INDEX idx_notif_recipient_unread ON notifications (recipient_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_student         ON notifications (student_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- TODO: Row-Level Security Policies (Phase 10)
--
-- evidence_logs:
--   - Teachers can read for their students.
--   - Admins can read all.
--   - Guardians: evidence is never exposed directly — only via status_flags
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
-- ──────────────────────────────────────────────────────────────────────────────
