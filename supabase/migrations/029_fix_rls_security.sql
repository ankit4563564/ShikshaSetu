-- ============================================================================
-- Migration 029: Authentication & Security Fix
-- Fixes every RLS policy, removes anonymous data exposure, fixes SQL injection,
-- and ensures all Clerk auth checks use clerk_user_id properly.
-- ============================================================================

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. Fix SQL injection in community counter functions (migration 026)
--    Replace dynamic table_name/column_name with parameterized whitelist
-- ═════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment(row_id UUID, table_name TEXT, column_name TEXT, amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
  allowed_tables TEXT[] := ARRAY['community_posts', 'community_answers', 'community_upvotes', 'ai_insights'];
  allowed_columns TEXT[] := ARRAY['upvote_count', 'answer_count', 'view_count', 'report_count', 'comment_count'];
BEGIN
  IF NOT (table_name = ANY(allowed_tables)) THEN
    RAISE EXCEPTION 'Table % is not allowed for increment', table_name;
  END IF;
  IF NOT (column_name = ANY(allowed_columns)) THEN
    RAISE EXCEPTION 'Column % is not allowed for increment', column_name;
  END IF;
  EXECUTE format('SELECT COALESCE(%I, 0) FROM %I WHERE id = $1', column_name, table_name)
    INTO current_val USING row_id;
  new_val := current_val + amount;
  EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, column_name)
    USING new_val, row_id;
  RETURN new_val;
END;
$$;

CREATE OR REPLACE FUNCTION decrement(row_id UUID, table_name TEXT, column_name TEXT, amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
  allowed_tables TEXT[] := ARRAY['community_posts', 'community_answers', 'community_upvotes', 'ai_insights'];
  allowed_columns TEXT[] := ARRAY['upvote_count', 'answer_count', 'view_count', 'report_count', 'comment_count'];
BEGIN
  IF NOT (table_name = ANY(allowed_tables)) THEN
    RAISE EXCEPTION 'Table % is not allowed for decrement', table_name;
  END IF;
  IF NOT (column_name = ANY(allowed_columns)) THEN
    RAISE EXCEPTION 'Column % is not allowed for decrement', column_name;
  END IF;
  EXECUTE format('SELECT COALESCE(%I, 0) FROM %I WHERE id = $1', column_name, table_name)
    INTO current_val USING row_id;
  new_val := GREATEST(0, current_val - amount);
  EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, column_name)
    USING new_val, row_id;
  RETURN new_val;
END;
$$;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. Remove ALL anonymous data exposure on transport tables
--    student_journey, driver_trips, journey_alerts MUST require auth
-- ═════════════════════════════════════════════════════════════════════════════

-- Drop the dangerous anonymous policies
DROP POLICY IF EXISTS driver_trips_all_anon ON driver_trips;
DROP POLICY IF EXISTS student_journey_all_anon ON student_journey;
DROP POLICY IF EXISTS journey_alerts_all_anon ON journey_alerts;

-- Drop the over-broad authenticated policies
DROP POLICY IF EXISTS driver_trips_all_auth ON driver_trips;
DROP POLICY IF EXISTS student_journey_all_auth ON student_journey;
DROP POLICY IF EXISTS journey_alerts_all_auth ON journey_alerts;

-- Replace with role-specific policies

-- driver_trips: drivers can manage their own trips; admins full; teachers/guardians read
DROP POLICY IF EXISTS driver_trips_select ON driver_trips;
CREATE POLICY driver_trips_select ON driver_trips FOR SELECT
USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub' AND d.id = driver_id) OR
  EXISTS (SELECT 1 FROM students s JOIN student_stops ss ON s.id = ss.student_id WHERE ss.bus_route = driver_trips.bus_route AND s.class_teacher_id = get_teacher_id()) OR
  EXISTS (SELECT 1 FROM guardian_access ga WHERE ga.student_id IN (SELECT student_id FROM student_stops WHERE bus_route = driver_trips.bus_route) AND ga.guardian_id = get_guardian_id())
);

CREATE POLICY driver_trips_insert ON driver_trips FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY driver_trips_update ON driver_trips FOR UPDATE
USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub' AND d.id = driver_id)
)
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub' AND d.id = driver_id)
);

