'use server';

import { createClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

// Canonical student ID for Aarav Sharma
const CANONICAL_STUDENT_ID = '00000000-0000-4000-8000-000000000001';
const CANONICAL_TEACHER_ID = '00000000-0000-4000-8000-000000000002';

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
      .eq('student_id', CANONICAL_STUDENT_ID);

    if (interventionsError && interventionsError.code !== 'PGRST116') {
      console.error('Failed to delete interventions:', interventionsError);
    }

    // Delete intervention milestones for canonical student
    const { error: milestonesError } = await supabase
      .from('intervention_milestones')
      .delete()
      .in('intervention_id', 
        supabase.from('interventions').select('id').eq('student_id', CANONICAL_STUDENT_ID)
      );

    if (milestonesError && milestonesError.code !== 'PGRST116') {
      console.error('Failed to delete milestones:', milestonesError);
    }

    // Delete student tasks for canonical student
    const { error: tasksError } = await supabase
      .from('student_tasks')
      .delete()
      .eq('student_id', CANONICAL_STUDENT_ID);

    if (tasksError && tasksError.code !== 'PGRST116') {
      console.error('Failed to delete tasks:', tasksError);
    }

    // Delete ecosystem events for canonical student
    const { error: eventsError } = await supabase
      .from('ecosystem_events')
      .delete()
      .eq('student_id', CANONICAL_STUDENT_ID);

    if (eventsError && eventsError.code !== 'PGRST116') {
      console.error('Failed to delete ecosystem events:', eventsError);
    }

    // Reset status flag for canonical student
    const { error: statusFlagError } = await supabase
      .from('status_flags')
      .update({
        action_status: 'unseen',
        acted_by: null,
        acted_at: null,
        resolved_at: null,
      })
      .eq('student_id', CANONICAL_STUDENT_ID)
      .is('resolved_at', null);

    if (statusFlagError && statusFlagError.code !== 'PGRST116') {
      console.error('Failed to reset status flag:', statusFlagError);
    }

    // Refresh homework dates to be current (so signal detection works)
    const now = new Date();
    
    // Update missed homework to recent dates
    const { error: homeworkUpdateError } = await supabase
      .from('homework')
      .update({
        due_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submitted_at: null,
        created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('student_id', CANONICAL_STUDENT_ID)
      .eq('title', 'Algebra Worksheet B');

    if (homeworkUpdateError) console.error('Failed to update homework 1:', homeworkUpdateError);

    const { error: homeworkUpdateError2 } = await supabase
      .from('homework')
      .update({
        due_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submitted_at: null,
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('student_id', CANONICAL_STUDENT_ID)
      .eq('title', 'Physics Lab Report #2');

    if (homeworkUpdateError2) console.error('Failed to update homework 2:', homeworkUpdateError2);

    const { error: homeworkUpdateError3 } = await supabase
      .from('homework')
      .update({
        due_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submitted_at: null,
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('student_id', CANONICAL_STUDENT_ID)
      .eq('title', 'Geometry Practice');

    if (homeworkUpdateError3) console.error('Failed to update homework 3:', homeworkUpdateError3);

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
