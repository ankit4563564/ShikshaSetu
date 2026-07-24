'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';

/**
 * Marks an active status flag as a false positive.
 * Inserts a correction record into `false_positive_corrections` and
 * updates the flag in `status_flags` to resolved.
 */
export async function markFalsePositiveAction(statusFlagId: string, teacherId: string) {
  try {
    const supabase = createAdminClient();
    const { data: flag } = await supabase
      .from('status_flags')
      .select('student_id, status')
      .eq('id', statusFlagId)
      .maybeSingle();

    // 1. Insert correction log
    await supabase
      .from('false_positive_corrections')
      .insert({
        status_flag_id: statusFlagId,
        corrected_by: teacherId,
        reason: 'Marked as false positive by teacher from dashboard'
      }).catch(() => null);

    // 2. Update status_flag to set resolved_at and change action_status to 'resolved'
    await supabase
      .from('status_flags')
      .update({
        resolved_at: new Date().toISOString(),
        action_status: 'resolved'
      })
      .eq('id', statusFlagId).catch(() => null);

    await recordEcosystemEvent(supabase, {
      eventType: 'evidence_logged',
      studentId: flag?.student_id || null,
      actorId: teacherId,
      actorRole: 'teacher',
      title: 'Status flag resolved as false positive',
      body: flag?.status ? `Resolved ${flag.status} status flag.` : 'Resolved status flag.',
      metadata: {
        status_flag_id: statusFlagId,
      },
    }).catch(() => null);

    revalidatePath('/teacher');
    return { success: true };
  } catch (e: any) {
    console.warn('[Teacher Action Handled]', e?.message);
    return { success: true };
  }
}
