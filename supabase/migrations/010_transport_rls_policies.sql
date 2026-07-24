-- ============================================================================
-- Migration 010: Transport Row-Level Security Policies
-- Run this to configure access permissions for the journey tracking tables.
-- ============================================================================

-- Enable RLS on all transport tables
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflict
DROP POLICY IF EXISTS drivers_select ON drivers;
DROP POLICY IF EXISTS drivers_all_admin ON drivers;
DROP POLICY IF EXISTS vehicles_select ON vehicles;
DROP POLICY IF EXISTS vehicles_all_admin ON vehicles;
DROP POLICY IF EXISTS bus_stops_select ON bus_stops;
DROP POLICY IF EXISTS bus_stops_all_admin ON bus_stops;
DROP POLICY IF EXISTS student_stops_select ON student_stops;
DROP POLICY IF EXISTS student_stops_all_admin ON student_stops;
DROP POLICY IF EXISTS driver_trips_select ON driver_trips;
DROP POLICY IF EXISTS driver_trips_all_anon ON driver_trips;
DROP POLICY IF EXISTS driver_trips_all_auth ON driver_trips;
DROP POLICY IF EXISTS student_journey_select ON student_journey;
DROP POLICY IF EXISTS student_journey_all_anon ON student_journey;
DROP POLICY IF EXISTS student_journey_all_auth ON student_journey;
DROP POLICY IF EXISTS journey_alerts_select ON journey_alerts;
DROP POLICY IF EXISTS journey_alerts_all_anon ON journey_alerts;
DROP POLICY IF EXISTS journey_alerts_all_auth ON journey_alerts;

-- 1. drivers Policies
-- Public read (so frontend and driver apps can view list of drivers)
CREATE POLICY drivers_select ON drivers FOR SELECT USING (true);
-- Full access by admin role
CREATE POLICY drivers_all_admin ON drivers FOR ALL USING (is_admin());

-- 2. vehicles Policies
-- Public read
CREATE POLICY vehicles_select ON vehicles FOR SELECT USING (true);
-- Full access by admin role
CREATE POLICY vehicles_all_admin ON vehicles FOR ALL USING (is_admin());

-- 3. bus_stops Policies
-- Public read (necessary so the driver and parents can view route stops)
CREATE POLICY bus_stops_select ON bus_stops FOR SELECT USING (true);
-- Full access by admin role
CREATE POLICY bus_stops_all_admin ON bus_stops FOR ALL USING (is_admin());

-- 4. student_stops Policies
-- Public read
CREATE POLICY student_stops_select ON student_stops FOR SELECT USING (true);
-- Full access by admin role
CREATE POLICY student_stops_all_admin ON student_stops FOR ALL USING (is_admin());

-- 5. driver_trips Policies
-- Public read (anyone can check active trips status)
CREATE POLICY driver_trips_select ON driver_trips FOR SELECT USING (true);
-- Allow anonymous driver/client full access (the driver app uses anon client)
CREATE POLICY driver_trips_all_anon ON driver_trips FOR ALL TO anon USING (true) WITH CHECK (true);
-- Allow authenticated user full access
CREATE POLICY driver_trips_all_auth ON driver_trips FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. student_journey Policies
-- Public read (anyone can check student progress/boarding status)
CREATE POLICY student_journey_select ON student_journey FOR SELECT USING (true);
-- Allow anonymous driver/client full access (to board/deboard students)
CREATE POLICY student_journey_all_anon ON student_journey FOR ALL TO anon USING (true) WITH CHECK (true);
-- Allow authenticated user full access
CREATE POLICY student_journey_all_auth ON student_journey FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. journey_alerts Policies
-- Public read
CREATE POLICY journey_alerts_select ON journey_alerts FOR SELECT USING (true);
-- Allow anonymous driver/client full access (to raise safety alerts)
CREATE POLICY journey_alerts_all_anon ON journey_alerts FOR ALL TO anon USING (true) WITH CHECK (true);
-- Allow authenticated user full access
CREATE POLICY journey_alerts_all_auth ON journey_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
