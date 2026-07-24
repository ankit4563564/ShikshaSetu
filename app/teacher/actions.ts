'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';

/**
 * Marks an active status flag as a false positive.
 * Inserts a correction record into `false_positive_corrections` and
 * updates the flag in `status_flags` to resolved.
 *
 * @param statusFlagId The UUID of the status flag to correct.
 * @param teacherId The UUID of the teacher making the correction.
 *                  TODO: teacherId is currently passed from the client since real auth isn't wired yet.
 *                  This must be replaced with a session-derived value in Phase 10.
 */
export async function markFalsePositiveAction(statusFlagId: string, teacherId: string) {
  const supabase = createClient();
  const { data: flag } = await supabase
    .from('status_flags')
    .select('student_id, status')
    .eq('id', statusFlagId)
    .maybeSingle();

  // 1. Insert correction log
  const { error: insertError } = await supabase
    .from('false_positive_corrections')
    .insert({
      status_flag_id: statusFlagId,
      corrected_by: teacherId,
      reason: 'Marked as false positive by teacher from dashboard'
    });

  if (insertError) {
    console.error('[Action Error] Failed to log false positive correction:', insertError);
    throw new Error(`Failed to log false positive correction: ${insertError.message}`);
  }

  // 2. Update status_flag to set resolved_at and change action_status to 'resolved'
  const { error: updateError } = await supabase
    .from('status_flags')
    .update({
      resolved_at: new Date().toISOString(),
      action_status: 'resolved'
    })
    .eq('id', statusFlagId);

  if (updateError) {
    console.error('[Action Error] Failed to resolve status flag:', updateError);
    throw new Error(`Failed to resolve status flag: ${updateError.message}`);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'evidence_logged',
    studentId: flag?.student_id || null,
    actorId: teacherId,
    actorRole: 'teacher',
    title: 'Status flag resolved as false positive',
    body: flag?.status ? `Resolved ${flag.status} status flag.` : 'Resolved status flag.',
    metadata: {
      statusFlagId,
      previousStatus: flag?.status || null,
      resolution: 'false_positive',
    },
  });

  // 3. Revalidate path to update Server Components
  revalidatePath('/teacher');
  revalidatePath('/parent');
  revalidatePath('/admin');
}
