'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext, requirePermission } from '@/lib/auth/getAuthContext';
import { revalidatePath } from 'next/cache';
import { recordEcosystemEvent } from '@/lib/ecosystem';

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
 * Fetches all school calendar periods for the authenticated tenant.
 */
export async function fetchCalendarPeriodsAction(): Promise<CalendarPeriodData[]> {
  try {
    const context = await getAuthContext();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('school_calendar')
      .select('*')
      .eq('school_id', context.schoolId)
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
  } catch (err) {
    console.error(`[fetchCalendarPeriodsAction] Auth error:`, err);
    return [];
  }
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
  const context = await getAuthContext();
  requirePermission(context, 'school:manage');
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('school_calendar')
    .insert({
      school_id: context.schoolId,
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

  try {
    await recordEcosystemEvent({
      event_type: 'school_calendar_changed',
      actor_id: context.userId,
      actor_role: context.role,
      title: data.name,
      description: data.description,
      metadata: {
        action: 'create',
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        suppressAlerts: data.suppressAlerts,
      },
    });
  } catch (evtErr) {
    console.warn('[createCalendarPeriodAction] Event note:', evtErr);
  }

  revalidatePath('/teacher');
  revalidatePath('/parent');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Deletes a school calendar period.
 */
export async function deleteCalendarPeriodAction(id: string) {
  const context = await getAuthContext();
  requirePermission(context, 'school:manage');
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('school_calendar')
    .delete()
    .eq('id', id)
    .eq('school_id', context.schoolId);

  if (error) {
    console.error(`[deleteCalendarPeriodAction] Error:`, error.message);
    return { success: false, error: error.message };
  }

  try {
    await recordEcosystemEvent({
      event_type: 'school_calendar_changed',
      actor_id: context.userId,
      actor_role: context.role,
      title: 'School calendar period deleted',
      metadata: {
        action: 'delete',
        id,
      },
    });
  } catch (evtErr) {
    console.warn('[deleteCalendarPeriodAction] Event note:', evtErr);
  }

  revalidatePath('/teacher');
  revalidatePath('/parent');
  revalidatePath('/admin');
  return { success: true };
}
