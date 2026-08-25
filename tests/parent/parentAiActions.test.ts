import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getChildAiInsightAction,
  explainStudentPerformanceAction,
  explainHomeworkAction,
  summarizeNoticeAction,
  draftParentTeacherMessageAction,
} from '@/app/actions/parentAiActions';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';

vi.mock('@/lib/auth/getAuthContext', () => ({
  getAuthContext: vi.fn(),
  validateParentStudentAccess: vi.fn(),
}));

vi.mock('@/lib/supabase/scoped', () => ({
  createScopedClient: vi.fn(),
}));

describe('Parent Portal AI Actions Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getAuthContext).mockResolvedValue({
      userId: 'usr-parent-1',
      clerkUserId: 'clerk_parent_1',
      schoolId: 'e0000000-0000-4000-8000-000000000001',
      role: 'parent',
      permissions: ['child:read_today', 'homework:read', 'gate_pass:request'],
      linkedStudentIds: ['b1000000-0000-4000-8000-000000000001'],
    });
  });

  describe('1. Child AI Dashboard Insight', () => {
    it('analyzes real student records and produces actionable parent briefing', async () => {
      const mockDb = {
        from: vi.fn((table: string) => {
          if (table === 'attendance') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              limit: vi.fn().mockResolvedValue({
                data: [
                  { status: 'present', date: '2026-08-25' },
                  { status: 'present', date: '2026-08-24' },
                ],
              }),
            };
          }
          if (table === 'homework') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({
                data: [
                  { title: 'Linear Equations Ex 3.2', subject: 'Mathematics', due_date: '2026-08-26', is_submitted: false },
                ],
              }),
            };
          }
          if (table === 'grades') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockResolvedValue({
                data: [
                  { subject: 'Mathematics', score: 23, max_score: 25, is_published: true },
                  { subject: 'Science', score: 18, max_score: 25, is_published: true },
                ],
              }),
            };
          }
          if (table === 'students') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { first_name: 'Aarav', last_name: 'Sharma', grade: '8', section: 'A' },
              }),
            };
          }
          return { select: vi.fn().mockReturnThis() };
        }),
      };

      vi.mocked(createScopedClient).mockReturnValue(mockDb as any);

      const res = await getChildAiInsightAction('b1000000-0000-4000-8000-000000000001');
      expect(res.success).toBe(true);
      expect(res.insight).toBeDefined();
      expect(res.insight?.strengths.length).toBeGreaterThan(0);
      expect(res.insight?.attendanceHealth).toContain('Attendance');
    });
  });

  describe('2. Homework AI Assistant', () => {
    it('generates non-cheating conceptual hints and check questions for parents', async () => {
      const res = await explainHomeworkAction({
        title: 'Photosynthesis Lab Worksheet',
        subject: 'Science',
        instructions: 'Explain light and dark reactions with chemical equation.',
        studentGrade: '8',
      });

      expect(res.success).toBe(true);
      expect(res.help).toBeDefined();
      expect(res.help?.simplifiedConcept).toBeDefined();
      expect(res.help?.guidingHints.length).toBeGreaterThan(0);
      expect(res.help?.checkQuestions.length).toBe(2);
    });
  });

  describe('3. Notice & Circular AI Summarizer', () => {
    it('distills school circulars into key dates and parent takeaways', async () => {
      const res = await summarizeNoticeAction({
        title: 'Annual Sports Day & Rehearsal Schedule',
        content: 'The annual sports meet will be held on Oct 12 at the Main Campus. Students must arrive in full sports uniform by 7:30 AM. Parent passes are required.',
        date: '2026-10-12',
      });

      expect(res.success).toBe(true);
      expect(res.summary).toBeDefined();
      expect(res.summary?.whatParentsNeedToKnow).toBeDefined();
      expect(res.summary?.importantDates.length).toBeGreaterThan(0);
    });
  });

  describe('4. Teacher Message AI Drafter', () => {
    it('drafts a polite message for leave applications', async () => {
      const res = await draftParentTeacherMessageAction({
        intent: 'leave_request',
        studentName: 'Aarav',
        notes: 'Fever since yesterday',
        tone: 'polite',
      });

      expect(res.success).toBe(true);
      expect(res.draft?.draftText).toContain('Aarav');
      expect(res.draft?.suggestedSubject).toContain('Leave Application');
    });

    it('drafts a clear message for homework doubts', async () => {
      const res = await draftParentTeacherMessageAction({
        intent: 'homework_query',
        studentName: 'Aarav',
        notes: 'Exercise 3.2 question 4',
        tone: 'clearer',
      });

      expect(res.success).toBe(true);
      expect(res.draft?.draftText).toContain('homework');
    });
  });

  describe('5. Attendance AI Explainer', () => {
    it('evaluates attendance percentages and returns healthy summary', async () => {
      const { explainAttendanceAction } = await import('@/app/actions/parentAiActions');

      const mockDb = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { date: '2026-08-25', status: 'present' },
              { date: '2026-08-24', status: 'present' },
              { date: '2026-08-23', status: 'present' },
            ],
          }),
        })),
      };

      vi.mocked(createScopedClient).mockReturnValue(mockDb as any);

      const res = await explainAttendanceAction({
        studentId: 'b1000000-0000-4000-8000-000000000001',
        studentName: 'Aarav',
      });

      expect(res.success).toBe(true);
      expect(res.insight).toBeDefined();
      expect(res.insight?.statusRating).toBe('Excellent');
      expect(res.insight?.summary).toContain('attendance is in good standing');
    });
  });

  describe('6. Fee Status AI Explainer', () => {
    it('summarizes exact ledger figures without hallucinating amounts', async () => {
      const { explainFeeStatusAction } = await import('@/app/actions/parentAiActions');

      const res = await explainFeeStatusAction({
        totalAmount: 58000,
        paidAmount: 34000,
        pendingAmount: 24000,
        nextDueDate: '2026-10-15',
        studentName: 'Aarav',
      });

      expect(res.success).toBe(true);
      expect(res.explanation).toBeDefined();
      expect(res.explanation?.summary).toContain('24,000');
      expect(res.explanation?.paidStatus).toContain('34,000');
    });
  });
});

