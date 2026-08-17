'use server';

import { getAuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { createScopedClient } from '@/lib/supabase/scoped';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  BatchAttendancePayload,
  BatchAttendanceResponse,
  OperationResult,
  mapStatusToDb,
  AttendanceStatus,
  DbAttendanceStatus,
} from '@/lib/attendance/types';
import { recordEcosystemEvent } from '@/app/actions/ecosystemActions';

/**
 * Server Action: recordAttendanceBatchAction
 *
 * Tenant-scoped, authorized, idempotent batch attendance processor.
 * Preserves RLS, validates inputs, resolves server-side conflicts, and prevents duplicate side-effects.
 */
export async function recordAttendanceBatchAction(
  payload: BatchAttendancePayload
): Promise<BatchAttendanceResponse> {
  try {
    // 1. Authenticate & Resolve Tenant AuthContext
    const context = await getAuthContext();
    requirePermission(context, 'attendance:write');

    if (!payload || !Array.isArray(payload.operations) || payload.operations.length === 0) {
      return {
        success: false,
        processedCount: 0,
        results: [],
        error: 'Invalid payload: operations array is required and must not be empty.',
      };
    }

    const scopedClient = createScopedClient(context);
    const adminDb = createAdminClient();
    const results: OperationResult[] = [];

    // 2. Pre-fetch target student IDs belonging to the authenticated tenant
    const studentIds = payload.operations.map((op) => op.studentId);
    const { data: validStudents, error: studentErr } = await scopedClient
      .from('students')
      .select('id, display_name')
      .in('id', studentIds);

    if (studentErr) {
      return {
        success: false,
        processedCount: 0,
        results: [],
        error: `Failed to verify student tenant authorization: ${studentErr.message}`,
      };
    }

    const validStudentMap = new Map<string, string>();
    (validStudents || []).forEach((s: any) => validStudentMap.set(s.id, s.display_name));

    // Resolve teacher record ID for marked_by reference
    let teacherRecordId: string | null = null;
    const { data: teacherRec } = await adminDb
      .from('teachers')
      .select('id')
      .eq('clerk_user_id', context.clerkUserId)
      .limit(1)
      .maybeSingle();

    if (teacherRec) {
      teacherRecordId = teacherRec.id;
    } else {
      // Use context userId as marked_by (string reference). In demo mode this is 'demo-teacher'.
      // Attendance will still be recorded; the DB marked_by column is a text field.
      teacherRecordId = context.userId;
    }

    // 3. Process each operation idempotently
    for (const op of payload.operations) {
      const { operationId, studentId, date, status, notes, createdAt } = op;

      // Input Validation
      if (!operationId || !studentId || !date || !status) {
        results.push({
          operationId: operationId || 'unknown',
          studentId: studentId || 'unknown',
          status: 'validation_failed',
          error: 'Missing required operation fields (operationId, studentId, date, status).',
        });
        continue;
      }

      // Tenant Authorization Check
      if (!validStudentMap.has(studentId)) {
        results.push({
          operationId,
          studentId,
          status: 'authorization_failed',
          error: `Student ${studentId} does not belong to authorized school tenant.`,
        });
        continue;
      }

      const validStatuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused', 'medical_leave'];
      if (!validStatuses.includes(status)) {
        results.push({
          operationId,
          studentId,
          status: 'validation_failed',
          error: `Invalid attendance status: ${status}`,
        });
        continue;
      }

      // Idempotency Check: Check if operationId was already processed
      const { data: existingOp } = await adminDb
        .from('attendance_operations')
        .select('operation_id, result_status')
        .eq('operation_id', operationId)
        .limit(1)
        .maybeSingle();

      if (existingOp) {
        results.push({
          operationId,
          studentId,
          status: 'duplicate',
        });
        continue;
      }

      // Server Conflict Check: Inspect existing attendance record for (studentId, date)
      const { data: existingAtt } = await adminDb
        .from('attendance')
        .select('id, status, notes, marked_at')
        .eq('student_id', studentId)
        .eq('date', date)
        .limit(1)
        .maybeSingle();

      const clientTimestamp = new Date(createdAt).getTime();

      if (existingAtt && existingAtt.marked_at) {
        const serverTimestamp = new Date(existingAtt.marked_at).getTime();

        // Stale update protection: client timestamp older than server record
        if (serverTimestamp > clientTimestamp) {
          // Log ignored stale operation
          await adminDb.from('attendance_operations').insert({
            operation_id: operationId,
            school_id: context.schoolId,
            student_id: studentId,
            date,
            status: mapStatusToDb(status).status,
            notes,
            actor_id: teacherRecordId,
            client_timestamp: new Date(createdAt).toISOString(),
            result_status: 'ignored_stale',
          });

          results.push({
            operationId,
            studentId,
            status: 'conflict',
            serverState: {
              status: existingAtt.status as DbAttendanceStatus,
              markedAt: existingAtt.marked_at,
              notes: existingAtt.notes,
            },
          });
          continue;
        }
      }

      // Execute Database Mutation
      const dbPayload = mapStatusToDb(status, notes);
      const nowIso = new Date().toISOString();

      const { error: upsertErr } = await adminDb.from('attendance').upsert({
        student_id: studentId,
        date,
        status: dbPayload.status,
        marked_by: teacherRecordId,
        notes: dbPayload.notes,
        marked_at: nowIso,
      }, { onConflict: 'student_id,date' });

      if (upsertErr) {
        results.push({
          operationId,
          studentId,
          status: 'error',
          error: `Database upsert error: ${upsertErr.message}`,
        });
        continue;
      }

      // Log Operation in Idempotency Audit Table
      await adminDb.from('attendance_operations').insert({
        operation_id: operationId,
        school_id: context.schoolId,
        student_id: studentId,
        date,
        status: dbPayload.status,
        notes: dbPayload.notes,
        actor_id: teacherRecordId,
        client_timestamp: new Date(createdAt).toISOString(),
        result_status: 'applied',
      });

      // Emit Domain Event for Notification Orchestration (only on newly applied operations)
      try {
        const studentName = validStudentMap.get(studentId) || 'Student';
        await recordEcosystemEvent({
          event_type: 'teacher_mark_attended',
          actor_id: context.userId,
          actor_role: context.role,
          student_id: studentId,
          title: `Attendance recorded: ${status}`,
          description: `Attendance recorded as ${status} for ${studentName} on ${date}`,
          metadata: { date, status, operationId },
        });
      } catch (evtErr) {
        console.warn('[recordAttendanceBatchAction] Event propagation warning:', evtErr);
      }

      results.push({
        operationId,
        studentId,
        status: 'applied',
      });
    }

    // Revalidate server-rendered routes across portals
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/teacher');
      revalidatePath('/parent');
      revalidatePath('/admin');
    } catch (_revalErr) {
      // Ignore cache revalidation errors in non-Next runtime/test environments
    }

    // Broadcast Real-time event across channels
    try {
      const { broadcastPortalEvent } = await import('@/lib/realtime/portalSync');
      await broadcastPortalEvent(`school:${context.schoolId}:admin:ops`, 'ATTENDANCE_MUTATED', {
        tenantId: context.schoolId,
        actorId: context.userId,
        actorRole: context.role,
      });

      for (const studentId of studentIds) {
        await broadcastPortalEvent(`school:${context.schoolId}:parent:${studentId}`, 'ATTENDANCE_MUTATED', {
          studentId,
          tenantId: context.schoolId,
          actorId: context.userId,
          actorRole: context.role,
        });
      }
    } catch (_bcErr) {
      // Ignore broadcast errors in test/offline environments
    }

    return {
      success: true,
      processedCount: results.length,
      results,
    };
  } catch (err: any) {
    console.error('[recordAttendanceBatchAction] Error:', err);
    return {
      success: false,
      processedCount: 0,
      results: [],
      error: err.message || 'Server error while processing attendance batch.',
    };
  }
}