-- student_journey: drivers manage; teachers/guardians read; admins full
DROP POLICY IF EXISTS student_journey_select ON student_journey;
CREATE POLICY student_journey_select ON student_journey FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY student_journey_insert ON student_journey FOR INSERT
WITH CHECK (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY student_journey_update ON student_journey FOR UPDATE
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
)
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

-- journey_alerts: teachers/guardians/drivers read; drivers insert; admins full
DROP POLICY IF EXISTS journey_alerts_select ON journey_alerts;
CREATE POLICY journey_alerts_select ON journey_alerts FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY journey_alerts_insert ON journey_alerts FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub') OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);

CREATE POLICY journey_alerts_update ON journey_alerts FOR UPDATE
USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
)
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. Enable RLS on bus_locations and add policies
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE bus_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bus_locations_select ON bus_locations;
DROP POLICY IF EXISTS bus_locations_insert ON bus_locations;
DROP POLICY IF EXISTS bus_locations_update ON bus_locations;

CREATE POLICY bus_locations_select ON bus_locations FOR SELECT
USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM guardian_access ga WHERE ga.guardian_id = get_guardian_id())
);

CREATE POLICY bus_locations_insert ON bus_locations FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY bus_locations_update ON bus_locations FOR UPDATE
USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
)
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. Fix gate pass policies — remove dev mode bypass
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS gate_passes_select ON gate_passes;
DROP POLICY IF EXISTS gate_passes_insert ON gate_passes;
DROP POLICY IF EXISTS gate_passes_update ON gate_passes;

CREATE POLICY gate_passes_select ON gate_passes FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY gate_passes_insert ON gate_passes FOR INSERT
WITH CHECK (
  is_guardian_of_student(student_id)
);

CREATE POLICY gate_passes_update ON gate_passes FOR UPDATE
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
)
WITH CHECK (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. Fix audit log / scan event / ecosystem event policies
--    Only authorized roles may insert
-- ═════════════════════════════════════════════════════════════════════════════

-- gate_pass_audit_logs: only authenticated server actions
DROP POLICY IF EXISTS gate_pass_audit_logs_insert ON gate_pass_audit_logs;
CREATE POLICY gate_pass_audit_logs_insert ON gate_pass_audit_logs FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub') OR
  is_guardian_of_student(
    (SELECT student_id FROM gate_passes WHERE id = pass_id)
  ) OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

-- scan_events: fix over-broad insert
DROP POLICY IF EXISTS scan_events_insert ON scan_events;
DROP POLICY IF EXISTS scan_events_insert_driver ON scan_events;
CREATE POLICY scan_events_insert ON scan_events FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

-- scan_events: narrow driver/gate select to their own scans
DROP POLICY IF EXISTS scan_events_select_driver ON scan_events;
CREATE POLICY scan_events_select_driver ON scan_events FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id) OR
  (scanner_portal = 'driver' AND EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')) OR
  (scanner_portal = 'gate' AND EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub'))
);

-- ecosystem_events: fix anon access
DROP POLICY IF EXISTS ecosystem_events_insert ON ecosystem_events;
DROP POLICY IF EXISTS ecosystem_events_insert_auth ON ecosystem_events;
CREATE POLICY ecosystem_events_insert ON ecosystem_events FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.clerk_user_id = auth.jwt() ->> 'sub')
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 6. Fix guardian_preferences RLS (broken auth.uid() → UUID comparison)
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Guardians can read own preferences" ON guardian_preferences;
DROP POLICY IF EXISTS "Guardians can upsert own preferences" ON guardian_preferences;
DROP POLICY IF EXISTS "Guardians can update own preferences" ON guardian_preferences;

CREATE POLICY "guardian_preferences_select" ON guardian_preferences FOR SELECT
USING (guardian_id = get_guardian_id());

CREATE POLICY "guardian_preferences_insert" ON guardian_preferences FOR INSERT
WITH CHECK (guardian_id = get_guardian_id());

