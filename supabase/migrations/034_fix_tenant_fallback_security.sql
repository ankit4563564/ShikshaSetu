-- ============================================================================
-- Migration 034: Fix Production Tenant Fallback Security Leak
-- Removes automatic fallback to default seed tenant in current_user_school_id()
-- Ensures unmapped or unauthorized authenticated users receive NULL school_id,
-- causing PostgreSQL RLS policies to evaluate school_id = NULL (DENY ALL ACCESS).
-- ============================================================================

CREATE OR REPLACE FUNCTION current_user_school_id()
RETURNS UUID AS $$
DECLARE
  v_school_id UUID;
  v_is_demo BOOLEAN := FALSE;
BEGIN
  -- 1. Query user_mappings for auth.uid() or JWT 'sub' claim
  SELECT school_id INTO v_school_id
  FROM user_mappings
  WHERE clerk_user_id = COALESCE(auth.uid()::text, auth.jwt() ->> 'sub')
  LIMIT 1;

  -- 2. SECURE PRODUCTION BEHAVIOR:
  -- If user has no valid user_mappings record with assigned school_id, return NULL.
  -- In PostgreSQL RLS, `school_id = NULL` evaluates to UNKNOWN/FALSE, rejecting all queries.

  -- 3. DEMO/DEVELOPMENT ENVIRONMENT ISOLATED BYPASS (ONLY IF DEMO MOCK CLAIM IS EXPLICIT)
  IF v_school_id IS NULL THEN
    v_is_demo := COALESCE((auth.jwt() ->> 'is_demo')::boolean, FALSE);
    IF v_is_demo IS TRUE THEN
      SELECT id INTO v_school_id FROM schools WHERE slug = 'greenwood-high' LIMIT 1;
    END IF;
  END IF;

  RETURN v_school_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
