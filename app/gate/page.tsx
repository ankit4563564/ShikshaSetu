import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { linkClerkUser } from '@/lib/auth/authOnboarding';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { cookies } from 'next/headers';
import GatePortalClient from '@/components/gate/GatePortalClient';

export const revalidate = 60;

export default async function GatePage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  // 1. Clerk Authentication Check & Onboarding Link
  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in?portal=gate');
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || '';

    // Idempotent account onboarding linking on first login
    const onboarding = await linkClerkUser(userId, email);
    if (!onboarding.success) {
      console.warn('[Gate Onboarding] Warning:', onboarding.error);
    }

    // Query database to fetch linked gate operator record (admin client bypasses RLS)
    const adminDb = createAdminClient();
    const { data: gateOperator } = await adminDb
      .from('gate_operators')
      .select('id')
      .eq('clerk_user_id', userId)
      .limit(1)
      .maybeSingle();

    if (!gateOperator) {
      redirect('/unauthorized?portal=gate&currentRole=none');
    }
  }

  // Gate portal is now authenticated and authorized
  return <GatePortalClient />;
}
