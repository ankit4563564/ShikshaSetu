import { createAdminClient } from '@/lib/supabase/admin';
import type { DemoScanSequence } from './demoData';

export async function simulateBoardings(sequence: DemoScanSequence): Promise<string[]> {
  const adminDb = createAdminClient();
  const eventIds: string[] = [];

  for (let i = 0; i < sequence.count; i++) {
    const studentId = sequence.studentIds[i % sequence.studentIds.length];
    const scannedAt = new Date(Date.now() + i * sequence.intervalMs).toISOString();

    const { data } = await adminDb
      .from('scan_events')
      .insert({
        student_id: studentId,
        mode: sequence.mode,
        result: 'success',
        scanner_portal: sequence.portal,
        scanner_identity: 'demo-simulator',
        device_metadata: { simulated: true, sequenceIndex: i },
        scanned_at: scannedAt,
      })
      .select('id')
      .single();

    if (data) eventIds.push(data.id);
  }

  return eventIds;
}

export async function replayJourney(studentId: string): Promise<void> {
  const adminDb = createAdminClient();
  const { data: scans } = await adminDb
    .from('scan_events')
    .select('*')
    .eq('student_id', studentId)
    .order('scanned_at', { ascending: true });

  if (!scans || scans.length === 0) return;

  // Replay each scan event with a delay matching original intervals
  for (let i = 0; i < scans.length; i++) {
    const scan = scans[i] as any;
    const nextScan = scans[i + 1] as any;
    const delay = nextScan
      ? new Date(nextScan.scanned_at).getTime() - new Date(scan.scanned_at).getTime()
      : 1000;

    await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 5000)));

    await adminDb.from('scan_events').insert({
      student_id: scan.student_id,
      card_id: scan.card_id,
      mode: scan.mode,
      result: 'success',
      scanner_portal: scan.scanner_portal,
      scanner_identity: 'demo-replay',
      device_metadata: { ...scan.device_metadata, replayed: true, originalEventId: scan.id },
      scanned_at: new Date().toISOString(),
    });
  }
}

export async function simulateDelays(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
