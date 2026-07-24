-- ──────────────────────────────────────────────────────────────────────────────
-- 017: Missing RLS Policies
-- Adds Row-Level Security to tables that were created without it.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── Table: ecosystem_events (audit log) ──
ALTER TABLE ecosystem_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY ecosystem_events_select ON ecosystem_events FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

-- Server actions need to insert; allow any authenticated role
CREATE POLICY ecosystem_events_insert ON ecosystem_events FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' IS NOT NULL);

CREATE POLICY ecosystem_events_all_admin ON ecosystem_events FOR ALL
USING (is_admin());

-- ── Table: notifications ──
-- recipient_id refers to the internal UUID (teacher.id, guardian.id, etc.),
-- NOT the Clerk user ID. We look up via the role helper functions.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON notifications FOR SELECT
USING (
  is_admin() OR
  recipient_id = get_teacher_id() OR
  recipient_id = get_guardian_id() OR
  recipient_id IN (
    SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ) OR
  recipient_id IN (
    SELECT id FROM drivers WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY notifications_insert ON notifications FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' IS NOT NULL);

CREATE POLICY notifications_update ON notifications FOR UPDATE
USING (
  is_admin() OR
  recipient_id = get_teacher_id() OR
  recipient_id = get_guardian_id() OR
  recipient_id IN (
    SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ) OR
  recipient_id IN (
    SELECT id FROM drivers WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- ── Table: evidence_logs (teacher observations) ──
ALTER TABLE evidence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY evidence_logs_select ON evidence_logs FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY evidence_logs_insert ON evidence_logs FOR INSERT
WITH CHECK (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);

CREATE POLICY evidence_logs_update ON evidence_logs FOR UPDATE
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);

CREATE POLICY evidence_logs_all_admin ON evidence_logs FOR ALL
USING (is_admin());
