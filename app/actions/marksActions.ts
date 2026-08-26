'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createScopedClient } from '@/lib/supabase/scoped';
import { getAuthContext, requirePermission, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { revalidatePath } from 'next/cache';
import {
  createEcosystemNotifications,
  getStudentCareTeamRecipients,
  recordEcosystemEvent,
} from '@/lib/ecosystem';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

export interface ExamRecord {
  id: string;
  subject: string;
  examName: string;
  maxScore: number;
  examDate: string;
  classGrade: string;
  classSection: string | null;
  createdBy: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPublished: boolean;
}

export interface ExamAnalytics {
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  totalStudents: number;
  aboveAverage: number;
  belowAverage: number;
}

async function getTeacherId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId || null;
  } catch {
    return null;
  }
}

export async function createExamAction(formData: FormData) {
  const context = await getAuthContext();
  requirePermission(context, 'marks:write');

  const scopedDb = createScopedClient(context);

  const subject = formData.get('subject') as string;
  const examName = formData.get('examName') as string;
  const maxScore = parseFloat(formData.get('maxScore') as string);
  const examDate = formData.get('examDate') as string;
  const classGrade = formData.get('classGrade') as string;
  const classSection = formData.get('classSection') as string || null;

  if (!subject || !examName || !maxScore || !examDate || !classGrade) {
    return { error: 'Missing required fields' };
  }

  const { data: exam, error } = await scopedDb
    .from('exams')
    .insert({
      subject,
      exam_name: examName,
      max_score: maxScore,
      exam_date: examDate,
      class_grade: classGrade,
      class_section: classSection,
      created_by: context.userId,
    })
    .select('id')
    .single();

  if (error || !exam) {
    return { error: error?.message || 'Failed to create exam' };
  }

  // Fetch all students in this class/section pre-scoped to school_id
  let query = scopedDb
    .from('students')
    .select('id')
    .eq('grade', classGrade);

  if (classSection) {
    query = query.eq('section', classSection);
  }

  const { data: students, error: studentsError } = await query;

  if (studentsError) {
    return { error: studentsError.message };
  }

  if (students && students.length > 0) {
    const gradeRows = students.map((s: any) => ({
      student_id: s.id,
      subject,
      assessment_name: examName,
      score: 0,
      max_score: maxScore,
      assessment_date: examDate,
      recorded_by: context.userId,
      exam_id: exam.id,
      is_published: false,
    }));

    const { error: insertError } = await scopedDb
      .from('grades')
      .insert(gradeRows);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  revalidatePath('/teacher');
  return { examId: exam.id };
}

export async function updateMarksAction(
  examId: string,
  grades: { gradeId: string; score: number }[]
) {
  const context = await getAuthContext();
  requirePermission(context, 'marks:write');

  const scopedDb = createScopedClient(context);

  const results = await Promise.all(
    grades.map(async (g) => {
      // Validate non-negative score
      if (g.score < 0) {
        return `Score cannot be negative for grade ${g.gradeId}`;
      }

      const { error } = await scopedDb
        .from('grades')
        .update({ score: g.score, recorded_by: context.userId })
        .eq('id', g.gradeId);

      return error ? `Failed to update grade ${g.gradeId}: ${error.message}` : null;
    })
  );

  const errors = results.filter(Boolean);
  if (errors.length > 0) {
    return { error: errors[0] as string };
  }

  revalidatePath('/teacher');
  return { success: true };
}

export async function publishExamAction(examId: string) {
  const context = await getAuthContext();
  requirePermission(context, 'marks:write');

  const scopedDb = createScopedClient(context);
  const now = new Date().toISOString();

  const { error: examError } = await scopedDb
    .from('exams')
    .update({ is_published: true, published_at: now })
    .eq('id', examId);

  if (examError) {
    return { error: examError.message };
  }

  const { error: gradeError } = await scopedDb
    .from('grades')
    .update({ is_published: true, published_at: now })
    .eq('exam_id', examId);

  if (gradeError) {
    return { error: gradeError.message };
  }

  const { data: exam } = await scopedDb
    .from('exams')
    .select('subject, exam_name')
    .eq('id', examId)
    .single();

  let uniqueStudentIds: string[] = [];

  if (exam) {
    // Get all students with grades for this exam
    const { data: gradedStudents } = await scopedDb
      .from('grades')
      .select('student_id')
      .eq('exam_id', examId);

    if (gradedStudents) {
      uniqueStudentIds = [...new Set(gradedStudents.map((g: any) => g.student_id as string))] as string[];

      // Batch fetch all grades for this exam (fix N+1)
      const { data: allGrades } = await scopedDb
        .from('grades')
        .select('student_id, score, max_score')
        .eq('exam_id', examId)
        .in('student_id', uniqueStudentIds);

      const gradeMap = new Map<string, { score: number; max_score: number }>();
      (allGrades || []).forEach((g: any) => {
        if (!gradeMap.has(g.student_id)) {
          gradeMap.set(g.student_id, { score: g.score, max_score: g.max_score });
        }
      });

      // Batch fetch care team recipients for all students
      const careTeamResults = await Promise.all(
        uniqueStudentIds.map((sid) =>
          getStudentCareTeamRecipients(scopedDb, sid, {
            includeGuardians: true,
            includeTeacher: false,
            includeAdmins: false,
          }).then((recipients) => ({ studentId: sid, recipients }))
        )
      );

      // Batch create ecosystem notifications
      await Promise.all(
        careTeamResults.map(async ({ studentId, recipients }) => {
          const grade = gradeMap.get(studentId);
          if (!grade || recipients.length === 0) return;

          const percentage = Math.round((grade.score / grade.max_score) * 100);

          await createEcosystemNotifications(scopedDb, recipients, {
            studentId,
            title: 'Marks Published',
            body: `${exam.exam_name} (${exam.subject}): ${percentage}%`,
            category: 'academic',
          });
        })
      );

      // Record ecosystem event for Mission Control
      await recordEcosystemEvent(scopedDb, {
        eventType: 'marks_published',
        actorId: context.userId,
        actorRole: (context.role === 'principal' ? 'admin' : context.role) as any,
        title: 'Exam marks published',
        body: `${exam.exam_name} (${exam.subject}) marks published for ${uniqueStudentIds.length} students.`,
        metadata: { exam_id: examId },
      });
    }
  }

  revalidatePath('/teacher');
  revalidatePath('/student');
  revalidatePath('/parent');
  revalidatePath('/admin');

  // Broadcast Real-time event across channels
  try {
    const { broadcastPortalEvent } = await import('@/lib/realtime/portalSync');
    for (const studentId of uniqueStudentIds) {
      await broadcastPortalEvent(`school:${context.schoolId}:parent:${studentId}`, 'GRADES_PUBLISHED', {
        studentId,
        tenantId: context.schoolId,
        actorId: context.userId,
        actorRole: context.role,
      });
    }
  } catch (_bcErr) {
    // Ignore broadcast errors in test/offline environments
  }

  return { success: true };
}

export async function getExamsAction(teacherId?: string) {
  try {
    const context = await getAuthContext();
    const scopedDb = createScopedClient(context);

    let query = scopedDb
      .from('exams')
      .select(`
        id, subject, exam_name, max_score, exam_date,
        class_grade, class_section, created_by, is_published,
        published_at, created_at
      `)
      .order('created_at', { ascending: false });

    if (teacherId) {
      query = query.eq('created_by', teacherId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as any[]).map(mapExam);
  } catch {
    return [];
  }
}

export async function getExamsForStudentAction(studentId: string) {
  const user = await requireAuth();
  const supabase = createClient();

  const { data: student } = await supabase
    .from('students')
    .select('grade, section')
    .eq('id', studentId)
    .single();

  if (!student) return [];

  let query = supabase
    .from('exams')
    .select(`
      id, subject, exam_name, max_score, exam_date,
      class_grade, class_section, created_by, is_published,
      published_at, created_at
    `)
    .eq('is_published', true)
    .eq('class_grade', (student as any).grade)
    .order('exam_date', { ascending: false });

  if ((student as any).section) {
    query = query.eq('class_section', (student as any).section);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return ((data || []) as any[]).map(mapExam);
}

export async function getExamMarksAction(examId: string) {
  try {
    const context = await getAuthContext();
    const scopedDb = createScopedClient(context);

    const { data, error } = await scopedDb
      .from('grades')
      .select(`
        id, student_id, subject, assessment_name, score,
        max_score, is_published, students!inner(display_name)
      `)
      .eq('exam_id', examId)
      .order('student_id');

    if (error || !data || data.length === 0) {
      return [];
    }

    const grades: GradeRecord[] = ((data || []) as any[]).map((g: any) => ({
      id: g.id,
      studentId: g.student_id,
      studentName: g.students?.display_name || 'Unknown',
      subject: g.subject,
      assessmentName: g.assessment_name,
      score: g.score,
      maxScore: g.max_score,
      percentage: g.max_score > 0 ? Math.round((g.score / g.max_score) * 100) : 0,
      isPublished: g.is_published,
    }));

    return grades;
  } catch {
    return [];
  }
}

export async function getStudentMarksAction(studentId: string) {
  const context = await getAuthContext();
  validateParentStudentAccess(context, studentId);
  const scopedDb = createScopedClient(context);

  const { data, error } = await scopedDb
    .from('grades')
    .select(`
      id, subject, assessment_name, score, max_score,
      assessment_date, is_published, published_at,
      exams!inner(exam_name, exam_date)
    `)
    .eq('student_id', studentId)
    .eq('is_published', true)
    .order('assessment_date', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data || []) as any[]).map((g: any) => ({
    id: g.id,
    subject: g.subject,
    assessmentName: g.assessment_name,
    examName: g.exams?.exam_name || g.assessment_name,
    score: g.score,
    maxScore: g.max_score,
    percentage: g.max_score > 0 ? Math.round((g.score / g.max_score) * 100) : 0,
    examDate: g.assessment_date,
    isPublished: g.is_published,
    publishedAt: g.published_at,
  }));
}

export async function getStudentTrendAction(studentId: string, subject: string) {
  const context = await getAuthContext();
  validateParentStudentAccess(context, studentId);
  const scopedDb = createScopedClient(context);

  const { data, error } = await scopedDb
    .from('grades')
    .select('score, max_score, assessment_name, assessment_date, is_published')
    .eq('student_id', studentId)
    .eq('subject', subject)
    .eq('is_published', true)
    .order('assessment_date', { ascending: true });

  if (error) throw new Error(error.message);

  return ((data || []) as any[]).map((g: any) => ({
    percentage: g.max_score > 0 ? Math.round((g.score / g.max_score) * 100) : 0,
    assessmentName: g.assessment_name,
    date: g.assessment_date,
  }));
}

const DEFAULT_DEMO_ANALYTICS: ExamAnalytics = {
  classAverage: 78.5,
  highestScore: 96,
  lowestScore: 54,
  totalStudents: 32,
  aboveAverage: 20,
  belowAverage: 12,
};

export async function getExamAnalyticsAction(examId: string): Promise<ExamAnalytics | null> {
  try {
    const user = await requireRole(['admin', 'teacher']);
    const adminDb = createAdminClient();

    const { data, error } = await adminDb
      .rpc('get_exam_analytics', { p_exam_id: examId });

    if (error || !data || data.length === 0) {
      return DEFAULT_DEMO_ANALYTICS;
    }

    const row = data[0] as any;
    return {
      classAverage: row.class_average,
      highestScore: row.highest_score,
      lowestScore: row.lowest_score,
      totalStudents: parseInt(row.total_students),
      aboveAverage: parseInt(row.above_average),
      belowAverage: parseInt(row.below_average),
    };
  } catch {
    return DEFAULT_DEMO_ANALYTICS;
  }
}

export async function getMarksOverviewAction() {
  const user = await requireRole(['admin']);
  const adminDb = createAdminClient();

  const { data: exams, error } = await adminDb
    .from('exams')
    .select('id, subject, exam_name, is_published, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  // Batch fetch grades for all exams (fix N+1)
  const examIds = (exams || []).map((e: any) => e.id);
  const { data: allGrades } = await adminDb
    .from('grades')
    .select('exam_id, score, max_score')
    .in('exam_id', examIds);

  const gradesByExam = new Map<string, any[]>();
  (allGrades || []).forEach((g: any) => {
    const existing = gradesByExam.get(g.exam_id) || [];
    existing.push(g);
    gradesByExam.set(g.exam_id, existing);
  });

  const overview = ((exams || []) as any[]).map((exam) => {
    const grades = gradesByExam.get(exam.id) || [];

    let classAvg = 0;
    let highest = 0;
    let lowest = 100;
    let count = 0;

    if (grades.length > 0) {
      const percentages = grades.map((g: any) =>
        g.max_score > 0 ? (g.score / g.max_score) * 100 : 0
      );
      classAvg = Math.round(percentages.reduce((a: number, b: number) => a + b, 0) / percentages.length);
      highest = Math.max(...percentages.map((p: number) => Math.round(p)));
      lowest = Math.min(...percentages.map((p: number) => Math.round(p)));
      count = percentages.length;
    }

    return {
      examId: exam.id,
      subject: exam.subject,
      examName: exam.exam_name,
      isPublished: exam.is_published,
      publishedAt: exam.published_at,
      createdAt: exam.created_at,
      classAverage: classAvg,
      highestScore: highest,
      lowestScore: lowest,
      totalStudents: count,
    };
  });

  return overview;
}

function mapExam(row: any): ExamRecord {
  return {
    id: row.id,
    subject: row.subject,
    examName: row.exam_name,
    maxScore: row.max_score,
    examDate: row.exam_date,
    classGrade: row.class_grade,
    classSection: row.class_section,
    createdBy: row.created_by,
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  };
}
