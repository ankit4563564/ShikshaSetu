import { createAdminClient } from '@/lib/supabase/admin';

export interface DailyScanMetrics {
  total: number;
  successful: number;
  duplicate: number;
  failed: number;
  revokedCardAttempts: number;
  unauthorizedDevices: number;
}

export interface GateThroughputMetrics {
  scansPerMinute: number;
  peakHourStart: string | null;
  peakHourEnd: string | null;
}

export interface ScannerHealthMetrics {
  deviceId: string;
  deviceName: string;
  totalScans: number;
  lastSeen: string | null;
  status: string;
}

export async function getDailyScanMetrics(date?: string): Promise<DailyScanMetrics> {
  const adminDb = createAdminClient();
  const targetDate = date || new Date().toISOString().split('T')[0];
  const startIso = `${targetDate}T00:00:00Z`;
  const endIso = `${targetDate}T23:59:59Z`;

  const { count: total } = await adminDb
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .gte('scanned_at', startIso)
    .lte('scanned_at', endIso);

  const { count: successful } = await adminDb
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .eq('result', 'success')
    .gte('scanned_at', startIso)
    .lte('scanned_at', endIso);

  const { count: duplicate } = await adminDb
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .in('result', ['duplicate', 'replay_detected'])
    .gte('scanned_at', startIso)
    .lte('scanned_at', endIso);

  const { count: failed } = await adminDb
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .not('result', 'eq', 'success')
    .gte('scanned_at', startIso)
    .lte('scanned_at', endIso);

  const { count: revokedCardAttempts } = await adminDb
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .eq('result', 'revoked_card')
    .gte('scanned_at', startIso)
    .lte('scanned_at', endIso);

  const { count: unauthorizedDevices } = await adminDb
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .eq('result', 'unauthorized_scanner')
    .gte('scanned_at', startIso)
    .lte('scanned_at', endIso);

  return {
    total: total ?? 0,
    successful: successful ?? 0,
    duplicate: duplicate ?? 0,
    failed: failed ?? 0,
    revokedCardAttempts: revokedCardAttempts ?? 0,
    unauthorizedDevices: unauthorizedDevices ?? 0,
  };
}

export async function getGateThroughputMetrics(date?: string): Promise<GateThroughputMetrics> {
  const adminDb = createAdminClient();
  const targetDate = date || new Date().toISOString().split('T')[0];
  const startIso = `${targetDate}T00:00:00Z`;
  const endIso = `${targetDate}T23:59:59Z`;

  const { data: scans } = await adminDb
    .from('scan_events')
    .select('scanned_at')
    .in('mode', ['gate_entry', 'gate_exit'])
    .eq('result', 'success')
    .gte('scanned_at', startIso)
    .lte('scanned_at', endIso);

  const count = scans?.length ?? 0;
  const scansPerMinute = count > 0 ? count / 1440 : 0;

  const hourlyBuckets: Record<string, number> = {};
  for (const row of scans || []) {
    const hour = (row as any).scanned_at?.slice(11, 13) || '00';
    hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
  }

  let peakHour: string | null = null;
  let peakCount = 0;
  for (const [hour, hCount] of Object.entries(hourlyBuckets)) {
    if (hCount > peakCount) {
      peakCount = hCount;
      peakHour = hour;
    }
  }

  const peakHourEnd = peakHour
    ? `${String(Number(peakHour) + 1).padStart(2, '0')}:00`
    : null;

  return {
    scansPerMinute: Math.round(scansPerMinute * 100) / 100,
    peakHourStart: peakHour ? `${peakHour}:00` : null,
    peakHourEnd,
  };
}

export async function getScannerHealthMetrics(): Promise<ScannerHealthMetrics[]> {
  const adminDb = createAdminClient();
  const { data: devices } = await adminDb
    .from('scanner_devices')
    .select('id, device_name, status, last_seen');

  const result: ScannerHealthMetrics[] = [];

  for (const device of devices || []) {
    const d = device as any;
    const { count } = await adminDb
      .from('scan_events')
      .select('*', { count: 'exact', head: true })
      .filter('scanner_identity', 'eq', d.id);

    result.push({
      deviceId: d.id,
      deviceName: d.device_name,
      totalScans: count ?? 0,
      lastSeen: d.last_seen,
      status: d.status,
    });
  }

  return result;
}
