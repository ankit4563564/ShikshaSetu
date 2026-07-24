'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

export interface CalendarPeriodData {
  id: string;
  name: string;
  type: 'exam_period' | 'holiday' | 'break';
  startDate: string;
  endDate: string;
  description: string | null;
  suppressAlerts: boolean;
}

/**
 * Fetches all school calendar periods.
 */
export async function fetchCalendarPeriodsAction(): Promise<CalendarPeriodData[]> {
  await requireAuth();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('school_calendar')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    console.error(`[fetchCalendarPeriodsAction] Error:`, error.message);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    type: p.type as any,
    startDate: p.start_date,
    endDate: p.end_date,
    description: p.description,
    suppressAlerts: p.suppress_alerts,
  }));
}

/**
 * Creates a new school calendar event/period.
 */
export async function createCalendarPeriodAction(data: {
  name: string;
  type: 'exam_period' | 'holiday' | 'break';
  startDate: string;
  endDate: string;
  description: string;
  suppressAlerts: boolean;
}) {
  await requireRole(['admin', 'teacher']);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('school_calendar')
    .insert({
      name: data.name,
      type: data.type,
      start_date: data.startDate,
      end_date: data.endDate,
      description: data.description,
      suppress_alerts: data.suppressAlerts,
    });

  if (error) {
    console.error(`[createCalendarPeriodAction] Error:`, error.message);
    return { success: false, error: error.message };
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'school_calendar_changed',
    actorRole: 'admin',
    title: data.name,
    body: data.description,
    metadata: {
      action: 'create',
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      suppressAlerts: data.suppressAlerts,
    },
  });

  revalidatePath('/teacher');
  revalidatePath('/parent');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Deletes a school calendar period.
 */
export async function deleteCalendarPeriodAction(id: string) {
  await requireRole(['admin', 'teacher']);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('school_calendar')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[deleteCalendarPeriodAction] Error:`, error.message);
    return { success: false, error: error.message };
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'school_calendar_changed',
    actorRole: 'admin',
    title: 'School calendar period deleted',
    metadata: {
      action: 'delete',
      id,
    },
  });

  revalidatePath('/teacher');
  revalidatePath('/parent');
  revalidatePath('/admin');
  return { success: true };
}
