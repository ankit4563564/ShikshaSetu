'use server';

import { createClient } from '@/lib/supabase/server';
import { createScopedClient } from '@/lib/supabase/scoped';
import { getAuthContext, requirePermission, validateParentStudentAccess } from '@/lib/auth/getAuthContext';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import {
  createEcosystemNotifications,
  getStudentCareTeamRecipients,
  recordEcosystemEvent,
} from '@/lib/ecosystem';

export interface VerifyPassResult {
  success: boolean;
  status: 'valid' | 'expiring_soon' | 'expired' | 'used' | 'pending' | 'rejected' | 'invalid';
  studentName?: string;
  guardianName?: string;
  studentGrade?: string;
  studentSection?: string;
  studentAvatarUrl?: string;
  usedAt?: string;
  windowEnd?: string;
  message: string;
}

/**
 * requestGatePassAction: Submits a gate pass request from a parent.
 */
export async function requestGatePassAction(
  studentId: string,
  reason: string,
  pickupWindowStart: string,
  pickupWindowEnd: string
) {
  const context = await getAuthContext();
  requirePermission(context, 'gate_pass:request');
  validateParentStudentAccess(context, studentId);

  const scopedDb = createScopedClient(context);
  let requestedBy = context.userId;
  let performer = context.clerkUserId;

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
      pass_code: 'PENDNG',
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

  await recordEcosystemEvent(supabase, {
    eventType: 'gate_pass_requested',
    studentId,
    actorId: requestedBy,
    actorRole: 'parent',
    title: 'Gate pass requested',
    body: `${studentName} has a new gate pass request from parent.`,
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
 * approveGatePassAction: Approves a pass, generating a unique 6-digit code.
 */
export async function approveGatePassAction(passId: string, teacherId: string) {
  const supabase = createClient();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let performer = teacherId;

  if (clerkKey) {
    const { userId } = await auth();
    if (userId) performer = userId;
  }

  // Fetch pass details to retrieve guardian and student name
  const { data: passData } = await supabase
    .from('gate_passes')
    .select('student_id, requested_by, students(display_name)')
    .eq('id', passId)
    .single();

  const studentId = passData?.student_id;
  const guardianId = passData?.requested_by;
  const studentName = (passData as any)?.students?.display_name || 'Student';

  // Generate a random 6-digit alphanumeric code
  const passCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Unified database updates: update pass status and write audit log
  const { error: updateError } = await supabase
    .from('gate_passes')
    .update({
      status: 'approved',
      pass_code: passCode,
      approved_by: teacherId,
    })
    .eq('id', passId);

  if (updateError) {
    throw new Error(`Failed to approve gate pass: ${updateError.message}`);
  }

  // Insert audit log
  await supabase
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: passId,
      pass_code: passCode,
      action: 'approve',
      performed_by: performer,
      details: `Gate pass approved for ${studentName}. Code: ${passCode}.`,
    });

  // Send notification to guardian
  if (guardianId && studentId) {
    await supabase
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
    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_approved',
      studentId,
      actorId: teacherId,
      actorRole: 'teacher',
      title: 'Gate pass approved',
      body: `Gate pass approved for ${studentName}.`,
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
 * generatePassCode: Retrieves the 6-digit code for a gate pass, enforcing teacher approval.
 */
export async function generatePassCode(passId: string): Promise<string | null> {
  const supabase = createClient();
  const { data: pass, error } = await supabase
    .from('gate_passes')
    .select('status, approved_by, pass_code')
    .eq('id', passId)
    .single();

  if (error || !pass) {
    throw new Error('Gate pass not found');
  }

  if (pass.status !== 'approved' || !pass.approved_by) {
    throw new Error('Gate pass is not approved yet');
  }

  return pass.pass_code;
}

/**
 * rejectGatePassAction: Rejects a pass with an optional reason.
 */
export async function rejectGatePassAction(passId: string, teacherId: string, rejectionReason?: string) {
  const supabase = createClient();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let performer = teacherId;

  if (clerkKey) {
    const { userId } = await auth();
    if (userId) performer = userId;
  }

  // Fetch pass details to retrieve guardian and student name
  const { data: passData } = await supabase
    .from('gate_passes')
    .select('student_id, requested_by, students(display_name)')
    .eq('id', passId)
    .single();

  const studentId = passData?.student_id;
  const guardianId = passData?.requested_by;
  const studentName = (passData as any)?.students?.display_name || 'Student';

  const { error: updateError } = await supabase
    .from('gate_passes')
    .update({
      status: 'rejected',
      approved_by: teacherId,
      rejection_reason: rejectionReason || null,
    })
    .eq('id', passId);

  if (updateError) {
    throw new Error(`Failed to reject gate pass: ${updateError.message}`);
  }

  // Insert audit log
  await supabase
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: passId,
      pass_code: 'REJECT',
      action: 'reject',
      performed_by: performer,
      details: `Gate pass rejected by Teacher ID: ${teacherId}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
    });

  // Send notification to guardian
  if (guardianId && studentId) {
    await supabase
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
    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_rejected',
      studentId,
      actorId: teacherId,
      actorRole: 'teacher',
      title: 'Gate pass rejected',
      body: rejectionReason || 'The gate pass request was rejected.',
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
 * cancelGatePassAction: Cancels a pass request from a parent.
 */
export async function cancelGatePassAction(passId: string) {
  const supabase = createClient();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let performer = 'parent';

  if (clerkKey) {
    const { userId } = await auth();
    if (userId) performer = userId;
  }

  // Fetch pass details to retrieve teacher and student info
  const { data: passData } = await supabase
    .from('gate_passes')
    .select('student_id, requested_by, students(display_name)')
    .eq('id', passId)
    .single();

  const studentId = passData?.student_id;
  const studentName = (passData as any)?.students?.display_name || 'Student';

  // Update status to rejected with special reason "Cancelled by parent"
  const { error: updateError } = await supabase
    .from('gate_passes')
    .update({
      status: 'rejected',
      rejection_reason: 'Cancelled by parent',
    })
    .eq('id', passId);

  if (updateError) {
    throw new Error(`Failed to cancel gate pass: ${updateError.message}`);
  }

  // Insert audit log
  await supabase
    .from('gate_pass_audit_logs')
    .insert({
      pass_id: passId,
      pass_code: 'CANCEL',
      action: 'cancel',
      performed_by: performer,
      details: `Gate pass cancelled by parent.`,
    });

  // Notify the class teacher
  if (studentId) {
    const { data: student } = await supabase
      .from('students')
      .select('class_teacher_id')
      .eq('id', studentId)
      .single();

    const teacherId = student?.class_teacher_id;
    if (teacherId) {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: teacherId,
          recipient_role: 'teacher',
          student_id: studentId,
          title: 'Gate Pass Cancelled',
          body: `The gate pass request for ${studentName} has been cancelled by the parent.`,
          category: 'safety',
          is_read: false,
        });
    }
  }

  if (studentId) {
    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_cancelled',
      studentId,
      actorId: passData?.requested_by || null,
      actorRole: 'parent',
      title: 'Gate pass cancelled',
      body: `The gate pass request for ${studentName} has been cancelled by the parent.`,
      metadata: {
        passId,
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
 * verifyGatePassAction: Scanned pass code check. Enforces 4 verification states.
 */
export async function verifyGatePassAction(passCode: string): Promise<VerifyPassResult> {
  const supabase = createClient();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let performer = 'gate-staff';

  if (clerkKey) {
    const { userId } = await auth();
    if (userId) performer = userId;
  }

  // 1. Query the pass with student and guardian details
  const { data: pass, error } = await supabase
    .from('gate_passes')
    .select(`
      id,
      student_id,
      status,
      pickup_window_start,
      pickup_window_end,
      used_at,
      students (
        first_name,
        last_name,
        display_name,
        grade,
        section,
        avatar_url
      ),
      guardians (
        first_name,
        last_name
      )
    `)
    .eq('pass_code', passCode)
    .limit(1)
    .maybeSingle();

  if (error || !pass) {
    await supabase
      .from('gate_pass_audit_logs')
      .insert({
        pass_code: passCode,
        action: 'use_fail_not_found',
        performed_by: performer,
        details: `Scan failed. Pass code ${passCode} not found in database.`,
      });

    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_scan_failed',
      actorId: performer,
      actorRole: 'gate',
      title: 'Gate pass scan failed',
      body: `Pass code ${passCode} was not found.`,
      metadata: {
        passCode,
        reason: 'not_found',
      },
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

  const currentTime = new Date();
  const windowEnd = new Date(pass.pickup_window_end);

  // Check 1: Already Used
  if (pass.status === 'used') {
    await supabase
      .from('gate_pass_audit_logs')
      .insert({
        pass_id: pass.id,
        pass_code: passCode,
        action: 'use_fail_already_used',
        performed_by: performer,
        details: `Scan failed. Pass code ${passCode} was already scanned previously.`,
      });

    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_scan_failed',
      studentId: pass.student_id,
      actorId: performer,
      actorRole: 'gate',
      title: 'Gate pass already used',
      body: `Pass code ${passCode} was already used.`,
      metadata: {
        passId: pass.id,
        passCode,
        reason: 'already_used',
      },
    });

    return {
      success: false,
      status: 'used',
      studentName,
      guardianName,
      usedAt: pass.used_at || new Date().toISOString(),
      message: 'Warning: This pass was already used.',
    };
  }

  // Check 2: Expired
  if (pass.status === 'expired' || currentTime > windowEnd) {
    if (pass.status === 'approved') {
      await supabase
        .from('gate_passes')
        .update({ status: 'expired' })
        .eq('id', pass.id);
    }

    await supabase
      .from('gate_pass_audit_logs')
      .insert({
        pass_id: pass.id,
        pass_code: passCode,
        action: 'use_fail_expired',
        performed_by: performer,
        details: `Scan failed. Pass code ${passCode} expired at ${pass.pickup_window_end}.`,
      });

    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_scan_failed',
      studentId: pass.student_id,
      actorId: performer,
      actorRole: 'gate',
      title: 'Gate pass expired',
      body: `Pass code ${passCode} expired at ${pass.pickup_window_end}.`,
      metadata: {
        passId: pass.id,
        passCode,
        reason: 'expired',
      },
    });

    return {
      success: false,
      status: 'expired',
      studentName,
      guardianName,
      windowEnd: pass.pickup_window_end,
      message: 'Warning: This pass has expired.',
    };
  }

  // Check 3: Rejected
  if (pass.status === 'rejected') {
    await supabase
      .from('gate_pass_audit_logs')
      .insert({
        pass_id: pass.id,
        pass_code: passCode,
        action: 'use_fail_rejected',
        performed_by: performer,
        details: `Scan failed. Pass code ${passCode} is marked rejected.`,
      });

    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_scan_failed',
      studentId: pass.student_id,
      actorId: performer,
      actorRole: 'gate',
      title: 'Rejected gate pass scanned',
      body: `Rejected pass code ${passCode} was scanned.`,
      metadata: {
        passId: pass.id,
        passCode,
        reason: 'rejected',
      },
    });

    return {
      success: false,
      status: 'rejected',
      studentName,
      guardianName,
      message: 'This pass was rejected by the class teacher.',
    };
  }

  // Check 4: Pending
  if (pass.status === 'pending') {
    await supabase
      .from('gate_pass_audit_logs')
      .insert({
        pass_id: pass.id,
        pass_code: passCode,
        action: 'use_fail_pending',
        performed_by: performer,
        details: `Scan failed. Pass code ${passCode} is still pending teacher approval.`,
      });

    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_scan_failed',
      studentId: pass.student_id,
      actorId: performer,
      actorRole: 'gate',
      title: 'Pending gate pass scanned',
      body: `Pending pass code ${passCode} was scanned.`,
      metadata: {
        passId: pass.id,
        passCode,
        reason: 'pending',
      },
    });

    return {
      success: false,
      status: 'pending',
      studentName,
      guardianName,
      message: 'This pass is still pending teacher approval.',
    };
  }

  // Check 5: Approved (Valid or Expiring Soon)
  if (pass.status === 'approved') {
    const timeRemainingMs = windowEnd.getTime() - currentTime.getTime();
    const isExpiringSoon = timeRemainingMs < 15 * 60 * 1000; // less than 15 mins remaining
    const resolvedStatus = isExpiringSoon ? 'expiring_soon' : 'valid';

    // Update status to used and timestamp
    const nowStr = new Date().toISOString();
    let removedJourneyIds: string[] = [];
    await supabase
      .from('gate_passes')
      .update({
        status: 'used',
        used_at: nowStr,
      })
      .eq('id', pass.id);

    // If the student is checked out early mid-route, remove their record from active bus trips
    // so they are removed from the conductor's active roster list and do not trigger false alerts.
    try {
      const { data: activeJourneys } = await supabase
        .from('student_journey')
        .select(`
          id,
          driver_trips!inner(status)
        `)
        .eq('student_id', pass.student_id)
        .eq('driver_trips.status', 'en_route');

      if (activeJourneys && activeJourneys.length > 0) {
        const journeyIds = activeJourneys.map((j: any) => j.id);
        removedJourneyIds = journeyIds;
        await supabase
          .from('student_journey')
          .delete()
          .in('id', journeyIds);
        console.log(`[Gate Pass Sync] Removed student ${pass.student_id} from active bus rosters.`);
      }
    } catch (syncErr) {
      console.error('[Gate Pass Sync] Failed to remove student from active bus rosters:', syncErr);
    }

    await supabase
      .from('gate_pass_audit_logs')
      .insert({
        pass_id: pass.id,
        pass_code: passCode,
        action: 'use_success',
        performed_by: performer,
        details: `Student Released. Pass code ${passCode} successfully verified. Checked in by: ${guardianName}.`,
      });

    await recordEcosystemEvent(supabase, {
      eventType: 'gate_pass_used',
      studentId: pass.student_id,
      actorId: performer,
      actorRole: 'gate',
      title: 'Student released at gate',
      body: `${studentName} was released to ${guardianName}.`,
      metadata: {
        passId: pass.id,
        passCode,
        usedAt: nowStr,
        status: resolvedStatus,
        removedJourneyIds,
      },
    });

    const recipients = await getStudentCareTeamRecipients(supabase, pass.student_id, {
      includeGuardians: true,
      includeTeacher: true,
    });

    await createEcosystemNotifications(supabase, recipients, {
      studentId: pass.student_id,
      title: 'Student released at gate',
      body: `${studentName} was released to ${guardianName}.`,
      category: 'safety',
    });

    revalidatePath('/parent');
    revalidatePath('/teacher');
    revalidatePath('/gate');
    revalidatePath('/driver');
    revalidatePath('/admin');

    const studentGrade = (pass as any).students?.grade || 'Grade 8';
    const studentSection = (pass as any).students?.section || 'A';
    const studentAvatarUrl = (pass as any).students?.avatar_url || '';

    return {
      success: true,
      status: resolvedStatus,
      studentName,
      guardianName,
      studentGrade,
      studentSection,
      studentAvatarUrl,
      usedAt: nowStr,
      message: 'Student Released',
    };
  }

  return {
    success: false,
    status: 'invalid',
    message: 'Unknown pass status.',
  };
}
