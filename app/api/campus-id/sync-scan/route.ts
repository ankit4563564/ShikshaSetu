import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/routeGuard';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['teacher', 'admin', 'driver']);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { qrContent, mode, portal, deviceMetadata, originalTimestamp } = body;

    if (!qrContent || !mode || !portal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Dedup: check if a scan with the same mode and close timestamp already exists
    const supabase = createClient();
    const scanTime = originalTimestamp || new Date().toISOString();
    const windowStart = new Date(new Date(scanTime).getTime() - 5000).toISOString();
    const windowEnd = new Date(new Date(scanTime).getTime() + 5000).toISOString();

    const { data: existing } = await supabase
      .from('scan_events')
      .select('id')
      .eq('mode', mode)
      .gte('scanned_at', windowStart)
      .lte('scanned_at', windowEnd)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ status: 'duplicate', message: 'Scan already recorded' });
    }

    // Insert the scan event in 'pending' state for later processing
    const { error } = await supabase
      .from('scan_events')
      .insert({
        mode,
        result: 'success',
        scanner_portal: portal,
        scanner_identity: 'offline-sync',
        device_metadata: { ...deviceMetadata, syncedFromOffline: true },
        error_detail: 'Offline queued scan — processed on sync',
        scanned_at: scanTime,
      });

    if (error) {
      console.error('[SyncScan] Failed to insert:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'recorded' });
  } catch (err) {
    console.error('[SyncScan] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
