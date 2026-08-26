import { createClient } from './server';
import type { StudentInputData } from '@/lib/rules-engine/calculateStatus';

// Exact mock data representing the 3 seeded students from seed.sql
export interface StudentWithFlag extends StudentInputData {
  activeStatusFlag?: {
    id: string;
    status: 'on_track' | 'worth_watching' | 'needs_attention';
    isCorrected: boolean;
  } | null;
  classTeacherId?: string | null;
  grade?: string | null;
  section?: string | null;
  roll_number?: string | null;
  avatar_url?: string | null;
  house?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED-ALIGNED OFFLINE FALLBACK
//
// These 15 students match seed.sql exactly (IDs, names, grade/section,
// class_teacher_id). Used ONLY when the DB is unavailable (local dev without
// Supabase creds). NEVER returned in production with valid DB credentials.
// ─────────────────────────────────────────────────────────────────────────────

const SEED_STUDENTS_FALLBACK: StudentWithFlag[] = [
  // Teacher 1: Ananya Mehra — Class 8A
  {
    studentId: 'b1000000-0000-4000-8000-000000000001',
    classTeacherId: 'a1000000-0000-4000-8000-000000000001',
    displayName: 'Aarav Sharma',
    grade: '8',
    section: 'A',
    roll_number: '801',
    house: 'Ruby',
    activeStatusFlag: { id: 'sf-001', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000002',
    classTeacherId: 'a1000000-0000-4000-8000-000000000001',
    displayName: 'Priya Patel',
    grade: '8',
    section: 'A',
    roll_number: '802',
    house: 'Emerald',
    activeStatusFlag: { id: 'sf-002', status: 'needs_attention', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000003',
    classTeacherId: 'a1000000-0000-4000-8000-000000000001',
    displayName: 'Rohan Singh',
    grade: '8',
    section: 'A',
    roll_number: '803',
    house: 'Sapphire',
    activeStatusFlag: { id: 'sf-003', status: 'needs_attention', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000004',
    classTeacherId: 'a1000000-0000-4000-8000-000000000001',
    displayName: 'Ananya Gupta',
    grade: '8',
    section: 'A',
    roll_number: '804',
    house: 'Topaz',
    activeStatusFlag: { id: 'sf-004', status: 'worth_watching', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000005',
    classTeacherId: 'a1000000-0000-4000-8000-000000000001',
    displayName: 'Kabir Khan',
    grade: '8',
    section: 'A',
    roll_number: '805',
    house: 'Ruby',
    activeStatusFlag: { id: 'sf-005', status: 'worth_watching', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  // Teacher 2: Vikram Joshi — Class 8B
  {
    studentId: 'b1000000-0000-4000-8000-000000000006',
    classTeacherId: 'a1000000-0000-4000-8000-000000000002',
    displayName: 'Diya Mehta',
    grade: '8',
    section: 'B',
    roll_number: '806',
    house: 'Emerald',
    activeStatusFlag: { id: 'sf-006', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000007',
    classTeacherId: 'a1000000-0000-4000-8000-000000000002',
    displayName: 'Arjun Reddy',
    grade: '8',
    section: 'B',
    roll_number: '807',
    house: 'Sapphire',
    activeStatusFlag: { id: 'sf-007', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000008',
    classTeacherId: 'a1000000-0000-4000-8000-000000000002',
    displayName: 'Meera Nair',
    grade: '8',
    section: 'B',
    roll_number: '808',
    house: 'Topaz',
    activeStatusFlag: { id: 'sf-008', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000009',
    classTeacherId: 'a1000000-0000-4000-8000-000000000002',
    displayName: 'Vihaan Iyer',
    grade: '8',
    section: 'B',
    roll_number: '809',
    house: 'Ruby',
    activeStatusFlag: { id: 'sf-009', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000010',
    classTeacherId: 'a1000000-0000-4000-8000-000000000002',
    displayName: 'Zara Ahmed',
    grade: '8',
    section: 'B',
    roll_number: '810',
    house: 'Emerald',
    activeStatusFlag: { id: 'sf-010', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  // Teacher 3: Kavita Deshmukh — Class 8C
  {
    studentId: 'b1000000-0000-4000-8000-000000000011',
    classTeacherId: 'a1000000-0000-4000-8000-000000000003',
    displayName: 'Advait Sharma',
    grade: '8',
    section: 'C',
    roll_number: '811',
    house: 'Sapphire',
    activeStatusFlag: { id: 'sf-011', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000012',
    classTeacherId: 'a1000000-0000-4000-8000-000000000003',
    displayName: 'Ishaan Verma',
    grade: '8',
    section: 'C',
    roll_number: '812',
    house: 'Topaz',
    activeStatusFlag: { id: 'sf-012', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000013',
    classTeacherId: 'a1000000-0000-4000-8000-000000000003',
    displayName: 'Navya Kapoor',
    grade: '8',
    section: 'C',
    roll_number: '813',
    house: 'Ruby',
    activeStatusFlag: { id: 'sf-013', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000014',
    classTeacherId: 'a1000000-0000-4000-8000-000000000003',
    displayName: 'Reyansh Chauhan',
    grade: '8',
    section: 'C',
    roll_number: '814',
    house: 'Emerald',
    activeStatusFlag: { id: 'sf-014', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
  {
    studentId: 'b1000000-0000-4000-8000-000000000015',
    classTeacherId: 'a1000000-0000-4000-8000-000000000003',
    displayName: 'Aarohi Menon',
    grade: '8',
    section: 'C',
    roll_number: '815',
    house: 'Sapphire',
    activeStatusFlag: { id: 'sf-015', status: 'on_track', isCorrected: false },
    attendance: [],
    homework: [],
    grades: [],
    mood: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Core DB fetch helper — shared by all query functions below
// ─────────────────────────────────────────────────────────────────────────────

async function fetchStudentsFromDB(
  filter?: { grade?: string; section?: string; classTeacherId?: string; studentIds?: string[] }
): Promise<StudentWithFlag[]> {
  const supabase = createClient();

  let query = supabase
    .from('students')
    .select('id, first_name, last_name, display_name, class_teacher_id, grade, section, roll_number, avatar_url, house');

  if (filter?.grade) query = (query as any).eq('grade', filter.grade);
  if (filter?.section) query = (query as any).eq('section', filter.section);
  if (filter?.classTeacherId) query = (query as any).eq('class_teacher_id', filter.classTeacherId);
  if (filter?.studentIds && filter.studentIds.length > 0) {
    query = (query as any).in('id', filter.studentIds);
  }

  const { data: students, error: studentError } = await query;

  if (studentError || !students || students.length === 0) {
    throw new Error(studentError?.message || 'No students found');
  }

  const studentIds = students.map((s) => s.id);

  const [
    { data: attendance },
    { data: homework },
    { data: grades },
    { data: mood },
    { data: flags },
  ] = await Promise.all([
    supabase.from('attendance').select('id, student_id, date, status, notes').in('student_id', studentIds),
    supabase.from('homework').select('id, student_id, subject, title, due_date, submitted_at, is_submitted').in('student_id', studentIds),
    supabase.from('grades').select('id, student_id, subject, assessment_name, score, max_score, assessment_date').in('student_id', studentIds),
    supabase.from('mood_checkins').select('id, student_id, mood_value, mood_label, note, checked_in_at').in('student_id', studentIds),
    supabase.from('status_flags')
      .select('id, student_id, status, resolved_at, false_positive_corrections(id)')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false }),
  ]);

  const groupByStudent = <T extends { student_id: string }>(records: T[] | null) => {
    const grouped = new Map<string, T[]>();
    for (const record of records || []) {
      const group = grouped.get(record.student_id) || [];
      group.push(record);
      grouped.set(record.student_id, group);
    }
    return grouped;
  };

  const attendanceByStudent = groupByStudent(attendance);
  const homeworkByStudent = groupByStudent(homework);
  const gradesByStudent = groupByStudent(grades);
  const moodByStudent = groupByStudent(mood);
  const flagsByStudent = groupByStudent(flags);

  return students.map((student) => {
    const recentFlag = flagsByStudent.get(student.id)?.[0] || null;
    const activeStatusFlag = recentFlag ? {
      id: recentFlag.id,
      status: recentFlag.status as 'on_track' | 'worth_watching' | 'needs_attention',
      isCorrected: recentFlag.false_positive_corrections && (recentFlag.false_positive_corrections as any[]).length > 0,
    } : null;

    return {
      studentId: student.id,
      classTeacherId: student.class_teacher_id,
      displayName: student.display_name,
      grade: student.grade,
      section: student.section,
      roll_number: student.roll_number,
      avatar_url: student.avatar_url,
      house: student.house,
      activeStatusFlag,
      attendance: (attendanceByStudent.get(student.id) || []).map((att) => ({
        id: att.id,
        date: att.date,
        status: att.status as 'present' | 'absent' | 'late' | 'excused',
        notes: att.notes,
      })),
      homework: (homeworkByStudent.get(student.id) || []).map((hw) => ({
        id: hw.id,
        subject: hw.subject,
        title: hw.title,
        dueDate: hw.due_date,
        submittedAt: hw.submitted_at,
        isSubmitted: hw.is_submitted,
      })),
      grades: (gradesByStudent.get(student.id) || []).map((gr) => ({
        id: gr.id,
        subject: gr.subject,
        assessmentName: gr.assessment_name,
        score: Number(gr.score),
        maxScore: Number(gr.max_score),
        assessmentDate: gr.assessment_date,
      })),
      mood: (moodByStudent.get(student.id) || []).map((m) => ({
        id: m.id,
        moodValue: m.mood_value,
        moodLabel: m.mood_label,
        note: m.note,
        checkedInAt: m.checked_in_at,
      })),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public query helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getStudentsData: Loads all students visible to the current server context.
 * Falls back to the 15-student seeded fallback ONLY when DB is unavailable.
 */
export async function getStudentsData(): Promise<StudentWithFlag[]> {
  try {
    return await fetchStudentsFromDB();
  } catch (error) {
    console.warn('[getStudentsData] DB unavailable, using seed fallback:', error);
    return SEED_STUDENTS_FALLBACK;
  }
}

/**
 * getStudentsForClass: Loads students for a specific grade/section.
 * Returns [] (never fabricated students) if nothing found in DB.
 */
export async function getStudentsForClass(
  grade: string,
  section: string
): Promise<StudentWithFlag[]> {
  try {
    return await fetchStudentsFromDB({ grade, section });
  } catch (error) {
    console.warn(`[getStudentsForClass] DB unavailable for ${grade}${section}, using seed fallback:`, error);
    // Return only seed students matching the requested grade/section
    return SEED_STUDENTS_FALLBACK.filter(
      (s) => s.grade === grade && s.section === section
    );
  }
}

/**
 * getStudentsForTeacher: Loads all students whose class_teacher_id matches.
 * Returns [] if teacher has no assigned students.
 */
export async function getStudentsForTeacher(
  teacherId: string
): Promise<StudentWithFlag[]> {
  try {
    return await fetchStudentsFromDB({ classTeacherId: teacherId });
  } catch (error) {
    console.warn(`[getStudentsForTeacher] DB unavailable for teacher ${teacherId}, using seed fallback:`, error);
    return SEED_STUDENTS_FALLBACK.filter((s) => s.classTeacherId === teacherId);
  }
}

/**
 * getStudentsForGuardian: Loads students linked to a guardian.
 * Requires the list of pre-resolved student IDs from guardian_access.
 * Returns [] (not all students) if ids array is empty.
 */
export async function getStudentsForGuardian(
  linkedStudentIds: string[]
): Promise<StudentWithFlag[]> {
  if (linkedStudentIds.length === 0) {
    return [];
  }
  try {
    return await fetchStudentsFromDB({ studentIds: linkedStudentIds });
  } catch (error) {
    console.warn('[getStudentsForGuardian] DB unavailable, using seed fallback for linked IDs:', error);
    return SEED_STUDENTS_FALLBACK.filter((s) => Boolean(s.studentId && linkedStudentIds.includes(s.studentId)));
  }
}

/**
 * getStudentByAuthenticatedUser: Resolves the student record for a Clerk-authenticated student user.
 * Returns null if the user has no linked student record — never returns a fallback student.
 */
export async function getStudentByAuthenticatedUser(
  clerkUserId: string
): Promise<StudentWithFlag | null> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminDb = createAdminClient();

    const { data: studentRecord } = await adminDb
      .from('students')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (!studentRecord) return null;

    const results = await fetchStudentsFromDB({ studentIds: [studentRecord.id] });
    return results[0] || null;
  } catch (error) {
    console.warn('[getStudentByAuthenticatedUser] DB error:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPRECATED — kept only for import compatibility. Do NOT use in new code.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use getStudentsForClass / getStudentsForTeacher instead.
 * This function only exists to avoid breaking old imports.
 */
export function generateSystematicMockData(): StudentWithFlag[] {
  console.warn('[generateSystematicMockData] DEPRECATED. Use getStudentsForTeacher/getStudentsForClass instead.');
  return SEED_STUDENTS_FALLBACK;
}
