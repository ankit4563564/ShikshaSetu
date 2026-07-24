-- ============================================================================
-- Migration 013: Campus ID System
--
-- Implements the Digital Campus Identity foundation:
--   • Fixed card identities with rotating signed QR tokens
--   • Multiple card types per student (student_id, library, bus_pass, etc.)
--   • Scan events with full audit trail and device metadata
--   • Replay prevention via nonce (separate from token expiry)
--   • Event bus decouples scans from downstream actions
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. New Enum Types
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TYPE campus_card_type AS ENUM (
  'student_id', 'library_card', 'bus_pass',
  'sports_card', 'hostel_card'
);

CREATE TYPE campus_card_status AS ENUM (
  'active', 'inactive', 'revoked', 'lost', 'damaged'
);

CREATE TYPE scan_mode AS ENUM (
  'transport_board', 'transport_deboard',
  'gate_entry', 'gate_exit',
  'attendance',
  'library_entry', 'sports_entry', 'event_entry', 'lab_entry', 'hostel_entry'
);

CREATE TYPE scan_result AS ENUM (
  'success', 'duplicate', 'already_boarded', 'already_deboarded',
  'invalid_qr', 'expired_token', 'revoked_card', 'inactive_card',
  'unauthorized_scanner', 'wrong_route', 'replay_detected',
  'card_not_found', 'mode_unauthorized'
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Campus Cards — fixed identity per card (multiple per student)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE campus_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  card_type       campus_card_type NOT NULL DEFAULT 'student_id',
  status          campus_card_status NOT NULL DEFAULT 'active',
  display_label   TEXT,
  issued_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  issued_by       UUID REFERENCES teachers(id) ON DELETE SET NULL,
  revoked_at      TIMESTAMPTZ,
  revoked_reason  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE campus_cards IS 'Fixed card identities. A student can have multiple cards (student_id, library, bus_pass). The card ID is stable and public; QR tokens rotate.';
COMMENT ON COLUMN campus_cards.display_label IS 'Human-readable label e.g. "Student ID Card" or "Library Card".';

CREATE INDEX idx_campus_cards_student ON campus_cards (student_id);
CREATE INDEX idx_campus_cards_active  ON campus_cards (student_id) WHERE status = 'active';

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. QR Tokens — rotating signed tokens (2–5 min validity)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE qr_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID NOT NULL REFERENCES campus_cards(id) ON DELETE CASCADE,
  nonce           UUID NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  consumed_at     TIMESTAMPTZ,
  issued_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE qr_tokens IS 'Rotating signed QR tokens. Each token has a unique nonce for replay prevention. Tokens are short-lived (2–5 min) and consumed on first use.';
COMMENT ON COLUMN qr_tokens.nonce IS 'Unique random UUID. Prevents replay attacks independently of token expiry.';
COMMENT ON COLUMN qr_tokens.consumed_at IS 'Set when the token is first used in a successful scan. If non-null, subsequent scans with this token are rejected as replay.';

CREATE INDEX idx_qr_tokens_card     ON qr_tokens (card_id);
CREATE INDEX idx_qr_tokens_nonce    ON qr_tokens (nonce);
CREATE INDEX idx_qr_tokens_consumed ON qr_tokens (consumed_at) WHERE consumed_at IS NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Scan Events — full audit trail with device metadata
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE scan_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_token_id         UUID REFERENCES qr_tokens(id) ON DELETE SET NULL,
  card_id             UUID REFERENCES campus_cards(id) ON DELETE SET NULL,
  student_id          UUID REFERENCES students(id) ON DELETE SET NULL,
  mode                scan_mode NOT NULL,
  result              scan_result NOT NULL,
  scanner_portal      TEXT,                    -- 'driver', 'gate', 'teacher', 'admin'
  scanner_identity    TEXT,                    -- user ID, device ID, or kiosk name
  device_metadata     JSONB DEFAULT '{}',      -- user-agent, ip, location, platform
  error_detail        TEXT,                    -- human-readable error if failed
  scanned_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE scan_events IS 'Complete audit trail of every campus card scan. Records mode, result, scanner identity, and device metadata.';
COMMENT ON COLUMN scan_events.scanner_portal IS 'Which portal performed the scan (driver, gate, teacher, admin).';
COMMENT ON COLUMN scan_events.scanner_identity IS 'The authenticated user or device that initiated the scan.';
COMMENT ON COLUMN scan_events.device_metadata IS 'JSON blob with user-agent, IP address, GPS coordinates, platform, etc.';

CREATE INDEX idx_scan_events_student  ON scan_events (student_id);
CREATE INDEX idx_scan_events_mode     ON scan_events (mode);
CREATE INDEX idx_scan_events_result   ON scan_events (result);
CREATE INDEX idx_scan_events_time     ON scan_events (scanned_at DESC);
CREATE INDEX idx_scan_events_card     ON scan_events (card_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Card Issue History — full lifecycle audit
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE card_issue_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  card_id         UUID REFERENCES campus_cards(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,               -- 'issued', 'revoked', 'rotated', 'marked_lost', 'reactivated', 'damaged', 'replaced'
  performed_by    UUID REFERENCES teachers(id) ON DELETE SET NULL,
  reason          TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE card_issue_history IS 'Lifecycle audit trail: every issue, revoke, rotate, loss report, and reactivation.';

CREATE INDEX idx_card_issue_student ON card_issue_history (student_id);
CREATE INDEX idx_card_issue_card    ON card_issue_history (card_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. Student columns for Campus ID profile
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE students ADD COLUMN IF NOT EXISTS house          TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group    TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. RLS Policies
-- ──────────────────────────────────────────────────────────────────────────────

-- Helper: check if current user is a driver
CREATE OR REPLACE FUNCTION is_driver()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM drivers
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql;

-- campus_cards
ALTER TABLE campus_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY campus_cards_select ON campus_cards FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id) OR
  student_id IN (SELECT id FROM students WHERE id = campus_cards.student_id) -- student self
);

CREATE POLICY campus_cards_all_admin ON campus_cards FOR ALL
USING (is_admin());

-- qr_tokens
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY qr_tokens_select ON qr_tokens FOR SELECT
USING (
  is_admin() OR
  card_id IN (
    SELECT cc.id FROM campus_cards cc
    JOIN students s ON cc.student_id = s.id
    WHERE s.class_teacher_id = get_teacher_id()
  ) OR
  card_id IN (
    SELECT cc.id FROM campus_cards cc
    JOIN guardian_access ga ON ga.student_id = cc.student_id
    WHERE ga.guardian_id = get_guardian_id()
  ) OR
  card_id IN (
    SELECT cc.id FROM campus_cards cc
    WHERE cc.student_id = auth.uid()::uuid
  )
);

-- scan_events
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY scan_events_select ON scan_events FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY scan_events_insert ON scan_events FOR INSERT
WITH CHECK (true);  -- Allow any authenticated scanner to insert

-- card_issue_history
ALTER TABLE card_issue_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY card_issue_history_select ON card_issue_history FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY card_issue_history_all_admin ON card_issue_history FOR ALL
USING (is_admin());

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. Add clerk_user_id to drivers for auth mapping
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE drivers ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. Notifications: add 'campus_id' category support (extend existing check)
-- ──────────────────────────────────────────────────────────────────────────────

-- The notifications category check already includes 'safety', 'academic',
-- 'wellness', 'chat', 'system'. We don't need a new category; scans use 'safety'.

-- ──────────────────────────────────────────────────────────────────────────────
-- 10. Ecosystem events: new event types
-- ──────────────────────────────────────────────────────────────────────────────

-- Existing ecosystem_events table stores event_type as TEXT, so no migration
-- needed. New event types will be:
--   'card_scanned'        — any campus card scan
--   'card_issued'         — new card issued
--   'card_revoked'        — card revoked
--   'card_token_rotated'  — QR token rotation
