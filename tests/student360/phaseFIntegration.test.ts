import { describe, it, expect, vi } from 'vitest';
import { fetchStudent360Action } from '@/app/actions/student360Actions';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { getStudent360Data } from '@/lib/student360/getStudent360';

vi.mock('@/lib/auth/getAuthContext', () => ({
  getAuthContext: vi.fn(),
  requirePermission: vi.fn(),
  validateParentStudentAccess: vi.fn(),
}));

vi.mock('@/lib/supabase/scoped', () => ({
  createScopedClient: vi.fn(() => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            if (table === 'students') {
              return { data: { id: 'stu-aarav', grade: '8', section: 'A' }, error: null };
            }
            return { data: null, error: null };
          },
          maybeSingle: async () => {
            if (table === 'teachers') {
              return { data: { id: 't-101' }, error: null };
            }
            return { data: null, error: null };
          },
        }),
      }),
    }),
  })),
}));

vi.mock('@/lib/student360/getStudent360', () => ({
  getStudent360Data: vi.fn(),
}));

describe('Phase F Integration & Authorization Tests', () => {
  it('1. Teacher can fetch authorized Student 360 data via Server Action', async () => {
    const mockTeacherContext = {
      userId: 't-101',
      role: 'teacher',
      schoolId: 'sch-001',
      permissions: ['students:read_class', 'interventions:approve'],
    };

    (getAuthContext as any).mockResolvedValue(mockTeacherContext);
    (getStudent360Data as any).mockResolvedValue({
      studentId: 'stu-aarav',
      displayName: 'Aarav Singh',
      grade: '8',
      section: 'A',
      attendanceMetrics: { attendancePercentage: 84 },
      signalAnalysis: { severity: 'high', explanation: '3 signals changed' },
      interventions: [],
    });

    const res = await fetchStudent360Action('stu-aarav');
    expect(res.success).toBe(true);
    expect(res.data?.displayName).toBe('Aarav Singh');
  });

  it('2. Invalid or missing studentId is rejected immediately', async () => {
    const res = await fetchStudent360Action('');
    expect(res.success).toBe(false);
    expect(res.error).toContain('INVALID_INPUT');
  });
});
