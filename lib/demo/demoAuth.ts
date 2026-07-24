import { clerkClient } from '@clerk/nextjs/server';

export interface DemoProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  password: string;
  emoji: string;
  color: string;
  features: string[];
  tourTime: string;
}

const DEMO_PROFILES: Record<string, DemoProfile> = {
  teacher: {
    id: 'teacher',
    name: 'Ananya Mehra',
    role: 'Class 8A Teacher',
    emoji: '🍎',
    color: 'marigold',
    email: 'teacher@shikshasetu.com',
    password: 'ShikshaSetu2026!',
    features: ['Attendance', 'Attention Queue', 'SchoolGPT', 'Parent Messages'],
    tourTime: '2 minutes',
  },
  parent: {
    id: 'parent',
    name: 'Sunita Sharma',
    role: "Aarav's Parent",
    emoji: '👨‍👩‍👧',
    color: 'sage',
    email: 'parent@shikshasetu.com',
    password: 'ShikshaSetu2026!',
    features: ['Bus Tracking', 'Attendance', 'Homework', 'Wellness', 'Notifications'],
    tourTime: '90 seconds',
  },
  student: {
    id: 'student',
    name: 'Aarav Sharma',
    role: 'Class 8A Student',
    emoji: '🫙',
    color: 'deep-teal',
    email: 'student@shikshasetu.com',
    password: 'ShikshaSetu2026!',
    features: ['Homework', 'Campus Coins', 'Rewards QR', 'Worry Jar'],
    tourTime: '1 minute',
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    role: 'School Administrator',
    emoji: '⚙️',
    color: 'warm-clay',
    email: 'admin@shikshasetu.com',
    password: 'ShikshaSetu2026!',
    features: ['User Management', 'Analytics', 'System Settings'],
    tourTime: '2 minutes',
  },
  driver: {
    id: 'driver',
    name: 'Driver Demo',
    role: 'Bus Driver',
    emoji: '🚌',
    color: 'deep-teal',
    email: 'driver@shikshasetu.com',
    password: 'ShikshaSetu2026!',
    features: ['GPS Broadcast', 'Boarding Logs', 'Trip Complete'],
    tourTime: '1 minute',
  },
  gate: {
    id: 'gate',
    name: 'Gate Security',
    role: 'Gate Scanner',
    emoji: '🛡️',
    color: 'warm-clay',
    email: 'gate@shikshasetu.com',
    password: 'ShikshaSetu2026!',
    features: ['QR Scanning', 'Photo Reference', 'Gate Pass', 'Entry Logs'],
    tourTime: '45 seconds',
  },
  vendor: {
    id: 'vendor',
    name: 'Vendor Demo',
    role: 'School Vendor',
    emoji: '📦',
    color: 'marigold',
    email: 'vendor@shikshasetu.com',
    password: 'ShikshaSetu2026!',
    features: ['QR Scan', 'Pending Orders', 'Fulfillment History'],
    tourTime: '1 minute',
  },
};

export const getDemoProfile = (role: string): DemoProfile | null => {
  return DEMO_PROFILES[role] || null;
};

export const getDemoProfiles = (): DemoProfile[] => {
  return Object.values(DEMO_PROFILES);
};

export const isDemoRole = (role: string): boolean => {
  return role in DEMO_PROFILES;
};

export const getDemoCredentials = (role: string) => {
  const profile = DEMO_PROFILES[role];
  return profile ? { email: profile.email, password: profile.password } : null;
};
