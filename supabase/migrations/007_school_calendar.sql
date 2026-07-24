-- ============================================================================
-- Migration 007: School Calendar & Class Climate
-- Exam periods, holidays, and class-wide mood/engagement tracking (PRD §16)
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- School Calendar
-- Exam periods and holidays to suppress false alarms during high-stress periods
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE school_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exam_period', 'holiday', 'break')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  suppress_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE school_calendar IS 'School calendar with exam periods and holidays. Used by rule engine to suppress false alarms during predictable high-stress periods (PRD §16).';
COMMENT ON COLUMN school_calendar.suppress_alerts IS 'If true, the rule engine will suppress or adjust flags during this period to avoid false-alarm floods.';

CREATE INDEX idx_calendar_dates ON school_calendar (start_date, end_date);
CREATE INDEX idx_calendar_type ON school_calendar (type);

-- ──────────────────────────────────────────────────────────────────────────────
-- Class Climate
-- Aggregate class-wide mood/engagement tracking separate from individual flags
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE class_climate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_mood_score DECIMAL(3,2), -- 1-5 scale average
  avg_engagement_score DECIMAL(3,2), -- 1-5 scale average
  total_students INTEGER NOT NULL,
  students_with_mood_data INTEGER NOT NULL,
  students_with_engagement_data INTEGER NOT NULL,
  mood_distribution JSONB DEFAULT '{}', -- { "very_positive": 5, "positive": 10, "neutral": 8, "negative": 2, "very_negative": 0 }
  engagement_distribution JSONB DEFAULT '{}', -- { "very_high": 3, "high": 12, "moderate": 7, "low": 2, "very_low": 1 }
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(class_id, date)
);

COMMENT ON TABLE class_climate IS 'Aggregate class-wide mood and engagement metrics. Separate from individual student flags to provide class-level insights (PRD §16).';
COMMENT ON COLUMN class_climate.avg_mood_score IS 'Average mood score across all students with mood data for the day (1-5 scale).';
COMMENT ON COLUMN class_climate.avg_engagement_score IS 'Average engagement score across all students with engagement data for the day (1-5 scale).';
COMMENT ON COLUMN class_climate.mood_distribution IS 'Distribution of mood scores across the class for the day.';
COMMENT ON COLUMN class_climate.engagement_distribution IS 'Distribution of engagement scores across the class for the day.';

CREATE INDEX idx_climate_class_date ON class_climate (class_id, date DESC);
CREATE INDEX idx_climate_date ON class_climate (date DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE school_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_climate ENABLE ROW LEVEL SECURITY;

-- School calendar: read-only for all authenticated users
CREATE POLICY "calendar_read_all" ON school_calendar FOR SELECT USING (auth.role() = 'authenticated');

-- Class climate: teachers can read their own class data
CREATE POLICY "climate_read_own_class" ON class_climate FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM teachers WHERE id = class_id
  )
);

-- System can insert/update class climate data
CREATE POLICY "climate_system_write" ON class_climate FOR ALL USING (auth.role() = 'service_role');
