import type { Intent, SchoolRole } from '../models/index';

// ─────────────────────────────────────────────
// Skills Engine
// Defines what SchoolGPT can do, what it can suggest,
// and how to proactively offer actionable next steps
// ─────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  description: string;
  triggerIntents: Intent[];
  availableForRoles: SchoolRole[];
  isConnected: boolean;
  exampleQueries: string[];
}

export const SCHOOL_SKILLS: Skill[] = [
  {
    id: 'sk-attendance',
    name: 'Attendance Tracker',
    description: 'Track, analyze, and report on student attendance records, trends, and patterns.',
    triggerIntents: ['attendance', 'who_needs_attention'],
    availableForRoles: ['teacher', 'admin', 'principal', 'parent', 'student'],
    isConnected: true,
    exampleQueries: [
      'What is my attendance this month?',
      'Which students have low attendance?',
      'Show Class 8A attendance trends',
    ],
  },
  {
    id: 'sk-homework',
    name: 'Homework Manager',
    description: 'View, track, and manage homework assignments and submission status.',
    triggerIntents: ['homework'],
    availableForRoles: ['teacher', 'admin', 'parent', 'student'],
    isConnected: true,
    exampleQueries: [
      'Who missed the Maths homework?',
      'What homework is due this week?',
      'Show pending submissions for Grade 8',
    ],
  },
  {
    id: 'sk-timetable',
    name: 'Academic Scheduler',
    description: 'Access class timetables, period allocations, and room assignments.',
    triggerIntents: ['timetable'],
    availableForRoles: ['teacher', 'admin', 'principal', 'student', 'parent'],
    isConnected: true,
    exampleQueries: [
      "What's tomorrow's timetable for 8A?",
      'When is my next free period?',
      'Show the weekly schedule for Grade 9B',
    ],
  },
  {
    id: 'sk-exams',
    name: 'Examination Controller',
    description: 'View exam schedules, results, marks, grade analysis, and academic performance.',
    triggerIntents: ['exams', 'marks', 'student_performance'],
    availableForRoles: ['teacher', 'admin', 'principal', 'student', 'parent'],
    isConnected: true,
    exampleQueries: [
      "When is tomorrow's exam?",
      "Show Aarav's marks in Unit Test 1",
      'Who is the class topper in Maths?',
    ],
  },
  {
    id: 'sk-behaviour',
    name: 'Behaviour & Conduct Tracker',
    description: 'Monitor student behaviour records, praise notes, discipline incidents, and teacher observations.',
    triggerIntents: ['behaviour', 'who_needs_attention'],
    availableForRoles: ['teacher', 'admin', 'principal'],
    isConnected: true,
    exampleQueries: [
      'Show behaviour notes for Rohan Gupta',
      'Which students have discipline warnings?',
      'Log a praise note for Aarav Singh',
    ],
  },
  {
    id: 'sk-transport',
    name: 'Fleet & Transport Operations',
    description: 'Access bus route details, student assignments, driver contacts, and stop timings.',
    triggerIntents: ['bus'],
    availableForRoles: ['teacher', 'admin', 'principal', 'parent', 'student', 'driver'],
    isConnected: true,
    exampleQueries: [
      'How many students use Bus 3?',
      "What is Bus 1's morning route?",
      "Who is Bus 3's driver?",
    ],
  },
  {
    id: 'sk-library',
    name: 'Central Library System',
    description: 'Check library books, borrowing records, overdue fines, and availability.',
    triggerIntents: ['library'],
    availableForRoles: ['teacher', 'admin', 'student', 'parent'],
    isConnected: true,
    exampleQueries: [
      'Who has library dues?',
      'What books has Aarav borrowed?',
      'Is Harry Potter available in the library?',
    ],
  },
  {
    id: 'sk-canteen',
    name: 'Canteen & Dietary Services',
    description: "View daily canteen menus, chef's specials, and meal schedules.",
    triggerIntents: ['canteen'],
    availableForRoles: ['teacher', 'admin', 'student', 'parent', 'vendor'],
    isConnected: true,
    exampleQueries: [
      "What's today's canteen menu?",
      'Is there a vegetarian option for lunch?',
      "What's the chef's special today?",
    ],
  },
  {
    id: 'sk-events',
    name: 'School Calendar & Events',
    description: 'View upcoming events, holidays, annual day, sports day, science fairs, and PTM schedules.',
    triggerIntents: ['events', 'sports', 'ptm'],
    availableForRoles: ['teacher', 'admin', 'principal', 'student', 'parent'],
    isConnected: true,
    exampleQueries: [
      'When is Sports Day?',
      'Show upcoming school events',
      'When is the next PTM?',
    ],
  },
  {
    id: 'sk-policies',
    name: 'School Governance & Policies',
    description: 'Access school rules, uniform codes, discipline policies, visitor guidelines, and fee structures.',
    triggerIntents: ['rules', 'fees'],
    availableForRoles: ['teacher', 'admin', 'principal', 'student', 'parent', 'gate', 'vendor'],
    isConnected: true,
    exampleQueries: [
      'What is the uniform policy?',
      'Explain the discipline rules',
      'What are the fee payment deadlines?',
    ],
  },
  {
    id: 'sk-faculty',
    name: 'Faculty Directory',
    description: 'Look up teacher profiles, class assignments, contact details, and workload information.',
    triggerIntents: ['faculty', 'teacher_workload'],
    availableForRoles: ['teacher', 'admin', 'principal', 'student', 'parent'],
    isConnected: true,
    exampleQueries: [
      'Who teaches Class 8A?',
      'Show teacher workload for Ananya Sharma',
      'Who is the Science department head?',
    ],
  },
  {
    id: 'sk-clubs',
    name: 'Co-Curricular Activities',
    description: 'View club information, meeting schedules, membership, and activity details.',
    triggerIntents: ['clubs'],
    availableForRoles: ['teacher', 'admin', 'student', 'parent'],
    isConnected: true,
    exampleQueries: [
      'What clubs are available?',
      'When does Robotics Club meet?',
      'Who runs the Chess Club?',
    ],
  },
  {
    id: 'sk-health',
    name: 'Health & Infirmary',
    description: 'View health records, medical notes, allergy information, and infirmary visit logs.',
    triggerIntents: ['health'],
    availableForRoles: ['teacher', 'admin', 'principal', 'parent'],
    isConnected: true,
    exampleQueries: [
      'Does Aarav have any medical conditions?',
      "Who visited the nurse's office today?",
      'Show allergy list for Class 8A',
    ],
  },
  {
    id: 'sk-educator',
    name: 'AI Teaching Assistant',
    description: 'Explain academic concepts, help with lesson planning, provide career guidance, and motivational support.',
    triggerIntents: ['general_education', 'subject_explanation', 'motivation', 'career_guidance'],
    availableForRoles: ['teacher', 'admin', 'principal', 'student', 'parent'],
    isConnected: true,
    exampleQueries: [
      "Explain Newton's Laws of Motion",
      "What is Bloom's Taxonomy?",
      'Help me plan a lesson on fractions',
      'How do I motivate weak students?',
    ],
  },
  {
    id: 'sk-communication',
    name: 'Parent Communication Gateway',
    description: 'Track parent responses, PTM confirmations, notice acknowledgements, and draft messages.',
    triggerIntents: ['ptm', 'announcements'],
    availableForRoles: ['teacher', 'admin', 'principal'],
    isConnected: true,
    exampleQueries: [
      "Which parents haven't replied to the PTM?",
      'Draft a message for absent students\' parents',
      'Show recent notices',
    ],
  },
  {
    id: 'sk-gps-live',
    name: 'Live GPS Bus Tracking',
    description: 'Real-time satellite GPS tracking of school buses.',
    triggerIntents: ['bus'],
    availableForRoles: ['admin', 'parent', 'driver'],
    isConnected: false,
    exampleQueries: [
      'Where is Bus 3 right now?',
      'Show live location of all buses',
    ],
  },
  {
    id: 'sk-payment-gateway',
    name: 'Live Fee Payment Gateway',
    description: 'Real-time bank transaction processing and payment verification.',
    triggerIntents: ['fees'],
    availableForRoles: ['admin', 'parent'],
    isConnected: false,
    exampleQueries: [
      'Process fee payment online',
      'Show latest bank transaction',
    ],
  },
];

/**
 * Returns the best matching skill for an intent and role.
 */
export function getSkillForIntent(intent: Intent, role: SchoolRole): Skill | null {
  return SCHOOL_SKILLS.find(
    s => s.triggerIntents.includes(intent) && s.availableForRoles.includes(role) && s.isConnected
  ) || null;
}

/**
 * Returns all available skills for a given role.
 */
export function getAvailableSkills(role: SchoolRole): Skill[] {
  return SCHOOL_SKILLS.filter(s => s.availableForRoles.includes(role) && s.isConnected);
}

/**
 * Returns a formatted capabilities overview for "what can you do?" queries.
 */
export function getCapabilitiesOverview(role: SchoolRole): string {
  const available = getAvailableSkills(role);
  const lines = available.map(s => `• ${s.name}: ${s.description}`);

  return `Here's what I can help you with:\n\n${lines.join('\n')}\n\nJust ask me a question in natural language — I'll figure out the rest!`;
}

/**
 * Returns proactive follow-up suggestions based on skill context.
 */
export function getProactiveSuggestions(intent: Intent, role: SchoolRole): string[] {
  const skill = getSkillForIntent(intent, role);
  if (!skill) return [];
  return skill.exampleQueries.slice(0, 3);
}
