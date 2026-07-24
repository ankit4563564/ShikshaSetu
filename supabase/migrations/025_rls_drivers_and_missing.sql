-- Migration 025: RLS policies for drivers and missing cross-portal access
-- Ensures drivers, gate staff, and the ecosystem event stream have proper row-level security.

-- 1. Add driver SELECT on students table (drivers need to look up student names during boarding/deboarding)
DROP POLICY IF EXISTS students_select_driver ON students;
CREATE POLICY students_select_driver ON students FOR SELECT
USING (
  is_admin() OR
  class_teacher_id = get_teacher_id() OR
  is_guardian_of_student(id) OR
  -- Drivers can read basic student info for transport operations
  EXISTS (
    SELECT 1 FROM drivers d
    WHERE d.clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- 2. Driver SELECT on scan_events for viewing scan history
DROP POLICY IF EXISTS scan_events_select_driver ON scan_events;
CREATE POLICY scan_events_select_driver ON scan_events FOR SELECT
USING (
  is_admin() OR
  scanner_portal = 'driver' OR
  scanner_portal = 'gate'
);

-- 3. Allow drivers to INSERT into scan_events for offline-sync
DROP POLICY IF EXISTS scan_events_insert_driver ON scan_events;
CREATE POLICY scan_events_insert_driver ON scan_events FOR INSERT
WITH CHECK (
  is_admin() OR
  scanner_portal IN ('driver', 'gate', 'offline-sync')
);

-- 4. Teachers need INSERT on evidence_logs for voice notes and CSV imports
DROP POLICY IF EXISTS evidence_logs_insert_teacher ON evidence_logs;
CREATE POLICY evidence_logs_insert_teacher ON evidence_logs FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_id
    AND s.class_teacher_id = get_teacher_id()
  )
);

-- 5. Teachers need INSERT on attendance for CSV bulk import
DROP POLICY IF EXISTS attendance_insert_teacher ON attendance;
-- Already covered by attendance_modify_teacher which uses FOR ALL

-- 6. Drivers need SELECT on student_stops to know which students board at each stop
-- Already public read from migration 010

-- 7. Gate staff and drivers need SELECT on campus_cards for scan verification
DROP POLICY IF EXISTS campus_cards_select_public ON campus_cards;
CREATE POLICY campus_cards_select_public ON campus_cards FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id) OR
  EXISTS (
    SELECT 1 FROM drivers d
    WHERE d.clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- 8. ecosystem_events INSERT policy for all authenticated roles
DROP POLICY IF EXISTS ecosystem_events_insert_auth ON ecosystem_events;
CREATE POLICY ecosystem_events_insert_auth ON ecosystem_events FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 9. Driver SELECT on student_journey_ alerts for dashboard
-- Already public read from migration 010

-- 10. Ensure notifications can be read by the recipient regardless of role
DROP POLICY IF EXISTS notifications_select_recipient ON notifications;
CREATE POLICY notifications_select_recipient ON notifications FOR SELECT
USING (
  recipient_id::text = auth.jwt() ->> 'sub' OR
  EXISTS (
    SELECT 1 FROM teachers t WHERE t.id::text = recipient_id::text AND t.clerk_user_id = auth.jwt() ->> 'sub'
  ) OR
  EXISTS (
    SELECT 1 FROM guardians g WHERE g.id::text = recipient_id::text AND g.clerk_user_id = auth.jwt() ->> 'sub'
  ) OR
  EXISTS (
    SELECT 1 FROM admins a WHERE a.id::text = recipient_id::text AND a.clerk_user_id = auth.jwt() ->> 'sub'
  ) OR
  EXISTS (
    SELECT 1 FROM drivers d WHERE d.id::text = recipient_id::text AND d.clerk_user_id = auth.jwt() ->> 'sub'
  ) OR
  is_admin()
);
