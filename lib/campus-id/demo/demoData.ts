import type { ScanMode, ScannerPortal } from '../types';

export const DEMO_STUDENT_IDS = [
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000003',
  'b1000000-0000-4000-8000-000000000005',
  'b1000000-0000-4000-8000-000000000007',
  'b1000000-0000-4000-8000-000000000010',
  'b1000000-0000-4000-8000-000000000012',
  'b1000000-0000-4000-8000-000000000014',
];

export const DEMO_SCAN_MODES: { mode: ScanMode; portal: ScannerPortal; label: string }[] = [
  { mode: 'transport_board', portal: 'driver', label: 'Transport Boarding' },
  { mode: 'transport_deboard', portal: 'driver', label: 'Transport Deboarding' },
  { mode: 'gate_entry', portal: 'gate', label: 'Gate Entry' },
  { mode: 'gate_exit', portal: 'gate', label: 'Gate Exit' },
  { mode: 'attendance', portal: 'teacher', label: 'Attendance' },
];

export function generateDemoQrContent(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface DemoScanSequence {
  studentIds: string[];
  mode: ScanMode;
  portal: ScannerPortal;
  intervalMs: number;
  count: number;
}
