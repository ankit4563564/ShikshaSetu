import VendorDashboardClient from '@/components/vendor/VendorDashboardClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { auth, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { getDemoSessionFromCookies } from '@/lib/demo/session';
import { linkClerkUser } from '@/lib/auth/authOnboarding';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VendorPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let activeVendorId: string | null = null;
  let activeVendor: any = null;
  let vendorAccess: any[] = [];

  // Demo mode bypass: use centralized demo session validation
  const demo = await getDemoSessionFromCookies(cookies());

  // 1. Clerk Authentication Check & Onboarding Link
  if (clerkKey && !demo?.active) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in');
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || '';

    // Idempotent account onboarding linking on first login
    const onboarding = await linkClerkUser(userId, email);
    if (!onboarding.success) {
      console.warn('[Vendor Onboarding] Warning:', onboarding.error);
    }

    // Only proceed if linked role is 'vendor'
    if (onboarding.linkedRole !== 'vendor' && onboarding.success) {
      redirect('/unauthorized?portal=vendor&currentRole=' + (onboarding.linkedRole || 'none'));
    }

    // Query database to fetch linked vendor record (admin client bypasses RLS)
    const adminDb = createAdminClient();
    const { data: vendors } = await adminDb
      .from('vendors')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('is_active', true);

    // 2. Check that user has 'vendor' role
    if (!vendors || vendors.length === 0) {
      redirect('/unauthorized?portal=vendor&currentRole=none');
    }

    vendorAccess = vendors;

    // 3. For multi-vendor support: store available vendors
    // If user has access to multiple vendors, they can select which one to use
    if (vendorAccess.length === 1) {
      activeVendor = vendorAccess[0];
      activeVendorId = activeVendor.id;
    }
    // If multiple vendors, will show selector in client component
  } else if (demo?.active) {
    // Demo mode: use first active vendor from database
    const db = createAdminClient();
    const { data: demoVendors } = await db
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (demoVendors && demoVendors.length > 0) {
      activeVendor = demoVendors[0];
      activeVendorId = activeVendor.id;
    }
  } else {
    // No Clerk key and not in demo mode: fetch first active vendor as fallback
    const db = createAdminClient();
    const { data: vendors } = await db.from('vendors').select('*').eq('is_active', true).limit(1);

    if (vendors && vendors.length > 0) {
      activeVendor = vendors[0];
      activeVendorId = activeVendor.id;
    }
  }

  // 4. Handle no vendor access or no vendors configured
  if (!activeVendor && vendorAccess.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-lg font-bold text-deep-teal/40">Vendor portal not available</p>
          <p className="text-sm text-deep-teal/30 mt-1">
            {clerkKey && !demo?.active
              ? 'You do not have vendor access. Please contact your administrator.'
              : 'No vendors configured in the system.'}
          </p>
        </div>
      </div>
    );
  }

  // 5. Show vendor selector if user has access to multiple vendors
  if (vendorAccess.length > 1 && !activeVendor) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-white/80 bg-gradient-to-br from-white/80 to-white/60 p-6 backdrop-blur-xl shadow-sm">
          <h1 className="font-display text-2xl font-extrabold text-deep-teal mb-4">Select Vendor</h1>
          <p className="text-sm text-deep-teal/60 mb-6">You have access to multiple vendors. Choose one to continue:</p>
          
          <div className="grid grid-cols-1 gap-3">
            {vendorAccess.map((vendor) => (
              <a
                key={vendor.id}
                href={`/vendor?vendorId=${vendor.id}`}
                className="block p-4 rounded-xl border border-deep-teal/10 bg-white/50 hover:bg-white/80 hover:border-deep-teal/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-deep-teal">{vendor.name}</p>
                    <p className="text-sm text-deep-teal/50 mt-1 capitalize">{vendor.vendor_type}</p>
                  </div>
                  <span className="text-xl">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 6. Render vendor dashboard with selected vendor
  return (
    <VendorDashboardClient
      vendorId={activeVendor.id}
      vendorName={activeVendor.name}
      vendorType={activeVendor.vendor_type}
    />
  );
}
