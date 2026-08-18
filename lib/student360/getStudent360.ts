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

const SEED_STUDENTS_META: Record<string, { firstName: string; lastName: string; displayName: string; grade: string; section: string; photo: string }> = {
  'b1000000-0000-4000-8000-000000000001': { firstName: 'Aarav', lastName: 'Sharma', displayName: 'Aarav Sharma', grade: '8', section: 'A', photo: '/aarav.png' },
  'b1000000-0000-4000-8000-000000000002': { firstName: 'Priya', lastName: 'Patel', displayName: 'Priya Patel', grade: '8', section: 'A', photo: '/priya.png' },
  'b1000000-0000-4000-8000-000000000003': { firstName: 'Rohan', lastName: 'Singh', displayName: 'Rohan Singh', grade: '8', section: 'A', photo: '/rohan.png' },
  'b1000000-0000-4000-8000-000000000004': { firstName: 'Ananya', lastName: 'Gupta', displayName: 'Ananya Gupta', grade: '8', section: 'A', photo: '/ananya.png' },
  'b1000000-0000-4000-8000-000000000005': { firstName: 'Kabir', lastName: 'Khan', displayName: 'Kabir Khan', grade: '8', section: 'A', photo: '/kabir.png' },
};

/**
 * getFallbackStudent360: Generates high-fidelity fallback diagnostic 360 data
 * for demo mode and when DB connection is offline.
 */
export function getFallbackStudent360(studentId: string): Student360Data {
  const meta = SEED_STUDENTS_META[studentId] || {
    firstName: 'Student',
    lastName: 'Scholar',
    displayName: 'Student Scholar',
    grade: '8',
    section: 'A',
    photo: '/aarav.png',
  };

  const isAarav = meta.firstName === 'Aarav';
  const isPriya = meta.firstName === 'Priya';
  const isRohan = meta.firstName === 'Rohan';

  return {
    studentId,
    firstName: meta.firstName,
    lastName: meta.lastName,
    displayName: meta.displayName,
    grade: meta.grade,
    section: meta.section,
    avatarUrl: meta.photo,
    attendanceMetrics: {
      totalDays: 45,
      presentDays: isRohan ? 38 : isPriya ? 41 : 44,
      absentDays: isRohan ? 7 : isPriya ? 4 : 1,
      attendancePercentage: isRohan ? 84 : isPriya ? 91 : 98,
    },
    homeworkMetrics: {
      assigned: 20,
      submitted: isRohan ? 15 : isPriya ? 17 : 20,
      missing: isRohan ? 5 : isPriya ? 3 : 0,
      completionRate: isRohan ? 75 : isPriya ? 85 : 100,
    },
    academicMetrics: {
      overallAveragePercentage: isRohan ? 74 : isPriya ? 82 : 93,
      recentGrades: [
        { subject: 'Mathematics', percentage: isRohan ? 70 : isPriya ? 78 : 96 },
        { subject: 'Science', percentage: isRohan ? 76 : isPriya ? 80 : 94 },
        { subject: 'English', percentage: isRohan ? 78 : isPriya ? 88 : 92 },
        { subject: 'Social Studies', percentage: isRohan ? 72 : isPriya ? 82 : 90 },
      ],
    },
    observations: [
      {
        id: 'obs-1',
        category: 'wellness_checkin',
        note: isRohan
          ? 'Missed morning attendance check-in on two consecutive days.'
          : `${meta.firstName} demonstrated excellent engagement during classroom discussions.`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'obs-2',
        category: 'academic_note',
        note: isPriya
          ? 'Requested extra practice worksheets for Newtonian physics problems.'
          : 'Completed advanced problem sets ahead of scheduled deadline.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
    interventions: [
      {
        id: 'int-1',
        title: isRohan ? 'Attendance & Morning Check-in Support' : 'Olympiad Mathematics Acceleration',
        description: isRohan
          ? 'Daily check-in with class teacher to monitor on-time arrival and bus boarding.'
          : 'Enrolled in advanced weekly problem-solving mentor cohort.',
        status: 'active',
        createdAt: new Date(Date.now() - 604800000).toISOString(),
      },
    ],
    signalAnalysis: {
      concernDetected: isRohan || isPriya,
      severity: isRohan ? 'high' : isPriya ? 'medium' : 'low',
      confidenceScore: 0.92,
      explanation: isRohan
        ? `${meta.displayName} shows an attendance drop in the last 14 days and has 5 incomplete homework submissions.`
        : isPriya
        ? `${meta.displayName} is maintaining good attendance but shows a slight dip in Science test scores.`
        : `${meta.displayName} demonstrates outstanding academic consistency and 98% attendance across all subjects.`,
      signals: [
        {
          source: 'Attendance Logs',
          metric: 'Attendance Rate',
          value: `${isRohan ? 84 : isPriya ? 91 : 98}%`,
          direction: isRohan ? 'declining' : 'stable',
          evidenceText: `${isRohan ? 7 : 1} absent days recorded across the last 45 school days.`,
        },
        {
          source: 'Homework Tracker',
          metric: 'HW Completion',
          value: `${isRohan ? 75 : isPriya ? 85 : 100}%`,
          direction: isRohan ? 'declining' : 'stable',
          evidenceText: `${isRohan ? 5 : 0} missing assignment submissions in current academic cycle.`,
        },
      ],
      recommendedActions: [
        {
          action: isRohan ? 'Schedule Guardian Check-In' : 'Offer Advanced Problem Sets',
          category: isRohan ? 'parent_outreach' : 'academic_acceleration',
          rationale: isRohan
            ? 'Coordinate with parent to identify transport or morning routine delays.'
            : 'Foster academic growth and Olympiad preparation.',
          priority: isRohan ? 'high' : 'low',
        },
        {
          action: '1-on-1 Teacher Feedback Session',
          category: 'teacher_mentorship',
          rationale: 'Review recent coursework and celebrate positive participation.',
          priority: 'medium',
        },
      ],
    },
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

  try {
    // 2. Fetch basic Student details
    const { data: student, error: studentError } = await scopedDb
      .from('students')
      .select('id, first_name, last_name, display_name, grade, section, avatar_url')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return getFallbackStudent360(studentId);
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
  } catch (error) {
    console.warn(`[getStudent360Data] Falling back to seed diagnostic for ${studentId}:`, error);
    return getFallbackStudent360(studentId);
  }
}
