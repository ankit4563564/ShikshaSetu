-- ============================================================================
-- Migration 020: SchoolGPT Tables
-- Adds timetable, clubs, notices, library books, and school rules tables
-- to support the SchoolGPT AI assistant's data retrieval capabilities.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Timetable: weekly class schedule
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_grade TEXT NOT NULL,
  class_section TEXT,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  period_number SMALLINT NOT NULL CHECK (period_number > 0),
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Clubs: extracurricular clubs and activities
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  meeting_day SMALLINT CHECK (meeting_day BETWEEN 0 AND 6),
  meeting_time TIME,
  meeting_location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Club Members: students enrolled in clubs
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (club_id, student_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Notices: school-wide announcements
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  posted_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  target_audience TEXT[] DEFAULT '{}'
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Library Books: book inventory
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  category TEXT,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. School Rules: school policies and rules
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_rules ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "timetable_select" ON timetable FOR SELECT USING (true);
CREATE POLICY "clubs_select" ON clubs FOR SELECT USING (true);
CREATE POLICY "club_members_select" ON club_members FOR SELECT USING (true);
CREATE POLICY "notices_select" ON notices FOR SELECT USING (true);
CREATE POLICY "library_books_select" ON library_books FOR SELECT USING (true);
CREATE POLICY "school_rules_select" ON school_rules FOR SELECT USING (true);

-- Teachers and admins can write
CREATE POLICY "timetable_insert" ON timetable FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);
CREATE POLICY "clubs_insert" ON clubs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);
CREATE POLICY "club_members_insert" ON club_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);
CREATE POLICY "notices_insert" ON notices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub')
);

-- ════════════════════════════════════════════════════════════════════════════
-- Seed Data
-- ════════════════════════════════════════════════════════════════════════════

-- Timetable for Grade 8A (Ananya Mehra's class)
INSERT INTO timetable (class_grade, class_section, day_of_week, period_number, subject, teacher_id, start_time, end_time, room) VALUES
  ('8', 'A', 0, 1, 'Math', 'a1000000-0000-4000-8000-000000000001', '08:00', '08:45', '201'),
  ('8', 'A', 0, 2, 'Science', 'a1000000-0000-4000-8000-000000000001', '08:50', '09:35', '202'),
  ('8', 'A', 0, 3, 'English', NULL, '09:40', '10:25', '203'),
  ('8', 'A', 0, 4, 'Hindi', NULL, '10:45', '11:30', '204'),
  ('8', 'A', 0, 5, 'Physical Education', NULL, '11:35', '12:20', 'Ground'),
  ('8', 'A', 1, 1, 'Science', 'a1000000-0000-4000-8000-000000000001', '08:00', '08:45', '202'),
  ('8', 'A', 1, 2, 'Math', 'a1000000-0000-4000-8000-000000000001', '08:50', '09:35', '201'),
  ('8', 'A', 1, 3, 'Social Studies', NULL, '09:40', '10:25', '205'),
  ('8', 'A', 1, 4, 'Art', NULL, '10:45', '11:30', 'Art Room'),
  ('8', 'A', 1, 5, 'Computer Science', NULL, '11:35', '12:20', 'Lab 1'),
  ('8', 'A', 2, 1, 'Math', 'a1000000-0000-4000-8000-000000000001', '08:00', '08:45', '201'),
  ('8', 'A', 2, 2, 'English', NULL, '08:50', '09:35', '203'),
  ('8', 'A', 2, 3, 'Science', 'a1000000-0000-4000-8000-000000000001', '09:40', '10:25', '202'),
  ('8', 'A', 2, 4, 'Hindi', NULL, '10:45', '11:30', '204'),
  ('8', 'A', 2, 5, 'Social Studies', NULL, '11:35', '12:20', '205'),
  ('8', 'A', 3, 1, 'Science', 'a1000000-0000-4000-8000-000000000001', '08:00', '08:45', '202'),
  ('8', 'A', 3, 2, 'Math', 'a1000000-0000-4000-8000-000000000001', '08:50', '09:35', '201'),
  ('8', 'A', 3, 3, 'Computer Science', NULL, '09:40', '10:25', 'Lab 1'),
  ('8', 'A', 3, 4, 'Physical Education', NULL, '10:45', '11:30', 'Ground'),
  ('8', 'A', 3, 5, 'Art', NULL, '11:35', '12:20', 'Art Room'),
  ('8', 'A', 4, 1, 'English', NULL, '08:00', '08:45', '203'),
  ('8', 'A', 4, 2, 'Social Studies', NULL, '08:50', '09:35', '205'),
  ('8', 'A', 4, 3, 'Math', 'a1000000-0000-4000-8000-000000000001', '09:40', '10:25', '201'),
  ('8', 'A', 4, 4, 'Science', 'a1000000-0000-4000-8000-000000000001', '10:45', '11:30', '202'),
  ('8', 'A', 4, 5, 'Hindi', NULL, '11:35', '12:20', '204');

-- Clubs
INSERT INTO clubs (id, name, description, teacher_id, meeting_day, meeting_time, meeting_location, is_active) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'Robotics Club', 'Build and program robots, participate in competitions', 'a1000000-0000-4000-8000-000000000001', 2, '15:00', 'Lab 1', true),
  ('d1000000-0000-4000-8000-000000000002', 'Drama Club', 'Theatre, acting, and stage production', 'a1000000-0000-4000-8000-000000000002', 1, '15:00', 'Auditorium', true),
  ('d1000000-0000-4000-8000-000000000003', 'Art Club', 'Painting, sculpture, and creative arts', 'a1000000-0000-4000-8000-000000000003', 3, '14:30', 'Art Room', true),
  ('d1000000-0000-4000-8000-000000000004', 'Chess Club', 'Learn and play chess, participate in tournaments', NULL, 0, '15:00', 'Library', true),
  ('d1000000-0000-4000-8000-000000000005', 'Music Club', 'Choir, instruments, and music theory', NULL, 4, '15:00', 'Music Room', true);

