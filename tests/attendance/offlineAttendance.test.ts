import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordAttendanceBatchAction } from '@/app/actions/attendanceActions';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { InMemoryAttendanceStore } from '@/lib/attendance/offlineStore';
import { AttendanceSyncEngine } from '@/lib/attendance/offlineSyncEngine';
import { AttendanceStatus } from '@/lib/attendance/types';

// Mock getAuthContext
vi.mock('@/lib/auth/getAuthContext', () => ({
  getAuthContext: vi.fn(),
  requirePermission: vi.fn((context, permission) => {
    if (!context.permissions || !context.permissions.includes(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }),
}));

// Mock Database Tables Store for Vitest
let mockAttendanceTable: Array<{ id: string; student_id: string; date: string; status: string; notes?: string; marked_at: string }> = [];
let mockOpsTable: Array<{ operation_id: string; school_id: string; student_id: string; result_status: string }> = [];

vi.mock('@/lib/supabase/scoped', () => ({
  createScopedClient: vi.fn((context) => ({
    from: (table: string) => ({
      select: () => ({
        in: async (col: string, ids: string[]) => {
          if (table === 'students') {
            // Only return students matching valid school tenant
            const valid = ids
              .filter((id) => id.startsWith('stu-valid'))
              .map((id) => ({ id, display_name: `Student ${id}` }));
            return { data: valid, error: null };
          }
          return { data: [], error: null };
        },
      }),
    }),
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'teachers') {
        return {
          select: () => ({
            eq: () => ({
              limit: () => ({
                maybeSingle: async () => ({ data: { id: 'tch-101' } }),
              }),
            }),
          }),
        };
      }
      if (table === 'attendance_operations') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              limit: () => ({
                maybeSingle: async () => {
                  const found = mockOpsTable.find((op) => op.operation_id === val);
                  return { data: found || null };
                },
              }),
            }),
          }),
          insert: async (row: any) => {
            mockOpsTable.push(row);
            return { data: row, error: null };
          },
        };
      }
      if (table === 'attendance') {
        return {
          select: () => ({
            eq: (col1: string, val1: string) => ({
              eq: (col2: string, val2: string) => ({
                limit: () => ({
                  maybeSingle: async () => {
                    const found = mockAttendanceTable.find(
                      (a) => a.student_id === val1 && a.date === val2
                    );
                    return { data: found || null };
                  },
                }),
              }),
            }),
          }),
          upsert: async (row: any) => {
            const index = mockAttendanceTable.findIndex(
              (a) => a.student_id === row.student_id && a.date === row.date
            );
            if (index >= 0) {
              mockAttendanceTable[index] = { ...mockAttendanceTable[index], ...row };
            } else {
              mockAttendanceTable.push({ id: `att-${Date.now()}`, ...row });
            }
            return { error: null };
          },
        };
      }
      return {};
    },
  })),
}));

