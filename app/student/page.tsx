import { cookies } from 'next/headers';
import { getStudentsData, getStudentByAuthenticatedUser } from '@/lib/supabase/getStudentsData';
import StudentPortalClient from '@/components/student/StudentPortalClient';
import { auth } from '@clerk/nextjs/server';
import { getDemoSessionFromCookies } from '@/lib/demo/session';

export const dynamic = 'force-dynamic';

// Demo seed student: Aarav Sharma (matches seed.sql b1000000-...-001)
const DEMO_STUDENT_ID = 'b1000000-0000-4000-8000-000000000001';

export default async function StudentPage({
  searchParams,
}: {
  searchParams?: { studentId?: string };
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const demo = await getDemoSessionFromCookies(cookies());

  let resolvedStudentId: string | null = null;

  // 1. URL param override (for admin viewing a specific student, or demo switching)
  if (searchParams?.studentId) {
    resolvedStudentId = searchParams.studentId;
  }

  // 2. Clerk authenticated user → resolve their student record
  if (!resolvedStudentId && clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (userId) {
      const student = await getStudentByAuthenticatedUser(userId);
      if (student) {
        resolvedStudentId = student.studentId;
      }
    }
  }

  // 3. Demo mode: use the seeded Aarav Sharma student
  if (!resolvedStudentId && demo?.active) {
    resolvedStudentId = DEMO_STUDENT_ID;
  }

  // 4. If still no student resolved, load all students and try to find by ID
  //    NEVER fall back to students[0] — show "not linked" state instead.
  if (!resolvedStudentId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-10 max-w-md text-center shadow-xl space-y-4">
          <div className="text-4xl">🎓</div>
          <h1 className="font-display text-xl font-black text-slate-900">
            Student Profile Not Linked
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Your account is not linked to a student profile yet. Please contact your school
            administrator to set up your student account.
          </p>
        </div>
      </div>
    );
  }

  // Load all students and find the resolved one
  const students = await getStudentsData();
  const student = students.find((s) => s.studentId === resolvedStudentId);

  // If the student ID is resolved but not found in DB (e.g., wrong ID), show error
  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-10 max-w-md text-center shadow-xl space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="font-display text-xl font-black text-slate-900">
            Student Record Not Found
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            The student profile could not be found. Please contact your school administrator.
          </p>
        </div>
      </div>
    );
  }

  return <StudentPortalClient student={student} />;
}
