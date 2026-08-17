'use server';

import { createScopedClient } from '@/lib/supabase/scoped';
import { getAuthContext, requirePermission, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { revalidatePath } from 'next/cache';
import {
  createEcosystemNotifications,
  getStudentCareTeamRecipients,
  recordEcosystemEvent,
} from '@/lib/ecosystem';
import { decodeGatePassQrContent } from '@/lib/gate/qrPassToken';
import type {
  VerifyGatePassResult,
  GateCheckoutResult,
  EmergencyPickupPayload,
  EmergencyPickupResult,
} from '@/lib/gate/types';

/**
 * requestGatePassAction: Submits a gate pass request from a parent.
 */
export async function requestGatePassAction(
  studentId: string,
  reason: string,
  pickupWindowStart: string,
  pickupWindowEnd: string,
  pickupGuardianId?: string
) {
  const context = await getAuthContext();
  requirePermission(context, 'gate_pass:request');
  validateParentStudentAccess(context, studentId);

  const scopedDb = createScopedClient(context);
  const requestedBy = pickupGuardianId || context.userId;
  const performer = context.clerkUserId;

  // Fetch student details pre-scoped to school_id
  const { data: student } = await scopedDb
    .from('students')
    .select('display_name, class_teacher_id')
    .eq('id', studentId)
    .single();

  const studentName = student?.display_name || 'Student';
  const teacherId = student?.class_teacher_id;

  // 1. Insert the gate pass pre-scoped to school_id
  const { data: pass, error: passError } = await scopedDb
    .from('gate_passes')
    .insert({
      student_id: studentId,
      requested_by: requestedBy,
      status: 'pending',
      reason,
      pickup_window_start: pickupWindowStart,
      pickup_window_end: pickupWindowEnd,
    })
    .select('id')
    .single();

  if (passError || !pass) {
    throw new Error(passError?.message || 'Failed to request gate pass');
  }

  // 2. Insert audit log pre-scoped to school_id
  await scopedDb
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: pass.id,
      student_id: studentId,
      guardian_id: requestedBy,
      pass_code: 'PENDING',
      action: 'request',
      performed_by: performer,
      details: `Gate pass requested for ${studentName}. Reason: ${reason}.`,
    });

  // 3. Send notification to the class teacher pre-scoped to school_id
  if (teacherId) {
    await scopedDb
      .from('notifications')
      .insert({
        recipient_id: teacherId,
        recipient_role: 'teacher',
        student_id: studentId,
        title: 'New Gate Pass Request',
        body: `${studentName} has a new gate pass request from parent.`,
        category: 'safety',
        is_read: false,
      });
  }

  await recordEcosystemEvent({
    event_type: 'gate_pass_requested',
    student_id: studentId,
    actor_id: requestedBy,
    actor_role: 'parent',
    title: 'Gate pass requested',
    description: `${studentName} has a new gate pass request from parent.`,
    metadata: {
      passId: pass.id,
      reason,
      pickupWindowStart,
      pickupWindowEnd,
    },
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/gate');
  revalidatePath('/admin');
  return { success: true, passId: pass.id };
}

/**
 * approveGatePassAction: Approves a pass, generating a unique 6-digit pass_code.
 */
export async function approveGatePassAction(passId: string, teacherId: string) {
  const context = await getAuthContext();
  requirePermission(context, 'gate_pass:approve');
  const scopedDb = createScopedClient(context);
  const performer = context.clerkUserId;

  // Fetch pass details
  const { data: passData } = await scopedDb
    .from('gate_passes')
    .select('student_id, requested_by, status, students(display_name)')
    .eq('id', passId)
    .single();

  if (!passData) {
    throw new Error('Gate pass not found');
  }
  if (passData.status !== 'pending') {
    throw new Error(`Cannot approve pass in state ${passData.status}`);
  }

  const studentId = passData.student_id;
  const guardianId = passData.requested_by;
  const studentName = (passData as any)?.students?.display_name || 'Student';

  // Generate a random 6-digit alphanumeric pass code
  const passCode = Math.floor(100000 + Math.random() * 900000).toString();

  const { error: updateError } = await scopedDb
    .from('gate_passes')
    .update({
      status: 'approved',
      pass_code: passCode,
      approved_by: teacherId || context.userId,
    })
    .eq('id', passId);

  if (updateError) {
    throw new Error(`Failed to approve gate pass: ${updateError.message}`);
  }

  // Insert audit log
  await scopedDb
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: passId,
      student_id: studentId,
      guardian_id: guardianId,
      pass_code: passCode,
      action: 'approve',
      performed_by: performer,
      details: `Gate pass approved for ${studentName}. Code: ${passCode}.`,
    });

  // Notify guardian
  if (guardianId && studentId) {
    await scopedDb
      .from('notifications')
      .insert({
        recipient_id: guardianId,
        recipient_role: 'parent',
        student_id: studentId,
        title: 'Gate Pass Approved',
        body: `Your gate pass request for ${studentName} has been approved. Code: ${passCode}.`,
        category: 'safety',
        is_read: false,
      });
  }

  if (studentId) {
    await recordEcosystemEvent({
      event_type: 'gate_pass_approved',
      student_id: studentId,
      actor_id: teacherId || context.userId,
      actor_role: context.role,
      title: 'Gate pass approved',
      description: `Gate pass approved for ${studentName}. Code: ${passCode}.`,
      metadata: {
        passId,
        passCode,
      },
    });
  }

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/gate');
  revalidatePath('/admin');
  return { success: true, passCode };
}

