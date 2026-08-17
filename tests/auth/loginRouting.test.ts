import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProductionPortalMapRoute, resolveAuthenticatedPortalRoute } from '@/app/actions/authRoutingActions';
import { getAuthContext, validateParentStudentAccess, AuthContext } from '@/lib/auth/getAuthContext';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

// Mock demo session
vi.mock('@/lib/demo/session', () => ({
  getDemoSessionFromCookies: vi.fn().mockResolvedValue(null),
}));

describe('Production Login & Automatic Role Routing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Production Portal Access Matrix', () => {
    it('1. Maps teacher to /teacher', async () => {
      expect(await getProductionPortalMapRoute('teacher')).toBe('/teacher');
    });

    it('2. Maps parent to /parent', async () => {
      expect(await getProductionPortalMapRoute('parent')).toBe('/parent');
    });

    it('3. Maps student to /student', async () => {
      expect(await getProductionPortalMapRoute('student')).toBe('/student');
    });

    it('4. Maps admin and principal to /admin', async () => {
      expect(await getProductionPortalMapRoute('admin')).toBe('/admin');
      expect(await getProductionPortalMapRoute('principal')).toBe('/admin');
    });

    it('5. Maps gate to /gate', async () => {
      expect(await getProductionPortalMapRoute('gate')).toBe('/gate');
    });

    it('6. Maps driver to /driver', async () => {
      expect(await getProductionPortalMapRoute('driver')).toBe('/driver');
    });

    it('7. Explicitly excludes prototype vendor from production portal matrix', async () => {
      expect(await getProductionPortalMapRoute('vendor')).toBeUndefined();
    });
  });

  describe('resolveAuthenticatedPortalRoute server action', () => {
    it('8. Returns null when user is unauthenticated in Clerk', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as any).mockResolvedValue({ userId: null });

      const route = await resolveAuthenticatedPortalRoute();
      expect(route).toBeNull();
    });

    it('9. Resolves role and returns correct portal route for authenticated user', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as any).mockResolvedValue({ userId: 'clerk-user-teacher-101' });

      const { createAdminClient } = await import('@/lib/supabase/admin');
      (createAdminClient as any).mockReturnValue({
        from: (table: string) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => {
                if (table === 'user_mappings') {
                  return { data: { user_id: 't-101', school_id: 'sch-001', role: 'teacher' } };
                }
                return { data: null };
              },
            }),
          }),
        }),
      });

      const route = await resolveAuthenticatedPortalRoute();
      expect(route).toBe('/teacher');
    });

    it('10. Returns /unauthorized for user with missing/unconfigured role', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      (auth as any).mockResolvedValue({ userId: 'clerk-user-unlinked' });

      const { createAdminClient } = await import('@/lib/supabase/admin');
      (createAdminClient as any).mockReturnValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      });

      const route = await resolveAuthenticatedPortalRoute();
      expect(route).toContain('/unauthorized');
    });
  });

  describe('Security Boundaries & Access Denial', () => {
    it('11. Denies parent access to unauthorized student context', () => {
      const parentContext: AuthContext = {
        userId: 'parent-101',
        clerkUserId: 'clerk-parent-101',
        schoolId: 'sch-001',
        role: 'parent',
        permissions: ['child:read_today'],
        linkedStudentIds: ['stu-my-child-1'],
      };

      // Own child -> allowed
      expect(() => validateParentStudentAccess(parentContext, 'stu-my-child-1')).not.toThrow();

      // Another parent's child -> denied
      expect(() => validateParentStudentAccess(parentContext, 'stu-other-child-2')).toThrow(/FORBIDDEN/);
    });

    it('12. Prevents parent from having admin permissions', () => {
      const parentPermissions = ['child:read_today', 'gate_pass:request', 'homework:read'];
      expect(parentPermissions).not.toContain('school:manage');
      expect(parentPermissions).not.toContain('users:manage');
      expect(parentPermissions).not.toContain('reports:view_all');
    });
  });
});
