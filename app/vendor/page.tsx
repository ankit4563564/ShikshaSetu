import VendorDashboardClient from '@/components/vendor/VendorDashboardClient';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function VendorPage() {
  const db = createAdminClient();
  const { data: vendors } = await db.from('vendors').select('*').eq('is_active', true).limit(1);

  const vendor = vendors?.[0];

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-lg font-bold text-deep-teal/40">Vendor portal not configured</p>
          <p className="text-sm text-deep-teal/30 mt-1">Please set up vendors in the database.</p>
        </div>
      </div>
    );
  }

  return (
    <VendorDashboardClient
      vendorId={vendor.id}
      vendorName={vendor.name}
      vendorType={vendor.vendor_type}
    />
  );
}