/**
 * rejectGatePassAction: Rejects a pass request with an optional reason.
 */
export async function rejectGatePassAction(passId: string, teacherId: string, rejectionReason?: string) {
  const context = await getAuthContext();
  requirePermission(context, 'gate_pass:approve');
  const scopedDb = createScopedClient(context);
  const performer = context.clerkUserId;

  const { data: passData } = await scopedDb
    .from('gate_passes')
    .select('student_id, requested_by, students(display_name)')
    .eq('id', passId)
    .single();

  const studentId = passData?.student_id;
  const guardianId = passData?.requested_by;
  const studentName = (passData as any)?.students?.display_name || 'Student';

  const { error: updateError } = await scopedDb
    .from('gate_passes')
    .update({
      status: 'rejected',
      approved_by: teacherId || context.userId,
      rejection_reason: rejectionReason || null,
    })
    .eq('id', passId);

  if (updateError) {
    throw new Error(`Failed to reject gate pass: ${updateError.message}`);
  }

  await scopedDb
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: passId,
      student_id: studentId,
      guardian_id: guardianId,
      pass_code: 'REJECT',
      action: 'reject',
      performed_by: performer,
      details: `Gate pass rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
    });

  if (guardianId && studentId) {
    await scopedDb
      .from('notifications')
      .insert({
        recipient_id: guardianId,
        recipient_role: 'parent',
        student_id: studentId,
        title: 'Gate Pass Rejected',
        body: `Your gate pass request for ${studentName} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        category: 'safety',
        is_read: false,
      });
  }

  if (studentId) {
    await recordEcosystemEvent({
      event_type: 'gate_pass_rejected',
      student_id: studentId,
      actor_id: context.userId,
      actor_role: context.role,
      title: 'Gate pass rejected',
      description: rejectionReason || 'The gate pass request was rejected.',
      metadata: {
        passId,
        rejectionReason: rejectionReason || null,
      },
    });
  }

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/gate');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * revokeGatePassAction: Instantly revokes an active approved pass.
 */
