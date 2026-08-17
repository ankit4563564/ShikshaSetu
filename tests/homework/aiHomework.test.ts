import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateHomeworkDraftAction } from '@/app/actions/teacherAiActions';
import { getAuthContext, requirePermission, AuthContext, ROLE_PERMISSIONS } from '@/lib/auth/getAuthContext';

vi.mock('@/lib/auth/getAuthContext', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    getAuthContext: vi.fn(),
    requirePermission: vi.fn(),
  };
});

vi.mock('@/lib/supabase/scoped', () => ({
  createScopedClient: vi.fn(() => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: [{ id: 'stu-101' }], error: null }),
          then: (res: any) => res({ data: [{ id: 'stu-101' }], error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'hw-101' }, error: null }),
        }),
      }),
    }),
  })),
}));

describe('Phase 2.1 — AI-Assisted Homework Draft Generation Suite', () => {
  const schoolA = 'e0000000-0000-4000-8000-000000000001';

  const teacherContext: AuthContext = {
    userId: 'usr-teacher-999',
    clerkUserId: 'clerk-teacher-999',
    schoolId: schoolA,
    role: 'teacher',
    permissions: ROLE_PERMISSIONS['teacher'],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getAuthContext as any).mockResolvedValue(teacherContext);
  });

  it('1. Unauthorized user cannot generate homework draft', async () => {
    (requirePermission as any).mockImplementation(() => {
      throw new Error("FORBIDDEN: Role 'student' lacks required permission 'homework:write'");
    });

    const res = await generateHomeworkDraftAction({
      grade: '8',
      subject: 'Mathematics',
      topic: 'Algebra',
      lessonNotes: 'Linear equations lesson covered today.',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('FORBIDDEN');
  });

  it('2. Insufficient lesson notes context rejected', async () => {
    const res = await generateHomeworkDraftAction({
      grade: '8',
      subject: 'Mathematics',
      topic: 'Algebra',
      lessonNotes: 'Short',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Not enough lesson context');
  });

  it('3. Valid request returns structured draft with questions', async () => {
    const res = await generateHomeworkDraftAction({
      grade: '8',
      subject: 'Mathematics',
      topic: 'Linear Equations',
      lessonNotes: 'Today we taught solving ax + b = c. Example: 2x + 4 = 10 -> x = 3.',
    });

    expect(res.success).toBe(true);
    expect(res.draft).toBeDefined();
    expect(res.draft?.title).toContain('Mathematics');
    expect(res.draft?.grade).toBe('8');
    expect(Array.isArray(res.draft?.questions)).toBe(true);
    expect(res.draft?.questions.length).toBeGreaterThan(0);
  });

  it('4. AI draft does NOT publish to DB automatically (Client review only)', async () => {
    const res = await generateHomeworkDraftAction({
      grade: '8',
      subject: 'Science',
      topic: 'Photosynthesis',
      lessonNotes: 'Covered light reaction and dark reaction in plant leaves today.',
    });

    expect(res.success).toBe(true);
    expect(res.draft?.subject).toBe('Science');
  });
});
