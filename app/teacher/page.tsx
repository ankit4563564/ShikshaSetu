import { calculateStudentStatus } from '@/lib/rules-engine/calculateStatus';
import { generateOfflineFallback } from '@/lib/ai-narration/generateExplanation';
import TeacherWorkspaceV2 from '@/components/teacher/TeacherWorkspaceV2';
import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { getStudentsForTeacher } from '@/lib/supabase/getStudentsData';
import type { StudentWithFlag } from '@/lib/supabase/getStudentsData';

// Ensure the page is rendered dynamically to fetch fresh DB data
export const dynamic = 'force-dynamic';

export interface TeacherClassContext {
  teacherId: string;
  teacherName: string;
  grade: string;
  section: string;
  students: StudentWithFlag[];
}

export default async function TeacherPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // ─── Default context (demo / seed-aligned) ───────────────────────────────
  // Matches seed.sql: Ananya Mehra, class 8A, 5 seed students
  let teacherId = 'a1000000-0000-4000-8000-000000000001';
  let teacherName = 'Ananya Mehra';
  let teacherGrade = '8';
  let teacherSection = 'A';

  // ─── Demo mode ────────────────────────────────────────────────────────────
  const demo = await getDemoSessionFromCookies(cookies());

  // ─── Clerk Auth: resolve real teacher identity ────────────────────────────
  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/login');
    }

    let unauthorizedUrl: string | null = null;
    try {
      const context = await getAuthContext();
      if (context.role !== 'teacher' && context.role !== 'admin' && context.role !== 'principal') {
        unauthorizedUrl = `/unauthorized?portal=teacher&currentRole=${context.role}`;
      }
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err;
      }
      unauthorizedUrl = '/unauthorized?reason=unconfigured_account';
    }
    if (unauthorizedUrl) {
      redirect(unauthorizedUrl);
    }

    const adminDb = createAdminClient();

    // Try to find teacher by clerk_user_id
    const { data: teacher } = await adminDb
      .from('teachers')
      .select('id, first_name, last_name, display_name, grade, section, clerk_user_id')
      .eq('clerk_user_id', userId)
      .limit(1)
      .maybeSingle();

    if (teacher) {
      teacherId = teacher.id;
      teacherName =
        teacher.display_name ||
        `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() ||
        'Teacher';
      if (teacher.grade) teacherGrade = teacher.grade;
      if (teacher.section) teacherSection = teacher.section;
    }
  }

  // ─── Load students for this teacher's class ───────────────────────────────
  // getStudentsForTeacher returns [] if nothing found — never fabricates students.
  let classStudents = await getStudentsForTeacher(teacherId);

  // Enrich each student with rules engine status + AI narration
  const processedStudents = classStudents.map((st) => {
    const computedStatus = calculateStudentStatus(st.attendance, st.homework, st.grades);
    const aiNarration = generateOfflineFallback(st.displayName, computedStatus.evidence);
    return {
      ...st,
      status: computedStatus.finalStatus,
      statusReasons: computedStatus.reasons,
      aiExplanation: aiNarration,
    };
  });

  // Derive grade/section from students if teacher row didn't have it
  if (processedStudents.length > 0 && !classStudents[0].grade) {
    const firstStudent = processedStudents[0];
    if (firstStudent.grade) teacherGrade = firstStudent.grade;
    if (firstStudent.section) teacherSection = firstStudent.section;
  }

  const classContext: TeacherClassContext = {
    teacherId,
    teacherName,
    grade: teacherGrade,
    section: teacherSection,
    students: processedStudents,
  };

  return <TeacherWorkspaceV2 classContext={classContext} />;
}
