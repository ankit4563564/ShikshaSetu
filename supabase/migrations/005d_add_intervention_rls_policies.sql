-- ============================================================================
-- Migration 005d: Add RLS Policies for Intervention Tables
-- Adds row-level security policies for interventions, intervention_milestones, and student_tasks
-- ============================================================================

-- ── Table: interventions ──
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY interventions_select ON interventions FOR SELECT
USING (
  is_admin() OR
  teacher_id = get_teacher_id() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY interventions_insert ON interventions FOR INSERT
WITH CHECK (
  is_admin() OR
  teacher_id = get_teacher_id() OR
  -- Allow anon key for server actions (demo mode)
  auth.role() = 'anon'
);

CREATE POLICY interventions_update ON interventions FOR UPDATE
USING (
  is_admin() OR
  teacher_id = get_teacher_id() OR
  -- Allow anon key for server actions (demo mode)
  auth.role() = 'anon'
);

CREATE POLICY interventions_delete ON interventions FOR DELETE
USING (is_admin());

-- ── Table: intervention_milestones ──
ALTER TABLE intervention_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY intervention_milestones_select ON intervention_milestones FOR SELECT
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.id = intervention_milestones.intervention_id
    AND (
      i.teacher_id = get_teacher_id() OR
      i.student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
      is_guardian_of_student(i.student_id)
    )
  )
);

CREATE POLICY intervention_milestones_insert ON intervention_milestones FOR INSERT
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.id = intervention_milestones.intervention_id
    AND i.teacher_id = get_teacher_id()
  ) OR
  -- Allow anon key for server actions (demo mode)
  auth.role() = 'anon'
);

CREATE POLICY intervention_milestones_update ON intervention_milestones FOR UPDATE
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.id = intervention_milestones.intervention_id
    AND i.teacher_id = get_teacher_id()
  )
);

CREATE POLICY intervention_milestones_delete ON intervention_milestones FOR DELETE
USING (is_admin());

-- ── Table: student_tasks ──
ALTER TABLE student_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_tasks_select ON student_tasks FOR SELECT
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  is_guardian_of_student(student_id)
);

CREATE POLICY student_tasks_insert ON student_tasks FOR INSERT
WITH CHECK (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  -- Allow anon key for server actions (demo mode)
  auth.role() = 'anon'
);

CREATE POLICY student_tasks_update ON student_tasks FOR UPDATE
USING (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id())
);

CREATE POLICY student_tasks_delete ON student_tasks FOR DELETE
USING (is_admin());
