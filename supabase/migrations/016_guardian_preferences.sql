-- ──────────────────────────────────────────────────────────────────────────────
-- 016: Guardian Consent Preferences
-- Persists the privacy/consent toggles shown in the Parent portal (Section 1).
-- Each guardian_id has one row; preferences are upserted from the UI.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guardian_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id       UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  share_mood        BOOLEAN NOT NULL DEFAULT TRUE,
  receive_bus       BOOLEAN NOT NULL DEFAULT TRUE,
  receive_academic  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_guardian_preferences UNIQUE (guardian_id)
);

ALTER TABLE guardian_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guardians can read own preferences"
  ON guardian_preferences FOR SELECT
  USING (guardian_id = auth.uid());

CREATE POLICY "Guardians can upsert own preferences"
  ON guardian_preferences FOR INSERT
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY "Guardians can update own preferences"
  ON guardian_preferences FOR UPDATE
  USING (guardian_id = auth.uid())
  WITH CHECK (guardian_id = auth.uid());
