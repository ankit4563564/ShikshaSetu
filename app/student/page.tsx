import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getStudentsData } from '@/lib/supabase';
import StudentPortalClient from '@/components/student/StudentPortalClient';
import { auth } from '@clerk/nextjs/server';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export const dynamic = 'force-dynamic';

export default async function StudentPage() {
  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  if (!demo?.active) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in');
    }

    const adminDb = createAdminClient();
    const { data: authorizedStudent } = await adminDb
      .from('students')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (!authorizedStudent) {
      redirect('/unauthorized?portal=student&currentRole=none');
    }
  }

  const students = await getStudentsData();
  const student = students[0];

  if (!student) {
    redirect('/unauthorized?portal=student&currentRole=none');
  }

  return (
    <ErrorBoundary portalName="Student Portal">
      <StudentPortalClient student={student} />
    </ErrorBoundary>
  );
}
