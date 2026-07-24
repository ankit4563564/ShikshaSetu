'use server';

import { simulateBoardings, replayJourney, simulateDelays } from '@/lib/campus-id/demo/demoSimulator';
import { DEMO_SCAN_MODES, DEMO_STUDENT_IDS, type DemoScanSequence } from '@/lib/campus-id/demo/demoData';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

function guardDemoMode(): void {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    throw new Error('Demo mode is not enabled. Set NEXT_PUBLIC_DEMO_MODE=true to use this feature.');
  }
}

export async function simulateDemoBoardings(count: number = 5): Promise<string[]> {
  await requireRole(['admin']);
  guardDemoMode();
  const sequence: DemoScanSequence = {
    studentIds: DEMO_STUDENT_IDS,
    mode: 'transport_board',
    portal: 'driver',
    intervalMs: 500,
    count,
  };
  return simulateBoardings(sequence);
}

export async function simulateDemoGateEntries(count: number = 5): Promise<string[]> {
  await requireRole(['admin']);
  guardDemoMode();
  const sequence: DemoScanSequence = {
    studentIds: DEMO_STUDENT_IDS,
    mode: 'gate_entry',
    portal: 'gate',
    intervalMs: 300,
    count,
  };
  return simulateBoardings(sequence);
}

export async function simulateDemoDelays(ms: number = 2000): Promise<void> {
  await requireRole(['admin']);
  guardDemoMode();
  await simulateDelays(ms);
}

export async function demoReplayJourney(studentId: string): Promise<void> {
  await requireRole(['admin']);
  guardDemoMode();
  await replayJourney(studentId);
}
