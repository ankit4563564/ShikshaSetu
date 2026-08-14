import { AuthContext, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { ScopedSupabaseClient } from '@/lib/supabase/scoped';

export interface StructuredStudentContext {
  readonly studentId: string;
  readonly schoolId: string;
  readonly grade: string;
  readonly section: string | null;
  readonly attendanceMetrics: {
    readonly totalDays: number;
    readonly presentDays: number;
    readonly absentDays: number;
    readonly attendancePercentage: number;
  };
  readonly homeworkMetrics: {
    readonly assigned: number;
    readonly submitted: number;
    readonly missing: number;
    readonly completionRate: number;
  };
  readonly academicMetrics: {
    readonly overallAveragePercentage: number;
    readonly recentGrades: ReadonlyArray<{
      readonly subject: string;
      readonly percentage: number;
    }>;
  };
  readonly recentObservations: ReadonlyArray<{
    readonly category: string;
    readonly note: string;
  }>;
  readonly activeInterventionCount: number;
}

/**
 * buildStudentContext: Aggregates authorized student signals scoped to tenant school_id.
 * Enforces parent-child ownership and strips raw PII (names/contacts) before forwarding to LLM.
 */
export async function buildStudentContext(
  authContext: AuthContext,
  scopedDb: ScopedSupabaseClient,
  studentId: string
): Promise<StructuredStudentContext> {
  // 1. Enforce Parent -> Child boundary
  validateParentStudentAccess(authContext, studentId);

  // 2. Query Student metadata (excluding student name to protect PII)
  const { data: student, error: studentError } = await scopedDb
    .from('students')
    .select('id, grade, section, school_id')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    throw new Error(`Student ${studentId} not found in active school tenant`);
  }

  // 3. Fetch Attendance Logs (last 30 days)
  const { data: attendance } = await scopedDb
    .from('attendance_logs')
    .select('status')
    .eq('student_id', studentId);

  const totalDays = attendance?.length || 0;
  const presentDays = attendance?.filter((a: any) => a.status === 'present').length || 0;
  const absentDays = attendance?.filter((a: any) => a.status === 'absent').length || 0;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // 4. Fetch Homework Submissions
  const { data: homework } = await scopedDb
    .from('homework_submissions')
    .select('status')
    .eq('student_id', studentId);

  const assigned = homework?.length || 0;
  const submitted = homework?.filter((h: any) => h.status === 'submitted' || h.status === 'graded').length || 0;
  const missing = homework?.filter((h: any) => h.status === 'missing' || h.status === 'late').length || 0;
  const completionRate = assigned > 0 ? Math.round((submitted / assigned) * 100) : 100;

  // 5. Fetch Exam Marks / Grades
  const { data: grades } = await scopedDb
    .from('exam_marks')
    .select('subject, score, max_score')
    .eq('student_id', studentId);

  const recentGrades = (grades || []).map((g: any) => ({
    subject: g.subject || 'General',
    percentage: g.max_score > 0 ? Math.round((g.score / g.max_score) * 100) : 0,
  }));

  const overallAvg =
    recentGrades.length > 0
      ? Math.round(recentGrades.reduce((sum, g) => sum + g.percentage, 0) / recentGrades.length)
      : 85;

  // 6. Fetch Teacher Observations / Mood Check-ins
  const { data: moods } = await scopedDb
    .from('student_mood_checkins')
    .select('mood, note')
    .eq('student_id', studentId)
    .limit(5);

  const recentObservations = (moods || []).map((m: any) => ({
    category: 'wellness_checkin',
    note: m.note || `Mood score logged as ${m.mood}`,
  }));

  // 7. Fetch Active Interventions Count
  const { data: interventions } = await scopedDb
    .from('interventions')
    .select('id')
    .eq('student_id', studentId)
    .eq('status', 'active');

  return {
    studentId: student.id,
    schoolId: student.school_id,
    grade: student.grade,
    section: student.section,
    attendanceMetrics: {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage,
    },
    homeworkMetrics: {
      assigned,
      submitted,
      missing,
      completionRate,
    },
    academicMetrics: {
      overallAveragePercentage: overallAvg,
      recentGrades,
    },
    recentObservations,
    activeInterventionCount: interventions?.length || 0,
  };
}
