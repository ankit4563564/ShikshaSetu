-- ============================================================================
-- Migration 005e: Update Intervention RLS Policies with Anon Key Support
-- Drops existing policies and recreates them to allow anon key for server actions
-- ============================================================================

-- ── Table: interventions ──
DROP POLICY IF EXISTS interventions_insert ON interventions;
DROP POLICY IF EXISTS interventions_update ON interventions;

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

-- ── Table: intervention_milestones ──
DROP POLICY IF EXISTS intervention_milestones_insert ON intervention_milestones;

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

-- ── Table: student_tasks ──
DROP POLICY IF EXISTS student_tasks_insert ON student_tasks;

CREATE POLICY student_tasks_insert ON student_tasks FOR INSERT
WITH CHECK (
  is_admin() OR
  student_id IN (SELECT id FROM students WHERE class_teacher_id = get_teacher_id()) OR
  -- Allow anon key for server actions (demo mode)
  auth.role() = 'anon'
);
