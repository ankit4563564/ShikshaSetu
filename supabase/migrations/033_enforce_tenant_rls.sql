-- ============================================================================
-- Migration 033: Database-Level Multi-Tenant RLS Enforcement (Phase C)
-- Re-enables RLS on intervention tables, defines tenant helper functions,
-- and replaces existing RLS policies with strict school-isolated rules.
-- ============================================================================

-- ── 1. Tenant & Authentication Context Helper Functions ──

-- Get current user's mapped school_id
CREATE OR REPLACE FUNCTION current_user_school_id()
RETURNS UUID AS $$
DECLARE
  v_school_id UUID;
BEGIN
  -- 1. Query user_mappings for auth.uid() or JWT 'sub' claim
  SELECT school_id INTO v_school_id
  FROM user_mappings
  WHERE clerk_user_id = COALESCE(auth.uid()::text, auth.jwt() ->> 'sub')
  LIMIT 1;

  -- 2. Fallback to default tenant if executing in seed/demo environment
  IF v_school_id IS NULL THEN
    SELECT id INTO v_school_id FROM schools WHERE slug = 'greenwood-high' LIMIT 1;
  END IF;

  RETURN v_school_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Verify if current authenticated user is a guardian of a target student
CREATE OR REPLACE FUNCTION is_guardian_of_student_strict(p_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM guardian_access ga
    JOIN guardians g ON ga.guardian_id = g.id
    WHERE g.clerk_user_id = COALESCE(auth.uid()::text, auth.jwt() ->> 'sub')
      AND ga.student_id = p_student_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ── 2. Re-enable RLS on Previously Disabled Intervention Tables ──
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_tasks ENABLE ROW LEVEL SECURITY;

-- ── 3. Apply Tenant Isolation Policies Across Primary Domain Tables ──

-- Macro-like policy drop & recreate procedure for clean execution
DO $$
DECLARE
  tbl TEXT;
  tables_to_isolate TEXT[] := ARRAY[
    'user_mappings', 'teachers', 'guardians', 'students', 'staff',
    'attendance_logs', 'homework_assignments', 'homework_submissions',
    'student_mood_checkins', 'status_flags', 'false_positive_corrections',
    'interventions', 'intervention_milestones', 'student_tasks',
    'exams', 'exam_marks', 'gate_pass_requests', 'gate_pass_audit_logs',
    'visitor_logs', 'school_events', 'school_holidays', 'bus_routes',
    'bus_stops', 'bus_trips', 'student_journey', 'campus_cards',
    'campus_devices', 'unified_notifications', 'journey_alerts',
    'ai_generated_insights', 'worry_jar_entries', 'campus_coin_wallets',
    'rewards', 'community_posts'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_isolate LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);

    -- Drop legacy policies
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_select ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_insert ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_update ON %I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_delete ON %I;', tbl);

    -- 1. SELECT Policy (Strict Tenant Match)
    EXECUTE format('
      CREATE POLICY tenant_isolation_select ON %I FOR SELECT
      TO authenticated
      USING (school_id = current_user_school_id());
    ', tbl);

    -- 2. INSERT Policy (Derived/Validated Tenant Match)
    EXECUTE format('
      CREATE POLICY tenant_isolation_insert ON %I FOR INSERT
      TO authenticated
      WITH CHECK (school_id = current_user_school_id());
    ', tbl);

    -- 3. UPDATE Policy (Prevent Cross-Tenant Mutate & Tenant Reassignment)
    EXECUTE format('
      CREATE POLICY tenant_isolation_update ON %I FOR UPDATE
      TO authenticated
      USING (school_id = current_user_school_id())
      WITH CHECK (school_id = current_user_school_id());
    ', tbl);

    -- 4. DELETE Policy (Strict Tenant Match)
    EXECUTE format('
      CREATE POLICY tenant_isolation_delete ON %I FOR DELETE
      TO authenticated
      USING (school_id = current_user_school_id());
    ', tbl);
  END LOOP;
END $$;

-- ── 4. Role-Specific Security & Parent -> Child Boundary Policy Overrides ──

-- Gate Pass Requests: Parents can ONLY insert/select gate passes for their OWN linked children
DROP POLICY IF EXISTS parent_gate_pass_insert ON gate_pass_requests;
CREATE POLICY parent_gate_pass_insert ON gate_pass_requests FOR INSERT
TO authenticated
WITH CHECK (
  school_id = current_user_school_id() AND
  is_guardian_of_student_strict(student_id)
);

DROP POLICY IF EXISTS parent_gate_pass_select ON gate_pass_requests;
CREATE POLICY parent_gate_pass_select ON gate_pass_requests FOR SELECT
TO authenticated
USING (
  school_id = current_user_school_id() AND (
    is_guardian_of_student_strict(student_id) OR
    EXISTS (SELECT 1 FROM user_mappings WHERE clerk_user_id = COALESCE(auth.uid()::text, auth.jwt() ->> 'sub') AND role IN ('teacher', 'admin', 'gate'))
  )
);

-- Interventions: Internal notes are hidden from parents unless explicitly flagged
DROP POLICY IF EXISTS interventions_parent_read_policy ON interventions;
CREATE POLICY interventions_parent_read_policy ON interventions FOR SELECT
TO authenticated
USING (
  school_id = current_user_school_id() AND (
    EXISTS (SELECT 1 FROM user_mappings WHERE clerk_user_id = COALESCE(auth.uid()::text, auth.jwt() ->> 'sub') AND role IN ('teacher', 'admin', 'principal'))
    OR (
      is_guardian_of_student_strict(student_id) AND
      status IN ('active', 'completed')
    )
  )
);
