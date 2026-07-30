-- ============================================================================
-- Migration 004b: Fix Canonical UUIDs
-- Updates invalid UUID format (s*, t*, g*) to valid PostgreSQL UUIDs
-- ============================================================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Update teacher ID (cast to text to compare with invalid UUID string)
UPDATE teachers SET id = '00000000-0000-4000-8000-000000000002' WHERE id::text = 't0000000-0000-4000-8000-000000000001';

-- Update guardian ID
UPDATE guardians SET id = '00000000-0000-4000-8000-000000000003' WHERE id::text = 'g0000000-0000-4000-8000-000000000001';

-- Update student ID and class_teacher_id
UPDATE students SET id = '00000000-0000-4000-8000-000000000001' WHERE id::text = 's0000000-0000-4000-8000-000000000001';
UPDATE students SET class_teacher_id = '00000000-0000-4000-8000-000000000002' WHERE class_teacher_id::text = 't0000000-0000-4000-8000-000000000001';

-- Update guardian_access
UPDATE guardian_access SET guardian_id = '00000000-0000-4000-8000-000000000003' WHERE guardian_id::text = 'g0000000-0000-4000-8000-000000000001';
UPDATE guardian_access SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';

-- Update attendance
UPDATE attendance SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';
UPDATE attendance SET marked_by = '00000000-0000-4000-8000-000000000002' WHERE marked_by::text = 't0000000-0000-4000-8000-000000000001';

-- Update homework
UPDATE homework SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';
UPDATE homework SET assigned_by = '00000000-0000-4000-8000-000000000002' WHERE assigned_by::text = 't0000000-0000-4000-8000-000000000001';

-- Update grades
UPDATE grades SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';
UPDATE grades SET recorded_by = '00000000-0000-4000-8000-000000000002' WHERE recorded_by::text = 't0000000-0000-4000-8000-000000000001';

-- Update mood_checkins
UPDATE mood_checkins SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';

-- Update evidence_logs
UPDATE evidence_logs SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';

-- Update status_flags
UPDATE status_flags SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';

-- Update chat_messages
UPDATE chat_messages SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';
UPDATE chat_messages SET sender_id = '00000000-0000-4000-8000-000000000002' WHERE sender_id::text = 't0000000-0000-4000-8000-000000000001';
UPDATE chat_messages SET sender_id = '00000000-0000-4000-8000-000000000003' WHERE sender_id::text = 'g0000000-0000-4000-8000-000000000001';

-- Update notifications
UPDATE notifications SET student_id = '00000000-0000-4000-8000-000000000001' WHERE student_id::text = 's0000000-0000-4000-8000-000000000001';
UPDATE notifications SET recipient_id = '00000000-0000-4000-8000-000000000003' WHERE recipient_id::text = 'g0000000-0000-4000-8000-000000000001';

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Update comment
COMMENT ON TABLE students IS 'Canonical demo student Aarav Sharma (00000000-0000-4000-8000-000000000001) with complete seed data for end-to-end demo.';
