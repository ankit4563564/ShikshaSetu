import { AuthContext, requirePermission, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { ScopedSupabaseClient } from '@/lib/supabase/scoped';
import { buildStudentContext } from '@/lib/intelligence/context/buildStudentContext';
import { analyzeStudentEarlySignals } from '@/lib/intelligence/services/analyzeStudentSignals';

export interface Student360Data {
  readonly studentId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly grade: string;
  readonly section: string | null;
  readonly avatarUrl: string | null;
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
  readonly observations: ReadonlyArray<{
    readonly id: string;
    readonly category: string;
    readonly note: string;
    readonly createdAt: string;
  }>;
  readonly interventions: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly status: string;
    readonly createdAt: string;
  }>;
  readonly signalAnalysis: {
    readonly concernDetected: boolean;
    readonly severity: 'low' | 'medium' | 'high';
    readonly confidenceScore: number;
    readonly explanation: string;
    readonly signals: ReadonlyArray<{
      readonly source: string;
      readonly metric: string;
      readonly value: string;
      readonly direction: string;
      readonly evidenceText: string;
    }>;
    readonly recommendedActions: ReadonlyArray<{
      readonly action: string;
      readonly category: string;
      readonly rationale: string;
      readonly priority: string;
    }>;
  };
}

/**
 * getStudent360Data: Server-side aggregation service building authorized Student 360 view.
 * Enforces school_id tenant isolation and role permissions.
 */
export async function getStudent360Data(
  authContext: AuthContext,
  scopedDb: ScopedSupabaseClient,
  studentId: string
): Promise<Student360Data> {
  // 1. Enforce permission checks
  requirePermission(authContext, 'students:read_class');
  validateParentStudentAccess(authContext, studentId);

  // 2. Fetch basic Student details
  const { data: student, error: studentError } = await scopedDb
    .from('students')
    .select('id, first_name, last_name, display_name, grade, section, avatar_url')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    throw new Error(`Student ${studentId} not found in active tenant school`);
  }

  // 3. Build aggregated signals context
  const context = await buildStudentContext(authContext, scopedDb, studentId);

  // 4. Run Signal Intelligence Engine
  const signalAnalysis = await analyzeStudentEarlySignals(authContext, scopedDb, studentId);

  // 5. Fetch teacher observations (mood checkins / notes)
  const { data: moods } = await scopedDb
    .from('student_mood_checkins')
    .select('id, mood, note, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(10);

  const observations = (moods || []).map((m: any) => ({
    id: m.id,
    category: 'wellness_checkin',
    note: m.note || `Logged mood rating ${m.mood}`,
    createdAt: m.created_at || new Date().toISOString(),
  }));

  // 6. Fetch Interventions History
  const { data: interventionsData } = await scopedDb
    .from('interventions')
    .select('id, title, description, status, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  const interventions = (interventionsData || []).map((i: any) => ({
    id: i.id,
    title: i.title,
    description: i.description || 'Support plan intervention',
    status: i.status || 'active',
    createdAt: i.created_at || new Date().toISOString(),
  }));

  return {
    studentId: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    displayName: student.display_name,
    grade: student.grade,
    section: student.section,
    avatarUrl: student.avatar_url,
    attendanceMetrics: context.attendanceMetrics,
    homeworkMetrics: context.homeworkMetrics,
    academicMetrics: context.academicMetrics,
    observations: Object.freeze(observations),
    interventions: Object.freeze(interventions),
    signalAnalysis,
  };
}
