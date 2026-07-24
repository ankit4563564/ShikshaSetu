/**
 * School Calendar Integration (PRD §16)
 * 
 * Checks school calendar for exam periods, holidays, and breaks
 * to suppress false alarms during predictable high-stress periods.
 */

import { createClient } from '@/lib/supabase/server';

export interface CalendarPeriod {
  id: string;
  name: string;
  type: 'exam_period' | 'holiday' | 'break';
  startDate: Date;
  endDate: Date;
  description: string | null;
  suppressAlerts: boolean;
}

/**
 * Check if a given date falls within a calendar period that suppresses alerts
 */
export async function shouldSuppressAlerts(date: Date = new Date()): Promise<boolean> {
  const supabase = createClient();

  const { data: periods, error } = await supabase
    .from('school_calendar')
    .select('*')
    .eq('suppress_alerts', true)
    .lte('start_date', date.toISOString().split('T')[0])
    .gte('end_date', date.toISOString().split('T')[0]);

  if (error) {
    console.error('[Calendar] Failed to check calendar:', error);
    return false;
  }

  return periods && periods.length > 0;
}

/**
 * Get active calendar periods for a given date
 */
export async function getActivePeriods(date: Date = new Date()): Promise<CalendarPeriod[]> {
  const supabase = createClient();

  const { data: periods, error } = await supabase
    .from('school_calendar')
    .select('*')
    .lte('start_date', date.toISOString().split('T')[0])
    .gte('end_date', date.toISOString().split('T')[0])
    .order('start_date', { ascending: true });

  if (error) {
    console.error('[Calendar] Failed to get active periods:', error);
    return [];
  }

  return (periods || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    startDate: new Date(p.start_date),
    endDate: new Date(p.end_date),
    description: p.description,
    suppressAlerts: p.suppress_alerts,
  }));
}

/**
 * Get all calendar periods for a date range
 */
export async function getCalendarPeriods(startDate: Date, endDate: Date): Promise<CalendarPeriod[]> {
  const supabase = createClient();

  const { data: periods, error } = await supabase
    .from('school_calendar')
    .select('*')
    .gte('start_date', startDate.toISOString().split('T')[0])
    .lte('end_date', endDate.toISOString().split('T')[0])
    .order('start_date', { ascending: true });

  if (error) {
    console.error('[Calendar] Failed to get calendar periods:', error);
    return [];
  }

  return (periods || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    startDate: new Date(p.start_date),
    endDate: new Date(p.end_date),
    description: p.description,
    suppressAlerts: p.suppress_alerts,
  }));
}
