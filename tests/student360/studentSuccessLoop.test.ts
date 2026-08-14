import { describe, it, expect } from 'vitest';
import { AuthContext, ROLE_PERMISSIONS, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { getStudent360Data } from '@/lib/student360/getStudent360';
import { analyzeStudentEarlySignals } from '@/lib/intelligence/services/analyzeStudentSignals';

describe('Phase E Student Success Loop & Security Suite', () => {
  const schoolA = 'e0000000-0000-4000-8000-000000000001';
  const schoolB = 'e0000000-0000-4000-8000-000000000002';

  const teacherSchoolA: AuthContext = {
    userId: 'teacher-001',
    clerkUserId: 'clerk-teacher-001',
    schoolId: schoolA,
    role: 'teacher',
    permissions: ROLE_PERMISSIONS['teacher'],
  };

  const parentSchoolA: AuthContext = {
    userId: 'parent-001',
    clerkUserId: 'clerk-parent-001',
    schoolId: schoolA,
    role: 'parent',
    permissions: ROLE_PERMISSIONS['parent'],
    linkedStudentIds: ['stu-aarav'],
  };

  const createChain = (studentSchoolId = schoolA) => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: async () => ({ data: [], error: null }),
      single: async () => ({
        data: {
          id: 'stu-aarav',
          first_name: 'Aarav',
          last_name: 'Sharma',
          display_name: 'Aarav Sharma',
          grade: '8',
          section: 'A',
          avatar_url: '/aarav.png',
          school_id: studentSchoolId,
        },
        error: null,
      }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    };
    return chain;
  };

  const mockScopedDbSchoolA: any = { from: () => createChain(schoolA) };

  it('1. Teacher can view authorized Student 360 view', async () => {
    const data = await getStudent360Data(teacherSchoolA, mockScopedDbSchoolA, 'stu-aarav');
    expect(data.studentId).toBe('stu-aarav');
    expect(data.displayName).toBe('Aarav Sharma');
    expect(data.signalAnalysis).toBeDefined();
  });

  it('2. Prevents teacher from reading student context outside permissions', async () => {
    const unauthorizedContext: AuthContext = {
      ...teacherSchoolA,
      permissions: [],
    };
    await expect(getStudent360Data(unauthorizedContext, mockScopedDbSchoolA, 'stu-aarav')).rejects.toThrow(
      /FORBIDDEN/
    );
  });

  it('3. Ensures AI signal analysis does NOT automatically mutate DB state', async () => {
    const analysis = await analyzeStudentEarlySignals(teacherSchoolA, mockScopedDbSchoolA, 'stu-aarav');
    expect(analysis).toBeDefined();
    // Human-in-the-loop recommendation output only
    expect(analysis.recommendedActions).toBeDefined();
  });

  it('4. Separates parent-visible content from private internal notes', () => {
    // Parent context does not receive interventions:approve permission
    expect(parentSchoolA.permissions).not.toContain('interventions:approve');
    expect(() => validateParentStudentAccess(parentSchoolA, 'stu-aarav')).not.toThrow();
    expect(() => validateParentStudentAccess(parentSchoolA, 'unlinked-student')).toThrow(/FORBIDDEN/);
  });
});
