'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { linkClerkUser } from '@/lib/auth/authOnboarding';

export const PRODUCTION_PORTAL_MAP: Record<string, string> = {
  teacher: '/teacher',
  parent: '/parent',
  student: '/student',
  admin: '/admin',
  principal: '/admin',
  gate: '/gate',
  driver: '/driver',
};

/**
 * resolveAuthenticatedPortalRoute:
 * Server-authoritative function that inspects the current Clerk session,
 * links user if needed, resolves tenant & role from DB, and returns the target portal route.
 * Returns null if user is not authenticated in Clerk.
 * Returns '/unauthorized?...' if user is authenticated but role/mapping is unconfigured.
 */
export async function resolveAuthenticatedPortalRoute(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  // Idempotent account onboarding linking on first login
  try {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || '';
    if (email) {
      await linkClerkUser(userId, email);
    }
  } catch (err) {
    console.warn('[resolveAuthenticatedPortalRoute] Onboarding link notice:', err);
  }

  try {
    const context = await getAuthContext();
    const targetPortal = PRODUCTION_PORTAL_MAP[context.role];

    if (targetPortal) {
      return targetPortal;
    }

    return '/unauthorized?reason=missing_role';
  } catch (err: any) {
    console.warn('[resolveAuthenticatedPortalRoute] Auth context error:', err?.message || err);
    return '/unauthorized?reason=unconfigured_account';
  }
}
