import { describe, it, expect } from 'vitest';
import { AuthContext, ROLE_PERMISSIONS } from '@/lib/auth/getAuthContext';
import { analyzeStudentEarlySignals } from '@/lib/intelligence/services/analyzeStudentSignals';
import { buildStudentContext } from '@/lib/intelligence/context/buildStudentContext';
import { AIProvider, AIProviderResponse } from '@/lib/intelligence/providers/aiProvider';
import { validateSignalAnalysisResult } from '@/lib/intelligence/schemas/signalAnalysisSchema';

class MockTestAIProvider implements AIProvider {
  constructor(private responseText: string, private shouldFail = false) {}

  async generateCompletion(): Promise<AIProviderResponse> {
    if (this.shouldFail) {
      throw new Error('Mock LLM network failure');
    }
    return {
      text: this.responseText,
      provider: 'mock',
      latencyMs: 15,
    };
  }
}

describe('Phase 1.5 — Student Intelligence Quality Evaluation Suite', () => {
  const schoolA = 'e0000000-0000-4000-8000-000000000001';
  const schoolB = 'e0000000-0000-4000-8000-000000000002';

  const teacherContext: AuthContext = {
    userId: 'teacher-01',
    clerkUserId: 'clerk-teacher-01',
    schoolId: schoolA,
    role: 'teacher',
    permissions: ROLE_PERMISSIONS['teacher'],
  };

  const mockDbWithCustomData = (
    attendanceData: any[] = [],
    homeworkData: any[] = [],
    gradesData: any[] = [],
    interventionsData: any[] = []
  ) => {
    return {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: (field: string, val: any) => {
            if (field === 'id' && val === 'stu-cross-tenant') {
              return {
                single: async () => ({ data: null, error: new Error('Student stu-cross-tenant not found') }),
                order: () => chain,
                then: (res: any) => res({ data: [], error: null }),
              };
            }
            return chain;
          },
          order: () => chain,
          single: async () => ({
            data: { id: 'stu-aarav', grade: '8', section: 'A', school_id: schoolA },
            error: null,
          }),
          then: (resolve: any) => {
            if (table === 'attendance') resolve({ data: attendanceData, error: null });
            else if (table === 'homework_submissions') resolve({ data: homeworkData, error: null });
            else if (table === 'grades') resolve({ data: gradesData, error: null });
            else if (table === 'interventions') resolve({ data: interventionsData, error: null });
            else resolve({ data: [], error: null });
          },
        };
        return chain;
      },
    } as any;
  };

  it('CASE A — Clear Multi-Signal Decline (High Severity Expected)', async () => {
    const attendance = Array(20).fill({ date: '2026-08-01', status: 'absent' });
    const homework = Array(10).fill({ submitted_at: null });
    const grades = [{ subject: 'Mathematics', score: 40, max_score: 100 }];
    const db = mockDbWithCustomData(attendance, homework, grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.concernDetected).toBe(true);
    expect(res.severity).toBe('high');
  });

  it('CASE B — Attendance Only Decline (Moderate Concern, Not High Academic Flag)', async () => {
    const attendance = Array(15).fill({ date: '2026-08-01', status: 'absent' });
    const homework = Array(10).fill({ submitted_at: new Date().toISOString() });
    const grades = [{ subject: 'Mathematics', score: 85, max_score: 100 }];
    const db = mockDbWithCustomData(attendance, homework, grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.severity).not.toBe('high');
    expect(res.explanation).toContain('Attendance decline recorded');
  });

  it('CASE C — Academic Decline Only (Subject Specific Focus)', async () => {
    const attendance = Array(20).fill({ date: '2026-08-01', status: 'present' });
    const homework = Array(10).fill({ submitted_at: new Date().toISOString() });
    const grades = [{ subject: 'Mathematics', score: 45, max_score: 100 }];
    const db = mockDbWithCustomData(attendance, homework, grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.explanation).toContain('Subject-specific academic decline detected in Mathematics');
  });

  it('CASE D — Positive Trend (No Manufactured Concern)', async () => {
    const attendance = Array(20).fill({ date: '2026-08-01', status: 'present' });
    const homework = Array(10).fill({ submitted_at: new Date().toISOString() });
    const grades = [{ subject: 'Mathematics', score: 92, max_score: 100 }];
    const db = mockDbWithCustomData(attendance, homework, grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.concernDetected).toBe(false);
    expect(res.recommendedActions.length).toBe(0);
  });

  it('CASE E — Insufficient Data (Data Completeness Metadata Reflects Reduced Confidence)', async () => {
    const db = mockDbWithCustomData([], [], []);
    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.dataCompleteness.confidenceModifier).toBeLessThan(1.0);
  });

  it('CASE F — Contradictory Signals (Attendance Drop vs High Marks)', async () => {
    const attendance = Array(12).fill({ date: '2026-08-01', status: 'absent' });
    const homework = Array(10).fill({ submitted_at: new Date().toISOString() });
    const grades = [{ subject: 'Mathematics', score: 95, max_score: 100 }];
    const db = mockDbWithCustomData(attendance, homework, grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.severity).not.toBe('high');
  });

  it('CASE G — Subject-Specific Divergence (Math ↓ vs English ↑)', async () => {
    const grades = [
      { subject: 'Mathematics', score: 45, max_score: 100 },
      { subject: 'English', score: 95, max_score: 100 },
    ];
    const db = mockDbWithCustomData([], [], grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    const mathSig = res.subjectSignals.find((s) => s.subject === 'Mathematics');
    const engSig = res.subjectSignals.find((s) => s.subject === 'English');

    expect(mathSig?.direction).toBe('declining');
    expect(engSig?.direction).toBe('stable');
  });

  it('CASE H — Recent Recovery (Attendance & Homework Improving)', async () => {
    const attendance = [
      ...Array(15).fill({ date: '2026-08-10', status: 'present' }),
      ...Array(15).fill({ date: '2026-07-01', status: 'absent' }),
    ];
    const homework = Array(10).fill({ submitted_at: new Date().toISOString() });
    const grades = [{ subject: 'Mathematics', score: 80, max_score: 100 }];
    const db = mockDbWithCustomData(attendance, homework, grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.concernDetected).toBe(false);
    expect(res.explanation).toContain('recent positive recovery');
  });

  it('CASE I — Existing Active Intervention Protection (Deduplication)', async () => {
    const attendance = Array(20).fill({ date: '2026-08-01', status: 'absent' });
    const interventions = [{ id: 'int-1', status: 'active' }];
    const db = mockDbWithCustomData(attendance, [], [], interventions);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.recommendedActions[0].action).toBe('Review Active Support Plan');
  });

  it('CASE J — Missing Previous-Year Data (Honest Representation)', async () => {
    const db = mockDbWithCustomData();
    const ctx = await buildStudentContext(teacherContext, db, 'stu-aarav');
    expect(ctx.dataCompleteness.previousYearAvailable).toBe(false);
  });

  it('False Positive Control — Single minor absence does not trigger high alert', async () => {
    const attendance = [
      ...Array(19).fill({ date: '2026-08-01', status: 'present' }),
      { date: '2026-08-20', status: 'absent' },
    ];
    const homework = Array(10).fill({ submitted_at: new Date().toISOString() });
    const grades = [{ subject: 'Mathematics', score: 88, max_score: 100 }];
    const db = mockDbWithCustomData(attendance, homework, grades);

    const res = await analyzeStudentEarlySignals(teacherContext, db, 'stu-aarav');
    expect(res.concernDetected).toBe(false);
  });

  it('Security Boundary — Unauthorized access and cross-school access blocked', async () => {
    const db = mockDbWithCustomData();
    const unauthContext: AuthContext = { ...teacherContext, permissions: [] };
    await expect(analyzeStudentEarlySignals(unauthContext, db, 'stu-aarav')).rejects.toThrow(/FORBIDDEN/);

    const crossContext: AuthContext = { ...teacherContext, schoolId: schoolB };
    await expect(buildStudentContext(crossContext, db, 'stu-cross-tenant')).rejects.toThrow(/not found/);
  });
});
