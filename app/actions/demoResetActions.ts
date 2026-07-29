'use server';

import { createClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

export interface DemoResetResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Reset Demo Data
 * 
 * Resets the canonical demo student (Aarav Sharma) data to its initial state.
 * This is useful for demo purposes to restore the platform to a known good state.
 * 
 * WARNING: This will delete all interventions, tasks, and ecosystem events
 * for the canonical demo student.
 */
export async function resetDemoDataAction(): Promise<DemoResetResult> {
  const supabase = createClient();

  try {
    // Delete interventions for canonical student
    const { error: interventionsError } = await supabase
      .from('interventions')
      .delete()
      .eq('student_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

    if (interventionsError && interventionsError.code !== 'PGRST116') {
      console.error('Failed to delete interventions:', interventionsError);
    }

    // Delete student tasks for canonical student
    const { error: tasksError } = await supabase
      .from('student_tasks')
      .delete()
      .eq('student_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

    if (tasksError && tasksError.code !== 'PGRST116') {
      console.error('Failed to delete tasks:', tasksError);
    }

    // Delete ecosystem events for canonical student
    const { error: eventsError } = await supabase
      .from('ecosystem_events')
      .delete()
      .eq('student_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

    if (eventsError && eventsError.code !== 'PGRST116') {
      console.error('Failed to delete ecosystem events:', eventsError);
    }

    // Reset status flag for canonical student
    const { error: statusFlagError } = await supabase
      .from('status_flags')
      .update({
        action_status: 'pending',
        acted_by: null,
        acted_at: null,
        resolved_at: null,
      })
      .eq('student_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

    if (statusFlagError && statusFlagError.code !== 'PGRST116') {
      console.error('Failed to reset status flag:', statusFlagError);
    }

    // Revalidate all paths
    revalidatePath('/teacher');
    revalidatePath('/parent');
    revalidatePath('/student');
    revalidatePath('/admin');
    revalidatePath('/demo/connected');

    return {
      success: true,
      message: 'Demo data reset successfully. Canonical student data restored to initial state.',
    };

  } catch (error) {
    console.error('Reset demo data failed:', error);
    return {
      success: false,
      message: 'Failed to reset demo data',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
