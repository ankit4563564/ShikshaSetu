// Demo constants - centralized IDs for demo student, teacher, parent, etc.
export const DEMO_STUDENT_ID = 'b1000000-0000-4000-8000-000000000001';
export const DEMO_STUDENT_NAME = 'Aarav Sharma';
export const DEMO_TEACHER_ID = 'a1000000-0000-4000-8000-000000000001';
export const DEMO_TEACHER_NAME = 'Ananya Mehra';
export const DEMO_PARENT_ID = 'c1000000-0000-4000-8000-000000000001';
export const DEMO_PARENT_NAME = 'Rohit Sharma';
export const DEMO_VENDOR_ID = 'a2000000-0000-4000-8000-000000000001';
export const DEMO_BUS_ID = 'd1000000-0000-4000-8000-000000000001';
export const DEMO_BUS_IDENTIFIER = 'BUS-001';
export const DEMO_STOP_ID = 'f1000000-0000-4000-8000-000000000001';
export const DEMO_STOP_NAME = 'Green Park';

// Demo step definitions matching the requirements
export interface DemoStepDefinition {
  id: number;
  title: string;
  description: string;
  icon: string;
  portal: 'gate' | 'teacher' | 'parent' | 'driver' | 'student' | 'vendor' | 'admin' | 'all';
  action: () => Promise<any>;
  estimatedDuration: number; // in ms at 1x speed
}

const RAW_DEMO_STEP_DEFINITIONS: DemoStepDefinition[] = [
  {
    id: 1,
    title: 'Student Arrives',
    description: 'Aarav Sharma approaches the school gate and scans their Campus Pass QR code.',
    icon: '🏫',
    portal: 'gate',
    action: async () => {},
    estimatedDuration: 1500,
  },
  {
    id: 2,
    title: 'Gate QR Scan',
    description: 'Gate kiosk validates the QR token and records the entry scan event.',
    icon: '📱',
    portal: 'gate',
    action: async () => {},
    estimatedDuration: 1000,
  },
  {
    id: 3,
    title: 'Attendance Marked',
    description: 'System auto-marks attendance from gate entry. Teacher dashboard updates instantly.',
    icon: '✅',
    portal: 'teacher',
    action: async () => {},
    estimatedDuration: 1200,
  },
  {
    id: 4,
    title: 'Teacher Dashboard Updates',
    description: 'Live roster shows Aarav present. Attendance rate updates in real-time.',
    icon: '📊',
    portal: 'teacher',
    action: async () => {},
    estimatedDuration: 800,
  },
  {
    id: 5,
    title: 'Parent Notified',
    description: 'Push notification sent to parent: "Aarav has arrived at school and is marked present."',
    icon: '📲',
    portal: 'parent',
    action: async () => {},
    estimatedDuration: 600,
  },
  {
    id: 6,
    title: 'Bus Boarding',
    description: 'Afternoon: Aarav boards BUS-001. Driver scans bus pass. Journey tracking starts.',
    icon: '🚌',
    portal: 'driver',
    action: async () => {},
    estimatedDuration: 1500,
  },
  {
    id: 7,
    title: 'Parent: Bus Tracking Active',
    description: 'Parent receives notification with live bus tracking link.',
    icon: '📍',
    portal: 'parent',
    action: async () => {},
    estimatedDuration: 600,
  },
  {
    id: 8,
    title: 'Homework Assigned',
    description: 'Teacher assigns "Chapter 5: Algebraic Expressions" due tomorrow. Appears in student & parent portals.',
    icon: '📚',
    portal: 'teacher',
    action: async () => {},
    estimatedDuration: 800,
  },
  {
    id: 9,
    title: 'Teacher Awards Campus Coins',
    description: 'Teacher awards 25 coins for "Excellent class participation". Balance updates live.',
    icon: '🪙',
    portal: 'teacher',
    action: async () => {},
    estimatedDuration: 1000,
  },
  {
    id: 10,
    title: 'Student Redeems Reward',
    description: 'Aarav redeems 50 coins for "Free Canteen Meal". Redemption record created.',
    icon: '🎫',
    portal: 'student',
    action: async () => {},
    estimatedDuration: 1200,
  },
  {
    id: 11,
    title: 'QR Code Generated',
    description: 'Unique QR token generated for the redemption. Valid for 7 days.',
    icon: '📋',
    portal: 'student',
    action: async () => {},
    estimatedDuration: 800,
  },
  {
    id: 12,
    title: 'Vendor Scans QR',
    description: 'Canteen vendor scans QR. Token validated and marked as redeemed.',
    icon: '🛒',
    portal: 'vendor',
    action: async () => {},
    estimatedDuration: 1000,
  },
  {
    id: 13,
    title: 'Inventory Updates',
    description: 'Rewards catalogue stock decrements. Inventory log records the redemption.',
    icon: '📦',
    portal: 'vendor',
    action: async () => {},
    estimatedDuration: 600,
  },
  {
    id: 14,
    title: 'Analytics Update',
    description: 'All dashboards refresh: attendance rate, coins circulating, rewards redeemed, active students.',
    icon: '📈',
    portal: 'admin',
    action: async () => {},
    estimatedDuration: 800,
  },
  {
    id: 15,
    title: 'Student Deboards',
    description: 'Aarav reaches Green Park stop and deboards. Location & timestamp recorded.',
    icon: '🚶',
    portal: 'driver',
    action: async () => {},
    estimatedDuration: 1200,
  },
  {
    id: 16,
    title: 'Home Safe Confirmed',
    description: 'Aarav confirms home safe via student portal. Parent & teacher notified. Journey complete.',
    icon: '🏠',
    portal: 'student',
    action: async () => {},
    estimatedDuration: 1000,
  },
];

// Keep one gate-entry moment in the runner; the QR validation is part of that action.
export const DEMO_STEP_DEFINITIONS: DemoStepDefinition[] = RAW_DEMO_STEP_DEFINITIONS
  .filter((step) => step.title !== 'Gate QR Scan')
  .map((step, index) => ({ ...step, id: index + 1 }));

// Speed presets
export const DEMO_SPEEDS = [
  { label: '0.5x', value: 0.5, description: 'Slow - detailed viewing' },
  { label: '1x', value: 1, description: 'Normal speed' },
  { label: '2x', value: 2, description: 'Fast - overview' },
  { label: '5x', value: 5, description: 'Rapid - quick demo' },
] as const;

export type DemoSpeed = typeof DEMO_SPEEDS[number]['value'];

// Portal colors for visual indicators
export const PORTAL_COLORS: Record<string, string> = {
  gate: 'deep-teal',
  teacher: 'sage',
  parent: 'primary',
  driver: 'marigold',
  student: 'deep-teal',
  vendor: 'warm-clay',
  admin: 'purple',
  all: 'slate',
};

export function getPortalColor(portal: string): string {
  return PORTAL_COLORS[portal] || 'deep-teal';
}
