-- ============================================================================
-- Seed Data: Campus ID System
-- Creates campus_cards for each student and issues initial active cards.
-- ============================================================================

-- Insert a student_id card for each of the 15 seeded students
INSERT INTO campus_cards (id, student_id, card_type, status, display_label, issued_by)
VALUES
  -- Teacher 1: Ananya Mehra's students (Aarav, Priya, Rohan, Ananya, Kabir)
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000001', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000002', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000003', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000004', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000005', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000001'),

  -- Teacher 2: Vikram Joshi's students (Diya, Arjun, Meera, Vihaan, Zara)
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000006', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000007', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000008', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000009', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000010', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000002'),

  -- Teacher 3: Kavita Deshmukh's students (Advait, Ishaan, Navya, Reyansh, Aarohi)
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000011', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000012', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000013', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000014', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'b1000000-0000-4000-8000-000000000015', 'student_id', 'active', 'Student ID Card', 'a1000000-0000-4000-8000-000000000003')
ON CONFLICT DO NOTHING;

-- Record card issue history for each card
INSERT INTO card_issue_history (student_id, action, performed_by, reason)
SELECT student_id, 'issued', issued_by, 'Initial card issuance during onboarding'
FROM campus_cards
WHERE status = 'active'
ON CONFLICT DO NOTHING;

-- Assign houses to students for Campus ID display
UPDATE students SET house = 'Gandhi'   WHERE id = 'b1000000-0000-4000-8000-000000000001'; -- Aarav
UPDATE students SET house = 'Tagore'   WHERE id = 'b1000000-0000-4000-8000-000000000002'; -- Priya
UPDATE students SET house = 'Gandhi'   WHERE id = 'b1000000-0000-4000-8000-000000000003'; -- Rohan
UPDATE students SET house = 'Tagore'   WHERE id = 'b1000000-0000-4000-8000-000000000004'; -- Ananya
UPDATE students SET house = 'Gandhi'   WHERE id = 'b1000000-0000-4000-8000-000000000005'; -- Kabir
UPDATE students SET house = 'Nehru'    WHERE id = 'b1000000-0000-4000-8000-000000000006'; -- Diya
UPDATE students SET house = 'Nehru'    WHERE id = 'b1000000-0000-4000-8000-000000000007'; -- Arjun
UPDATE students SET house = 'Nehru'    WHERE id = 'b1000000-0000-4000-8000-000000000008'; -- Meera
UPDATE students SET house = 'Nehru'    WHERE id = 'b1000000-0000-4000-8000-000000000009'; -- Vihaan
UPDATE students SET house = 'Nehru'    WHERE id = 'b1000000-0000-4000-8000-000000000010'; -- Zara
UPDATE students SET house = 'Tagore'   WHERE id = 'b1000000-0000-4000-8000-000000000011'; -- Advait
UPDATE students SET house = 'Tagore'   WHERE id = 'b1000000-0000-4000-8000-000000000012'; -- Ishaan
UPDATE students SET house = 'Tagore'   WHERE id = 'b1000000-0000-4000-8000-000000000013'; -- Navya
UPDATE students SET house = 'Gandhi'   WHERE id = 'b1000000-0000-4000-8000-000000000014'; -- Reyansh
UPDATE students SET house = 'Tagore'   WHERE id = 'b1000000-0000-4000-8000-000000000015'; -- Aarohi
