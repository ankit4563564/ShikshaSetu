-- Migration 028: Unified Notification Center
-- Adds: notification_queue, notification_deliveries, notification_schedules
-- Alters: notifications table with priority, archived, metadata, read_by

-- ============================================================
-- 1. Extend the notifications table
-- ============================================================

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS channels TEXT[] DEFAULT '{in_app}',
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Drop existing category CHECK if present, then re-create with all valid categories
DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'notifications'::regclass
      AND conname LIKE '%category%'
      AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE notifications DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'system'
    CHECK (category IN ('academic', 'wellness', 'safety', 'chat', 'system', 'transport', 'gate'));

CREATE INDEX IF NOT EXISTS idx_notif_priority ON notifications (priority);
CREATE INDEX IF NOT EXISTS idx_notif_archived ON notifications (recipient_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_notif_scheduled ON notifications (scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ============================================================
-- 2. Notification Queue (pending deliveries)
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel       TEXT NOT NULL CHECK (channel IN ('push', 'email', 'sms', 'whatsapp', 'in_app')),
  recipient_id  UUID NOT NULL,
  recipient_role TEXT NOT NULL,
  payload       JSONB NOT NULL DEFAULT '{}',
  priority      TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  attempts      INT NOT NULL DEFAULT 0,
  max_attempts  INT NOT NULL DEFAULT 3,
  last_error    TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_queue_status_priority ON notification_queue (status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_queue_recipient ON notification_queue (recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_retry ON notification_queue (next_retry_at) WHERE status = 'retrying';

-- ============================================================
-- 3. Notification Deliveries (delivery log per attempt)
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('push', 'email', 'sms', 'whatsapp', 'in_app')),
  recipient_id    UUID NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  attempt         INT NOT NULL DEFAULT 1,
  error_message   TEXT,
  provider_id     TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_delivery_notification ON notification_deliveries (notification_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status ON notification_deliveries (status, created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_recipient ON notification_deliveries (recipient_id, created_at);

-- ============================================================
-- 4. Notification Schedules
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  body            TEXT,
  category        TEXT NOT NULL DEFAULT 'system',
  priority        TEXT NOT NULL DEFAULT 'normal',
  channels        TEXT[] NOT NULL DEFAULT '{in_app}',
  recipient_ids   JSONB NOT NULL DEFAULT '[]',
  recipient_roles JSONB NOT NULL DEFAULT '[]',
  scheduled_for   TIMESTAMPTZ NOT NULL,
  recurrence      TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  sent_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_schedule_status ON notification_schedules (status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_schedule_pending ON notification_schedules (scheduled_for) WHERE status = 'scheduled';

-- ============================================================
-- 5. Notification Analytics (daily aggregates)
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  channel         TEXT NOT NULL,
  category        TEXT NOT NULL,
  total_sent      INT NOT NULL DEFAULT 0,
  total_delivered INT NOT NULL DEFAULT 0,
  total_failed    INT NOT NULL DEFAULT 0,
  total_read      INT NOT NULL DEFAULT 0,
  avg_delivery_ms INT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(date, channel, category)
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON notification_analytics (date DESC);

-- ============================================================
-- 6. RLS Policies
-- ============================================================

ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins full access on queue" ON notification_queue
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins full access on deliveries" ON notification_deliveries
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins full access on schedules" ON notification_schedules
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins full access on analytics" ON notification_analytics
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Service role bypasses RLS (used by server actions)

-- ============================================================
-- 7. Queue processing function
-- ============================================================

CREATE OR REPLACE FUNCTION process_notification_queue(p_batch_size INT DEFAULT 10)
RETURNS TABLE(processed_id UUID, channel TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT id, channel, notification_id, recipient_id, payload, attempts, max_attempts
    FROM notification_queue
    WHERE status IN ('pending', 'retrying')
      AND (next_retry_at IS NULL OR next_retry_at <= now())
    ORDER BY
      CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
      created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Mark as processing
    UPDATE notification_queue SET status = 'processing' WHERE id = rec.id;

    processed_id := rec.id;
    channel := rec.channel;
    status := 'processing';
    RETURN NEXT;
  END LOOP;
END;
$$;

-- ============================================================
-- 8. Update read_at on notifications when is_read changes
-- ============================================================

CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notification_read_at ON notifications;
CREATE TRIGGER trg_notification_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_read_at();

-- ============================================================
-- 9. Missing FK & composite indexes for query perf
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_notif_read_archived
  ON notifications (recipient_id, is_read, is_archived);

CREATE INDEX IF NOT EXISTS idx_gate_pass_audit_pass_id
  ON gate_pass_audit_logs (pass_id);

CREATE INDEX IF NOT EXISTS idx_community_reports_post_id
  ON community_reports (post_id);

CREATE INDEX IF NOT EXISTS idx_community_reports_answer_id
  ON community_reports (answer_id);
