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
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (userId) {
      const adminDb = createAdminClient();
      await adminDb
        .from('students')
        .select('id')
        .eq('clerk_user_id', userId)
        .maybeSingle();
    }
  }

  const students = await getStudentsData();
  const student = students[0];

  return (
    <ErrorBoundary portalName="Student Portal">
      <StudentPortalClient student={student} />
    </ErrorBoundary>
  );
}
