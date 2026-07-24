-- Transport seed recovery
-- Run this after 008_student_journey_tracking.sql if the transport tables
-- exist but BUS-001 has no configured stops.

INSERT INTO drivers (id, name, phone, license_number, avatar_emoji) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'Rajesh Kumar', '+91-98765-43210', 'DL-DRIVER-001', '🧑‍✈️')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, bus_identifier, plate_number, capacity) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'BUS-001', 'DL 01 AB 1234', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bus_stops (id, bus_identifier, stop_name, stop_order, latitude, longitude, arrival_time) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'BUS-001', 'Green Park', 1, 28.5588, 77.2028, '07:30:00'),
  ('f1000000-0000-4000-8000-000000000002', 'BUS-001', 'Hauz Khas', 2, 28.5494, 77.2001, '07:45:00'),
  ('f1000000-0000-4000-8000-000000000003', 'BUS-001', 'School Gate', 3, 28.6139, 77.2090, '08:10:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_stops (student_id, stop_id) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000003', 'f1000000-0000-4000-8000-000000000001')
ON CONFLICT (student_id, stop_id) DO NOTHING;