CREATE POLICY "guardian_preferences_update" ON guardian_preferences FOR UPDATE
USING (guardian_id = get_guardian_id())
WITH CHECK (guardian_id = get_guardian_id());

-- ═════════════════════════════════════════════════════════════════════════════
-- 7. Fix grades RLS — broken auth.uid()::uuid cast for students
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Grades: students read published" ON grades;
CREATE POLICY "Grades: students read published" ON grades FOR SELECT
USING (
  is_published = TRUE AND student_id IN (
    SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 8. Fix qr_tokens RLS — broken auth.uid()::uuid cast for students
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS qr_tokens_select ON qr_tokens;
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
    WHERE cc.student_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  )
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 9. Fix campus_cards RLS for student self-access (broken auth.uid() cast)
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS campus_cards_select ON campus_cards;
CREATE POLICY campus_cards_select ON campus_cards FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id) OR
  student_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 10. Fix redeem_reward — add OR REPLACE for idempotency (migration 021)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION redeem_reward(
  p_student_id UUID,
  p_reward_id UUID,
  p_cost INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
  v_result JSONB;
BEGIN
  SELECT coins INTO v_balance FROM student_balance WHERE student_id = p_student_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Student balance not found');
  END IF;
  IF v_balance < p_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;
  UPDATE student_balance SET coins = coins - p_cost, updated_at = now() WHERE student_id = p_student_id;
  INSERT INTO coin_transactions (student_id, amount, transaction_type, description)
  VALUES (p_student_id, -p_cost, 'redemption', CONCAT('Redeemed reward: ', (SELECT name FROM rewards_config WHERE id = p_reward_id)));
  v_result := jsonb_build_object('success', true, 'new_balance', v_balance - p_cost);
  RETURN v_result;
END;
$$;

-- ═════════════════════════════════════════════════════════════════════════════
-- 11. Fix notifications RLS — broken auth.uid() comparisons
--     (already partially fixed in migration 025, ensure consistency)
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS notifications_select_recipient ON notifications;
DROP POLICY IF EXISTS notifications_select ON notifications;
DROP POLICY IF EXISTS notifications_update ON notifications;

CREATE POLICY notifications_select ON notifications FOR SELECT
USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM teachers t WHERE t.id = recipient_id AND t.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM guardians g WHERE g.id = recipient_id AND g.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM students s WHERE s.id = recipient_id AND s.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.id = recipient_id AND d.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM admins a WHERE a.id = recipient_id AND a.clerk_user_id = auth.jwt() ->> 'sub')
);

CREATE POLICY notifications_update ON notifications FOR UPDATE
USING (
  is_admin() OR
  EXISTS (SELECT 1 FROM teachers t WHERE t.id = recipient_id AND t.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM guardians g WHERE g.id = recipient_id AND g.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM students s WHERE s.id = recipient_id AND s.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.id = recipient_id AND d.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM admins a WHERE a.id = recipient_id AND a.clerk_user_id = auth.jwt() ->> 'sub')
)
WITH CHECK (
  is_admin() OR
  EXISTS (SELECT 1 FROM teachers t WHERE t.id = recipient_id AND t.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM guardians g WHERE g.id = recipient_id AND g.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM students s WHERE s.id = recipient_id AND s.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM drivers d WHERE d.id = recipient_id AND d.clerk_user_id = auth.jwt() ->> 'sub') OR
  EXISTS (SELECT 1 FROM admins a WHERE a.id = recipient_id AND a.clerk_user_id = auth.jwt() ->> 'sub')
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 12. Fix notification_queue/notification_deliveries/notification_schedules
--     /notification_analytics RLS (migration 028) — broken admin check
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins full access on queue" ON notification_queue;
DROP POLICY IF EXISTS "Admins full access on deliveries" ON notification_deliveries;
DROP POLICY IF EXISTS "Admins full access on schedules" ON notification_schedules;
DROP POLICY IF EXISTS "Admins full access on analytics" ON notification_analytics;

CREATE POLICY "notification_queue_admin" ON notification_queue FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "notification_deliveries_admin" ON notification_deliveries FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "notification_schedules_admin" ON notification_schedules FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "notification_analytics_admin" ON notification_analytics FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub'));
