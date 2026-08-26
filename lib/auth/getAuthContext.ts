import { auth } from '@clerk/nextjs/server';
import { cookies, headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDemoSessionFromCookies } from '@/lib/demo/session';

// ── 1. Unified Portal Roles ──
export type PortalRole = 'admin' | 'principal' | 'teacher' | 'parent' | 'student' | 'driver' | 'gate' | 'vendor';

// ── 2. Unified Fine-Grained Permissions ──
export type Permission =
  | 'school:manage'
  | 'users:manage'
  | 'reports:view_all'
  | 'students:read_class'
  | 'attendance:write'
  | 'homework:read'
  | 'homework:write'
  | 'marks:write'
  | 'interventions:create'
  | 'interventions:approve'
  | 'child:read_today'
  | 'gate_pass:request'
  | 'gate:scan'
  | 'bus:update_location';

// ── 3. Role-to-Permission Mapping Table ──
export const ROLE_PERMISSIONS: Record<PortalRole, Permission[]> = {
  admin: [
    'school:manage',
    'users:manage',
    'reports:view_all',
    'students:read_class',
    'attendance:write',
    'homework:read',
    'homework:write',
    'marks:write',
    'interventions:create',
    'interventions:approve',
    'child:read_today',
    'gate_pass:request',
    'gate:scan',
    'bus:update_location',
  ],
  principal: [
    'school:manage',
    'reports:view_all',
    'students:read_class',
    'attendance:write',
    'homework:read',
    'homework:write',
    'marks:write',
    'interventions:approve',
    'child:read_today',
  ],
  teacher: [
    'students:read_class',
    'attendance:write',
    'homework:read',
    'homework:write',
    'marks:write',
    'interventions:create',
    'interventions:approve',
  ],
  parent: [
    'child:read_today',
    'gate_pass:request',
  ],
  student: [
    'homework:read',
  ],
  driver: [
    'bus:update_location',
  ],
  gate: [
    'gate:scan',
  ],
  vendor: [],
};

// Default fallback school ID for seed/demo dataset
export const DEFAULT_SCHOOL_ID = 'e0000000-0000-4000-8000-000000000001';

// ── 4. Typed Immutable AuthContext Interface ──
export interface AuthContext {
  readonly userId: string;           // Internal DB user UUID
  readonly clerkUserId: string;      // Clerk authentication user ID string
  readonly schoolId: string;         // Multi-tenant school UUID
  readonly role: PortalRole;         // Scoped portal role
  readonly permissions: ReadonlyArray<Permission>; // Fine-grained permissions
  readonly linkedStudentIds?: ReadonlyArray<string>; // For parent roles: guardian's children
}

/**
 * getAuthContext: Resolves authenticated Clerk user, maps internal user_mappings,
 * extracts school_id and assigns permissions into a typed immutable AuthContext.
 */
