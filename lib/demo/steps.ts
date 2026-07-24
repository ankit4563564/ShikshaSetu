export interface DemoStep {
  id: number;
  title: string;
  description: string;
  completedActions: string[];
  action?: 'board' | 'gate_entry' | 'gate_exit' | 'attendance' | 'debark' | 'home_safe' | 'reset';
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Student arrives at campus',
    description: 'Aarav Sharma approaches the school gate and scans their Campus Pass.',
    completedActions: ['Student identified', 'Gate pass verified'],
    action: 'gate_entry',
  },
  {
    id: 2,
    title: 'Attendance recorded',
    description: 'Teacher marks Aarav present for the day.',
    completedActions: ['Attendance logged', 'Parent notified'],
    action: 'attendance',
  },
  {
    id: 3,
    title: 'Student boards the bus',
    description: 'Aarav boards the school bus for the afternoon route.',
    completedActions: ['Boarding scan complete', 'Seat assigned'],
    action: 'board',
  },
  {
    id: 4,
    title: 'Bus en route to destination',
    description: 'The bus departs with all students accounted for.',
    completedActions: ['Route started', 'GPS tracking active', 'Parent can track bus'],
    action: 'debark',
  },
  {
    id: 5,
    title: 'Student deboards safely',
    description: 'Aarav reaches their stop and deboards the bus.',
    completedActions: ['Deboarding confirmed', 'Stop location recorded'],
    action: 'debark',
  },
  {
    id: 6,
    title: 'Home safe confirmed',
    description: 'Aarav confirms they are home safe via the student portal.',
    completedActions: ['Home safe timestamped', 'Parent notified', 'Journey complete'],
    action: 'home_safe',
  },
];

export const DEMO_STUDENT_NAME = 'Aarav Sharma';
export const DEMO_STUDENT_ID = 'b1000000-0000-4000-8000-000000000001';
