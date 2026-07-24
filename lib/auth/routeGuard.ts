import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

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
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  return NextResponse.json(
    { error: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]` },
    { status: 403 },
  );
}
