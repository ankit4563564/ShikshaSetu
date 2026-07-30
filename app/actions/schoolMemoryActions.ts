'use server';

import { createClient } from '@/lib/supabase/client';
import { CANONICAL_STUDENT_ID } from '@/lib/canonical';

export interface InterventionOutcome {
  signalType: string;
  interventionTitle: string;
  taskTitle: string;
  taskDescription: string;
  completedAt: string;
  outcome: 'success' | 'pending' | 'failed';
}

export interface SchoolMemoryData {
  studentId: string;
  studentName: string;
  recentOutcomes: InterventionOutcome[];
  totalInterventions: number;
  successRate: number;
}

/**
 * Get School Memory for canonical student
 * Returns actual persisted intervention outcomes from database
 */
export async function getSchoolMemoryAction(): Promise<SchoolMemoryData> {
  const supabase = createClient();

  try {
    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('display_name')
      .eq('id', CANONICAL_STUDENT_ID)
      .single();

    if (studentError || !student) {
      throw new Error('Student not found');
    }

    // Get completed interventions with tasks
    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .select(`
        id,
        signal_type,
        title,
        status,
        created_at,
        student_tasks (
          id,
          title,
          description,
          status,
          completed_at
        )
      `)
      .eq('student_id', CANONICAL_STUDENT_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    if (interventionsError) throw interventionsError;

    // Convert to outcome format
    const recentOutcomes: InterventionOutcome[] = [];
    let completedCount = 0;

    (interventions || []).forEach(inv => {
      const completedTask = inv.student_tasks?.find((t: any) => t.status === 'completed');
      
      if (completedTask) {
        completedCount++;
        recentOutcomes.push({
          signalType: inv.signal_type || 'unknown',
          interventionTitle: inv.title || 'Support intervention',
          taskTitle: completedTask.title || 'Task',
          taskDescription: completedTask.description || '',
          completedAt: completedTask.completed_at || inv.created_at,
          outcome: 'success',
        });
      }
    });

    // Calculate success rate
    const totalInterventions = (interventions || []).length;
    const successRate = totalInterventions > 0 
      ? Math.round((completedCount / totalInterventions) * 100) 
      : 0;

    return {
      studentId: CANONICAL_STUDENT_ID,
      studentName: student.display_name || 'Aarav Sharma',
      recentOutcomes,
      totalInterventions,
      successRate,
    };
  } catch (error) {
    console.error('Failed to fetch school memory:', error);
    // Return empty structure on error
    return {
      studentId: CANONICAL_STUDENT_ID,
      studentName: 'Aarav Sharma',
      recentOutcomes: [],
      totalInterventions: 0,
      successRate: 0,
    };
  }
}
