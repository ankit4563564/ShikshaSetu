import { createAdminClient } from '@/lib/supabase/admin';
import type { ScanMode } from './types';

export interface ScannerDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  assignedRole: ScanMode;
  assignedUser: string | null;
  status: string;
  lastSeen: string | null;
  publicIdentifier: string;
}

interface DeviceValidationResult {
  valid: boolean;
  device: ScannerDevice | null;
  error?: string;
}

export async function validateDevice(
  deviceId: string,
  scanMode: ScanMode,
): Promise<DeviceValidationResult> {
  const adminDb = createAdminClient();

  const { data, error } = await adminDb
    .from('scanner_devices')
    .select('*')
    .eq('public_identifier', deviceId)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, device: null, error: 'Device not found' };
  }

  const device = mapRow(data);

  if (device.status !== 'active') {
    return { valid: false, device: null, error: `Device is ${device.status}` };
  }

  if (device.assignedRole !== scanMode) {
    return {
      valid: false,
      device: null,
      error: `Device role '${device.assignedRole}' not authorized for '${scanMode}'`,
    };
  }

  await touchLastSeen(data.id);

  return { valid: true, device };
}

export async function getDeviceById(deviceId: string): Promise<ScannerDevice | null> {
  const adminDb = createAdminClient();
  const { data } = await adminDb
    .from('scanner_devices')
    .select('*')
    .eq('id', deviceId)
    .maybeSingle();
  return data ? mapRow(data) : null;
}

export async function getDeviceByPublicIdentifier(publicId: string): Promise<ScannerDevice | null> {
  const adminDb = createAdminClient();
  const { data } = await adminDb
    .from('scanner_devices')
    .select('*')
    .eq('public_identifier', publicId)
    .maybeSingle();
  return data ? mapRow(data) : null;
}

async function touchLastSeen(id: string): Promise<void> {
  try {
    const adminDb = createAdminClient();
    await adminDb
      .from('scanner_devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', id);
  } catch {
    // Non-critical — don't fail the scan
  }
}

function mapRow(row: Record<string, unknown>): ScannerDevice {
  return {
    id: row.id as string,
    deviceName: row.device_name as string,
    deviceType: row.device_type as string,
    assignedRole: row.assigned_role as ScanMode,
    assignedUser: (row.assigned_user as string) || null,
    status: row.status as string,
    lastSeen: (row.last_seen as string) || null,
    publicIdentifier: row.public_identifier as string,
  };
}
