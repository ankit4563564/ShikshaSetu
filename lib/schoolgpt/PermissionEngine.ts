import type { SchoolGPTRole } from './types';

export interface RolePermissions {
  allowedDomains: string[];
  blockedFields: string[];
  maxScope: 'own' | 'class' | 'school' | 'route' | 'gate';
  allowRiskScores: boolean;
  allowFinancials: boolean;
  allowInternalNotes: boolean;
}

export const ROLE_PERMISSION_MATRIX: Record<SchoolGPTRole, RolePermissions> = {
  parent: {
    allowedDomains: ['homework', 'attendance', 'bus', 'teacher_messages', 'school_notices'],
    blockedFields: ['risk_score', 'internal_teacher_notes', 'other_students', 'fee_ledgers_other', 'class_ranking'],
    maxScope: 'own',
    allowRiskScores: false,
    allowFinancials: false,
    allowInternalNotes: false,
  },
  teacher: {
    allowedDomains: ['class_roster', 'attendance', 'homework', 'academic_radar', 'parent_messages', 'lesson_plans', 'student_mood'],
    blockedFields: ['school_financial_ledger', 'salary_records', 'other_unassigned_classes'],
    maxScope: 'class',
    allowRiskScores: true,
    allowFinancials: false,
    allowInternalNotes: true,
  },
  student: {
    allowedDomains: ['own_grades', 'own_homework', 'quizzes', 'chapter_explanations', 'school_calendar'],
    blockedFields: ['teacher_notes', 'risk_score', 'other_students', 'class_ranking'],
    maxScope: 'own',
    allowRiskScores: false,
    allowFinancials: false,
    allowInternalNotes: false,
  },
  admin: {
    allowedDomains: ['all_campus_telemetry', 'bus_fleet', 'gate_scans', 'staff_attendance', 'fee_collections', 'school_analytics'],
    blockedFields: ['private_salary_details'],
    maxScope: 'school',
    allowRiskScores: true,
    allowFinancials: true,
    allowInternalNotes: true,
  },
  driver: {
    allowedDomains: ['assigned_route', 'passenger_manifest', 'stop_etas', 'emergency_contacts'],
    blockedFields: ['academic_grades', 'homework', 'teacher_notes', 'fee_status', 'risk_score'],
    maxScope: 'route',
    allowRiskScores: false,
    allowFinancials: false,
    allowInternalNotes: false,
  },
  gate: {
    allowedDomains: ['gate_passes', 'visitor_logs', 'student_pickup_approvals', 'entry_exit_scans'],
    blockedFields: ['academic_grades', 'homework', 'teacher_notes', 'fee_status', 'risk_score'],
    maxScope: 'gate',
    allowRiskScores: false,
    allowFinancials: false,
    allowInternalNotes: false,
  },
  vendor: {
    allowedDomains: ['inventory_orders', 'cafeteria_menu', 'campus_delivery_passes'],
    blockedFields: ['student_records', 'teacher_notes', 'academic_grades', 'risk_score'],
    maxScope: 'own',
    allowRiskScores: false,
    allowFinancials: false,
    allowInternalNotes: false,
  },
};

export class PermissionEngine {
  static getPermissions(role: SchoolGPTRole): RolePermissions {
    return ROLE_PERMISSION_MATRIX[role] || ROLE_PERMISSION_MATRIX.student;
  }

  static isFieldAllowed(field: string, role: SchoolGPTRole): boolean {
    const perms = this.getPermissions(role);
    return !perms.blockedFields.some(b => field.toLowerCase().includes(b));
  }

  static filterDataForRole(data: Record<string, any>, role: SchoolGPTRole): Record<string, any> {
    const perms = this.getPermissions(role);
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (perms.blockedFields.some(b => key.toLowerCase().includes(b))) {
        continue;
      }
      sanitized[key] = value;
    }

    return sanitized;
  }
}