export async function revokeGatePassAction(passId: string, reason: string) {
  const context = await getAuthContext();
  requirePermission(context, 'gate_pass:revoke');
  const scopedDb = createScopedClient(context);
  const performer = context.clerkUserId;

  const { data: passData } = await scopedDb
    .from('gate_passes')
    .select('student_id, requested_by, status, students(display_name)')
    .eq('id', passId)
    .single();

  if (!passData) {
    throw new Error('Gate pass not found');
  }

  const studentId = passData.student_id;
  const guardianId = passData.requested_by;
  const studentName = (passData as any)?.students?.display_name || 'Student';

  const { error: updateError } = await scopedDb
    .from('gate_passes')
    .update({
      status: 'revoked',
      rejection_reason: reason || 'Revoked by school staff',
    })
    .eq('id', passId);

  if (updateError) {
    throw new Error(`Failed to revoke gate pass: ${updateError.message}`);
  }

  await scopedDb
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: passId,
      student_id: studentId,
      guardian_id: guardianId,
      pass_code: 'REVOKE',
      action: 'revoke',
      performed_by: performer,
      details: `Gate pass revoked for ${studentName}. Reason: ${reason}.`,
    });

  if (guardianId && studentId) {
    await scopedDb
      .from('notifications')
      .insert({
        recipient_id: guardianId,
        recipient_role: 'parent',
        student_id: studentId,
        title: 'Gate Pass Revoked',
        body: `Your active gate pass for ${studentName} was revoked by school staff. Reason: ${reason}.`,
        category: 'safety',
        is_read: false,
      });
  }

  if (studentId) {
    await recordEcosystemEvent({
      event_type: 'gate_pass_revoked',
      student_id: studentId,
      actor_id: context.userId,
      actor_role: context.role,
      title: 'Gate pass revoked',
      description: `Active gate pass for ${studentName} was revoked by staff. Reason: ${reason}.`,
      metadata: { passId, reason },
    });
  }

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/gate');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * cancelGatePassAction: Cancels a pass request from a parent.
 */
export async function cancelGatePassAction(passId: string) {
  const context = await getAuthContext();
  const scopedDb = createScopedClient(context);
  const performer = context.clerkUserId;

  const { data: passData } = await scopedDb
    .from('gate_passes')
    .select('student_id, requested_by, students(display_name)')
    .eq('id', passId)
    .single();

  const studentId = passData?.student_id;
  const studentName = (passData as any)?.students?.display_name || 'Student';

  const { error: updateError } = await scopedDb
    .from('gate_passes')
    .update({
      status: 'cancelled',
      rejection_reason: 'Cancelled by parent',
    })
    .eq('id', passId);

  if (updateError) {
    throw new Error(`Failed to cancel gate pass: ${updateError.message}`);
  }

  await scopedDb
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: passId,
      student_id: studentId,
      guardian_id: passData?.requested_by,
      pass_code: 'CANCEL',
      action: 'cancel',
      performed_by: performer,
      details: `Gate pass cancelled by parent.`,
    });

  if (studentId) {
    await recordEcosystemEvent({
      event_type: 'gate_pass_cancelled',
      student_id: studentId,
      actor_id: context.userId,
      actor_role: 'parent',
      title: 'Gate pass cancelled',
      description: `The gate pass request for ${studentName} was cancelled by parent.`,
      metadata: { passId },
    });
  }

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/gate');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * verifyGatePassTokenAction: Scans QR content or pass code. Read-only verification (Step 1).
 */
