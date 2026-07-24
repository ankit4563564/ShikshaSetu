-- ============================================================================
-- Migration 008: Student Journey Tracking
-- ============================================================================

-- 1. Drivers Table
CREATE TABLE drivers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  phone          TEXT,
  license_number TEXT,
  avatar_emoji   TEXT DEFAULT '🧑'
);

-- 2. Vehicles Table
CREATE TABLE vehicles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_identifier TEXT UNIQUE NOT NULL,
  plate_number   TEXT,
  capacity       INT DEFAULT 30
);

-- 3. Bus Stops Table
CREATE TABLE bus_stops (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_identifier TEXT NOT NULL REFERENCES vehicles(bus_identifier) ON DELETE CASCADE,
  stop_name      TEXT NOT NULL,
  stop_order     INT NOT NULL,
  latitude       DOUBLE PRECISION NOT NULL,
  longitude      DOUBLE PRECISION NOT NULL,
  arrival_time   TIME NOT NULL
);

-- 4. Student Stops Mapping
CREATE TABLE student_stops (
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  stop_id    UUID NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, stop_id)
);

-- 5. Driver Trips Table
CREATE TABLE driver_trips (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id      UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  bus_identifier TEXT NOT NULL REFERENCES vehicles(bus_identifier) ON DELETE CASCADE,
  status         TEXT NOT NULL CHECK (status IN ('scheduled', 'en_route', 'completed')),
  started_at     TIMESTAMPTZ DEFAULT now(),
  ended_at       TIMESTAMPTZ
);

-- 6. Student Journey Table
CREATE TABLE student_journey (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  trip_id           UUID NOT NULL REFERENCES driver_trips(id) ON DELETE CASCADE,
  status            TEXT NOT NULL CHECK (status IN ('waiting', 'boarded', 'deboarded', 'home_safe')),
  boarded_at        TIMESTAMPTZ,
  deboarded_at      TIMESTAMPTZ,
  home_safe_at      TIMESTAMPTZ,
  deboard_stop      TEXT,
  deboard_lat       DOUBLE PRECISION,
  deboard_lng       DOUBLE PRECISION,
  confirmed_by      UUID REFERENCES guardians(id) ON DELETE SET NULL,
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT student_journey_student_trip_unique UNIQUE (student_id, trip_id)
);

-- 7. Journey Alerts Table
CREATE TABLE journey_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  trip_id      UUID NOT NULL REFERENCES driver_trips(id) ON DELETE CASCADE,
  alert_type   TEXT NOT NULL CHECK (alert_type IN ('missed_stop', 'not_home_safe', 'unexpected_deboard')),
  message      TEXT NOT NULL,
  resolved     BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_student_journey_student ON student_journey (student_id);
CREATE INDEX idx_student_journey_trip    ON student_journey (trip_id);
CREATE INDEX idx_journey_alerts_student  ON journey_alerts (student_id);
CREATE INDEX idx_journey_alerts_trip     ON journey_alerts (trip_id);

-- Stored Function for raising journey alerts
CREATE OR REPLACE FUNCTION create_journey_alert(
  p_student_id UUID,
  p_trip_id UUID,
  p_alert_type TEXT,
  p_message TEXT
) RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
  v_guardian_id UUID;
  v_teacher_id UUID;
  v_admin_id UUID;
