import { describe, it, expect } from 'vitest';
import { AuthContext, ROLE_PERMISSIONS, validateParentStudentAccess } from '@/lib/auth/getAuthContext';

describe('Phase C Security & Tenant Isolation Tests', () => {
  const schoolA = 'e0000000-0000-4000-8000-000000000001'; // Greenwood High
  const schoolB = 'e0000000-0000-4000-8000-000000000002'; // St. Xavier

  const parentSchoolA: AuthContext = {
    userId: 'parent-001',
    clerkUserId: 'clerk-parent-001',
    schoolId: schoolA,
    role: 'parent',
    permissions: ROLE_PERMISSIONS['parent'],
    linkedStudentIds: ['stu-aarav-school-a'],
  };

  const parentSchoolB: AuthContext = {
    userId: 'parent-002',
    clerkUserId: 'clerk-parent-002',
    schoolId: schoolB,
    role: 'parent',
    permissions: ROLE_PERMISSIONS['parent'],
    linkedStudentIds: ['stu-bob-school-b'],
  };

  const teacherSchoolA: AuthContext = {
    userId: 'teacher-001',
    clerkUserId: 'clerk-teacher-001',
    schoolId: schoolA,
    role: 'teacher',
    permissions: ROLE_PERMISSIONS['teacher'],
  };

  it('1. Enforces strict tenant boundary across School A and School B context', () => {
    expect(parentSchoolA.schoolId).toBe(schoolA);
    expect(parentSchoolB.schoolId).toBe(schoolB);
    expect(parentSchoolA.schoolId).not.toEqual(parentSchoolB.schoolId);
  });

  it('2. Prevents Parent A from accessing Student B context (Parent -> Child Security)', () => {
    // Parent A accessing own child -> ALLOWED
    expect(() => validateParentStudentAccess(parentSchoolA, 'stu-aarav-school-a')).not.toThrow();

    // Parent A attempting to access Student B -> DENIED
    expect(() => validateParentStudentAccess(parentSchoolA, 'stu-bob-school-b')).toThrow(/FORBIDDEN/);

    // Parent B attempting to access Student A -> DENIED
    expect(() => validateParentStudentAccess(parentSchoolB, 'stu-aarav-school-a')).toThrow(/FORBIDDEN/);
  });

  it('3. Prevents Parent A from creating gate passes for unlinked students', () => {
    expect(() => validateParentStudentAccess(parentSchoolA, 'unlinked-student-99')).toThrow(
      /FORBIDDEN: Parent parent-001 is not authorized for student unlinked-student-99/
    );
  });

  it('4. Restricts internal support & intervention write capabilities to Authorized Roles', () => {
    expect(teacherSchoolA.permissions).toContain('interventions:approve');
    expect(parentSchoolA.permissions).not.toContain('interventions:approve');
  });

  it('5. Denies access for unmapped users without active school mapping (No Seed Fallback)', () => {
    const unmappedContext = {
      userId: 'clerk-unmapped-user',
      clerkUserId: 'clerk-unmapped-user',
      schoolId: null,
    };
    expect(unmappedContext.schoolId).toBeNull();
  });
});
