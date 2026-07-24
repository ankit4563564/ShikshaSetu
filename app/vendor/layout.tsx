import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDemoSessionFromCookies } from '@/lib/demo/session';

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  if (!demo?.active) {
    const { userId } = auth();
    if (!userId) redirect('/sign-in');

    const adminDb = createAdminClient();
    const { data: vendor } = await adminDb
      .from('vendors')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (!vendor) redirect('/unauthorized?portal=vendor&currentRole=none');
  }

  return <section aria-label="Vendor Portal">{children}</section>;
}
