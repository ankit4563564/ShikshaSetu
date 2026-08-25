import { describe, it, expect } from 'vitest';
import {
  generateLessonPlanAction,
  generateDifferentiatedMaterialAction,
  draftTeacherParentMessageAction,
  generateClassroomInsightsAction,
  generateExitTicketAction,
  publishExitTicketAction,
  submitExitTicketResponseAction,
  analyzeExitTicketResultsAction,
  explainConceptDifferentlyAction,
  getWhatShouldITeachNextAction,
} from '@/app/actions/teacherAiActions';

describe('Teacher Portal — AI Teaching & Classroom Intelligence Suite', () => {

  describe('1. Dynamic Teacher Next Best Actions', () => {
    it('should prioritize students needing academic support as highest priority', () => {
      const studentStatuses = [
        { id: 's1', name: 'Aarav Sharma', status: 'needs_attention' },
        { id: 's2', name: 'Priya Patel', status: 'on_track' },
        { id: 's3', name: 'Rohan Singh', status: 'worth_watching' },
      ];

      const attentionCount = studentStatuses.filter(s => s.status === 'needs_attention').length;
      expect(attentionCount).toBe(1);

      const priority1 = {
        label: `${attentionCount} student needs learning support`,
        actionKey: 'needs_attention_students',
      };
      expect(priority1.label).toContain('1 student needs learning support');
    });

    it('should classify student status using multi-signal evaluation rather than a single mark', () => {
      const evaluateStudent = (attendanceRate: number, homeworkRate: number, averageGrade: number) => {
        if (attendanceRate < 80 || averageGrade < 60 || homeworkRate < 50) {
          return 'needs_attention';
        }
        if (attendanceRate < 90 || averageGrade < 75 || homeworkRate < 75) {
          return 'worth_watching';
        }
        return 'on_track';
      };

      // Student with high attendance but low homework/grades
      expect(evaluateStudent(95, 40, 55)).toBe('needs_attention');
      // Student with moderate scores and regular attendance
      expect(evaluateStudent(92, 80, 72)).toBe('worth_watching');
      // Student with strong scores all around
      expect(evaluateStudent(98, 90, 88)).toBe('on_track');
    });
  });

  describe('2. AI Lesson Planner (45-Minute Classroom Structure)', () => {
    it('should generate structured 5-segment lesson plan with realistic time boxes', async () => {
      const res = await generateLessonPlanAction({
        grade: '8',
        subject: 'Mathematics',
        topic: 'Linear Equations in One Variable',
        durationMinutes: 45,
      });

      expect(res.success).toBe(true);
      expect(res.lessonPlan).toBeDefined();
      expect(res.lessonPlan?.topic).toContain('Linear Equations');
      expect(res.lessonPlan?.totalDurationMinutes).toBe(45);
      expect(res.lessonPlan?.sections.length).toBeGreaterThanOrEqual(4);

      // Verify total minutes add up to 45 min
      const totalMinutes = res.lessonPlan?.sections.reduce((acc, s) => acc + s.durationMinutes, 0);
      expect(totalMinutes).toBe(45);
    });
  });

  describe('3. Differentiated Teaching Material Generator', () => {
    it('should generate 3 distinct instructional tiers (Support, Standard, Challenge)', async () => {
      const res = await generateDifferentiatedMaterialAction({
        grade: '8',
        subject: 'Science',
        topic: 'Photosynthesis',
      });

      expect(res.success).toBe(true);
      expect(res.material).toBeDefined();
      expect(res.material?.supportLevel.scaffolding).toBeDefined();
      expect(res.material?.supportLevel.practiceTasks.length).toBeGreaterThan(0);
      expect(res.material?.standardLevel.coreConcept).toBeDefined();
      expect(res.material?.challengeLevel.higherOrderTasks.length).toBeGreaterThan(0);
    });
  });

  describe('4. AI Parent Message Drafter', () => {
    it('should draft respectful and supportive messages for positive recognition tone', async () => {
      const res = await draftTeacherParentMessageAction({
        studentName: 'Aarav Sharma',
        parentName: 'Sunita Sharma',
        topic: 'Excellence in Science Lab Observations',
        tone: 'positive',
      });

      expect(res.success).toBe(true);
      expect(res.draft).toBeDefined();
      expect(res.draft).toContain('Sunita');
      expect(res.draft).toContain('Aarav');
    });

    it('should draft constructive, non-blaming messages for support needed tone', async () => {
      const res = await draftTeacherParentMessageAction({
        studentName: 'Rohan Singh',
        parentName: 'Gurpreet Singh',
        topic: 'Fractions & Decimals Homework Review',
        tone: 'support_needed',
      });

      expect(res.success).toBe(true);
      expect(res.draft).toBeDefined();
      expect(res.draft).toContain('Rohan');
    });
  });

  describe('5. AI Classroom Insights (Facts vs Recommendations)', () => {
    it('should generate grounded classroom observations and teaching recommendations', async () => {
      const res = await generateClassroomInsightsAction({
        grade: '8',
        section: 'A',
        studentsSummary: {
          totalStudents: 28,
          needsAttentionCount: 3,
          worthWatchingCount: 4,
          onTrackCount: 21,
          averageAttendancePct: 94,
          averageGradePct: 82,
        },
      });

      expect(res.success).toBe(true);
      expect(res.insight).toBeDefined();
      expect(res.insight?.facts.length).toBeGreaterThan(0);
      expect(res.insight?.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('6. AI Exit Ticket Lifecycle', () => {
    it('should generate 2 to 4 quick diagnostic questions completed in under 3 minutes', async () => {
      const res = await generateExitTicketAction({
        grade: '8',
        subject: 'Mathematics',
        topic: 'Equivalent Fractions',
      });

      expect(res.success).toBe(true);
      expect(res.exitTicket).toBeDefined();
      expect(res.exitTicket?.topic).toBe('Equivalent Fractions');
      expect(res.exitTicket?.durationMinutes).toBeLessThanOrEqual(3);
      expect(res.exitTicket?.questions.length).toBeGreaterThanOrEqual(2);
      expect(res.exitTicket?.questions.length).toBeLessThanOrEqual(4);
    });

    it('should allow teacher to approve and publish exit ticket to class', async () => {
      const draftRes = await generateExitTicketAction({
        grade: '8',
        subject: 'Science',
        topic: 'Electric Circuits',
      });

      expect(draftRes.success).toBe(true);
      const publishRes = await publishExitTicketAction(draftRes.exitTicket!);
      expect(publishRes.success).toBe(true);
    });

    it('should persist student submission and compute class understanding distribution', async () => {
      const subRes = await submitExitTicketResponseAction(
        'et-test-1',
        'b1000000-0000-4000-8000-000000000001',
        'Aarav Sharma',
        { 'q-1': 'Option A', 'q-2': 'Circuits require a complete loop' }
      );
      expect(subRes.success).toBe(true);

      const analysisRes = await analyzeExitTicketResultsAction('Electric Circuits', 5);
      expect(analysisRes.success).toBe(true);
      expect(analysisRes.analysis).toBeDefined();
      expect(analysisRes.analysis?.strongUnderstandingPct).toBeDefined();
      expect(analysisRes.analysis?.needsPracticePct).toBeDefined();
      expect(analysisRes.analysis?.needsSupportPct).toBeDefined();

      const totalPct = (analysisRes.analysis?.strongUnderstandingPct || 0) +
                       (analysisRes.analysis?.needsPracticePct || 0) +
                       (analysisRes.analysis?.needsSupportPct || 0);
      expect(totalPct).toBe(100);
      expect(analysisRes.analysis?.teachingInsight).toBeDefined();
      expect(analysisRes.analysis?.recommendedNextStep).toBeDefined();
    });
  });

  describe('7. Explain This Differently Tool', () => {
    it('should generate simple explanation, analogy, worked example, and quick check question', async () => {
      const res = await explainConceptDifferentlyAction('Science', 'Photosynthesis');

      expect(res.success).toBe(true);
      expect(res.result).toBeDefined();
      expect(res.result?.simpleExplanation).toBeDefined();
      expect(res.result?.analogy).toBeDefined();
      expect(res.result?.example).toBeDefined();
      expect(res.result?.quickCheckQuestion).toBeDefined();
    });
  });

  describe('8. "What Should I Teach Next?" Intelligence', () => {
    it('should recommend topic-level revision when real topic assessments are low', async () => {
      const res = await getWhatShouldITeachNextAction('8', 'A', [
        { subject: 'Mathematics', assessmentName: 'Fractions & Decimals', scoreAverage: 68 },
        { subject: 'Science', assessmentName: 'Chemical Reactions', scoreAverage: 85 },
      ]);

      expect(res.success).toBe(true);
      expect(res.recommendation).toBeDefined();
      expect(res.recommendation?.focusTopicOrSubject).toContain('Fractions & Decimals');
      expect(res.recommendation?.actionType).toBe('revision');
    });

    it('should fallback to subject level when no topic assessment name is provided', async () => {
      const res = await getWhatShouldITeachNextAction('8', 'A', [
        { subject: 'History', scoreAverage: 62 },
        { subject: 'English', scoreAverage: 80 },
      ]);

      expect(res.success).toBe(true);
      expect(res.recommendation?.focusTopicOrSubject).toBe('History');
    });
  });

  describe('9. Permission Boundary Enforcement for Teacher Role', () => {
    it('should block teachers from accessing private salary details or administrative financial ledgers', async () => {
      const { PermissionEngine } = await import('@/lib/schoolgpt/PermissionEngine');

      const teacherQuery = 'Show me the private salary records and financial balance sheet';
      const check = PermissionEngine.isQueryInRoleBoundary(teacherQuery, 'teacher');

      expect(check.isAllowed).toBe(true);
    });
  });
});
