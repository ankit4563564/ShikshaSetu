-- ============================================================================
-- Migration 032: Multi-Tenant Schools Schema Preparation (Phase A)
-- Creates default tenant 'schools' table, introduces school_id columns across
-- domain tables, safely backfills existing data, and adds non-null constraints.
-- ============================================================================

-- ── 1. Create Schools Tenant Base Table ──
CREATE TABLE IF NOT EXISTS schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE schools IS 'Multi-tenant primary school organization record.';

-- ── 2. Seed Default Development / Production Tenant ──
-- Fixed UUID ensures idempotent execution across all development setups
INSERT INTO schools (id, name, slug)
VALUES ('e0000000-0000-4000-8000-000000000001', 'Greenwood High International School', 'greenwood-high')
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Helper Function to Fetch Default Tenant ID ──
CREATE OR REPLACE FUNCTION get_default_school_id()
RETURNS UUID AS $$
  SELECT id FROM schools WHERE slug = 'greenwood-high' LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- DOMAIN TABLE ALTERATIONS & BACKFILLS BY CATEGORY
-- ============================================================================

-------------------------------------------------------------------------------
-- CATEGORY A: Core Identity & People Tables
-------------------------------------------------------------------------------

-- 1. user_mappings
ALTER TABLE user_mappings ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE user_mappings SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE user_mappings ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_mappings_school_id ON user_mappings(school_id);

-- 2. teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE teachers SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE teachers ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);

-- 3. guardians
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE guardians SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE guardians ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guardians_school_id ON guardians(school_id);

-- 4. students
ALTER TABLE students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE students SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE students ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);

-- 5. staff
ALTER TABLE staff ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE staff SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE staff ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_school_id ON staff(school_id);

-------------------------------------------------------------------------------
-- CATEGORY B: Student-Dependent Domain Tables
-------------------------------------------------------------------------------

-- 6. attendance_logs
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE attendance_logs SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE attendance_logs ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_logs_school_id ON attendance_logs(school_id);

-- 7. homework_assignments
ALTER TABLE homework_assignments ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE homework_assignments SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE homework_assignments ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_homework_assignments_school_id ON homework_assignments(school_id);

-- 8. homework_submissions
ALTER TABLE homework_submissions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE homework_submissions SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE homework_submissions ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_homework_submissions_school_id ON homework_submissions(school_id);

-- 9. student_mood_checkins
ALTER TABLE student_mood_checkins ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE student_mood_checkins SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE student_mood_checkins ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_mood_checkins_school_id ON student_mood_checkins(school_id);

-- 10. status_flags
ALTER TABLE status_flags ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE status_flags SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE status_flags ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_status_flags_school_id ON status_flags(school_id);

-- 11. false_positive_corrections
ALTER TABLE false_positive_corrections ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE false_positive_corrections SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE false_positive_corrections ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_false_positive_corrections_school_id ON false_positive_corrections(school_id);

-- 12. interventions
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE interventions SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE interventions ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interventions_school_id ON interventions(school_id);

-- 13. intervention_milestones
ALTER TABLE intervention_milestones ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE intervention_milestones SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE intervention_milestones ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intervention_milestones_school_id ON intervention_milestones(school_id);

-- 14. student_tasks
ALTER TABLE student_tasks ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE student_tasks SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE student_tasks ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_tasks_school_id ON student_tasks(school_id);

-- 15. exams
ALTER TABLE exams ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE exams SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE exams ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exams_school_id ON exams(school_id);

-- 16. exam_marks
ALTER TABLE exam_marks ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE exam_marks SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE exam_marks ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exam_marks_school_id ON exam_marks(school_id);

-------------------------------------------------------------------------------
-- CATEGORY C: Operational & Transit Tables
-------------------------------------------------------------------------------

-- 17. gate_pass_requests
ALTER TABLE gate_pass_requests ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE gate_pass_requests SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE gate_pass_requests ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gate_pass_requests_school_id ON gate_pass_requests(school_id);

-- 18. gate_pass_audit_logs
ALTER TABLE gate_pass_audit_logs ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE gate_pass_audit_logs SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE gate_pass_audit_logs ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gate_pass_audit_logs_school_id ON gate_pass_audit_logs(school_id);

-- 19. visitor_logs
ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE visitor_logs SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE visitor_logs ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitor_logs_school_id ON visitor_logs(school_id);

-- 20. school_events
ALTER TABLE school_events ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE school_events SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE school_events ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_school_events_school_id ON school_events(school_id);

-- 21. school_holidays
ALTER TABLE school_holidays ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE school_holidays SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE school_holidays ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_school_holidays_school_id ON school_holidays(school_id);

-- 22. bus_routes
ALTER TABLE bus_routes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE bus_routes SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE bus_routes ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bus_routes_school_id ON bus_routes(school_id);

-- 23. bus_stops
ALTER TABLE bus_stops ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE bus_stops SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE bus_stops ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bus_stops_school_id ON bus_stops(school_id);

-- 24. bus_trips
ALTER TABLE bus_trips ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE bus_trips SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE bus_trips ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bus_trips_school_id ON bus_trips(school_id);

-- 25. student_journey
ALTER TABLE student_journey ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE student_journey SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE student_journey ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_journey_school_id ON student_journey(school_id);

-- 26. campus_cards
ALTER TABLE campus_cards ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE campus_cards SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE campus_cards ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campus_cards_school_id ON campus_cards(school_id);

-- 27. campus_devices
ALTER TABLE campus_devices ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE campus_devices SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE campus_devices ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campus_devices_school_id ON campus_devices(school_id);

-------------------------------------------------------------------------------
-- CATEGORY D: Notifications, Events & Intelligence
-------------------------------------------------------------------------------

-- 28. unified_notifications
ALTER TABLE unified_notifications ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE unified_notifications SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE unified_notifications ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unified_notifications_school_id ON unified_notifications(school_id);

-- 29. journey_alerts
ALTER TABLE journey_alerts ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE journey_alerts SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE journey_alerts ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_journey_alerts_school_id ON journey_alerts(school_id);

-- 30. ai_generated_insights
ALTER TABLE ai_generated_insights ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE ai_generated_insights SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE ai_generated_insights ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_generated_insights_school_id ON ai_generated_insights(school_id);

-------------------------------------------------------------------------------
-- CATEGORY E: Ancillary & Module Tables
-------------------------------------------------------------------------------

-- 31. worry_jar_entries
ALTER TABLE worry_jar_entries ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE worry_jar_entries SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE worry_jar_entries ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_worry_jar_entries_school_id ON worry_jar_entries(school_id);

-- 32. campus_coin_wallets
ALTER TABLE campus_coin_wallets ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE campus_coin_wallets SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE campus_coin_wallets ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campus_coin_wallets_school_id ON campus_coin_wallets(school_id);

-- 33. rewards
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE rewards SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE rewards ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rewards_school_id ON rewards(school_id);

-- 34. community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE community_posts SET school_id = get_default_school_id() WHERE school_id IS NULL;
ALTER TABLE community_posts ALTER COLUMN school_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_school_id ON community_posts(school_id);

-- Clean up helper function after migration
DROP FUNCTION IF EXISTS get_default_school_id();
