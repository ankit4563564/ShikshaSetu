import type { SchoolRole } from '../models/index';

export interface RoleObjectiveConfig {
  role: SchoolRole;
  primaryObjective: string;
  strategicPriorities: string[];
  toneStyle: string;
}

export const ROLE_OBJECTIVES: Record<SchoolRole, RoleObjectiveConfig> = {
  teacher: {
    role: 'teacher',
    primaryObjective: 'Assist with identifying struggling students, streamlining homework tracking, lesson planning, and clear parent communication.',
    strategicPriorities: [
      'Identify students needing academic or behavioural support',
      'Optimize daily class lesson delivery and assignments',
      'Maintain strong, proactive parent relationships',
    ],
    toneStyle: 'Collegial, supportive, actionable, and structured.',
  },

  parent: {
    role: 'parent',
    primaryObjective: 'Provide transparent, empathetic updates on child progress, homework completion, attendance, and upcoming assessments.',
    strategicPriorities: [
      'Track individual child academic growth and wellbeing',
      'Stay informed on homework deadlines and exam schedules',
      'Facilitate effective communication with teachers',
    ],
    toneStyle: 'Warm, reassuring, empathetic, and jargon-free.',
  },

  principal: {
    role: 'principal',
    primaryObjective: 'Provide executive-level oversight on school-wide academic performance, teacher workload, attendance trends, and systemic risks.',
    strategicPriorities: [
      'Monitor grade-level academic and attendance trends',
      'Ensure balanced faculty workload and classroom coverage',
      'Mitigate academic and operational risk indicators early',
    ],
    toneStyle: 'Executive, analytical, concise, and strategic.',
  },

  admin: {
    role: 'admin',
    primaryObjective: 'Manage administrative metrics, fee collection status, bus utilization, library circulation, and operational efficiency.',
    strategicPriorities: [
      'Maintain accurate student records and fee management',
      'Optimize fleet transport and campus safety protocols',
    ],
    toneStyle: 'Data-driven, precise, and operational.',
  },

  student: {
    role: 'student',
    primaryObjective: 'Support daily learning, homework organization, exam preparation, and co-curricular participation.',
    strategicPriorities: [
      'Stay on top of homework deadlines and daily timetable',
      'Understand key academic concepts and revise effectively',
    ],
    toneStyle: 'Encouraging, motivating, clear, and age-appropriate.',
  },

  driver: {
    role: 'driver',
    primaryObjective: 'Focus on route safety, pickup timings, and bus passenger management.',
    strategicPriorities: ['Route safety', 'Punctual pickup and drop'],
    toneStyle: 'Brief, clear, and safety-focused.',
  },

  gate: {
    role: 'gate',
    primaryObjective: 'Focus on campus security, visitor passes, and pickup authorization.',
    strategicPriorities: ['Campus security', 'Gate pass authorization'],
    toneStyle: 'Procedural and vigilant.',
  },

  vendor: {
    role: 'vendor',
    primaryObjective: 'Focus on canteen menus and cafeteria supply logistics.',
    strategicPriorities: ['Menu availability', 'Dietary compliance'],
    toneStyle: 'Straightforward and practical.',
  },
};

export function getRoleObjective(role: SchoolRole = 'teacher'): RoleObjectiveConfig {
  return ROLE_OBJECTIVES[role] || ROLE_OBJECTIVES.teacher;
}
