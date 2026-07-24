-- Migration: 004_clerk_auth_mapping
-- Purpose: Support linking Clerk User IDs to teachers, guardians, and admins tables

-- 1. Add clerk_user_id column to teachers
ALTER TABLE teachers ADD COLUMN clerk_user_id TEXT UNIQUE;
COMMENT ON COLUMN teachers.clerk_user_id IS 'Unique Clerk User ID (user_...) linked to this teacher record.';

-- 2. Add clerk_user_id column to guardians
ALTER TABLE guardians ADD COLUMN clerk_user_id TEXT UNIQUE;
COMMENT ON COLUMN guardians.clerk_user_id IS 'Unique Clerk User ID (user_...) linked to this guardian record.';

-- 3. Create admins table
CREATE TABLE admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE admins IS 'System administrators. Links to Clerk via clerk_user_id.';