export async function getAuthContext(explicitRole?: PortalRole): Promise<AuthContext> {
  let clerkUserId: string | null = null;

  try {
    const { userId } = await auth();
    clerkUserId = userId;
  } catch (err) {
    // Auth check threw (e.g. static rendering context)
  }

  // 1. Check for demo session if Clerk session is absent
  if (!clerkUserId) {
    let demoRole: PortalRole = explicitRole || 'teacher';
    let hasActiveDemo = false;

    try {
      const demo = await getDemoSessionFromCookies(cookies());
      if (demo?.active) {
        hasActiveDemo = true;
        if (!explicitRole) {
          demoRole = (demo.role as PortalRole) || demoRole;
        }
      }
    } catch {
      // Cookies read failed
    }

    try {
      const headerList = headers();
      const referer = headerList.get('referer') || '';
      if (!explicitRole && !hasActiveDemo) {
        if (referer.includes('/teacher')) demoRole = 'teacher';
        else if (referer.includes('/parent')) demoRole = 'parent';
        else if (referer.includes('/student')) demoRole = 'student';
        else if (referer.includes('/admin')) demoRole = 'admin';
        else if (referer.includes('/driver')) demoRole = 'driver';
        else if (referer.includes('/gate')) demoRole = 'gate';
        else if (referer.includes('/vendor')) demoRole = 'vendor';
      }
    } catch {
      // headers read failed
    }

    // In production without clerk user and without demo session or explicit role, throw UNAUTHORIZED
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !hasActiveDemo && !explicitRole) {
      throw new Error('UNAUTHORIZED: Valid session required');
    }

    const demoUserId = demoRole === 'teacher'
      ? 'a1000000-0000-4000-8000-000000000001'
      : demoRole === 'parent'
      ? 'c1000000-0000-4000-8000-000000000001'
      : 'b1000000-0000-4000-8000-000000000001';

    return {
      userId: demoUserId,
      clerkUserId: `demo-${demoRole}-id`,
      schoolId: DEFAULT_SCHOOL_ID,
      role: demoRole,
      permissions: ROLE_PERMISSIONS[demoRole] || [],
      // Demo parent is Sunita Sharma — linked to Aarav Sharma (real seed UUID)
      linkedStudentIds: demoRole === 'parent' ? ['b1000000-0000-4000-8000-000000000001'] : undefined,
    };
  }

  // 2. Query user_mappings via Admin DB to resolve tenant & role
  const adminDb = createAdminClient();
  const { data: userMapping, error } = await adminDb
    .from('user_mappings')
    .select('user_id, school_id, role')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (error || !userMapping || !userMapping.school_id) {
    throw new Error('FORBIDDEN: User does not have an active school tenant mapping');
  }

  if (!userMapping.role) {
    throw new Error('FORBIDDEN: User does not have an assigned portal role');
  }

  const role = userMapping.role as PortalRole;
  const schoolId = userMapping.school_id;
  let linkedStudentIds: string[] | undefined = undefined;

  // 3. For parents, fetch linked children IDs to enforce server-side guardian-student boundary
  if (role === 'parent') {
    const { data: guardian } = await adminDb
      .from('guardians')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (guardian) {
      const { data: access } = await adminDb
        .from('guardian_access')
        .select('student_id')
        .eq('guardian_id', guardian.id);

      linkedStudentIds = (access || []).map((a: any) => a.student_id);
    }
  }

  return Object.freeze({
    userId: userMapping.user_id || clerkUserId,
    clerkUserId,
    schoolId,
    role,
    permissions: Object.freeze(ROLE_PERMISSIONS[role] || []),
    linkedStudentIds: linkedStudentIds ? Object.freeze(linkedStudentIds) : undefined,
  });
}

/**
 * hasPermission: Checks if context contains a specific permission.
 */
export function hasPermission(context: AuthContext, permission: Permission): boolean {
  return context.permissions.includes(permission);
}

/**
 * requirePermission: Enforces permission on context, throwing error if absent.
 */
export function requirePermission(context: AuthContext, permission: Permission): void {
  if (!hasPermission(context, permission)) {
    throw new Error(`FORBIDDEN: Role '${context.role}' lacks required permission '${permission}'`);
  }
}

/**
 * validateParentStudentAccess: Server-side validation confirming parent owns student context.
 */
export function validateParentStudentAccess(context: AuthContext, studentId: string): void {
  if (context.role !== 'parent') return; // Non-parents bypass guardian ownership check

  if (!context.linkedStudentIds || context.linkedStudentIds.length === 0) {
    // Demo mode fallback: Sunita Sharma's child is Aarav Sharma (real seed UUID from seed.sql)
    if (studentId === 'b1000000-0000-4000-8000-000000000001') return;
  } else if (!context.linkedStudentIds.includes(studentId)) {
    throw new Error(`FORBIDDEN: Parent ${context.userId} is not authorized for student ${studentId}`);
  }
}
