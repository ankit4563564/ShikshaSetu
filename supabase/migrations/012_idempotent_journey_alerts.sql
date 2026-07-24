-- Migration 012: Make journey alert creation idempotent under concurrency.
-- Keeps the existing application-level duplicate check, while serializing
-- concurrent requests for the same student/trip/alert type in the database.

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
  -- Transaction-scoped lock: concurrent requests for the same logical alert
  -- cannot both pass the existing-alert check and create notifications.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(
      p_student_id::TEXT || ':' || p_trip_id::TEXT || ':' || p_alert_type,
      0
    )
  );

  SELECT id INTO v_alert_id
  FROM journey_alerts
  WHERE student_id = p_student_id
    AND trip_id = p_trip_id
    AND alert_type = p_alert_type
    AND resolved = FALSE
  ORDER BY triggered_at ASC
  LIMIT 1;

  IF v_alert_id IS NOT NULL THEN
    RETURN v_alert_id;
  END IF;

  INSERT INTO journey_alerts (student_id, trip_id, alert_type, message)
  VALUES (p_student_id, p_trip_id, p_alert_type, p_message)
  RETURNING id INTO v_alert_id;

  SELECT guardian_id INTO v_guardian_id
  FROM guardian_access
  WHERE student_id = p_student_id
  ORDER BY is_primary DESC, created_at ASC
  LIMIT 1;

  SELECT class_teacher_id INTO v_teacher_id
  FROM students
  WHERE id = p_student_id;

  IF p_alert_type = 'missed_stop' THEN
    IF v_guardian_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_guardian_id, 'parent', p_student_id, 'Missed Stop Alert', p_message, 'safety', false);
    END IF;
    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_teacher_id, 'teacher', p_student_id, 'Missed Stop Alert', p_message, 'safety', false);
    END IF;
  ELSIF p_alert_type = 'not_home_safe' THEN
    IF v_guardian_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_guardian_id, 'parent', p_student_id, 'Not Home Safe Alert', p_message, 'safety', false);
    END IF;
    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_teacher_id, 'teacher', p_student_id, 'Not Home Safe Alert', p_message, 'safety', false);
    END IF;
    FOR v_admin_id IN SELECT id FROM admins LOOP
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_admin_id, 'admin', p_student_id, 'Not Home Safe Alert', p_message, 'safety', false);
    END LOOP;
  ELSIF p_alert_type = 'unexpected_deboard' THEN
    IF v_guardian_id IS NOT NULL THEN
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_guardian_id, 'parent', p_student_id, 'Unexpected Deboard Alert', p_message, 'safety', false);
    END IF;
    FOR v_admin_id IN SELECT id FROM admins LOOP
      INSERT INTO notifications (recipient_id, recipient_role, student_id, title, body, category, is_read)
      VALUES (v_admin_id, 'admin', p_student_id, 'Unexpected Deboard Alert', p_message, 'safety', false);
    END LOOP;
  END IF;

  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;
