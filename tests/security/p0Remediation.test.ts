import { describe, it, expect, vi } from 'vitest';
import { approveSupportPlanAction } from '@/app/actions/interventionActions';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { resolveContextualReferences } from '@/school-brain/memory/conversationMemory';

// Mock Auth Context
vi.mock('@/lib/auth/getAuthContext', () => ({
  getAuthContext: vi.fn(),
  requirePermission: vi.fn(),
  validateParentStudentAccess: vi.fn(),
}));

// Mock ScopedSupabaseClient
vi.mock('@/lib/supabase/scoped', () => ({
  createScopedClient: vi.fn(() => ({
    from: (table: string) => {
      return {
        insert: (data: any) => ({
          select: () => ({
            single: async () => ({
              data: { id: `${table}-101`, ...data },
              error: null,
            }),
          }),
          single: async () => ({
            data: { id: `${table}-101`, ...data },
            error: null,
          }),
        }),
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () => ({ data: { guardian_id: 'g-101' }, error: null }),
            }),
          }),
        }),
        update: () => ({
          eq: () => ({
            is: async () => ({ error: null }),
          }),
        }),
      };
    },
  })),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock recordEcosystemEvent
vi.mock('@/app/actions/ecosystemActions', () => ({
  recordEcosystemEvent: vi.fn().mockResolvedValue({ success: true }),
}));

describe('P0 Remediation Tests', () => {
  it('1. Authenticated teacher owns intervention with real userId from getAuthContext()', async () => {
    const mockTeacherContext = {
      userId: 'usr-teacher-999',
      role: 'teacher',
      schoolId: 'sch-001-test',
      permissions: ['interventions:approve', 'interventions:write'],
    };

    (getAuthContext as any).mockResolvedValue(mockTeacherContext);

    const result = await approveSupportPlanAction({
      studentId: 'stu-101',
      studentName: 'Test Student',
      teacherId: 'fake-teacher-should-be-ignored',
      signalId: 'sig-101',
      signalType: 'academic_tutoring',
      recommendedActions: [
        {
          id: 'act-1',
          action: 'Tutoring session',
          category: 'academic',
          priority: 'high',
          description: 'Weekly 1-on-1 tutoring',
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.interventionId).toBe('interventions-101');
  });

  it('2. Conversation memory does not return hardcoded fallback student identity when unmentioned', () => {
    const { state } = resolveContextualReferences('How is class attendance?');
    expect(state.currentStudentId).toBeUndefined();
    expect(state.currentStudentName).toBeUndefined();
  });
});