BEGIN
  -- Insert into journey_alerts
  INSERT INTO journey_alerts (student_id, trip_id, alert_type, message)
  VALUES (p_student_id, p_trip_id, p_alert_type, p_message)
  RETURNING id INTO v_alert_id;

  -- Fetch primary guardian
  SELECT guardian_id INTO v_guardian_id
  FROM guardian_access
  WHERE student_id = p_student_id
  ORDER BY is_primary DESC, created_at ASC
  LIMIT 1;

  -- Fetch class teacher
  SELECT class_teacher_id INTO v_teacher_id
  FROM students
  WHERE id = p_student_id;

  -- Fetch admin
  SELECT id INTO v_admin_id
  FROM admins
  LIMIT 1;

  -- Duplicate notifications to unified feed matching exact column schema:
  -- [id, recipient_id, recipient_role, student_id, title, body, category, is_read, read_at, created_at]
  
  -- missed_stop → notify parent + teacher instantly
  IF p_alert_type = 'missed_stop' THEN
    IF v_guardian_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_guardian_id, 'parent', p_student_id, 'Missed Stop Alert', p_message, 'safety', false);
    END IF;
    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_teacher_id, 'teacher', p_student_id, 'Missed Stop Alert', p_message, 'safety', false);
    END IF;
  
  -- not_home_safe → notify after 30 min, parent + teacher + admin
  ELSIF p_alert_type = 'not_home_safe' THEN
    IF v_guardian_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_guardian_id, 'parent', p_student_id, 'Not Home Safe Alert', p_message, 'safety', false);
    END IF;
    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_teacher_id, 'teacher', p_student_id, 'Not Home Safe Alert', p_message, 'safety', false);
    END IF;
    IF v_admin_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_admin_id, 'admin', p_student_id, 'Not Home Safe Alert', p_message, 'safety', false);
    END IF;

  -- unexpected_deboard → notify parent + admin instantly
  ELSIF p_alert_type = 'unexpected_deboard' THEN
    IF v_guardian_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_guardian_id, 'parent', p_student_id, 'Unexpected Deboard Alert', p_message, 'safety', false);
    END IF;
    IF v_admin_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_admin_id, 'admin', p_student_id, 'Unexpected Deboard Alert', p_message, 'safety', false);
    END IF;
  END IF;

  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Seed Data
INSERT INTO drivers (id, name, phone, license_number, avatar_emoji) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'Rajesh Kumar', '+91-98765-43210', 'DL-DRIVER-001', '🧑‍✈️'),
  ('d1000000-0000-4000-8000-000000000002', 'Amit Singh', '+91-98765-43211', 'DL-DRIVER-002', '🧑‍✈️')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, bus_identifier, plate_number, capacity) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'BUS-001', 'DL 01 AB 1234', 30),
  ('e1000000-0000-4000-8000-000000000002', 'BUS-002', 'DL 01 CD 5678', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bus_stops (id, bus_identifier, stop_name, stop_order, latitude, longitude, arrival_time) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'BUS-001', 'Green Park', 1, 28.5588, 77.2028, '07:30:00'),
  ('f1000000-0000-4000-8000-000000000002', 'BUS-001', 'Hauz Khas', 2, 28.5494, 77.2001, '07:45:00'),
  ('f1000000-0000-4000-8000-000000000003', 'BUS-001', 'School Gate', 3, 28.6139, 77.2090, '08:10:00')
ON CONFLICT (id) DO NOTHING;

-- Map student stop order
-- Aarav Sharma (b1000000-0000-4000-8000-000000000001) → School Gate
-- Priya Patel (b1000000-0000-4000-8000-000000000002) → Hauz Khas
-- Rohan Singh (b1000000-0000-4000-8000-000000000003) → Green Park
INSERT INTO student_stops (student_id, stop_id) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000003', 'f1000000-0000-4000-8000-000000000001')
ON CONFLICT (student_id, stop_id) DO NOTHING;

-- TODO: Row-Level Security Policies (Phase 10)
-- drivers: Public read, write by admins.
-- vehicles: Public read, write by admins.
-- bus_stops: Public read, write by admins.
-- student_stops: Public read, write by admins.
-- driver_trips: Public read, insert/update by drivers/admins.
-- student_journey: Read by parents/teachers/admins, update by drivers/parents.
-- journey_alerts: Read by parents/teachers/admins, write by system/drivers.

-- Add checked_in_by to mood_checkins
ALTER TABLE mood_checkins ADD COLUMN IF NOT EXISTS checked_in_by TEXT DEFAULT 'student';