describe('Phase G1.1 — Offline Attendance & Idempotency Tests', () => {
  const teacherContext = {
    userId: 'usr-teacher-001',
    clerkUserId: 'clerk-teacher-001',
    schoolId: 'school-101',
    role: 'teacher' as const,
    permissions: ['attendance:write', 'students:read_class'] as const,
  };

  beforeEach(() => {
    mockAttendanceTable = [];
    mockOpsTable = [];
    vi.clearAllMocks();
    (getAuthContext as any).mockResolvedValue(teacherContext);
  });

  it('1. Authorized teacher can record attendance batch', async () => {
    const payload = {
      operations: [
        {
          operationId: 'op-001',
          studentId: 'stu-valid-1',
          date: '2026-08-17',
          status: 'present' as AttendanceStatus,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const res = await recordAttendanceBatchAction(payload);
    expect(res.success).toBe(true);
    expect(res.results[0].status).toBe('applied');
    expect(mockAttendanceTable.length).toBe(1);
    expect(mockAttendanceTable[0].status).toBe('present');
  });

  it('2. Unauthorized role is rejected by requirePermission', async () => {
    const parentContext = {
      userId: 'usr-parent-001',
      clerkUserId: 'clerk-parent-001',
      schoolId: 'school-101',
      role: 'parent' as const,
      permissions: ['child:read_today'] as const,
    };
    (getAuthContext as any).mockResolvedValue(parentContext);

    const res = await recordAttendanceBatchAction({
      operations: [
        {
          operationId: 'op-002',
          studentId: 'stu-valid-1',
          date: '2026-08-17',
          status: 'present' as AttendanceStatus,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Permission denied');
  });

  it('3. Cross-tenant student ID is rejected with authorization_failed', async () => {
    const payload = {
      operations: [
        {
          operationId: 'op-003',
          studentId: 'stu-other-tenant-99',
          date: '2026-08-17',
          status: 'present' as AttendanceStatus,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const res = await recordAttendanceBatchAction(payload);
    expect(res.success).toBe(true);
    expect(res.results[0].status).toBe('authorization_failed');
  });

  it('4. Retrying exact same operation ID twice is idempotent (duplicate)', async () => {
    const op = {
      operationId: 'op-dedup-100',
      studentId: 'stu-valid-1',
      date: '2026-08-17',
      status: 'absent' as AttendanceStatus,
      createdAt: new Date().toISOString(),
    };

    const res1 = await recordAttendanceBatchAction({ operations: [op] });
    expect(res1.results[0].status).toBe('applied');

    // Re-send exact same operation
    const res2 = await recordAttendanceBatchAction({ operations: [op] });
    expect(res2.results[0].status).toBe('duplicate');
    expect(mockAttendanceTable.length).toBe(1);
  });

  it('5. Legitimate newer operation updates attendance for student', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-17T08:05:00.000Z'));

    const op1 = {
      operationId: 'op-first-001',
      studentId: 'stu-valid-1',
      date: '2026-08-17',
      status: 'present' as AttendanceStatus,
      createdAt: '2026-08-17T08:00:00.000Z',
    };
    await recordAttendanceBatchAction({ operations: [op1] });
    expect(mockAttendanceTable[0].status).toBe('present');

    // Newer legitimate correction at 08:30. Advance system time to 08:35.
    vi.setSystemTime(new Date('2026-08-17T08:35:00.000Z'));

    const op2 = {
      operationId: 'op-second-002',
      studentId: 'stu-valid-1',
      date: '2026-08-17',
      status: 'late' as AttendanceStatus,
      createdAt: '2026-08-17T08:30:00.000Z',
    };
    const res2 = await recordAttendanceBatchAction({ operations: [op2] });
    expect(res2.results[0].status).toBe('applied');
    expect(mockAttendanceTable[0].status).toBe('late');

    vi.useRealTimers();
  });

  it('6. Stale operation is rejected when server state is newer', async () => {
    // Existing server record created at 09:00:00
    mockAttendanceTable.push({
      id: 'att-existing',
      student_id: 'stu-valid-1',
      date: '2026-08-17',
      status: 'excused',
      marked_at: '2026-08-17T09:00:00.000Z',
    });

    // Stale offline operation created earlier at 08:15:00
    const staleOp = {
      operationId: 'op-stale-001',
      studentId: 'stu-valid-1',
      date: '2026-08-17',
      status: 'present' as AttendanceStatus,
      createdAt: '2026-08-17T08:15:00.000Z',
    };

    const res = await recordAttendanceBatchAction({ operations: [staleOp] });
    expect(res.results[0].status).toBe('conflict');
    expect(res.results[0].serverState?.status).toBe('excused');
    expect(mockAttendanceTable[0].status).toBe('excused');
  });

  it('7. Offline store enqueues items and sync engine clears queue on sync', async () => {
    const memoryStore = new InMemoryAttendanceStore();
    const engine = new AttendanceSyncEngine(memoryStore);

    await engine.markAttendance('stu-valid-1', '2026-08-17', 'present', undefined, 'Aarav Sharma');

    // Wait for async sync triggered by markAttendance to complete
    await new Promise((resolve) => setTimeout(resolve, 200));

    const pendingAfter = await memoryStore.getPending();
    expect(pendingAfter.length).toBe(0);
    expect(mockAttendanceTable.length).toBe(1);
    expect(mockAttendanceTable[0].status).toBe('present');
  });

  it('8. Partial batch failure processes valid operations while returning error for invalid operations', async () => {
    const payload = {
      operations: [
        {
          operationId: 'op-batch-valid',
          studentId: 'stu-valid-1',
          date: '2026-08-17',
          status: 'present' as AttendanceStatus,
          createdAt: new Date().toISOString(),
        },
        {
          operationId: 'op-batch-invalid-tenant',
          studentId: 'stu-unauthorized-99',
          date: '2026-08-17',
          status: 'present' as AttendanceStatus,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const res = await recordAttendanceBatchAction(payload);
    expect(res.success).toBe(true);
    expect(res.results.length).toBe(2);
    expect(res.results.find((r) => r.operationId === 'op-batch-valid')?.status).toBe('applied');
    expect(res.results.find((r) => r.operationId === 'op-batch-invalid-tenant')?.status).toBe('authorization_failed');
  });

  it('9. Failed sync increments retryCount on pending queue items', async () => {
    const memoryStore = new InMemoryAttendanceStore();
    const item = {
      operationId: 'op-retry-test',
      studentId: 'stu-invalid-fail',
      date: '2026-08-17',
      requestedStatus: 'present' as AttendanceStatus,
      createdAt: new Date().toISOString(),
      syncState: 'saved_locally' as const,
      retryCount: 0,
    };
    await memoryStore.enqueue(item);

    const engine = new AttendanceSyncEngine(memoryStore);
    await engine.triggerSync();

    const pending = await memoryStore.getPending();
    expect(pending.length).toBe(1);
    expect(pending[0].retryCount).toBeGreaterThan(0);
    expect(pending[0].syncState).toBe('sync_failed');
  });
});

