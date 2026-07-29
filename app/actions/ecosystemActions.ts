'use server';

import { createClient } from '@/lib/supabase/client';

export interface EcosystemEventInput {
  event_type: string;
  actor_id?: string;
  actor_role?: string;
  student_id?: string;
  title: string;
  description?: string;
  metadata?: any;
}

/**
 * Record an ecosystem event
 * Used for cross-portal observability and Connected Experience
 */
export async function recordEcosystemEvent(input: EcosystemEventInput): Promise<void> {
  const supabase = createClient();

  try {
    await supabase
      .from('ecosystem_events')
      .insert({
        event_type: input.event_type,
        actor_id: input.actor_id,
        actor_role: input.actor_role,
        student_id: input.student_id,
        title: input.title,
        description: input.description,
        metadata: input.metadata,
      });
  } catch (error) {
    console.error('Failed to record ecosystem event:', error);
    // Don't throw - ecosystem events are best-effort
  }
}

/**
 * Get ecosystem events for a student
 */
export async function getStudentEcosystemEvents(studentId: string, limit: number = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('ecosystem_events')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch ecosystem events:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent ecosystem events across all students
 */
export async function getRecentEcosystemEvents(limit: number = 100) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('ecosystem_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch recent ecosystem events:', error);
    return [];
  }

  return data || [];
}
