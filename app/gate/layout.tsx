import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDemoSessionFromCookies } from '@/lib/demo/session';

export default async function GateLayout({ children }: { children: React.ReactNode }) {
  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  if (!demo?.active) {
    const { userId } = await auth();
    if (!userId) redirect('/login');

    const { getAuthContext } = await import('@/lib/auth/getAuthContext');
    try {
      const context = await getAuthContext();
      if (context.role !== 'gate' && context.role !== 'teacher' && context.role !== 'admin' && context.role !== 'principal') {
        redirect(`/unauthorized?portal=gate&currentRole=${context.role}`);
      }
    } catch (_err) {
      redirect('/unauthorized?reason=unconfigured_account');
    }
  }

  return <section aria-label="Gate Portal">{children}</section>;
}
