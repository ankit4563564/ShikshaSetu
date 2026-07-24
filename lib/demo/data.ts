export interface RoleConfig {
  id: string;
  title: string;
  emoji: string;
  accent: string;
  bgAccent: string;
  description: string;
  features: string[];
}

export const DEMO_ROLES: Record<string, RoleConfig> = {
  parent: {
    id: 'parent',
    title: 'Parent Portal',
    emoji: '👨‍👩‍👧',
    accent: 'text-[#6b9080]',
    bgAccent: 'bg-[#6b9080]/10 border-[#6b9080]/20',
    description: "Your child's school day in one place. Track the bus, confirm gate entry, see homework, and message teachers.",
    features: ['Live Bus Tracking', 'Gate Pass Status', 'Homework Sync', 'Teacher Messages'],
  },
  teacher: {
    id: 'teacher',
    title: 'Teacher Portal',
    emoji: '👩‍🏫',
    accent: 'text-[#e8a33d]',
    bgAccent: 'bg-[#e8a33d]/10 border-[#e8a33d]/20',
    description: 'See who needs attention, take attendance, and message parents — without juggling five tools.',
    features: ['Class Attendance', 'Attention Queue', 'SchoolGPT', 'Parent Messaging'],
  },
  student: {
    id: 'student',
    title: 'Student Portal',
    emoji: '🎓',
    accent: 'text-[#1f4e5f]',
    bgAccent: 'bg-[#1f4e5f]/10 border-[#1f4e5f]/20',
    description: 'Homework, campus coins, and a private Worry Jar — built for the school day, not another feed.',
    features: ['Homework Board', 'Campus Coins', 'Rewards QR', 'Worry Jar'],
  },
  admin: {
    id: 'admin',
    title: 'Mission Control',
    emoji: '🏫',
    accent: 'text-[#c06c5c]',
    bgAccent: 'bg-[#c06c5c]/10 border-[#c06c5c]/20',
    description: 'Live campus operations: buses, gate scans, and safety signals in one view.',
    features: ['Live Operations', 'Bus Fleet', 'Gate Scans', 'Safety Controls'],
  },
  driver: {
    id: 'driver',
    title: 'Driver Portal',
    emoji: '🚌',
    accent: 'text-[#1f4e5f]',
    bgAccent: 'bg-[#1f4e5f]/10 border-[#1f4e5f]/20',
    description: 'Board and deboard students, broadcast GPS to parents, and flag missed stops in one checklist.',
    features: ['Boarding Checklist', 'GPS Broadcast', 'Safety Alerts', 'Trip Complete'],
  },
  gate: {
    id: 'gate',
    title: 'Gate Security',
    emoji: '🛡️',
    accent: 'text-[#c06c5c]',
    bgAccent: 'bg-[#c06c5c]/10 border-[#c06c5c]/20',
    description: 'Scan student QR codes, confirm identity with a photo reference, and log every entry and exit.',
    features: ['QR Scanner', 'Photo Reference', 'Entry Logs', 'Gate Pass Check'],
  },
  vendor: {
    id: 'vendor',
    title: 'Vendor Portal',
    emoji: '📦',
    accent: 'text-[#e8a33d]',
    bgAccent: 'bg-[#e8a33d]/10 border-[#e8a33d]/20',
    description: 'Scan campus-coin redemptions, clear pending orders, and keep a simple fulfillment history.',
    features: ['Scan Redeem QR', 'Pending Orders', 'Fulfillment History', 'Daily Totals'],
  },
};

export const LOADING_STEPS = [
  'Preparing portal…',
  'Connecting school services…',
  'Setting up your demo…',
];
