-- ============================================================================
-- Migration 024: Campus Community — Intelligent School Communication System
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Community Categories (predefined + routable)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '💬',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_moderation BOOLEAN DEFAULT false,
  routing_target TEXT CHECK (routing_target IN ('teacher', 'admin', 'vendor', 'transport', 'library', 'lost_found', 'safety', 'canteen', 'none')),
  routing_role TEXT CHECK (routing_role IN ('teacher', 'admin', 'vendor', 'none')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Anonymous Animal Identities
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anonymous_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Community Posts (core table)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES community_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  anonymous_identity_id UUID REFERENCES anonymous_identities(id) ON DELETE SET NULL,
  ai_category TEXT,
  ai_priority TEXT CHECK (ai_priority IN ('low', 'medium', 'high', 'critical')),
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  ai_toxicity_score NUMERIC(4,3) DEFAULT 0,
  ai_duplicate_of UUID REFERENCES community_posts(id) ON DELETE SET NULL,
  ai_suggested_department TEXT,
  ai_moderated BOOLEAN DEFAULT false,
  ai_moderation_passed BOOLEAN DEFAULT true,
  ai_moderation_reason TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'approved', 'resolved', 'closed', 'hidden')),
  is_published BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_posts_student ON community_posts(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category_id, status);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_priority ON community_posts(ai_priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_community_posts_fts ON community_posts USING GIN(to_tsvector('english', title || ' ' || body));

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Community Answers
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  is_ai_generated BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  upvote_count INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_answers_post ON community_answers(post_id, created_at);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Community Upvotes
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('student', 'teacher', 'admin')),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES community_answers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT upvote_target CHECK (
    (post_id IS NOT NULL AND answer_id IS NULL) OR
    (post_id IS NULL AND answer_id IS NOT NULL)
  ),
  UNIQUE (user_id, user_role, post_id),
  UNIQUE (user_id, user_role, answer_id)
);

