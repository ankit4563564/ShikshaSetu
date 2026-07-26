import { AttendanceRecord } from './types';

export const ATTENDANCE_DATA: AttendanceRecord[] = [
  { studentId: 'std-001', date: '2026-07-26', status: 'PRESENT', gateScanTime: '08:05 AM', busBoardTime: '07:35 AM' },
  { studentId: 'std-002', date: '2026-07-26', status: 'PRESENT', gateScanTime: '08:12 AM', busBoardTime: '07:42 AM' },
  { studentId: 'std-003', date: '2026-07-26', status: 'PRESENT', gateScanTime: '08:08 AM', busBoardTime: '07:38 AM' },
  { studentId: 'std-004', date: '2026-07-26', status: 'PRESENT', gateScanTime: '08:02 AM', busBoardTime: '07:30 AM' },
  { studentId: 'std-005', date: '2026-07-26', status: 'LATE', gateScanTime: '08:24 AM', busBoardTime: '07:55 AM' },
];
