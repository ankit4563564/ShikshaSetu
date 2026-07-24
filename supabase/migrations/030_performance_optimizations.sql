-- ============================================================================
-- Migration 030: Database Performance Indexes
-- Adds composite indexes to critical query tables to optimize execution times 
-- when scaling to thousands of student logs and telemetry entries.
-- ============================================================================

-- 1. Academic and Wellness Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date 
  ON attendance (student_id, date);

CREATE INDEX IF NOT EXISTS idx_homework_student_due 
  ON homework (student_id, due_date);

CREATE INDEX IF NOT EXISTS idx_grades_student_date 
  ON grades (student_id, assessment_date);

CREATE INDEX IF NOT EXISTS idx_mood_checkins_student_date 
  ON mood_checkins (student_id, checked_in_at);

-- 2. Rewards and Redemptions Indexes
CREATE INDEX IF NOT EXISTS idx_coin_transactions_student 
  ON coin_transactions (student_id);

CREATE INDEX IF NOT EXISTS idx_redemptions_student 
  ON redemptions (student_id);

-- 3. Transport and Scan Events Indexes
CREATE INDEX IF NOT EXISTS idx_student_journey_student 
  ON student_journey (student_id);

CREATE INDEX IF NOT EXISTS idx_scan_events_card_timestamp 
  ON scan_events (card_id, scanned_at DESC);
