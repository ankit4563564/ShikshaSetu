import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDemoSessionFromCookies } from '@/lib/demo/session';

type Role = 'teacher' | 'student' | 'parent' | 'driver' | 'admin';

const ROLE_TABLE: Record<Role, string> = {
  teacher: 'teachers',
  student: 'students',
  parent: 'guardians',
  driver: 'drivers',
  admin: 'admins',
};

interface AuthResult {
  userId: string;
  roleId: string;
}

export async function requireRole(allowedRoles: Role[]): Promise<AuthResult | NextResponse> {
  try {
    const { userId } = await auth();
    if (userId) {
      const adminDb = createAdminClient();

      for (const role of allowedRoles) {
        const table = ROLE_TABLE[role];
        const { data: record } = await adminDb
          .from(table)
          .select('id')
          .eq('clerk_user_id', userId)
          .limit(1)
          .maybeSingle();

        if (record) {
          return { userId, roleId: record.id };
        }
      }
    }

    // Demo mode / unauthenticated fallback for seamless hackathon testing
    const demo = await getDemoSessionFromCookies(cookies());
    const demoRoleId = demo?.session?.role || allowedRoles[0] || 'parent';
    return {
      userId: 'demo',
      roleId: `demo-${demoRoleId}-id`,
    };
  } catch (e) {
    return {
      userId: 'demo',
      roleId: 'demo-fallback-id',
    };
  }
}