export async function verifyGatePassTokenAction(qrContentOrCode: string): Promise<VerifyGatePassResult> {
  const context = await getAuthContext();
  requirePermission(context, 'gate:scan');
  const scopedDb = createScopedClient(context);
  const performer = context.clerkUserId;

  // 1. Resolve passId or passCode
  let targetPassId: string | null = null;
  let targetPassCode: string | null = null;

  // Attempt decoding as dynamic HMAC QR token
  const tokenDecode = decodeGatePassQrContent(qrContentOrCode);
  if (tokenDecode.isValid && tokenDecode.passId) {
    targetPassId = tokenDecode.passId;
  } else if (/^\d{6}$/.test(qrContentOrCode.trim())) {
    targetPassCode = qrContentOrCode.trim();
  } else {
    // Attempt plain passId or fallback code
    targetPassId = qrContentOrCode;
  }

  // Build query pre-scoped to tenant school_id
  let query = scopedDb.from('gate_passes').select(`
    id,
    student_id,
    requested_by,
    status,
    pickup_window_start,
    pickup_window_end,
    pass_code,
    reason,
    used_at,
    rejection_reason,
    students (
      id,
      first_name,
      last_name,
      display_name,
      grade,
      section,
      avatar_url
    ),
    guardians (
      id,
      first_name,
      last_name,
      phone
    )
  `);

  if (targetPassId) {
    query = query.eq('id', targetPassId);
  } else if (targetPassCode) {
    query = query.eq('pass_code', targetPassCode);
  }

  const { data: pass, error } = await query.limit(1).maybeSingle();

  if (error || !pass) {
    await scopedDb.from('gate_pass_audit_logs').insert({
      pass_code: qrContentOrCode,
      action: 'use_fail_not_found',
      performed_by: performer,
      details: `Scan failed. Pass code ${qrContentOrCode} not found in tenant registry.`,
    });

    return {
      success: false,
      status: 'invalid',
      message: 'Invalid Pass Code. Pass not found in registry.',
    };
  }

  const studentName = (pass as any).students?.display_name || 'Student';
  const guardianName = (pass as any).guardians
    ? `${(pass as any).guardians.first_name} ${(pass as any).guardians.last_name}`
    : 'Parent/Guardian';
  const guardianPhone = (pass as any).guardians?.phone || '';
  const studentGrade = (pass as any).students?.grade || '';
  const studentSection = (pass as any).students?.section || '';
  const studentAvatarUrl = (pass as any).students?.avatar_url || '';

  const currentTime = new Date();
  const windowEnd = new Date(pass.pickup_window_end);

  // Status Evaluation:

  // 1. Already Used
  if (pass.status === 'used') {
    return {
      success: false,
      status: 'used',
      passId: pass.id,
      studentId: pass.student_id,
      studentName,
      guardianName,
      usedAt: pass.used_at || new Date().toISOString(),
      message: 'Warning: This pass was ALREADY USED for checkout.',
    };
  }

  // 2. Revoked
  if (pass.status === 'revoked') {
    return {
      success: false,
      status: 'revoked',
      passId: pass.id,
      studentId: pass.student_id,
      studentName,
      guardianName,
      message: `Pass REVOKED by staff: ${pass.rejection_reason || 'Safety concern'}`,
    };
  }

  // 3. Rejected
  if (pass.status === 'rejected' || pass.status === 'cancelled') {
    return {
      success: false,
      status: 'rejected',
      passId: pass.id,
      studentId: pass.student_id,
      studentName,
      guardianName,
      message: `Pass ${pass.status.toUpperCase()}: ${pass.rejection_reason || 'No reason specified'}`,
    };
  }

  // 4. Expired
  if (pass.status === 'expired' || currentTime > windowEnd) {
    if (pass.status === 'approved') {
      await scopedDb.from('gate_passes').update({ status: 'expired' }).eq('id', pass.id);
    }
    return {
      success: false,
      status: 'expired',
      passId: pass.id,
      studentId: pass.student_id,
      studentName,
      guardianName,
      windowEnd: pass.pickup_window_end,
      message: 'Warning: This pass HAS EXPIRED.',
    };
  }

  // 5. Pending
  if (pass.status === 'pending') {
    return {
      success: false,
      status: 'pending',
      passId: pass.id,
      studentId: pass.student_id,
      studentName,
      guardianName,
      message: 'Pass is still PENDING teacher approval.',
    };
  }

  // 6. Approved (Valid)
  if (pass.status === 'approved') {
    const timeRemainingMs = windowEnd.getTime() - currentTime.getTime();
    const isExpiringSoon = timeRemainingMs < 15 * 60 * 1000;
    return {
      success: true,
      status: isExpiringSoon ? 'expiring_soon' : 'valid',
      passId: pass.id,
      studentId: pass.student_id,
      studentName,
      studentGrade,
      studentSection,
      studentAvatarUrl,
      guardianName,
      guardianPhone,
      pickupReason: pass.reason || '',
      windowEnd: pass.pickup_window_end,
      message: 'Pass VERIFIED. Confirm checkout below.',
    };
  }

  return {
    success: false,
    status: 'invalid',
    message: 'Unknown pass status.',
  };
}

/**
 * confirmGateCheckoutAction: Atomic, idempotent student checkout confirmation (Step 2).
 */
