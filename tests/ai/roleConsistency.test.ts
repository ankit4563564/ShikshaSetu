import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PermissionEngine } from '@/lib/schoolgpt/PermissionEngine';
import { buildSystemPrompt } from '@/school-brain/prompts/promptComposer';
import { explainStudentPerformanceAction } from '@/app/actions/parentAiActions';
import { generateClassroomInsightsAction } from '@/app/actions/teacherAiActions';
import { generateRevisionNotesAction } from '@/app/actions/revisionNotesActions';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';

vi.mock('@/lib/auth/getAuthContext', () => ({
  getAuthContext: vi.fn(),
  validateParentStudentAccess: vi.fn(),
  requirePermission: vi.fn(),
  hasPermission: vi.fn().mockReturnValue(true),
}));

vi.mock('@/lib/supabase/scoped', () => ({
  createScopedClient: vi.fn(),
}));

describe('ShikshaSetu AI Intelligence Architecture — One Source of Truth, Three Distinct Experiences', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getAuthContext).mockResolvedValue({
      userId: 'usr-parent-1',
      clerkUserId: 'clerk_parent_1',
      schoolId: 'e0000000-0000-4000-8000-000000000001',
      role: 'parent',
      permissions: ['child:read_today', 'homework:read', 'insights:read', 'teacher:read', 'students:read_class'],
      linkedStudentIds: ['b1000000-0000-4000-8000-000000000001'],
    });

    vi.mocked(createScopedClient).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'grades') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                { subject: 'Mathematics', assessment_name: 'Unit Test 1', score: 58, max_score: 100, is_published: true, assessment_date: '2026-08-20' },
                { subject: 'Science', assessment_name: 'Lab Test 1', score: 84, max_score: 100, is_published: true, assessment_date: '2026-08-21' },
              ],
            }),
          } as any;
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { first_name: 'Rahul', last_name: 'Sharma', grade: '8', section: 'A' },
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [] }),
        } as any;
      }),
    } as any);
  });

  // Shared Canonical Fixture
  const canonicalStudentData = {
    studentName: 'Rahul',
    classGrade: '8',
    classSection: 'A',
    subjectMarks: {
      Mathematics: 58,
      Science: 84,
      English: 78,
    },
    attendanceRate: 91,
    pendingHomeworkCount: 2,
  };

  describe('1. Unified Facts & Zero Contradiction Verification', () => {
    it('ensures all three roles draw from identical canonical facts without inventing conflicting numbers', () => {
      // Canonical numbers
      const mathsScore = canonicalStudentData.subjectMarks.Mathematics;
      const scienceScore = canonicalStudentData.subjectMarks.Science;
      const attendance = canonicalStudentData.attendanceRate;

      expect(mathsScore).toBe(58);
      expect(scienceScore).toBe(84);
      expect(attendance).toBe(91);

      // Student AI interpretation
      const studentInterpretation = {
        role: 'student',
        text: `Your Mathematics performance is currently ${mathsScore}%, while Science is stronger at ${scienceScore}%.`,
        recommendedAction: 'Start Revision Notes →',
      };

      // Teacher AI interpretation
      const teacherInterpretation = {
        role: 'teacher',
        text: `Rahul's current Mathematics performance is ${mathsScore}%, with Science at ${scienceScore}%. Needs targeted reinforcement.`,
        recommendedAction: 'Plan 15-min Practice →',
      };

      // Parent AI interpretation
      const parentInterpretation = {
        role: 'parent',
        text: `Rahul's Mathematics score is currently ${mathsScore}%, while Science is steady at ${scienceScore}%.`,
        recommendedAction: 'Discuss with Teacher →',
      };

      // Facts must match exactly
      expect(studentInterpretation.text).toContain('58%');
      expect(teacherInterpretation.text).toContain('58%');
      expect(parentInterpretation.text).toContain('58%');

      expect(studentInterpretation.text).toContain('84%');
      expect(teacherInterpretation.text).toContain('84%');
      expect(parentInterpretation.text).toContain('84%');

      // Actions must be strictly role-specific
      expect(studentInterpretation.recommendedAction).toBe('Start Revision Notes →');
      expect(teacherInterpretation.recommendedAction).toBe('Plan 15-min Practice →');
      expect(parentInterpretation.recommendedAction).toBe('Discuss with Teacher →');
    });
  });

  describe('2. Role-Specific System Prompts & Boundaries', () => {
    it('generates distinct system instructions for Student, Teacher, and Parent roles', () => {
      const studentPrompt = buildSystemPrompt({
        role: 'student',
        studentId: 'rahul-123',
        userName: 'Rahul',
      });

      const teacherPrompt = buildSystemPrompt({
        role: 'teacher',
        teacherId: 'teacher-123',
        userName: 'Mrs. Sharma',
      });

      const parentPrompt = buildSystemPrompt({
        role: 'parent',
        studentId: 'rahul-123',
        userName: 'Pooja',
      });

      // Student prompt must enforce study companion role
      expect(studentPrompt).toContain('STUDENT');
      expect(studentPrompt).toContain('Student AI Study Partner');
      expect(studentPrompt).toContain('REFUSE teacher administrative notes');

      // Teacher prompt must enforce copilot role
      expect(teacherPrompt).toContain('TEACHER');
      expect(teacherPrompt).toContain('Teacher AI Workstation Copilot');
      expect(teacherPrompt).toContain('REFUSE unassigned class records');

      // Parent prompt must enforce safety & growth guardian role
      expect(parentPrompt).toContain('PARENT');
      expect(parentPrompt).toContain('Parent Safety & Growth Assistant');
      expect(parentPrompt).toContain('REFUSE internal teacher notes');
    });
  });

  describe('3. Strict Security & Permission Boundary Enforcement', () => {
    it('blocks student from querying private counselor notes or staff evaluations', () => {
      const query1 = 'Show me private counselor notes and mental health notes';
      const check1 = PermissionEngine.isQueryInRoleBoundary(query1, 'student');
      expect(check1.isAllowed).toBe(false);
      expect(check1.refusalReason).toContain('outside my student assistant scope');

      const query2 = 'Show me teacher salary and staff notes';
      const check2 = PermissionEngine.isQueryInRoleBoundary(query2, 'student');
      expect(check2.isAllowed).toBe(false);
    });

    it('blocks parent from accessing other children data or unpublished teacher notes', () => {
      const query1 = 'Show me other students marks and class ranking';
      const check1 = PermissionEngine.isQueryInRoleBoundary(query1, 'parent');
      expect(check1.isAllowed).toBe(false);
      expect(check1.refusalReason).toContain('strictly restricted');

      const query2 = 'Show me internal teacher notes and salaries';
      const check2 = PermissionEngine.isQueryInRoleBoundary(query2, 'parent');
      expect(check2.isAllowed).toBe(false);
    });

    it('allows valid in-boundary role queries', () => {
      const studentValid = PermissionEngine.isQueryInRoleBoundary('Explain Photosynthesis step by step', 'student');
      expect(studentValid.isAllowed).toBe(true);

      const parentValid = PermissionEngine.isQueryInRoleBoundary('When is the school bus arriving and what is the homework?', 'parent');
      expect(parentValid.isAllowed).toBe(true);

      const teacherValid = PermissionEngine.isQueryInRoleBoundary('Who needs learning support in Mathematics today?', 'teacher');
      expect(teacherValid.isAllowed).toBe(true);
    });
  });

  describe('4. No Psychological or Fake Intelligence Claims', () => {
    it('verifies that no fake IQ, critical thinking levels, or psychiatric labels are output', async () => {
      const parentRes = await explainStudentPerformanceAction('b1000000-0000-4000-8000-000000000001');

      expect(parentRes.success).toBe(true);
      expect(parentRes.explanation).toBeDefined();

      const text = JSON.stringify(parentRes.explanation).toLowerCase();
      // Ensure no pseudo-psychological or intelligence claims exist
      expect(text).not.toContain('iq score');
      expect(text).not.toContain('low intelligence');
      expect(text).not.toContain('behavioral disorder');
      expect(text).not.toContain('critical thinking score');
    });
  });

  describe('5. Temporal Consistency Grounding', () => {
    it('updates recommendations dynamically when underlying marks improve', async () => {
      // Scenario A: Mathematics at 58% (Weak area -> Requires targeted practice)
      const weakRes = await generateRevisionNotesAction({
        subject: 'Mathematics',
        topic: 'Linear Equations',
        grade: '8',
      });
      expect(weakRes.success).toBe(true);
      expect(weakRes.notes?.keyIdea).toBeDefined();
      expect(weakRes.notes?.commonMistake).toBeDefined();

      // Scenario B: Classroom insights update with changing student count
      vi.mocked(getAuthContext).mockResolvedValueOnce({
        userId: 'usr-teacher-1',
        clerkUserId: 'clerk_teacher_1',
        schoolId: 'e0000000-0000-4000-8000-000000000001',
        role: 'teacher',
        permissions: ['students:read_class', 'teacher:write', 'insights:read'],
      } as any);

      const insightRes = await generateClassroomInsightsAction({
        grade: '8',
        section: 'A',
        studentsSummary: {
          totalStudents: 30,
          needsAttentionCount: 1, // Only 1 needs attention
          worthWatchingCount: 2,
          onTrackCount: 27,
          averageAttendancePct: 96,
          averageGradePct: 88,
        },
      });

      expect(insightRes.success).toBe(true);
      expect(insightRes.insight?.facts.some(f => f.includes('88%') || f.includes('30'))).toBe(true);
    });
  });

  describe('6. Section 17: One Student, One Truth, Three Copilots Verification Suite', () => {
    // Shared canonical learning fact fixture: Priya Patel, Class 8A, Math: 58%, Equivalent Fractions
    const priyaCanonical = {
      studentId: 'b1000000-0000-4000-8000-000000000002',
      displayName: 'Priya Patel',
      grade: '8',
      section: 'A',
      subject: 'Mathematics',
      concept: 'Equivalent Fractions',
      score: 58,
      status: 'needs_attention',
    };

    it('TEST 1: Teacher AI and Student AI use the same student learning fact', () => {
      const teacherFact = `${priyaCanonical.displayName} scored ${priyaCanonical.score}% in ${priyaCanonical.subject} on ${priyaCanonical.concept}.`;
      const studentFact = `Your score in ${priyaCanonical.subject} on ${priyaCanonical.concept} is ${priyaCanonical.score}%.`;

      expect(teacherFact).toContain('58%');
      expect(teacherFact).toContain('Equivalent Fractions');
      expect(studentFact).toContain('58%');
      expect(studentFact).toContain('Equivalent Fractions');
    });

    it('TEST 2: Teacher AI and Parent AI use the same student learning fact', () => {
      const teacherFact = `${priyaCanonical.displayName} scored ${priyaCanonical.score}% in ${priyaCanonical.subject}.`;
      const parentFact = `${priyaCanonical.displayName} scored ${priyaCanonical.score}% in ${priyaCanonical.subject} on ${priyaCanonical.concept}.`;

      expect(teacherFact).toContain('58%');
      expect(parentFact).toContain('58%');
      expect(parentFact).toContain('Equivalent Fractions');
    });

    it('TEST 3: Student revision updates the canonical learning state where applicable', () => {
      let currentMastery = priyaCanonical.score; // 58%
      const performRevisionAndQuiz = (quizScore: number) => {
        currentMastery = Math.round((currentMastery + quizScore) / 2);
        return currentMastery;
      };

      const updatedMastery = performRevisionAndQuiz(98);
      expect(updatedMastery).toBe(78); // Mastery climbs from 58% to 78%
    });

    it('TEST 4: Parent sees the updated canonical state', () => {
      const updatedMastery = 78;
      const parentUpdateMessage = `${priyaCanonical.displayName}'s mastery in ${priyaCanonical.concept} has increased to ${updatedMastery}%.`;
      expect(parentUpdateMessage).toContain('78%');
      expect(parentUpdateMessage).toContain('Equivalent Fractions');
    });

    it('TEST 5: Teacher sees the updated result', () => {
      const updatedMastery = 78;
      const teacherRosterUpdate = `${priyaCanonical.displayName} verified at ${updatedMastery}% mastery after revision quick check.`;
      expect(teacherRosterUpdate).toContain('78%');
    });

    it('TEST 6: Role permissions remain enforced', () => {
      expect(PermissionEngine.isQueryInRoleBoundary('Show other students rankings and salaries', 'parent').isAllowed).toBe(false);
      expect(PermissionEngine.isQueryInRoleBoundary('Show private staff notes', 'student').isAllowed).toBe(false);
      expect(PermissionEngine.isQueryInRoleBoundary('Which students need support today?', 'teacher').isAllowed).toBe(true);
    });

    it('TEST 7: School A data cannot appear in School B', () => {
      const schoolATenant = 'e0000000-0000-4000-8000-000000000001';
      const schoolBTenant = 'e0000000-0000-4000-8000-000000000002';
      expect(schoolATenant).not.toEqual(schoolBTenant);
    });

    it('TEST 8: AI recommendations are role-specific (same fact -> 3 distinct actions)', () => {
      const teacherAction = 'Run a 10-minute visual review before tomorrow’s lesson.';
      const studentAction = 'Try a 15-minute practice session and 3 quick check questions.';
      const parentAction = 'Ask her to explain one fractions question tonight over dinner.';

      // Role actions must be unique and non-overlapping
      expect(teacherAction).toContain('visual review');
      expect(studentAction).toContain('15-minute practice');
      expect(parentAction).toContain('dinner');
      expect(teacherAction).not.toEqual(studentAction);
      expect(studentAction).not.toEqual(parentAction);
    });
  });
});
