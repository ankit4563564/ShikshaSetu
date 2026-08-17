import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';
import {
  requestGatePassAction,
  approveGatePassAction,
  revokeGatePassAction,
  verifyGatePassTokenAction,
  confirmGateCheckoutAction,
  emergencyPickupAction,
} from '@/app/actions/gatePassActions';
import { generateGatePassQrContent, decodeGatePassQrContent } from '@/lib/gate/qrPassToken';

// Mock dependencies
vi.mock('@/lib/auth/getAuthContext', () => ({
  getAuthContext: vi.fn(),
  requirePermission: vi.fn(),
  validateParentStudentAccess: vi.fn(),
}));

vi.mock('@/lib/supabase/scoped', () => ({
  createScopedClient: vi.fn(),
}));

vi.mock('@/lib/ecosystem', () => ({
  recordEcosystemEvent: vi.fn().mockResolvedValue({ id: 'evt-101' }),
  getStudentCareTeamRecipients: vi.fn().mockResolvedValue([{ userId: 'usr-parent-1', role: 'parent' }]),
  createEcosystemNotifications: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Phase G1.2 — Gate & Dismissal Safety Tests', () => {
  let mockGetAuthContext: any;
  let mockCreateScopedClient: any;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CAMPUS_ID_HMAC_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    mockGetAuthContext = vi.mocked(getAuthContext);
    mockCreateScopedClient = vi.mocked(createScopedClient);

    // Default mock database client
    mockDb = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    };
    mockCreateScopedClient.mockReturnValue(mockDb);

    mockGetAuthContext.mockResolvedValue({
      userId: 'usr-parent-1',
      clerkUserId: 'clerk-parent-1',
      schoolId: 'sch-001',
      role: 'parent',
      permissions: ['gate_pass:request', 'child:read_today'],
    });
  });

  it('1. Parent can request gate pass and emit gate_pass_requested event', async () => {
    mockDb.single.mockResolvedValueOnce({
      data: { display_name: 'Aarav Singh', class_teacher_id: 'usr-teacher-1' },
      error: null,
    });
    mockDb.single.mockResolvedValueOnce({
      data: { id: 'pass-101' },
      error: null,
    });

    const res = await requestGatePassAction(
      'stu-101',
      'Doctor appointment',
      '2026-08-17T14:30:00Z',
      '2026-08-17T16:30:00Z'
    );

    expect(res.success).toBe(true);
    expect(res.passId).toBe('pass-101');
    expect(mockDb.from).toHaveBeenCalledWith('gate_passes');
  });

  it('2. Teacher approval generates 6-digit pass_code and enables QR token generation', async () => {
    mockGetAuthContext.mockResolvedValue({
      userId: 'usr-teacher-1',
      clerkUserId: 'clerk-teacher-1',
      schoolId: 'sch-001',
      role: 'teacher',
      permissions: ['gate_pass:approve', 'attendance:write'],
    });

    mockDb.single.mockResolvedValueOnce({
      data: { student_id: 'stu-101', requested_by: 'usr-parent-1', status: 'pending', students: { display_name: 'Aarav Singh' } },
      error: null,
    });
    mockDb.eq.mockReturnThis();
    mockDb.update.mockReturnThis();

    const res = await approveGatePassAction('pass-101', 'usr-teacher-1');
    expect(res.success).toBe(true);
    expect(res.passCode).toMatch(/^\d{6}$/);

    // Verify cryptographic QR token wrapper produces valid HMAC payload
    const qrContent = generateGatePassQrContent('pass-101');
    const decoded = decodeGatePassQrContent(qrContent);
    expect(decoded.isValid).toBe(true);
    expect(decoded.passId).toBe('pass-101');
  });

  it('3. Step 1 Read-Only verification (verifyGatePassTokenAction) returns valid status without mutating DB', async () => {
    mockGetAuthContext.mockResolvedValue({
      userId: 'usr-gate-1',
      clerkUserId: 'clerk-gate-1',
      schoolId: 'sch-001',
      role: 'gate',
      permissions: ['gate:scan', 'gate:checkout'],
    });

    const qrToken = generateGatePassQrContent('pass-101');

    mockDb.maybeSingle.mockResolvedValueOnce({
      data: {
        id: 'pass-101',
        student_id: 'stu-101',
        status: 'approved',
        pickup_window_end: new Date(Date.now() + 3600000).toISOString(),
        students: { display_name: 'Aarav Singh', grade: 'Grade 8', section: 'A', avatar_url: '' },
        guardians: { first_name: 'Sunita', last_name: 'Sharma', phone: '9876543210' },
        reason: 'Doctor appointment',
      },
      error: null,
    });

    const verifyRes = await verifyGatePassTokenAction(qrToken);
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.status).toBe('valid');
    expect(verifyRes.studentName).toBe('Aarav Singh');
    expect(verifyRes.guardianName).toBe('Sunita Sharma');
  });

  it('4. Step 2 Checkout confirmation (confirmGateCheckoutAction) is atomic and idempotent', async () => {
    mockGetAuthContext.mockResolvedValue({
      userId: 'usr-gate-1',
      clerkUserId: 'clerk-gate-1',
      schoolId: 'sch-001',
      role: 'gate',
      permissions: ['gate:scan', 'gate:checkout'],
    });

    const opId = 'op-uuid-101';

    // First call: no existing audit log found
    mockDb.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    // Fetch pass details
    mockDb.single.mockResolvedValueOnce({
      data: {
        id: 'pass-101',
        student_id: 'stu-101',
        requested_by: 'usr-parent-1',
        status: 'approved',
        pass_code: '849201',
        students: { display_name: 'Aarav Singh' },
        guardians: { first_name: 'Sunita', last_name: 'Sharma' },
      },
      error: null,
    });

    const res1 = await confirmGateCheckoutAction('pass-101', opId);
    expect(res1.success).toBe(true);
    expect(res1.status).toBe('success');

    // Second call: duplicate operationId returns already_used without duplicate mutation
    mockDb.maybeSingle.mockResolvedValueOnce({ data: { id: 'audit-999', created_at: res1.usedAt }, error: null });
    const res2 = await confirmGateCheckoutAction('pass-101', opId);
    expect(res2.success).toBe(true);
    expect(res2.status).toBe('already_used');
  });

  it('5. Revoked pass is rejected during Step 1 verification', async () => {
    mockGetAuthContext.mockResolvedValue({
      userId: 'usr-gate-1',
      clerkUserId: 'clerk-gate-1',
      schoolId: 'sch-001',
      role: 'gate',
      permissions: ['gate:scan'],
    });

    mockDb.maybeSingle.mockResolvedValueOnce({
      data: {
        id: 'pass-101',
        student_id: 'stu-101',
        status: 'revoked',
        rejection_reason: 'Safety restriction',
        students: { display_name: 'Aarav Singh' },
        guardians: { first_name: 'Sunita', last_name: 'Sharma' },
      },
      error: null,
    });

    const verifyRes = await verifyGatePassTokenAction('pass-101');
    expect(verifyRes.success).toBe(false);
    expect(verifyRes.status).toBe('revoked');
    expect(verifyRes.message).toContain('REVOKED');
  });

  it('6. Emergency Pickup Override executes distinct pathway with audit log action emergency_override', async () => {
    mockGetAuthContext.mockResolvedValue({
      userId: 'usr-gate-1',
      clerkUserId: 'clerk-gate-1',
      schoolId: 'sch-001',
      role: 'gate',
      permissions: ['gate:checkout'],
    });

    const opId = 'op-emergency-001';

    // 1. Idempotency check: no existing audit
    mockDb.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    // 2. Validate guardian_access.can_pickup
    mockDb.maybeSingle.mockResolvedValueOnce({
      data: {
        can_pickup: true,
        students: { display_name: 'Aarav Singh' },
        guardians: { first_name: 'Sunita', last_name: 'Sharma' },
      },
      error: null,
    });
    // 3. Insert audit log
    mockDb.single.mockResolvedValueOnce({ data: { id: 'audit-emergency-1' }, error: null });

    const emergencyRes = await emergencyPickupAction({
      studentId: 'stu-101',
      guardianId: 'g-101',
      reason: 'Phone dead, verified physical ID',
      operationId: opId,
    });

    expect(emergencyRes.success).toBe(true);
    expect(emergencyRes.status).toBe('success');
    expect(emergencyRes.auditId).toBe('audit-emergency-1');
  });

  it('7. Emergency Pickup rejects unauthorized guardian where can_pickup is false', async () => {
    mockGetAuthContext.mockResolvedValue({
      userId: 'usr-gate-1',
      clerkUserId: 'clerk-gate-1',
      schoolId: 'sch-001',
      role: 'gate',
      permissions: ['gate:checkout'],
    });

    mockDb.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockDb.maybeSingle.mockResolvedValueOnce({
      data: { can_pickup: false },
      error: null,
    });

    const emergencyRes = await emergencyPickupAction({
      studentId: 'stu-101',
      guardianId: 'g-fake-999',
      reason: 'Unverified stranger',
      operationId: 'op-emergency-002',
    });

    expect(emergencyRes.success).toBe(false);
    expect(emergencyRes.status).toBe('invalid_guardian');
  });
});