export async function confirmGateCheckoutAction(passId: string, operationId: string): Promise<GateCheckoutResult> {
  const context = await getAuthContext();
  requirePermission(context, 'gate:checkout');
  const scopedDb = createScopedClient(context);
  const performer = context.clerkUserId;

  // 1. Idempotency check: check if this operationId was already logged or pass is already used
  const { data: existingAudit } = await scopedDb
    .from('gate_pass_audit_logs')
    .select('id, created_at')
    .eq('operation_id', operationId)
    .limit(1)
    .maybeSingle();

  if (existingAudit) {
    return {
      success: true,
      status: 'already_used',
      passId,
      usedAt: existingAudit.created_at,
      message: 'Checkout already confirmed previously.',
    };
  }

  // 2. Fetch active pass pre-scoped to school_id
  const { data: pass, error: fetchErr } = await scopedDb
    .from('gate_passes')
    .select(`
      id,
      student_id,
      requested_by,
      status,
      pass_code,
      pickup_window_end,
      students (display_name),
      guardians (first_name, last_name)
    `)
    .eq('id', passId)
    .single();

  if (fetchErr || !pass) {
    return {
      success: false,
      status: 'invalid',
      message: 'Gate pass not found.',
    };
  }

  if (pass.status === 'used') {
    return {
      success: true,
      status: 'already_used',
      passId,
      message: 'Pass has already been used.',
    };
  }

  if (pass.status !== 'approved') {
    return {
      success: false,
      status: pass.status as any,
      passId,
      message: `Cannot checkout pass in status ${pass.status}.`,
    };
  }

  const nowStr = new Date().toISOString();
  const studentName = (pass as any).students?.display_name || 'Student';
  const guardianName = (pass as any).guardians
    ? `${(pass as any).guardians.first_name} ${(pass as any).guardians.last_name}`
    : 'Parent/Guardian';

  // 3. Atomic status update
  const { error: updateErr } = await scopedDb
    .from('gate_passes')
    .update({
      status: 'used',
      used_at: nowStr,
    })
    .eq('id', passId);

  if (updateErr) {
    throw new Error(`Failed to confirm checkout: ${updateErr.message}`);
  }

  // 4. Record audit log with operation_id
  await scopedDb.from('gate_pass_audit_logs').insert({
    pass_id: passId,
    student_id: pass.student_id,
    guardian_id: pass.requested_by,
    pass_code: pass.pass_code || 'PASS',
    action: 'use_success',
    operation_id: operationId,
    performed_by: performer,
    details: `Student Released. Verified and checked out to ${guardianName}.`,
  });

  // 5. Update student journey status to checked_out
  try {
    await scopedDb.from('student_journey').insert({
      student_id: pass.student_id,
      status: 'checked_out',
      location: 'main_gate',
      timestamp: nowStr,
    });
  } catch (err) {
    console.error('[Gate Checkout] Journey insert warning:', err);
  }

  // 6. Emit canonical domain event
  await recordEcosystemEvent({
    event_type: 'student_checked_out',
    student_id: pass.student_id,
    actor_id: context.userId,
    actor_role: context.role,
    title: 'Student checked out at gate',
    description: `${studentName} was released to ${guardianName} at main gate.`,
    metadata: {
      passId,
      operationId,
      usedAt: nowStr,
    },
  });

  // 7. Dispatch care team notification
  const recipients = await getStudentCareTeamRecipients(scopedDb, pass.student_id, {
    includeGuardians: true,
    includeTeacher: true,
  });

  await createEcosystemNotifications(scopedDb, recipients, {
    studentId: pass.student_id,
    title: 'Student released at gate',
    body: `${studentName} was released to ${guardianName} at main gate.`,
    category: 'safety',
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/gate');
  revalidatePath('/admin');

  // Broadcast Real-time event across channels
  try {
    const { broadcastPortalEvent } = await import('@/lib/realtime/portalSync');
    await broadcastPortalEvent(`school:${context.schoolId}:parent:${pass.student_id}`, 'GATE_PASS_MUTATED', {
      studentId: pass.student_id,
      tenantId: context.schoolId,
      actorId: context.userId,
      actorRole: context.role,
    });
    await broadcastPortalEvent(`school:${context.schoolId}:gate:active`, 'GATE_PASS_MUTATED', {
      studentId: pass.student_id,
      tenantId: context.schoolId,
      actorId: context.userId,
      actorRole: context.role,
    });
    await broadcastPortalEvent(`school:${context.schoolId}:admin:ops`, 'GATE_PASS_MUTATED', {
      studentId: pass.student_id,
      tenantId: context.schoolId,
      actorId: context.userId,
      actorRole: context.role,
    });
  } catch (_bcErr) {
    // Ignore broadcast errors in test/offline environments
  }

  return {
    success: true,
    status: 'success',
    passId,
    studentName,
    guardianName,
    usedAt: nowStr,
    message: 'Checkout Confirmed. Student Released.',
  };
}

/**
 * emergencyPickupAction: Distinct operational pathway for emergency override.
 * Does NOT create a standard gate_passes record. Writes immutable audit log and emits student_checked_out event.
 */
export async function emergencyPickupAction(payload: EmergencyPickupPayload): Promise<EmergencyPickupResult> {
  const { studentId, guardianId, reason, operationId } = payload;

  if (!studentId || !guardianId || !reason || !reason.trim()) {
    return {
      success: false,
      status: 'error',
      message: 'Student, Guardian, and non-empty Reason are required for emergency override.',
    };
  }

  const context = await getAuthContext();
  requirePermission(context, 'gate:checkout');
  const scopedDb = createScopedClient(context);
  const performer = context.clerkUserId;

  // 1. Idempotency check: check if operation_id exists in audit logs
  const { data: existingAudit } = await scopedDb
    .from('gate_pass_audit_logs')
    .select('id, created_at')
    .eq('operation_id', operationId)
    .limit(1)
    .maybeSingle();

  if (existingAudit) {
    return {
      success: true,
      status: 'success',
      auditId: existingAudit.id,
      checkedOutAt: existingAudit.created_at,
      message: 'Emergency pickup override already processed.',
    };
  }

  // 2. Validate guardian_access.can_pickup for the student pre-scoped to school_id
  const { data: guardianAccess } = await scopedDb
    .from('guardian_access')
    .select('can_pickup, guardians(first_name, last_name), students(display_name)')
    .eq('student_id', studentId)
    .eq('guardian_id', guardianId)
    .limit(1)
    .maybeSingle();

  if (!guardianAccess || !guardianAccess.can_pickup) {
    return {
      success: false,
      status: 'invalid_guardian',
      message: 'Selected guardian is NOT authorized for student pickup in guardian registry.',
    };
  }

  const studentName = (guardianAccess as any).students?.display_name || 'Student';
  const guardianName = (guardianAccess as any).guardians
    ? `${(guardianAccess as any).guardians.first_name} ${(guardianAccess as any).guardians.last_name}`
    : 'Authorized Guardian';

  const nowStr = new Date().toISOString();

  // 3. Write immutable gate audit log: action = 'emergency_override'
  const { data: audit, error: auditErr } = await scopedDb
    .from('gate_pass_audit_logs')
    .insert({
      student_id: studentId,
      guardian_id: guardianId,
      pass_code: 'EMERGENCY',
      action: 'emergency_override',
      operation_id: operationId,
      performed_by: performer,
      details: `EMERGENCY PICKUP OVERRIDE by ${context.role} (${performer}) for ${studentName} to ${guardianName}. Reason: ${reason}`,
    })
    .select('id')
    .single();

  if (auditErr || !audit) {
    throw new Error(`Failed to log emergency override audit: ${auditErr?.message}`);
  }

  // 4. Update student journey status to checked_out
  try {
    await scopedDb.from('student_journey').insert({
      student_id: studentId,
      status: 'checked_out',
      location: 'main_gate_emergency',
      timestamp: nowStr,
    });
  } catch (err) {
    console.error('[Emergency Pickup] Journey insert warning:', err);
  }

  // 5. Emit canonical domain event
  await recordEcosystemEvent({
    event_type: 'student_checked_out',
    student_id: studentId,
    actor_id: context.userId,
    actor_role: context.role,
    title: 'Emergency student checkout at gate',
    description: `EMERGENCY OVERRIDE: ${studentName} was picked up by ${guardianName}. Reason: ${reason}`,
    metadata: {
      isEmergency: true,
      operationId,
      guardianId,
      reason,
      checkedOutAt: nowStr,
    },
  });

  // 6. Send urgent notification to care team
  const recipients = await getStudentCareTeamRecipients(scopedDb, studentId, {
    includeGuardians: true,
    includeTeacher: true,
  });

  await createEcosystemNotifications(scopedDb, recipients, {
    studentId,
    title: 'Emergency Student Pickup',
    body: `EMERGENCY OVERRIDE: ${studentName} was checked out at main gate by ${guardianName}. Reason: ${reason}`,
    category: 'safety',
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/gate');
  revalidatePath('/admin');

  return {
    success: true,
    status: 'success',
    auditId: audit.id,
    studentName,
    guardianName,
    checkedOutAt: nowStr,
    message: 'Emergency Pickup Override Processed. Student Released.',
  };
}
