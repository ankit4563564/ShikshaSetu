-- ════════════════════════════════════════════════════════════════════════════
-- Migration 014: Campus ID Device Registration & Trusted Devices
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Create scanner device status enum
DO $$ BEGIN
  CREATE TYPE scanner_device_status AS ENUM ('active', 'deactivated', 'lost', 'retired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create scanner devices table
CREATE TABLE IF NOT EXISTS scanner_devices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name       TEXT NOT NULL,
  device_type       TEXT NOT NULL DEFAULT 'mobile', -- 'mobile', 'fixed_kiosk', 'tablet', 'embedded'
  assigned_role     scan_mode NOT NULL DEFAULT 'gate_entry',
  assigned_user     TEXT, -- Clerk user ID or staff identifier (nullable for shared kiosks)
  status            scanner_device_status NOT NULL DEFAULT 'active',
  last_seen         TIMESTAMPTZ,
  public_identifier TEXT NOT NULL UNIQUE, -- shared secret baked into device config
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_scanner_devices_public_id ON scanner_devices(public_identifier);
CREATE INDEX IF NOT EXISTS idx_scanner_devices_status ON scanner_devices(status);
CREATE INDEX IF NOT EXISTS idx_scanner_devices_assigned_role ON scanner_devices(assigned_role);

-- 4. RLS: read-only for authenticated scanners, full admin access
ALTER TABLE scanner_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY scanner_devices_select_authenticated ON scanner_devices
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY scanner_devices_all_admin ON scanner_devices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE clerk_user_id = auth.uid())
  );

-- 5. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_scanner_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scanner_devices_updated_at ON scanner_devices;
CREATE TRIGGER trg_scanner_devices_updated_at
  BEFORE UPDATE ON scanner_devices
  FOR EACH ROW EXECUTE FUNCTION update_scanner_device_timestamp();

-- 6. Seed a default gate kiosk device for backward compatibility
INSERT INTO scanner_devices (device_name, device_type, assigned_role, status, public_identifier)
VALUES ('Legacy Gate Kiosk', 'fixed_kiosk', 'gate_entry', 'active', 'legacy-gate-kiosk-default')
ON CONFLICT (public_identifier) DO NOTHING;

INSERT INTO scanner_devices (device_name, device_type, assigned_role, status, public_identifier)
VALUES ('Legacy Driver Tablet', 'tablet', 'transport_board', 'active', 'legacy-driver-tablet-default')
ON CONFLICT (public_identifier) DO NOTHING;
