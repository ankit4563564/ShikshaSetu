import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { linkClerkUser } from '@/lib/auth/authOnboarding';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { cookies } from 'next/headers';
import DriverPortalClient from '@/components/driver/DriverPortalClient';

export const revalidate = 60;

export default async function DriverPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  // 1. Clerk Authentication Check & Onboarding Link
  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in?portal=driver');
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || '';

    // Idempotent account onboarding linking on first login
    const onboarding = await linkClerkUser(userId, email);
    if (!onboarding.success) {
      console.warn('[Driver Onboarding] Warning:', onboarding.error);
    }

    // Query database to fetch linked driver record (admin client bypasses RLS)
    const adminDb = createAdminClient();
    const { data: driver } = await adminDb
      .from('drivers')
      .select('id')
      .eq('clerk_user_id', userId)
      .limit(1)
      .maybeSingle();

    if (!driver) {
      redirect('/unauthorized?portal=driver&currentRole=none');
    }
  }

  // Driver portal is now authenticated and authorized
  return <DriverPortalClient />;
}
