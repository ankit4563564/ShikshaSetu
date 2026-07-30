-- ============================================================================
-- Migration 004: Canonical Demo Student (Aarav Sharma)
-- Creates the authoritative seed data for the end-to-end demo student.
-- All portals should derive Aarav's state from these records.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Insert Canonical Teacher (Ananya Mehra - Class 8A)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO teachers (id, auth_user_id, first_name, last_name, email, phone, subjects, is_class_teacher, avatar_url)
VALUES (
  '00000000-0000-4000-8000-000000000002',
  NULL,
  'Ananya',
  'Mehra',
  'teacher@shikshasetu.com',
  '+91-98765-43210',
  ARRAY['Math', 'Science'],
  TRUE,
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Insert Canonical Guardian (Sunita Sharma - Aarav's Mother)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO guardians (id, auth_user_id, first_name, last_name, email, phone, preferred_language, avatar_url)
VALUES (
  '00000000-0000-4000-8000-000000000003',
  NULL,
  'Sunita',
  'Sharma',
  'parent@shikshasetu.com',
  '+91-98765-43211',
  'en',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Insert Canonical Student (Aarav Sharma)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO students (id, first_name, last_name, display_name, grade, section, roll_number, date_of_birth, class_teacher_id, avatar_url)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Aarav',
  'Sharma',
  'Aarav Sharma',
  '8',
  'A',
  '08',
  '2012-05-15',
  '00000000-0000-4000-8000-000000000002',
  NULL
)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Link Guardian to Student
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO guardian_access (guardian_id, student_id, relationship, is_primary, can_view_wellness)
VALUES (
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000001',
  'mother',
  TRUE,
  TRUE
)
ON CONFLICT (guardian_id, student_id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Attendance Records (Last 30 days)
-- Shows recent decline: 96% → 89% over last week
-- ──────────────────────────────────────────────────────────────────────────────

-- Days 1-24: Mostly present (96% attendance)
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at)
SELECT 
  '00000000-0000-4000-8000-000000000001',
  CURRENT_DATE - (i || ' days')::INTERVAL,
  CASE WHEN i % 25 IN (5, 12, 18) THEN 'absent' ELSE 'present' END,
  '00000000-0000-4000-8000-000000000002',
  CASE WHEN i % 25 IN (5, 12, 18) THEN 'Fever' ELSE NULL END,
  CURRENT_DATE - (i || ' days')::INTERVAL
FROM generate_series(1, 24) AS s(i)
ON CONFLICT (student_id, date) DO NOTHING;

-- Days 25-30: Recent decline (3 absences in last week)
INSERT INTO attendance (student_id, date, status, marked_by, notes, marked_at)
VALUES 
  ('00000000-0000-4000-8000-000000000001', CURRENT_DATE - 5, 'absent', '00000000-0000-4000-8000-000000000002', 'Fever', CURRENT_DATE - 5),
  ('00000000-0000-4000-8000-000000000001', CURRENT_DATE - 3, 'absent', '00000000-0000-4000-8000-000000000002', 'Not feeling well', CURRENT_DATE - 3),
  ('00000000-0000-4000-8000-000000000001', CURRENT_DATE - 1, 'late', '00000000-0000-4000-8000-000000000002', 'Traffic delay', CURRENT_DATE - 1)
ON CONFLICT (student_id, date) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Homework Records
-- Shows 3 consecutive missed assignments (trigger for support signal)
-- ──────────────────────────────────────────────────────────────────────────────

-- Submitted homework (earlier in the month)
INSERT INTO homework (student_id, subject, title, description, due_date, submitted_at, assigned_by, created_at)
VALUES 
  ('00000000-0000-4000-8000-000000000001', 'Math', 'Algebra Worksheet A', 'Solve equations 1-10', CURRENT_DATE - 20, CURRENT_DATE - 19, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 21),
  ('00000000-0000-4000-8000-000000000001', 'Science', 'Physics Lab Report #1', 'Motion experiment write-up', CURRENT_DATE - 18, CURRENT_DATE - 17, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 19),
  ('00000000-0000-4000-8000-000000000001', 'English', 'Essay: My Summer', '500-word personal essay', CURRENT_DATE - 15, CURRENT_DATE - 14, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 16)
ON CONFLICT DO NOTHING;

-- MISSED homework (3 consecutive - trigger for support signal)
INSERT INTO homework (student_id, subject, title, description, due_date, submitted_at, assigned_by, created_at)
VALUES 
  ('00000000-0000-4000-8000-000000000001', 'Math', 'Algebra Worksheet B', 'Solve equations 11-20', CURRENT_DATE - 5, NULL, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 6),
  ('00000000-0000-4000-8000-000000000001', 'Science', 'Physics Lab Report #2', 'Forces experiment write-up', CURRENT_DATE - 3, NULL, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 4),
  ('00000000-0000-4000-8000-000000000001', 'Math', 'Geometry Practice', 'Triangle problems 1-15', CURRENT_DATE - 1, NULL, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 2)
ON CONFLICT DO NOTHING;

-- Upcoming homework
INSERT INTO homework (student_id, subject, title, description, due_date, submitted_at, assigned_by, created_at)
VALUES 
  ('00000000-0000-4000-8000-000000000001', 'English', 'Reading Comprehension', 'Chapter 5 questions', CURRENT_DATE + 2, NULL, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 1)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Grades
-- Shows recent decline from A to B+ (correlates with homework misses)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO grades (student_id, subject, assessment_name, score, max_score, assessment_date, recorded_by, created_at)
VALUES 
  -- Earlier strong performance
  ('00000000-0000-4000-8000-000000000001', 'Math', 'Unit Test 1', 45, 50, CURRENT_DATE - 25, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 25),
  ('00000000-0000-4000-8000-000000000001', 'Science', 'Unit Test 1', 42, 50, CURRENT_DATE - 25, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 25),
  ('00000000-0000-4000-8000-000000000001', 'English', 'Essay 1', 38, 40, CURRENT_DATE - 20, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 20),
  -- Recent decline
  ('00000000-0000-4000-8000-000000000001', 'Math', 'Unit Test 2', 38, 50, CURRENT_DATE - 5, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 5),
  ('00000000-0000-4000-8000-000000000001', 'Science', 'Unit Test 2', 35, 50, CURRENT_DATE - 5, '00000000-0000-4000-8000-000000000002', CURRENT_DATE - 5)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Mood Check-ins
-- Shows recent "overwhelmed" state (input for support signal)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO mood_checkins (student_id, mood_value, mood_label, note, checked_in_at)
VALUES 
  ('00000000-0000-4000-8000-000000000001', 4, 'happy', NULL, CURRENT_DATE - 10),
  ('00000000-0000-4000-8000-000000000001', 4, 'calm', NULL, CURRENT_DATE - 8),
  ('00000000-0000-4000-8000-000000000001', 3, 'neutral', NULL, CURRENT_DATE - 6),
  ('00000000-0000-4000-8000-000000000001', 2, 'anxious', 'Feeling overwhelmed with homework', CURRENT_DATE - 4),
  ('00000000-0000-4000-8000-000000000001', 2, 'anxious', 'Still feeling behind', CURRENT_DATE - 2)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Evidence Log
-- Generated by rules engine from the data above
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO evidence_logs (student_id, source_type, headline, bullets, raw_data, generated_at)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'homework',
  '3 consecutive homework assignments missed',
  '["Algebra Worksheet B - missed (due 5 days ago)", "Physics Lab Report #2 - missed (due 3 days ago)", "Geometry Practice - missed (due yesterday)"]'::JSONB,
  '{"missed_count": 3, "consecutive_days": true, "subjects": ["Math", "Science"]}'::JSONB,
  CURRENT_DATE - 1
),
(
  '00000000-0000-4000-8000-000000000001',
  'attendance',
  'Attendance declined from 96% to 89% this week',
  '["3 absences in last 7 days", "1 late arrival", "Previous 4 weeks: 96% attendance"]'::JSONB,
  '{"current_rate": 0.89, "previous_rate": 0.96, "absences_this_week": 3}'::JSONB,
  CURRENT_DATE - 1
),
(
  '00000000-0000-4000-8000-000000000001',
  'grades',
  'Math score dropped from A (90%) to B+ (76%)',
  '["Unit Test 1: 45/50 (90%)", "Unit Test 2: 38/50 (76%)", "14 point decline"]'::JSONB,
  '{"previous_score": 90, "current_score": 76, "decline_points": 14}'::JSONB,
  CURRENT_DATE - 1
),
(
  '00000000-0000-4000-8000-000000000001',
  'mood',
  'Recent check-ins indicate feeling overwhelmed',
  '["Mood: anxious (2 days ago)", "Mood: anxious (yesterday)", "Note: Feeling overwhelmed with homework"]'::JSONB,
  '{"recent_moods": [2, 2], "mood_trend": "declining", "overwhelmed_keyword": true}'::JSONB,
  CURRENT_DATE - 1
)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Status Flag
-- Generated from evidence above
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO status_flags (student_id, status, triggered_by_evidence, action_status, created_at)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'needs_attention',
  (SELECT id FROM evidence_logs WHERE student_id = '00000000-0000-4000-8000-000000000001' AND source_type = 'homework' ORDER BY generated_at DESC LIMIT 1),
  'unseen',
  CURRENT_DATE - 1
)
ON CONFLICT (student_id) WHERE resolved_at IS NULL DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Bus Location (Demo Telemetry)
-- Simulated GPS for Aarav's bus
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO bus_locations (bus_identifier, latitude, longitude, speed_kmh, heading, recorded_at)
VALUES (
  'BUS-001',
  28.6139,
  77.2090,
  22.5,
  45.0,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Chat Messages
-- Sample conversation between teacher and parent
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO chat_messages (student_id, sender_id, sender_role, content, is_context_flag, read_at, created_at)
VALUES 
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'teacher', 'Aarav has been missing homework assignments this week. Can we discuss?', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'parent', 'Yes, he mentioned feeling overwhelmed. We are working with him at home.', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'teacher', 'Thank you for the update. Let me know if you need any support materials.', FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Canonical Notifications
-- Sample notifications for parent
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read, read_at, created_at)
VALUES 
  ('00000000-0000-4000-8000-000000000003', 'parent', '00000000-0000-4000-8000-000000000001', 'Homework Alert', 'Aarav has missed 3 homework assignments this week.', 'academic', FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  ('00000000-0000-4000-8000-000000000003', 'parent', '00000000-0000-4000-8000-000000000001', 'Attendance Update', 'Aarav was marked absent today due to fever.', 'academic', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('00000000-0000-4000-8000-000000000003', 'parent', '00000000-0000-4000-8000-000000000001', 'New Message', 'Teacher sent you a message about Aarav.', 'chat', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE students IS 'Canonical demo student Aarav Sharma (00000000-0000-4000-8000-000000000001) with complete seed data for end-to-end demo.';
