import { AuthContext, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { ScopedSupabaseClient } from '@/lib/supabase/scoped';

export interface SubjectTrend {
  readonly subject: string;
  readonly percentage: number;
  readonly trendDirection: 'declining' | 'stable' | 'improving';
  readonly assessmentCount: number;
}

export interface LongitudinalStudentContext {
  readonly studentId: string;
  readonly schoolId: string;
  readonly grade: string;
  readonly section: string | null;
  readonly attendanceMetrics: {
    readonly totalDays: number;
    readonly presentDays: number;
    readonly absentDays: number;
    readonly attendancePercentage: number;
    readonly trendDirection: 'declining' | 'stable' | 'improving';
    readonly recent30DayPercentage: number;
  };
  readonly homeworkMetrics: {
    readonly assigned: number;
    readonly submitted: number;
    readonly missing: number;
    readonly completionRate: number;
    readonly trendDirection: 'declining' | 'stable' | 'improving';
  };
  readonly academicMetrics: {
    readonly overallAveragePercentage: number;
    readonly subjectTrends: ReadonlyArray<SubjectTrend>;
  };
  readonly recentObservations: ReadonlyArray<{
    readonly category: string;
    readonly note: string;
  }>;
  readonly activeInterventionCount: number;
  readonly completedInterventionCount: number;
  readonly dataCompleteness: {
    readonly attendanceAvailable: boolean;
    readonly attendanceRecordCount: number;
    readonly homeworkAvailable: boolean;
    readonly homeworkRecordCount: number;
    readonly academicAvailable: boolean;
    readonly assessmentCount: number;
    readonly previousYearAvailable: boolean;
    readonly confidenceModifier: number;
  };
}

export async function buildStudentContext(
  authContext: AuthContext,
  scopedDb: ScopedSupabaseClient,
  studentId: string
): Promise<LongitudinalStudentContext> {
  // 1. Enforce Parent -> Child / Teacher -> Class boundary
  validateParentStudentAccess(authContext, studentId);

  // 2. Query Student metadata (excluding student name to protect PII in LLM context)
  const { data: student, error: studentError } = await scopedDb
    .from('students')
    .select('id, grade, section, school_id')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    throw new Error(`Student ${studentId} not found in active school tenant`);
  }

  // 3. Fetch Longitudinal Attendance Logs (ordered by date)
  const { data: attendance } = await scopedDb
    .from('attendance')
    .select('date, status')
    .eq('student_id', studentId)
    .order('date', { ascending: false });

  const attendanceRecords = attendance || [];
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((a: any) => a.status === 'present').length;
  const absentDays = attendanceRecords.filter((a: any) => a.status === 'absent').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Calculate 30-day attendance trend vs older records
  const recent30Days = attendanceRecords.slice(0, 15);
  const olderDays = attendanceRecords.slice(15, 30);

  const recent30Rate = recent30Days.length > 0
    ? Math.round((recent30Days.filter((a: any) => a.status === 'present').length / recent30Days.length) * 100)
    : attendancePercentage;

  const olderRate = olderDays.length > 0
    ? Math.round((olderDays.filter((a: any) => a.status === 'present').length / olderDays.length) * 100)
    : recent30Rate;

  let attendanceTrend: 'declining' | 'stable' | 'improving' = 'stable';
  if (recent30Rate < olderRate - 5) {
    attendanceTrend = 'declining';
  } else if (recent30Rate > olderRate + 5) {
    attendanceTrend = 'improving';
  }

  // 4. Fetch Homework Submissions
  const { data: homework } = await scopedDb
    .from('homework_submissions')
    .select('submitted_at, homework_id')
    .eq('student_id', studentId);

  const homeworkRecords = homework || [];
  const assigned = homeworkRecords.length;
  const submitted = homeworkRecords.filter((h: any) => h.submitted_at !== null).length;
  const missing = assigned - submitted;
  const completionRate = assigned > 0 ? Math.round((submitted / assigned) * 100) : 100;

  let homeworkTrend: 'declining' | 'stable' | 'improving' = 'stable';
  if (completionRate < 70) {
    homeworkTrend = 'declining';
  } else if (completionRate > 90) {
    homeworkTrend = 'improving';
  }

  // 5. Fetch Exam Marks & Subject-Specific Performance
  const { data: grades } = await scopedDb
    .from('grades')
    .select('subject, score, max_score')
    .eq('student_id', studentId);

  const gradeRecords = grades || [];
  const subjectMap = new Map<string, number[]>();

  gradeRecords.forEach((g: any) => {
    const sub = g.subject || 'General';
    const pct = g.max_score > 0 ? Math.round((g.score / g.max_score) * 100) : 0;
    const list = subjectMap.get(sub) || [];
    list.push(pct);
    subjectMap.set(sub, list);
  });

  const subjectTrends: SubjectTrend[] = Array.from(subjectMap.entries()).map(([sub, scores]) => {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    let direction: 'declining' | 'stable' | 'improving' = 'stable';
    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const avg1 = Math.round(firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length);
      const avg2 = Math.round(secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length);
      if (avg2 < avg1 - 5) direction = 'declining';
      else if (avg2 > avg1 + 5) direction = 'improving';
    } else if (avg < 60) {
      direction = 'declining';
    }
    return {
      subject: sub,
      percentage: avg,
      trendDirection: direction,
      assessmentCount: scores.length,
    };
  });

  const overallAvg = subjectTrends.length > 0
    ? Math.round(subjectTrends.reduce((sum, s) => sum + s.percentage, 0) / subjectTrends.length)
    : 85;

  // 6. Fetch Active & Completed Interventions
  const { data: interventions } = await scopedDb
    .from('interventions')
    .select('id, status')
    .eq('student_id', studentId);

  const activeInterventionCount = (interventions || []).filter((i: any) => i.status === 'active').length;
  const completedInterventionCount = (interventions || []).filter((i: any) => i.status === 'completed').length;

  // Calculate Data Completeness Modifier
  const attendanceAvailable = totalDays > 0;
  const homeworkAvailable = assigned > 0;
  const academicAvailable = gradeRecords.length > 0;

  let completenessCount = 0;
  if (attendanceAvailable) completenessCount++;
  if (homeworkAvailable) completenessCount++;
  if (academicAvailable) completenessCount++;

  const confidenceModifier = completenessCount > 0 ? Math.round((completenessCount / 3) * 100) / 100 : 0.5;

  const studentData = student as any;

  return {
    studentId: studentData.id,
    schoolId: studentData.school_id,
    grade: studentData.grade,
    section: studentData.section,
    attendanceMetrics: {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage,
      trendDirection: attendanceTrend,
      recent30DayPercentage: recent30Rate,
    },
    homeworkMetrics: {
      assigned,
      submitted,
      missing,
      completionRate,
      trendDirection: homeworkTrend,
    },
    academicMetrics: {
      overallAveragePercentage: overallAvg,
      subjectTrends: Object.freeze(subjectTrends),
    },
    recentObservations: [],
    activeInterventionCount,
    completedInterventionCount,
    dataCompleteness: {
      attendanceAvailable,
      attendanceRecordCount: totalDays,
      homeworkAvailable,
      homeworkRecordCount: assigned,
      academicAvailable,
      assessmentCount: gradeRecords.length,
      previousYearAvailable: false,
      confidenceModifier,
    },
  };
}