CREATE INDEX IF NOT EXISTS idx_community_upvotes_post ON community_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_upvotes_answer ON community_upvotes(answer_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Community Reports
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reporter_role TEXT NOT NULL CHECK (reporter_role IN ('student', 'teacher', 'admin')),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES community_answers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Community Audit Logs (immutable)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('student', 'teacher', 'admin', 'system')),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'answer', 'report', 'identity')),
  target_id UUID NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_audit_target ON community_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_audit_created ON community_audit_logs(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. AI Moderation Cache (dedup AI analysis)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT NOT NULL UNIQUE,
  category TEXT,
  priority TEXT,
  sentiment TEXT,
  toxicity_score NUMERIC(4,3),
  duplicate_of UUID,
  suggested_department TEXT,
  is_appropriate BOOLEAN,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ════════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_ai_cache ENABLE ROW LEVEL SECURITY;

-- Categories: everyone can read
CREATE POLICY "community_categories_select" ON community_categories FOR SELECT USING (true);

-- Anonymous identities: everyone can read
CREATE POLICY "anonymous_identities_select" ON anonymous_identities FOR SELECT USING (true);

-- Posts: students see published + own; teachers/admins see all
CREATE POLICY "community_posts_select" ON community_posts FOR SELECT USING (
  is_published = true
  OR student_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Students insert; teachers/admins can insert
CREATE POLICY "community_posts_insert" ON community_posts FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Teachers/admins can update
CREATE POLICY "community_posts_update" ON community_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Answers: everyone can read published post answers
CREATE POLICY "community_answers_select" ON community_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM community_posts WHERE id = post_id AND is_published = true)
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Students, teachers, admins can answer
CREATE POLICY "community_answers_insert" ON community_answers FOR INSERT WITH CHECK (
  author_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Teachers/admins update answers
CREATE POLICY "community_answers_update" ON community_answers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Upvotes: authenticated users
CREATE POLICY "community_upvotes_select" ON community_upvotes FOR SELECT USING (true);
CREATE POLICY "community_upvotes_insert" ON community_upvotes FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);
CREATE POLICY "community_upvotes_delete" ON community_upvotes FOR DELETE USING (
  user_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Reports: authenticated users can insert; teachers/admins can read/update
CREATE POLICY "community_reports_select" ON community_reports FOR SELECT USING (
  reporter_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);
CREATE POLICY "community_reports_insert" ON community_reports FOR INSERT WITH CHECK (
  reporter_id IN (SELECT id FROM students WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);
CREATE POLICY "community_reports_update" ON community_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- Audit logs: teachers/admins only
CREATE POLICY "community_audit_logs_select" ON community_audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  OR is_admin()
);

-- AI cache: everyone reads; system inserts
CREATE POLICY "community_ai_cache_select" ON community_ai_cache FOR SELECT USING (true);
CREATE POLICY "community_ai_cache_insert" ON community_ai_cache FOR INSERT WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════════════
-- Functions
-- ════════════════════════════════════════════════════════════════════════════

-- Record community audit log
CREATE OR REPLACE FUNCTION record_community_audit(
  p_action TEXT,
  p_actor_id UUID,
  p_actor_role TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_details TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO community_audit_logs (action, actor_id, actor_role, target_type, target_id, details, metadata)
  VALUES (p_action, p_actor_id, p_actor_role, p_target_type, p_target_id, p_details, p_metadata);
END;
$$;

-- Assign anonymous identity to a post
CREATE OR REPLACE FUNCTION assign_anonymous_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_identity_id UUID;
BEGIN
  IF NEW.is_anonymous AND NEW.anonymous_identity_id IS NULL THEN
    SELECT id INTO v_identity_id FROM anonymous_identities
    WHERE is_active = true
    AND id NOT IN (
      SELECT anonymous_identity_id FROM community_posts
      WHERE is_anonymous = true AND anonymous_identity_id IS NOT NULL
      AND created_at > now() - interval '24 hours'
    )
    ORDER BY random()
    LIMIT 1;

    IF v_identity_id IS NULL THEN
      SELECT id INTO v_identity_id FROM anonymous_identities
      WHERE is_active = true
      ORDER BY random()
      LIMIT 1;
    END IF;

    NEW.anonymous_identity_id := v_identity_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_anonymous_identity ON community_posts;
CREATE TRIGGER trg_assign_anonymous_identity
  BEFORE INSERT ON community_posts
  FOR EACH ROW
  WHEN (NEW.is_anonymous = true)
  EXECUTE FUNCTION assign_anonymous_identity();

-- ════════════════════════════════════════════════════════════════════════════
-- Seed Data
-- ════════════════════════════════════════════════════════════════════════════

-- Categories with routing
INSERT INTO community_categories (id, name, slug, description, icon, sort_order, routing_target, routing_role) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'Academic Questions', 'academic', 'Homework help, subject doubts, exam prep', '📚', 1, 'teacher', 'teacher'),
  ('c1000000-0000-4000-8000-000000000002', 'Ideas & Suggestions', 'ideas', 'Share ideas to improve the school', '💡', 2, 'admin', 'admin'),
  ('c1000000-0000-4000-8000-000000000003', 'Club Discussions', 'clubs', 'Robotics, drama, chess, art, music clubs', '🎭', 3, 'teacher', 'teacher'),
  ('c1000000-0000-4000-8000-000000000004', 'Transport Issues', 'transport', 'Bus routes, stops, timing concerns', '🚌', 4, 'transport', 'admin'),
  ('c1000000-0000-4000-8000-000000000005', 'Canteen Feedback', 'canteen', 'Food quality, menu suggestions, hygiene', '🍽️', 5, 'canteen', 'vendor'),
  ('c1000000-0000-4000-8000-000000000006', 'Lost & Found', 'lost-found', 'Report lost or found items', '🔍', 6, 'lost_found', 'admin'),
  ('c1000000-0000-4000-8000-000000000007', 'Event Discussions', 'events', 'Sports day, science fair, cultural events', '🎪', 7, 'teacher', 'teacher'),
  ('c1000000-0000-4000-8000-000000000008', 'Mental Wellness', 'wellness', 'Share feelings, get support (anonymous recommended)', '💚', 8, 'teacher', 'teacher'),
  ('c1000000-0000-4000-8000-000000000009', 'Safety Reports', 'safety', 'Report safety concerns (anonymous recommended)', '🛡️', 9, 'safety', 'admin'),
  ('c1000000-0000-4000-8000-000000000010', 'Library & Resources', 'library', 'Library books, study materials, resource requests', '📖', 10, 'library', 'vendor');

-- Anonymous animal identities
INSERT INTO anonymous_identities (id, animal_name, icon) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Anonymous Falcon', '🦅'),
  ('a1000000-0000-4000-8000-000000000002', 'Anonymous Tiger', '🐯'),
  ('a1000000-0000-4000-8000-000000000003', 'Anonymous Eagle', '🦅'),
  ('a1000000-0000-4000-8000-000000000004', 'Anonymous Lion', '🦁'),
  ('a1000000-0000-4000-8000-000000000005', 'Anonymous Panda', '🐼'),
  ('a1000000-0000-4000-8000-000000000006', 'Anonymous Fox', '🦊'),
  ('a1000000-0000-4000-8000-000000000007', 'Anonymous Owl', '🦉'),
  ('a1000000-0000-4000-8000-000000000008', 'Anonymous Dolphin', '🐬'),
  ('a1000000-0000-4000-8000-000000000009', 'Anonymous Wolf', '🐺'),
  ('a1000000-0000-4000-8000-000000000010', 'Anonymous Bear', '🐻');
