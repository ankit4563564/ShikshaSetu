-- Migration: 005_row_level_security
-- Purpose: Implement Row-Level Security (RLS) policies matching Clerk authentication roles.
-- Ensures parents can only read their children's data, teachers can only read their class's students, and admins can read everything.

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Helper Functions for RLS Policies
-- ──────────────────────────────────────────────────────────────────────────────

-- Check if current authenticated Clerk user is an Admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql;

-- Get the Teacher UUID of the current authenticated Clerk user
CREATE OR REPLACE FUNCTION get_teacher_id() 
RETURNS uuid SECURITY DEFINER AS $$
DECLARE
  t_id uuid;
BEGIN
  SELECT id INTO t_id FROM teachers
  WHERE clerk_user_id = auth.jwt() ->> 'sub';
  RETURN t_id;
END;
$$ LANGUAGE plpgsql;

-- Get the Guardian UUID of the current authenticated Clerk user
CREATE OR REPLACE FUNCTION get_guardian_id() 
RETURNS uuid SECURITY DEFINER AS $$
DECLARE
  g_id uuid;
BEGIN
  SELECT id INTO g_id FROM guardians
  WHERE clerk_user_id = auth.jwt() ->> 'sub';
  RETURN g_id;
END;
$$ LANGUAGE plpgsql;

-- Check if current authenticated Clerk user is a linked guardian of a student
CREATE OR REPLACE FUNCTION is_guardian_of_student(student_id_param uuid) 
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM guardian_access ga
    JOIN guardians g ON ga.guardian_id = g.id
    WHERE g.clerk_user_id = auth.jwt() ->> 'sub'
    AND ga.student_id = student_id_param
  );
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Enable RLS and create policies for each table
-- ──────────────────────────────────────────────────────────────────────────────

-- ── Table: students ──
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_select ON students FOR SELECT
USING (
  is_admin() OR
  class_teacher_id = get_teacher_id() OR
  is_guardian_of_student(id)
);

CREATE POLICY students_all_admin ON students FOR ALL
USING (is_admin());


-- ── Table: teachers ──
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY teachers_select ON teachers FOR SELECT
USING (
  is_admin() OR
  clerk_user_id = auth.jwt() ->> 'sub' OR
  -- A parent can select class teachers of their students
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.class_teacher_id = teachers.id 
    AND is_guardian_of_student(s.id)
  )
);

CREATE POLICY teachers_all_admin ON teachers FOR ALL
USING (is_admin());


-- ── Table: guardians ──
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY guardians_select ON guardians FOR SELECT
USING (
  is_admin() OR
  clerk_user_id = auth.jwt() ->> 'sub' OR
  -- Teachers can view guardians of students in their class
  EXISTS (
    SELECT 1 FROM guardian_access ga
    JOIN students s ON ga.student_id = s.id
    WHERE ga.guardian_id = guardians.id 
    AND s.class_teacher_id = get_teacher_id()
  )
);

CREATE POLICY guardians_all_admin ON guardians FOR ALL
USING (is_admin());


-- ── Table: guardian_access ──
ALTER TABLE guardian_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY guardian_access_select ON guardian_access FOR SELECT
USING (
  is_admin() OR
  -- Guardian can read their own access mappings
  guardian_id = get_guardian_id() OR
  -- Teacher can read access mapping for their students
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);

CREATE POLICY guardian_access_all_admin ON guardian_access FOR ALL
USING (is_admin());


-- ── Table: attendance ──
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY attendance_select ON attendance FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY attendance_modify_teacher ON attendance FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- ── Table: homework ──
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY homework_select ON homework FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY homework_modify_teacher ON homework FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- ── Table: grades ──
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY grades_select ON grades FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY grades_modify_teacher ON grades FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- ── Table: mood_checkins ──
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY mood_checkins_select ON mood_checkins FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  -- Guardians can only select mood records if they have primary wellness viewing consent enabled
  (
    is_guardian_of_student(student_id) AND
    EXISTS (
      SELECT 1 FROM guardian_access ga
      JOIN guardians g ON ga.guardian_id = g.id
      WHERE g.clerk_user_id = auth.jwt() ->> 'sub'
      AND ga.student_id = mood_checkins.student_id
      AND ga.can_view_wellness = TRUE
    )
  )
);

CREATE POLICY mood_checkins_all_admin ON mood_checkins FOR ALL
USING (is_admin());


-- ── Table: chat_messages ──
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
WITH CHECK (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);


-- ── Table: status_flags ──
ALTER TABLE status_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY status_flags_select ON status_flags FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY status_flags_modify ON status_flags FOR ALL
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);


-- ── Table: false_positive_corrections ──
ALTER TABLE false_positive_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY false_positive_corrections_select ON false_positive_corrections FOR SELECT
USING (
  is_admin() OR
  -- Teachers can view corrections belonging to status flags of their students
  EXISTS (
    SELECT 1 FROM status_flags sf
    JOIN students s ON sf.student_id = s.id
    WHERE sf.id = status_flag_id
    AND s.class_teacher_id = get_teacher_id()
  )
);

CREATE POLICY false_positive_corrections_insert ON false_positive_corrections FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM status_flags sf
    JOIN students s ON sf.student_id = s.id
    WHERE sf.id = status_flag_id
    AND s.class_teacher_id = get_teacher_id()
  )
);
