import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDemoSessionFromCookies } from '@/lib/demo/session';

export type PortalRole = 'teacher' | 'student' | 'parent' | 'driver' | 'admin' | 'vendor' | 'gate';

interface AuthenticatedUser {
  clerkId: string;
  role: PortalRole;
  dbUserId: string;
}

const ROLE_TABLE: Record<PortalRole, string> = {
  teacher: 'teachers',
  student: 'students',
  parent: 'guardians',
  driver: 'drivers',
  admin: 'admins',
  vendor: 'vendors',
  gate: 'gate_operators',
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const { userId } = await auth();
  if (!userId) {
    const demo = await getDemoSessionFromCookies(cookies());
    return {
      clerkId: 'demo',
      role: (demo?.session?.role as PortalRole) || 'parent',
      dbUserId: 'demo',
    };
  }

  const adminDb = createAdminClient();

  for (const [role, table] of Object.entries(ROLE_TABLE)) {
    const { data: record } = await adminDb
      .from(table)
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (record) {
      return { clerkId: userId, role: role as PortalRole, dbUserId: record.id };
    }
  }

  return null;
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Authentication required');
  return user;
}

export async function requireRole(allowedRoles: PortalRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: requires one of roles [${allowedRoles.join(', ')}]`);
  }
  return user;
}

export function unauthorized(): { error: string } {
  return { error: 'Authentication required' };
}

export function forbidden(roles: PortalRole[]): { error: string } {
  return { error: `Forbidden: requires one of roles [${roles.join(', ')}]` };
}
