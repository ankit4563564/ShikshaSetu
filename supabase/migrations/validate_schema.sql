-- ============================================================================
-- EduSync — Post-Migration Validation
-- Run this AFTER the migration to confirm all objects were created.
-- Expected: 15 tables, 5 enums, 1 trigger, 1 function.
-- ============================================================================

-- 1. Count tables (expect 15)
SELECT 'TABLES' AS check_type,
       count(*) AS actual,
       15 AS expected,
       CASE WHEN count(*) = 15 THEN '✅ PASS' ELSE '❌ FAIL' END AS result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'teachers', 'students', 'guardians', 'guardian_access',
    'attendance', 'homework', 'grades', 'mood_checkins',
    'evidence_logs', 'status_flags', 'false_positive_corrections',
    'gate_passes', 'bus_locations', 'chat_messages', 'notifications'
  );

-- 2. Count custom enum types (expect 5)
SELECT 'ENUMS' AS check_type,
       count(*) AS actual,
       5 AS expected,
       CASE WHEN count(*) = 5 THEN '✅ PASS' ELSE '❌ FAIL' END AS result
FROM pg_type
WHERE typtype = 'e'
  AND typname IN (
    'portal_role', 'evidence_status', 'gate_pass_status',
    'alert_action_status', 'guardian_relationship'
  );

-- 3. Verify the chat sender validation trigger exists
SELECT 'TRIGGER' AS check_type,
       count(*) AS actual,
       1 AS expected,
       CASE WHEN count(*) = 1 THEN '✅ PASS' ELSE '❌ FAIL' END AS result
FROM information_schema.triggers
WHERE trigger_name = 'trg_validate_chat_sender'
  AND event_object_table = 'chat_messages';

-- 4. Verify the validation function exists
SELECT 'FUNCTION' AS check_type,
       count(*) AS actual,
       1 AS expected,
       CASE WHEN count(*) = 1 THEN '✅ PASS' ELSE '❌ FAIL' END AS result
FROM information_schema.routines
WHERE routine_name = 'fn_validate_chat_sender'
  AND routine_type = 'FUNCTION';

-- 5. List all tables with their column counts for a quick visual check
SELECT table_name,
       count(column_name) AS columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'teachers', 'students', 'guardians', 'guardian_access',
    'attendance', 'homework', 'grades', 'mood_checkins',
    'evidence_logs', 'status_flags', 'false_positive_corrections',
    'gate_passes', 'bus_locations', 'chat_messages', 'notifications'
  )
GROUP BY table_name
ORDER BY table_name;

-- 6. Smoke-test the trigger: insert a chat message with a fake sender_id
-- This SHOULD fail with: "does not exist in teachers"
-- Uncomment to test, then roll back or delete the test row.
/*
INSERT INTO chat_messages (student_id, sender_id, sender_role, content)
VALUES (
  gen_random_uuid(),       -- fake student (will fail FK first, which is fine)
  gen_random_uuid(),       -- fake teacher
  'teacher',
  'This should fail validation'
);
*/
