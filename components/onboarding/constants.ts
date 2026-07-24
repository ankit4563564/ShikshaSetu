import type { SchoolRole, SchoolRoleOption, TimelineStep } from './types';

export const OPEN_DURATION_MS = 350;
export const INTRO_DURATION_MS = 2600;
export const TIMELINE_DURATION_MS = 1500;

export const INTRO_LINES: string[] = [
  'Every school has a story.',
  'Thousands of moments unfold every single day.',
  'Parents wait.',
  'Teachers guide.',
  'Drivers protect.',
  'Students learn.',
  'Every moment matters.',
  'Today...',
  "Choose whose story you'd like to experience.",
];

export const SCHOOL_ROLES: SchoolRoleOption[] = [
  {
    id: 'parent',
    emoji: '📱',
    title: 'Parent Mobile App',
    description: "Rich mobile experience for real-time bus tracking, gate proximity alerts, milestone tracking, and direct teacher messaging.",
    portalLabel: 'Parent Mobile App',
    isHero: true,
    badge: '⭐ HERO PORTAL',
  },
  {
    id: 'teacher',
    emoji: '💻',
    title: 'Teacher Web Dashboard',
    description: 'Comprehensive executive dashboard enabling teachers to monitor holistic classroom health, attendance, and support radar at a glance.',
    portalLabel: 'Teacher Web Dashboard',
    isHero: true,
    badge: '⭐ HERO PORTAL',
  },
  {
    id: 'admin',
    emoji: '🏫',
    title: 'School Administration',
    description: 'Care Analytics™, school climate metrics, and operational control feeding executive insights.',
    portalLabel: 'Mission Control',
    badge: 'ADMIN',
  },
  {
    id: 'student',
    emoji: '🎒',
    title: 'Student Companion',
    description: 'Student Growth Journal, School Mitra Socratic AI, and confidential counselor check-in interface.',
    portalLabel: 'Student Companion',
    badge: 'STUDENT',
  },
  {
    id: 'driver',
    emoji: '🚌',
    title: 'Transport Operations',
    description: 'GPS telemetry & conductor hands-free boarding console broadcasting vehicle position.',
    portalLabel: 'Driver Portal',
    badge: 'TRANSPORT',
  },
  {
    id: 'gate',
    emoji: '🛡️',
    title: 'Gate Security Engine',
    description: 'Dynamic QR scanner & gate pass verification engine feeding arrival events directly into Teacher & Parent timelines.',
    portalLabel: 'Gate Security',
    badge: 'GATE SECURITY',
  },
];

export const ECOSYSTEM_CHIPS = [
  '🚌 Live Bus Tracking',
  '📍 Real-Time Journey',
  '🛡 Gate Verification',
  '📚 Attendance Sync',
  '🔔 Parent Notifications',
  '💬 Teacher Communication',
] as const;

export const JOURNEY_TIMELINE: TimelineStep[] = [
  { id: 'school', emoji: '🏫', label: 'School' },
  { id: 'bus', emoji: '🚌', label: 'Bus' },
  { id: 'gate', emoji: '🛡', label: 'Gate' },
  { id: 'classroom', emoji: '📚', label: 'Classroom' },
  { id: 'teacher', emoji: '👩‍🏫', label: 'Teacher' },
  { id: 'parent', emoji: '👨‍👩‍👧', label: 'Parent' },
  { id: 'connected', emoji: '✅', label: 'Connected' },
];

export const DEMO_STORAGE_KEY = 'shikshasetu-demo-active';
export const DEV_ROLE_STORAGE_KEY = 'edusync-dev-role';

export const ROLE_ROUTES: Record<SchoolRole, string> = {
  parent: '/parent',
  teacher: '/teacher',
  student: '/student',
  admin: '/admin',
  vendor: '/vendor',
  gate: '/gate',
  driver: '/driver',
};
