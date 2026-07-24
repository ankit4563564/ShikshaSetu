-- ============================================================================
-- Migration: AI Insights Dashboard
-- Generates and stores nightly school insights with SQL aggregations
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Insight Types Enum
-- ────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE insight_category AS ENUM (
    'homework_completion',
    'attendance_trend',
    'bus_delays',
    'active_classes',
    'reward_redemption',
    'most_requested_reward',
    'most_discussed_topic',
    'students_needing_attention',
    'teacher_workload',
    'wellness_trend'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Insight Severity Enum
-- ────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE insight_severity AS ENUM (
    'info',
    'warning',
    'critical',
    'positive'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. AI Insights Table - Stores generated insights
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  insight_date DATE NOT NULL,                    -- The date this insight covers
  category insight_category NOT NULL,
  severity insight_severity NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',           -- Raw numeric data for charts
  chart_data JSONB NOT NULL DEFAULT '{}',        -- Pre-formatted chart data
  recommendation TEXT,                           -- Actionable recommendation
  action_suggestions JSONB NOT NULL DEFAULT '[]', -- Array of specific actions
  risk_alert BOOLEAN DEFAULT false,              -- Is this a risk alert?
  metadata JSONB DEFAULT '{}',                   -- Additional context
  is_dismissed BOOLEAN DEFAULT false,            -- Admin can dismiss
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_date ON ai_insights(insight_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_category ON ai_insights(category);
CREATE INDEX IF NOT EXISTS idx_ai_insights_severity ON ai_insights(severity);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed ON ai_insights(is_dismissed);

COMMENT ON TABLE ai_insights IS 'Nightly AI-generated school insights with SQL-backed aggregations';

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Insight Generation Log - Tracks when generation runs
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insight_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  insight_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  insights_generated INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_insight_gen_log_date ON insight_generation_log(insight_date DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. SQL Aggregation Functions - Pure SQL, no hardcoded analytics
-- =============================================================================

-- Helper: Get date range for last N days
-- Usage: SELECT * FROM get_date_range(30) returns {start_date, end_date}

-- ────────────────────────────────────────────────────────────────────────────
-- Homework Completion Trend (last 30 days)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_homework_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
  v_completion_rate NUMERIC;
  v_prev_rate NUMERIC;
  v_trend TEXT;
  v_students_behind INTEGER;
  v_chart_data JSONB;
BEGIN
  -- Calculate homework completion for last 30 days
  WITH hw_stats AS (
    SELECT 
      h.due_date,
      COUNT(*) FILTER (WHERE h.is_submitted) as submitted,
      COUNT(*) as total,
      ROUND(COUNT(*) FILTER (WHERE h.is_submitted)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as rate
    FROM homework h
    WHERE h.due_date BETWEEN (p_date - INTERVAL '29 days') AND p_date
    GROUP BY h.due_date
    ORDER BY h.due_date
  ),
  overall AS (
    SELECT 
      AVG(rate) as avg_rate,
      MAX(rate) FILTER (WHERE due_date = (SELECT MAX(due_date) FROM hw_stats)) as latest_rate,
      MAX(rate) FILTER (WHERE due_date = (SELECT MAX(due_date) - INTERVAL '7 days' FROM hw_stats)) as week_ago_rate
    FROM hw_stats
  ),
  behind_students AS (
    SELECT COUNT(DISTINCT h.student_id) as count
    FROM homework h
    WHERE h.due_date BETWEEN (p_date - INTERVAL '14 days') AND p_date
      AND h.is_submitted = false
  )
  SELECT 
    jsonb_build_object(
      'completion_rate', COALESCE(o.avg_rate, 0),
      'trend', CASE 
        WHEN o.week_ago_rate IS NULL THEN 'insufficient_data'
        WHEN o.latest_rate > o.week_ago_rate THEN 'improving'
        WHEN o.latest_rate < o.week_ago_rate THEN 'declining'
        ELSE 'stable'
      END,
      'students_behind', COALESCE(b.count, 0),
      'chart_data', (
        SELECT jsonb_agg(jsonb_build_object(
          'date', due_date,
          'rate', rate,
          'submitted', submitted,
          'total', total
        ) ORDER BY due_date) FROM hw_stats
      ),
      'severity', CASE 
        WHEN COALESCE(o.avg_rate, 0) < 50 THEN 'critical'
        WHEN COALESCE(o.avg_rate, 0) < 70 THEN 'warning'
        ELSE 'info'
      END
    )
  INTO v_result
  FROM overall o, behind_students b;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Attendance Trend (last 30 days)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_attendance_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH daily_att AS (
    SELECT 
      a.date,
      ROUND(
        COUNT(*) FILTER (WHERE a.status IN ('present', 'late'))::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 1
      ) as rate,
      COUNT(*) FILTER (WHERE a.status = 'absent') as absent_count,
      COUNT(*) as total
    FROM attendance a
    WHERE a.date BETWEEN (p_date - INTERVAL '29 days') AND p_date
    GROUP BY a.date
    ORDER BY a.date
  ),
  overall AS (
    SELECT 
      AVG(rate) as avg_rate,
      MAX(rate) FILTER (WHERE date = p_date) as today_rate,
      MAX(rate) FILTER (WHERE date = p_date - INTERVAL '7 days') as week_ago_rate,
      SUM(absent_count) as total_absent
    FROM daily_att
  ),
  chronic_absent AS (
    SELECT COUNT(DISTINCT a.student_id) as count
    FROM attendance a
    WHERE a.date BETWEEN (p_date - INTERVAL '30 days') AND p_date
      AND a.status = 'absent'
    GROUP BY a.student_id
    HAVING COUNT(*) FILTER (WHERE a.status = 'absent') > 5
  )
  SELECT jsonb_build_object(
    'average_rate', COALESCE(o.avg_rate, 0),
    'today_rate', COALESCE(o.today_rate, 0),
    'trend', CASE 
      WHEN o.week_ago_rate IS NULL THEN 'insufficient_data'
      WHEN o.today_rate > o.week_ago_rate THEN 'improving'
      WHEN o.today_rate < o.week_ago_rate THEN 'declining'
      ELSE 'stable'
    END,
    'chronic_absent_students', COALESCE((SELECT COUNT(*) FROM chronic_absent), 0),
    'chart_data', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', date,
        'rate', rate,
        'absent', absent_count,
        'total', total
      ) ORDER BY date) FROM daily_att
    ),
    'severity', CASE 
      WHEN COALESCE(o.avg_rate, 0) < 80 THEN 'critical'
      WHEN COALESCE(o.avg_rate, 0) < 90 THEN 'warning'
      ELSE 'info'
    END
  )
  INTO v_result
  FROM overall o;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Bus Delays (last 30 days)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_bus_delays_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if journey tables exist and have data
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_journey') THEN
    RETURN jsonb_build_object(
      'message', 'Journey tracking not yet configured',
      'severity', 'info',
      'chart_data', '[]'::jsonb
    );
  END IF;

  WITH trip_delays AS (
    SELECT 
      dt.id as trip_id,
      dt.bus_identifier,
      dt.started_at::date as trip_date,
      COUNT(sj.id) FILTER (WHERE sj.status = 'deboarded' AND sj.deboarded_at > sj.boarded_at + INTERVAL '15 minutes') as delayed_count,
      COUNT(sj.id) as total_students
    FROM driver_trips dt
    LEFT JOIN student_journey sj ON sj.trip_id = dt.id
    WHERE dt.started_at::date BETWEEN (p_date - INTERVAL '29 days') AND p_date
      AND dt.status = 'completed'
    GROUP BY dt.id, dt.bus_identifier, dt.started_at::date
    ORDER BY dt.started_at::date
  ),
  daily_summary AS (
    SELECT 
      trip_date,
      SUM(delayed_count) as total_delayed,
      SUM(total_students) as total_students,
      ROUND(SUM(delayed_count)::NUMERIC / NULLIF(SUM(total_students), 0) * 100, 1) as delay_rate
    FROM trip_delays
    GROUP BY trip_date
    ORDER BY trip_date
  )
  SELECT jsonb_build_object(
    'total_delayed', COALESCE(SUM(total_delayed), 0),
    'average_delay_rate', COALESCE(AVG(delay_rate), 0),
    'worst_day', (
      SELECT jsonb_build_object('date', trip_date, 'rate', delay_rate)
      FROM daily_summary
      ORDER BY delay_rate DESC
      LIMIT 1
    ),
    'chart_data', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', trip_date,
        'delay_rate', delay_rate,
        'delayed', total_delayed,
        'total', total_students
      ) ORDER BY trip_date) FROM daily_summary
    ),
    'severity', CASE 
      WHEN COALESCE(AVG(delay_rate), 0) > 20 THEN 'critical'
      WHEN COALESCE(AVG(delay_rate), 0) > 10 THEN 'warning'
      ELSE 'info'
    END
  )
  INTO v_result
  FROM daily_summary;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Most Active Classes (by homework, attendance, participation)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_active_classes_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH class_activity AS (
    SELECT 
      s.class_name,
      s.section,
      COUNT(DISTINCT s.id) as student_count,
      -- Homework submission rate
      COALESCE(ROUND(
        COUNT(DISTINCT CASE WHEN h.is_submitted THEN h.student_id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT h.student_id), 0) * 100, 1
      ), 0) as hw_rate,
      -- Attendance rate
      COALESCE(ROUND(
        COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.student_id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT a.student_id), 0) * 100, 1
      ), 0) as att_rate,
      -- Participation score (composite)
      (
        COALESCE(COUNT(DISTINCT CASE WHEN h.is_submitted THEN h.student_id END)::NUMERIC / NULLIF(COUNT(DISTINCT h.student_id), 0), 0) * 0.4 +
        COALESCE(COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.student_id END)::NUMERIC / NULLIF(COUNT(DISTINCT a.student_id), 0), 0) * 0.6
      ) * 100 as participation_score
    FROM students s
    LEFT JOIN homework h ON h.student_id = s.id AND h.due_date BETWEEN (p_date - INTERVAL '30 days') AND p_date
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date BETWEEN (p_date - INTERVAL '30 days') AND p_date
    WHERE s.class_name IS NOT NULL
    GROUP BY s.class_name, s.section
  ),
  ranked AS (
    SELECT *,
      RANK() OVER (ORDER BY participation_score DESC) as rank
    FROM class_activity
  )
  SELECT jsonb_build_object(
    'most_active', (
      SELECT jsonb_build_object(
        'class', class_name || '-' || section,
        'participation_score', participation_score,
        'hw_rate', hw_rate,
        'att_rate', att_rate,
        'student_count', student_count
      ) FROM ranked WHERE rank = 1
    ),
    'least_active', (
      SELECT jsonb_build_object(
        'class', class_name || '-' || section,
        'participation_score', participation_score,
        'hw_rate', hw_rate,
        'att_rate', att_rate,
        'student_count', student_count
      ) FROM ranked ORDER BY rank DESC LIMIT 1
    ),
    'all_classes', (
      SELECT jsonb_agg(jsonb_build_object(
        'class', class_name || '-' || section,
        'participation_score', participation_score,
        'hw_rate', hw_rate,
        'att_rate', att_rate,
        'student_count', student_count
      ) ORDER BY participation_score DESC) FROM ranked
    ),
    'severity', 'info'
  )
  INTO v_result
  FROM class_activity ca
  WHERE ca.student_count > 0
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Reward Redemption Trend
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_reward_redemption_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH daily_redemptions AS (
    SELECT 
      r.redeemed_at::date as date,
      COUNT(*) as count,
      SUM(ct.amount) as coins_spent
    FROM redemptions r
    JOIN coin_transactions ct ON ct.id = r.coin_tx_id
    WHERE r.redeemed_at::date BETWEEN (p_date - INTERVAL '29 days') AND p_date
      AND r.status = 'completed'
    GROUP BY r.redeemed_at::date
    ORDER BY r.redeemed_at::date
  ),
  category_breakdown AS (
    SELECT 
      rc.category,
      COUNT(*) as count,
      SUM(ct.amount) as coins
    FROM redemptions r
    JOIN rewards_config rc ON rc.id = r.reward_id
    JOIN coin_transactions ct ON ct.id = r.coin_tx_id
    WHERE r.redeemed_at::date BETWEEN (p_date - INTERVAL '29 days') AND p_date
      AND r.status = 'completed'
    GROUP BY rc.category
    ORDER BY count DESC
  )
  SELECT jsonb_build_object(
    'total_redemptions', COALESCE(SUM(count), 0),
    'total_coins_spent', COALESCE(SUM(coins_spent), 0),
    'average_daily', COALESCE(AVG(count), 0),
    'trend', CASE 
      WHEN (SELECT COUNT(*) FROM daily_redemptions WHERE date >= (p_date - INTERVAL '7 days')) 
           > (SELECT COUNT(*) FROM daily_redemptions WHERE date BETWEEN (p_date - INTERVAL '14 days') AND (p_date - INTERVAL '7 days'))
      THEN 'increasing'
      WHEN (SELECT COUNT(*) FROM daily_redemptions WHERE date >= (p_date - INTERVAL '7 days')) 
           < (SELECT COUNT(*) FROM daily_redemptions WHERE date BETWEEN (p_date - INTERVAL '14 days') AND (p_date - INTERVAL '7 days'))
      THEN 'decreasing'
      ELSE 'stable'
    END,
    'chart_data', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', date,
        'count', count,
        'coins', coins_spent
      ) ORDER BY date) FROM daily_redemptions
    ),
    'by_category', (
      SELECT jsonb_agg(jsonb_build_object(
        'category', category,
        'count', count,
        'coins', coins
      ) ORDER BY count DESC) FROM category_breakdown
    ),
    'severity', 'info'
  )
  INTO v_result
  FROM daily_redemptions;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Most Requested Reward
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_most_requested_reward_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH reward_stats AS (
    SELECT 
      rc.id,
      rc.name,
      rc.category,
      rc.cost,
      rc.stock,
      COUNT(r.id) as redemption_count,
      SUM(ct.amount) as total_coins,
      ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC) as rnk
    FROM rewards_config rc
    LEFT JOIN redemptions r ON r.reward_id = rc.id 
      AND r.redeemed_at::date BETWEEN (p_date - INTERVAL '30 days') AND p_date
      AND r.status = 'completed'
    WHERE rc.is_active = true
    GROUP BY rc.id, rc.name, rc.category, rc.cost, rc.stock
  )
  SELECT jsonb_build_object(
    'top_reward', (
      SELECT jsonb_build_object(
        'name', name,
        'category', category,
        'cost', cost,
        'stock', stock,
        'redemptions', redemption_count,
        'coins_spent', total_coins
      ) FROM reward_stats WHERE rnk = 1
    ),
    'top_5', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', name,
        'category', category,
        'cost', cost,
        'redemptions', redemption_count
      ) ORDER BY redemption_count DESC) FROM reward_stats WHERE rnk <= 5
    ),
    'underutilized', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', name,
        'category', category,
        'cost', cost,
        'redemptions', redemption_count
      ) ORDER BY redemption_count ASC) FROM reward_stats WHERE redemption_count = 0
    ),
    'severity', 'info'
  )
  INTO v_result
  FROM reward_stats rs
  WHERE rs.rnk = 1
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Most Discussed Topic (Community)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_most_discussed_topic_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if community tables exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts') THEN
    RETURN jsonb_build_object(
      'message', 'Community module not active',
      'severity', 'info',
      'chart_data', '[]'::jsonb
    );
  END IF;

  WITH category_stats AS (
    SELECT 
      cc.name as category,
      cc.icon,
      COUNT(p.id) as post_count,
      COUNT(a.id) as answer_count,
      COUNT(DISTINCT p.student_id) as unique_authors,
      AVG(p.upvote_count) as avg_upvotes
    FROM community_posts p
    JOIN community_categories cc ON cc.id = p.category_id
    LEFT JOIN community_answers a ON a.post_id = p.id
    WHERE p.created_at::date BETWEEN (p_date - INTERVAL '30 days') AND p_date
      AND p.is_published = true
    GROUP BY cc.name, cc.icon
    ORDER BY post_count DESC
  ),
  tag_stats AS (
    SELECT 
      tag,
      COUNT(*) as frequency
    FROM community_posts,
    LATERAL unnest(tags) as tag
    WHERE created_at::date BETWEEN (p_date - INTERVAL '30 days') AND p_date
      AND is_published = true
    GROUP BY tag
    ORDER BY frequency DESC
    LIMIT 10
  )
  SELECT jsonb_build_object(
    'top_category', (
      SELECT jsonb_build_object(
        'category', category,
        'icon', icon,
        'posts', post_count,
        'answers', answer_count,
        'authors', unique_authors,
        'avg_upvotes', avg_upvotes
      ) FROM category_stats ORDER BY post_count DESC LIMIT 1
    ),
    'top_tags', (
      SELECT jsonb_agg(jsonb_build_object('tag', tag, 'frequency', frequency) ORDER BY frequency DESC)
      FROM tag_stats
    ),
    'all_categories', (
      SELECT jsonb_agg(jsonb_build_object(
        'category', category,
        'icon', icon,
        'posts', post_count,
        'answers', answer_count
      ) ORDER BY post_count DESC) FROM category_stats
    ),
    'severity', 'info'
  )
  INTO v_result
  FROM category_stats cs
  WHERE cs.post_count = (SELECT MAX(post_count) FROM category_stats)
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Students Needing Attention
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_students_needing_attention_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH student_flags AS (
    SELECT 
      s.id,
      s.display_name,
      s.class_name,
      s.section,
      -- Attendance issues
      COUNT(a.id) FILTER (WHERE a.status = 'absent' AND a.date BETWEEN (p_date - INTERVAL '30 days') AND p_date) as absences_30d,
      -- Homework issues
      COUNT(h.id) FILTER (WHERE h.is_submitted = false AND h.due_date BETWEEN (p_date - INTERVAL '14 days') AND p_date) as missing_hw,
      -- Mood issues
      AVG(m.mood_value) FILTER (WHERE m.checked_in_at::date BETWEEN (p_date - INTERVAL '14 days') AND p_date) as avg_mood,
      -- Coin balance
      COALESCE(sb.balance, 0) as coin_balance,
      -- Status flag
      sf.is_corrected,
      sf.status as flag_status
    FROM students s
    LEFT JOIN attendance a ON a.student_id = s.id
    LEFT JOIN homework h ON h.student_id = s.id
    LEFT JOIN mood_checkins m ON m.student_id = s.id
    LEFT JOIN student_balance sb ON sb.student_id = s.id
    LEFT JOIN status_flags sf ON sf.student_id = s.id
    GROUP BY s.id, s.display_name, s.class_name, s.section, sb.balance, sf.is_corrected, sf.status
  ),
  scored AS (
    SELECT *,
      (absences_30d * 2 + missing_hw * 1.5 + 
       CASE WHEN avg_mood < 3 THEN (3 - avg_mood) * 2 ELSE 0 END +
       CASE WHEN coin_balance < 20 THEN 1 ELSE 0 END +
       CASE WHEN flag_status = 'Needs Attention' AND NOT is_corrected THEN 5 ELSE 0 END) as risk_score
    FROM student_flags
  )
  SELECT jsonb_build_object(
    'high_risk_count', (SELECT COUNT(*) FROM scored WHERE risk_score >= 10),
    'medium_risk_count', (SELECT COUNT(*) FROM scored WHERE risk_score BETWEEN 5 AND 9),
    'top_students', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'name', display_name,
        'class', class_name || '-' || section,
        'risk_score', ROUND(risk_score, 1),
        'absences', absences_30d,
        'missing_hw', missing_hw,
        'avg_mood', ROUND(avg_mood, 1),
        'coins', coin_balance,
        'flag', flag_status
      ) ORDER BY risk_score DESC LIMIT 10) FROM scored WHERE risk_score >= 5
    ),
    'chart_data', (
      SELECT jsonb_agg(jsonb_build_object(
        'risk_level', level,
        'count', cnt
      )) FROM (
        SELECT 'High' as level, COUNT(*) as cnt FROM scored WHERE risk_score >= 10
        UNION ALL SELECT 'Medium', COUNT(*) FROM scored WHERE risk_score BETWEEN 5 AND 9
        UNION ALL SELECT 'Low', COUNT(*) FROM scored WHERE risk_score < 5
      ) t
    ),
    'severity', CASE 
      WHEN (SELECT COUNT(*) FROM scored WHERE risk_score >= 10) > 10 THEN 'critical'
      WHEN (SELECT COUNT(*) FROM scored WHERE risk_score >= 10) > 5 THEN 'warning'
      ELSE 'info'
    END
  )
  INTO v_result
  FROM scored s
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Teacher Workload
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_teacher_workload_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') THEN
    RETURN jsonb_build_object('message', 'Teachers table not found', 'severity', 'info');
  END IF;

  WITH teacher_stats AS (
    SELECT 
      t.id,
      t.name,
      COUNT(DISTINCT s.id) as student_count,
      COUNT(DISTINCT h.id) as homework_assigned,
      COUNT(DISTINCT a.id) FILTER (WHERE a.recorded_by = t.id) as attendance_marked,
      COUNT(DISTINCT g.id) as grades_recorded,
      COUNT(DISTINCT cm.id) as chat_messages
    FROM teachers t
    LEFT JOIN students s ON s.class_teacher_id = t.id
    LEFT JOIN homework h ON h.assigned_by = t.id AND h.due_date BETWEEN (p_date - INTERVAL '14 days') AND p_date
    LEFT JOIN attendance a ON a.marked_by = t.id AND a.date BETWEEN (p_date - INTERVAL '14 days') AND p_date
    LEFT JOIN grades g ON g.recorded_by = t.id AND g.assessment_date BETWEEN (p_date - INTERVAL '14 days') AND p_date
    LEFT JOIN chat_messages cm ON cm.teacher_id = t.id AND cm.created_at::date BETWEEN (p_date - INTERVAL '14 days') AND p_date
    GROUP BY t.id, t.name
  ),
  scored AS (
    SELECT *,
      (student_count * 0.5 + homework_assigned * 0.2 + attendance_marked * 0.1 + grades_recorded * 0.1 + chat_messages * 0.1) as workload_score
    FROM teacher_stats
  )
  SELECT jsonb_build_object(
    'total_teachers', (SELECT COUNT(*) FROM scored),
    'highest_workload', (
      SELECT jsonb_build_object(
        'name', name,
        'students', student_count,
        'homework_assigned', homework_assigned,
        'attendance_marked', attendance_marked,
        'grades_recorded', grades_recorded,
        'chat_messages', chat_messages,
        'workload_score', ROUND(workload_score, 1)
      ) FROM scored ORDER BY workload_score DESC LIMIT 1
    ),
    'lowest_workload', (
      SELECT jsonb_build_object(
        'name', name,
        'students', student_count,
        'workload_score', ROUND(workload_score, 1)
      ) FROM scored ORDER BY workload_score ASC LIMIT 1
    ),
    'average_students_per_teacher', (
      SELECT ROUND(AVG(student_count)::NUMERIC, 1) FROM scored
    ),
    'chart_data', (
      SELECT jsonb_agg(jsonb_build_object(
        'teacher', name,
        'score', ROUND(workload_score, 1),
        'students', student_count
      ) ORDER BY workload_score DESC) FROM scored
    ),
    'severity', 'info'
  )
  INTO v_result
  FROM scored s
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Wellness Trend
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_wellness_trend_insight(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH daily_mood AS (
    SELECT 
      m.checked_in_at::date as date,
      AVG(m.mood_value) as avg_mood,
      COUNT(*) as checkins,
      COUNT(*) FILTER (WHERE m.mood_value <= 2) as low_mood_count
    FROM mood_checkins m
    WHERE m.checked_in_at::date BETWEEN (p_date - INTERVAL '29 days') AND p_date
    GROUP BY m.checked_in_at::date
    ORDER BY m.checked_in_at::date
  ),
  overall AS (
    SELECT 
      AVG(avg_mood) as avg_mood,
      MAX(avg_mood) FILTER (WHERE date = p_date) as today_mood,
      MAX(avg_mood) FILTER (WHERE date = p_date - INTERVAL '7 days') as week_ago_mood,
      SUM(low_mood_count) as total_low_mood
    FROM daily_mood
  ),
  mood_distribution AS (
    SELECT 
      m.mood_label,
      COUNT(*) as count
    FROM mood_checkins m
    WHERE m.checked_in_at::date BETWEEN (p_date - INTERVAL '29 days') AND p_date
    GROUP BY m.mood_label
    ORDER BY COUNT(*) DESC
  )
  SELECT jsonb_build_object(
    'average_mood', COALESCE(o.avg_mood, 0),
    'today_mood', COALESCE(o.today_mood, 0),
    'trend', CASE 
      WHEN o.week_ago_mood IS NULL THEN 'insufficient_data'
      WHEN o.today_mood > o.week_ago_mood THEN 'improving'
      WHEN o.today_mood < o.week_ago_mood THEN 'declining'
      ELSE 'stable'
    END,
    'low_mood_days', COALESCE(o.total_low_mood, 0),
    'chart_data', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', date,
        'avg_mood', avg_mood,
        'checkins', checkins,
        'low_mood', low_mood_count
      ) ORDER BY date) FROM daily_mood
    ),
    'mood_distribution', (
      SELECT jsonb_agg(jsonb_build_object(
        'label', mood_label,
        'count', count
      ) ORDER BY count DESC) FROM mood_distribution
    ),
    'severity', CASE 
      WHEN COALESCE(o.avg_mood, 3) < 2.5 THEN 'critical'
      WHEN COALESCE(o.avg_mood, 3) < 3.0 THEN 'warning'
      ELSE 'info'
    END
  )
  INTO v_result
  FROM overall o;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Master Function: Generate All Insights for a Date
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_all_insights(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_categories insight_category[] := ARRAY[
    'homework_completion',
    'attendance_trend',
    'bus_delays',
    'active_classes',
    'reward_redemption',
    'most_requested_reward',
    'most_discussed_topic',
    'students_needing_attention',
    'teacher_workload',
    'wellness_trend'
  ];
  v_category insight_category;
  v_insight JSONB;
  v_func_name TEXT;
  v_log_id UUID;
BEGIN
  -- Create generation log entry
  INSERT INTO insight_generation_log (insight_date, status)
  VALUES (p_date, 'running')
  RETURNING id INTO v_log_id;

  -- Delete existing insights for this date (idempotent)
  DELETE FROM ai_insights WHERE insight_date = p_date;

  -- Generate each insight
  FOREACH v_category IN ARRAY v_categories LOOP
    v_func_name := 'generate_' || v_category || '_insight';
    
    EXECUTE format('SELECT %I($1)', v_func_name) 
    USING p_date
    INTO v_insight;

    IF v_insight IS NOT NULL AND v_insight != '{}'::jsonb THEN
      INSERT INTO ai_insights (
        insight_date, category, severity, title, description,
        metrics, chart_data, recommendation, action_suggestions,
        risk_alert, metadata
      )
      SELECT 
        p_date,
        v_category,
        COALESCE(v_insight->>'severity', 'info')::insight_severity,
        initcap(replace(v_category, '_', ' ')) || ' Insight',
        CASE v_category
          WHEN 'homework_completion' THEN 'Homework completion rate analysis for the past 30 days'
          WHEN 'attendance_trend' THEN 'School attendance trends and chronic absenteeism'
          WHEN 'bus_delays' THEN 'Bus delay patterns and on-time performance'
          WHEN 'active_classes' THEN 'Class engagement and participation comparison'
          WHEN 'reward_redemption' THEN 'Reward redemption trends and coin circulation'
          WHEN 'most_requested_reward' THEN 'Most popular rewards by redemption count'
          WHEN 'most_discussed_topic' THEN 'Community discussion topics and engagement'
          WHEN 'students_needing_attention' THEN 'Students at risk based on multiple indicators'
          WHEN 'teacher_workload' THEN 'Teacher workload distribution and balance'
          WHEN 'wellness_trend' THEN 'Student wellness mood trends and distribution'
        END,
        v_insight,
        v_insight,
        CASE 
          WHEN v_insight->>'severity' IN ('warning', 'critical') THEN 
            'Review the detailed metrics and consider intervention strategies.'
          ELSE 
            'Monitor trends and continue current practices.'
        END,
        CASE v_category
          WHEN 'homework_completion' THEN '["Contact parents of students with 3+ missing assignments", "Schedule homework help sessions", "Review assignment difficulty"]'::jsonb
          WHEN 'attendance_trend' THEN '["Send attendance alerts to parents", "Schedule check-ins with chronic absentees", "Review attendance policies"]'::jsonb
          WHEN 'bus_delays' THEN '["Optimize bus routes", "Adjust departure times", "Notify parents of consistent delays"]'::jsonb
          WHEN 'students_needing_attention' THEN '["Schedule counselor meetings", "Contact parents", "Create intervention plans"]'::jsonb
          WHEN 'teacher_workload' THEN '["Redistribute students if possible", "Provide teaching assistants", "Schedule planning time"]'::jsonb
          WHEN 'wellness_trend' THEN '["Increase counselor availability", "Run wellness workshops", "Anonymous check-in campaign"]'::jsonb
          ELSE '["Monitor and review next cycle"]'::jsonb
        END,
        (v_insight->>'severity') IN ('warning', 'critical'),
        jsonb_build_object('generated_by', v_func_name, 'date', p_date)
      );
    END IF;
  END LOOP;

  -- Update log
  UPDATE insight_generation_log 
  SET status = 'completed', 
      insights_generated = (SELECT COUNT(*) FROM ai_insights WHERE insight_date = p_date),
      duration_ms = EXTRACT(EPOCH FROM (now() - created_at)) * 1000
  WHERE id = v_log_id;

EXCEPTION WHEN OTHERS THEN
  UPDATE insight_generation_log 
  SET status = 'failed', error_message = SQLERRM
  WHERE id = v_log_id;
  RAISE;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. RLS Policies
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_generation_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all insights
CREATE POLICY "ai_insights_admin_read" ON ai_insights FOR SELECT
USING (EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Teachers can read insights
CREATE POLICY "ai_insights_teacher_read" ON ai_insights FOR SELECT
USING (EXISTS (SELECT 1 FROM teachers WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Admins can manage insights
CREATE POLICY "ai_insights_admin_manage" ON ai_insights FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Generation log - admin only
CREATE POLICY "insight_gen_log_admin" ON insight_generation_log FOR SELECT
USING (EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.jwt() ->> 'sub'));

COMMENT ON FUNCTION generate_all_insights(DATE) IS 'Generates all 10 insight categories for a given date. Run nightly via cron.';