-- Club Members: enroll first 3 students of each teacher into clubs
INSERT INTO club_members (club_id, student_id, role) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'member'),
  ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'member'),
  ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', 'member'),
  ('d1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'member'),
  ('d1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000011', 'member'),
  ('d1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000004', 'member'),
  ('d1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000013', 'member'),
  ('d1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000008', 'member'),
  ('d1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000010', 'member'),
  ('d1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000015', 'member');

-- Notices
INSERT INTO notices (title, body, posted_by, posted_at, expires_at, target_audience) VALUES
  ('Parent-Teacher Meeting', 'Parent-Teacher Meeting for Grade 8 will be held on Friday, June 26, 2026 at 10:00 AM in the school auditorium. All parents are requested to attend.', 'a1000000-0000-4000-8000-000000000001', '2026-06-10 08:00:00+00', '2026-06-27 23:59:59+00', '{parent,teacher}'),
  ('Summer Camp Registration', 'Registration for the annual Summer Camp is now open. Activities include sports, arts, robotics, and music. Last date to register: July 5, 2026.', 'a1000000-0000-4000-8000-000000000002', '2026-06-12 09:00:00+00', '2026-07-06 23:59:59+00', '{student,parent,teacher}'),
  ('Science Fair Announcement', 'The Annual Science Fair will be held on August 15, 2026. Students interested in participating should submit their project proposals to their class teacher by July 20, 2026.', 'a1000000-0000-4000-8000-000000000001', '2026-06-15 10:00:00+00', '2026-08-16 23:59:59+00', '{student,teacher}');

-- Library Books
INSERT INTO library_books (title, author, isbn, category, total_copies, available_copies) VALUES
  ('Mathematics for Class 8', 'R.S. Aggarwal', '9788177099902', 'Textbook', 10, 7),
  ('Science for Class 8', 'NCERT', '9788174507246', 'Textbook', 10, 5),
  ('The Adventures of Tom Sawyer', 'Mark Twain', '9780143107330', 'Fiction', 3, 2),
  ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '9780439708180', 'Fiction', 5, 3),
  ('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Non-Fiction', 2, 1),
  ('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fiction', 3, 3),
  ('Wings of Fire', 'A.P.J. Abdul Kalam', '9788173711466', 'Biography', 4, 2),
  ('The Alchemist', 'Paulo Coelho', '9780062315007', 'Fiction', 3, 1),
  (  'Introduction to Robotics', 'John D. Smith', '9780262015774', 'Non-Fiction', 2, 2),
  ('Oxford English Dictionary', 'Oxford University Press', '9780199571123', 'Reference', 1, 1);

-- School Rules
INSERT INTO school_rules (category, title, content, is_active) VALUES
  ('Attendance', 'Regular Attendance', 'Students must attend at least 75% of classes each term to be eligible for examinations. Parents must submit a written explanation for any absence within 3 days.', true),
  ('Attendance', 'Late Arrival', 'Students arriving after 8:00 AM must report to the school office for a late slip. Three late arrivals will result in a parent meeting.', true),
  ('Uniform', 'School Uniform', 'Students must wear the complete school uniform every day. Physical Education days require the sports uniform. No jewelry or accessories are permitted.', true),
  ('Conduct', 'Classroom Behavior', 'Students are expected to be respectful, punctual, and prepared for class. Mobile phones must be switched off and stored during school hours.', true),
  ('Conduct', 'Bullying Policy', 'Bullying of any kind is strictly prohibited. Report any incidents to your class teacher or school counselor immediately.', true),
  ('Academics', 'Homework Policy', 'All homework must be submitted by the due date. Late submissions will receive a 10% penalty per day. Extensions may be granted for genuine reasons with prior notice.', true),
  ('Academics', 'Examination Rules', 'No electronic devices are permitted during exams. Any form of malpractice will result in a zero score and disciplinary action.', true),
  ('Library', 'Library Rules', 'Books may be borrowed for up to 14 days. Late returns incur a fine of Rs. 5 per day. Reference books may not be taken out of the library.', true),
  ('Safety', 'Emergency Procedures', 'In case of an emergency, students must follow teacher instructions and proceed to the designated assembly point. Monthly fire drills are mandatory.', true),
  ('Safety', 'Campus Safety', 'Students must wear their Campus ID card at all times while on school premises. Visitors must register at the gate and wear a visitor badge.', true);
