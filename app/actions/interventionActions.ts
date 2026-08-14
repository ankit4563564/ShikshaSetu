'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createScopedClient } from '@/lib/supabase/scoped';
import { getAuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/app/actions/ecosystemActions';

export interface ApproveSupportPlanInput {
  studentId: string;
  studentName: string;
  teacherId: string;
  signalId: string;
  signalType: string;
  recommendedActions: Array<{
    id: string;
    action: string;
    category: string;
    priority: string;
    description: string;
  }>;
}

export interface ApproveSupportPlanResult {
  success: boolean;
  interventionId?: string;
  taskId?: string;
  error?: string;
}

/**
 * Approve Support Plan Transaction
 */
export async function approveSupportPlanAction(
  input: ApproveSupportPlanInput
): Promise<ApproveSupportPlanResult> {
  const context = await getAuthContext();
  requirePermission(context, 'interventions:approve');

  const scopedDb = createScopedClient(context);

  console.log('[Server Action] approveSupportPlanAction called with:', input);

  try {
    // Authenticated teacher identity from context
    const activeTeacherId = context.userId;

    // Start transaction pre-scoped to school_id
    console.log('[Server Action] Creating intervention...');
    const { data: intervention, error: interventionError } = await scopedDb
      .from('interventions')
      .insert({
        student_id: input.studentId,
        teacher_id: activeTeacherId,
        signal_id: input.signalId,
        signal_type: input.signalType,
        title: `Support Plan: ${input.signalType.replace('_', ' ')}`,
        description: `Support plan approved based on ${input.signalType} signal`,
        status: 'active',
        time_saved_minutes: 45,
      })
      .select()
      .single();

    console.log('[Server Action] Intervention result:', { intervention, error: interventionError });

    if (interventionError) throw interventionError;

    // Create initial milestone for approval via scoped client
    const { error: milestoneError } = await scopedDb
      .from('intervention_milestones')
      .insert({
        intervention_id: intervention.id,
        title: 'Support plan approved by teacher',
        description: `Teacher approved support plan based on ${input.signalType} signal`,
        status: 'completed',
        actor: 'teacher',
        actor_id: activeTeacherId,
        completed_at: new Date().toISOString(),
      });

    if (milestoneError) throw milestoneError;

    // Create student task from first recommended action via scoped client
    const primaryAction = input.recommendedActions.find(a => a.category === 'academic') || input.recommendedActions[0];
    
    const { data: task, error: taskError } = await scopedDb
      .from('student_tasks')
      .insert({
        student_id: input.studentId,
        intervention_id: intervention.id,
        title: primaryAction.action,
        description: primaryAction.description,
        category: primaryAction.category as any,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        status: 'pending',
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // Create milestone for task assignment via scoped client
    const { error: taskMilestoneError } = await scopedDb
      .from('intervention_milestones')
      .insert({
        intervention_id: intervention.id,
        title: `Task assigned: ${primaryAction.action}`,
        description: primaryAction.description,
        status: 'completed',
        actor: 'system',
        completed_at: new Date().toISOString(),
      });

    if (taskMilestoneError) throw taskMilestoneError;

    // Get guardian ID for notification via scoped client
    const { data: guardianAccess, error: guardianError } = await scopedDb
      .from('guardian_access')
      .select('guardian_id')
      .eq('student_id', input.studentId)
      .eq('is_primary', true)
      .single();

    if (!guardianError && guardianAccess) {
      // Create parent notification via scoped client
      const { error: parentNotifError } = await scopedDb
        .from('notifications')
        .insert({
          recipient_id: guardianAccess.guardian_id,
          recipient_role: 'parent',
          student_id: input.studentId,
          title: 'Support plan created',
          body: `A support plan has been created for ${input.studentName}. Task: ${primaryAction.action}`,
          category: 'academic',
          is_read: false,
        });

      if (parentNotifError) console.error('Failed to create parent notification:', parentNotifError);
    }

    // Record ecosystem event
    await recordEcosystemEvent({
      event_type: 'intervention_approved',
      actor_id: activeTeacherId,
      actor_role: 'teacher',
      student_id: input.studentId,
      title: `Support intervention approved for ${input.studentName}`,
      description: `Teacher approved support plan based on ${input.signalType} signal. Task assigned: ${primaryAction.action}`,
      metadata: {
        intervention_id: intervention.id,
        signal_type: input.signalType,
        task_id: task.id,
        task_title: primaryAction.action,
      },
    });

    // Update status flag if exists via scoped client
    const { error: statusFlagError } = await scopedDb
      .from('status_flags')
      .update({
        action_status: 'action_taken',
        acted_by: activeTeacherId,
        acted_at: new Date().toISOString(),
      })
      .eq('student_id', input.studentId)
      .is('resolved_at', null);

    if (statusFlagError && statusFlagError.code !== 'PGRST116') {
      console.error('Failed to update status flag:', statusFlagError);
    }

    // Revalidate paths
    revalidatePath('/teacher');
    revalidatePath('/parent');
    revalidatePath('/student');
    revalidatePath('/admin');

    return {
      success: true,
      interventionId: intervention.id,
      taskId: task.id,
    };

  } catch (error) {
    console.error('Approve support plan failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Complete Student Task
 * 
 * Called when a student marks a task as complete.
 * Updates the task status and creates a milestone.
 */
export interface CompleteTaskInput {
  taskId: string;
  studentId: string;
}

export interface CompleteTaskResult {
  success: boolean;
  error?: string;
}

export async function completeTaskAction(
  input: CompleteTaskInput
): Promise<CompleteTaskResult> {
  const context = await getAuthContext();
  requirePermission(context, 'tasks:complete');

  const scopedDb = createScopedClient(context);

  try {
    // Update task status via scoped client
    const { data: task, error: taskError } = await scopedDb
      .from('student_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', input.taskId)
      .eq('student_id', input.studentId)
      .select()
      .single();

    if (taskError) throw taskError;

    // Create milestone via scoped client
    if (task.intervention_id) {
      const { error: milestoneError } = await scopedDb
        .from('intervention_milestones')
        .insert({
          intervention_id: task.intervention_id,
          title: `Task completed: ${task.title}`,
          description: task.description,
          status: 'completed',
          actor: 'student',
          actor_id: context.userId,
          completed_at: new Date().toISOString(),
        });

      if (milestoneError) throw milestoneError;

      // Record ecosystem event
      await recordEcosystemEvent({
        event_type: 'task_completed',
        actor_id: input.studentId,
        actor_role: 'student',
        student_id: input.studentId,
        title: `Student completed task: ${task.title}`,
        description: `Student marked task as complete: ${task.description}`,
        metadata: {
          task_id: task.id,
          intervention_id: task.intervention_id,
        },
      });
    }

    // Revalidate paths
    revalidatePath('/teacher');
    revalidatePath('/student');
    revalidatePath('/admin');

    return { success: true };

  } catch (error) {
    console.error('Complete task failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
