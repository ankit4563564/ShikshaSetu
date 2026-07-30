-- ============================================================================
-- Migration 005f: Disable RLS for Intervention Tables (Demo Mode)
-- Disables row-level security for intervention tables to allow server actions
-- This is for demo mode where authentication is not required
-- ============================================================================

-- ── Table: interventions ──
ALTER TABLE interventions DISABLE ROW LEVEL SECURITY;

-- ── Table: intervention_milestones ──
ALTER TABLE intervention_milestones DISABLE ROW LEVEL SECURITY;

-- ── Table: student_tasks ──
ALTER TABLE student_tasks DISABLE ROW LEVEL SECURITY;
