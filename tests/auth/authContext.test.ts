import { describe, it, expect, vi } from 'vitest';
import {
  getAuthContext,
  hasPermission,
  requirePermission,
  validateParentStudentAccess,
  ROLE_PERMISSIONS,
  AuthContext,
} from '@/lib/auth/getAuthContext';

describe('Phase B Authorization Context Suite', () => {
  it('assigns correct fine-grained permissions for teacher role', () => {
    const context: AuthContext = {
      userId: 'user-teacher-01',
      clerkUserId: 'clerk-teacher-01',
      schoolId: 'e0000000-0000-4000-8000-000000000001',
      role: 'teacher',
      permissions: ROLE_PERMISSIONS['teacher'],
    };

    expect(hasPermission(context, 'marks:write')).toBe(true);
    expect(hasPermission(context, 'interventions:approve')).toBe(true);
    expect(hasPermission(context, 'school:manage')).toBe(false);
    expect(() => requirePermission(context, 'marks:write')).not.toThrow();
    expect(() => requirePermission(context, 'school:manage')).toThrow(/FORBIDDEN/);
  });

  it('assigns correct fine-grained permissions for parent role', () => {
    const context: AuthContext = {
      userId: 'user-parent-01',
      clerkUserId: 'clerk-parent-01',
      schoolId: 'e0000000-0000-4000-8000-000000000001',
      role: 'parent',
      permissions: ROLE_PERMISSIONS['parent'],
      linkedStudentIds: ['stu-001', 'stu-002'],
    };

    expect(hasPermission(context, 'gate_pass:request')).toBe(true);
    expect(hasPermission(context, 'marks:write')).toBe(false);
    expect(() => requirePermission(context, 'gate_pass:request')).not.toThrow();
    expect(() => requirePermission(context, 'marks:write')).toThrow(/FORBIDDEN/);
  });

  it('validates parent-student context ownership correctly', () => {
    const parentContext: AuthContext = {
      userId: 'user-parent-01',
      clerkUserId: 'clerk-parent-01',
      schoolId: 'e0000000-0000-4000-8000-000000000001',
      role: 'parent',
      permissions: ROLE_PERMISSIONS['parent'],
      linkedStudentIds: ['stu-001'],
    };

    // Valid child context
    expect(() => validateParentStudentAccess(parentContext, 'stu-001')).not.toThrow();

    // Unauthorized student context
    expect(() => validateParentStudentAccess(parentContext, 'stu-unauthorized-99')).toThrow(/FORBIDDEN/);
  });
});
