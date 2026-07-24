'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  createEcosystemNotifications,
  getStudentCareTeamRecipients,
  recordEcosystemEvent,
} from '@/lib/ecosystem';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

export interface TeacherWellnessMetrics {
  teacherId: string;
  teacherName: string;
  alertCount: number;
  windowDays: number;
  threshold: number;
  isOverThreshold: boolean;
  recentAlerts: {
    studentId: string;
    studentName: string;
    status: string;
    actedAt: Date;
  }[];
}

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_THRESHOLD = 20;

/**
 * Get wellness metrics for all teachers
 */
export async function getTeacherWellnessMetricsAction(
  windowDays: number = DEFAULT_WINDOW_DAYS,
  threshold: number = DEFAULT_THRESHOLD
): Promise<TeacherWellnessMetrics[]> {
  await requireRole(['admin', 'teacher']);
  const supabase = createClient();

  // Get all teachers
  const { data: teachers, error: teachersError } = await supabase
    .from('teachers')
    .select('id, display_name')
    .order('display_name');

  if (teachersError || !teachers) {
    console.error('[Teacher Wellness] Failed to fetch teachers:', teachersError);
    return [];
  }

  // Calculate alert volume for each teacher
  const metrics: TeacherWellnessMetrics[] = await Promise.all(
    teachers.map(async (teacher) => {
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - windowDays);

      // Count alerts acted upon by this teacher in the rolling window
      const { data: alerts, error: alertsError } = await supabase
        .from('status_flags')
        .select(`
          id,
          acted_at,
          student_id,
          status,
          students!inner(display_name)
        `)
        .eq('acted_by', teacher.id)
        .gte('acted_at', windowStart.toISOString())
        .not('acted_at', 'is', null)
        .order('acted_at', { ascending: false });

      if (alertsError) {
        console.error(`[Teacher Wellness] Failed to fetch alerts for ${teacher.display_name}:`, alertsError);
        return {
          teacherId: teacher.id,
          teacherName: teacher.display_name,
          alertCount: 0,
          windowDays,
          threshold,
          isOverThreshold: false,
          recentAlerts: [],
        };
      }

      const alertCount = alerts?.length || 0;
      const isOverThreshold = alertCount >= threshold;

      // Get recent alerts for context
      const recentAlerts = (alerts || []).slice(0, 5).map((alert: any) => ({
        studentId: alert.student_id,
        studentName: alert.students.display_name,
        status: alert.status,
        actedAt: new Date(alert.acted_at),
      }));

      return {
        teacherId: teacher.id,
        teacherName: teacher.display_name,
        alertCount,
        windowDays,
        threshold,
        isOverThreshold,
        recentAlerts,
      };
    })
  );

  return metrics;
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Unwell',
  2: 'Low Energy',
  3: 'Neutral',
  4: 'Good',
  5: 'Joyful'
};

export async function submitMoodCheckin(studentId: string, moodValue: number, note?: string) {
  await requireAuth();
  const supabase = createClient();

  const label = MOOD_LABELS[moodValue] || 'Neutral';

  const { data, error } = await supabase
    .from('mood_checkins')
    .insert({
      student_id: studentId,
      mood_value: moodValue,
      mood_label: label,
      note: note || null,
      checked_in_by: 'guardian',
      checked_in_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit mood check-in: ${error.message}`);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'evidence_logged',
    studentId,
    actorRole: 'parent',
    title: 'Guardian mood check-in submitted',
    body: note || `Mood recorded as ${label}.`,
    metadata: {
      checkinId: data.id,
      moodValue,
      moodLabel: label,
      checkedInBy: 'guardian',
    },
  });

  const recipients = await getStudentCareTeamRecipients(supabase, studentId, {
    includeGuardians: false,
    includeTeacher: true,
    includeAdmins: moodValue <= 2,
  });

  await createEcosystemNotifications(supabase, recipients, {
    studentId,
    title: 'Guardian mood check-in',
    body: note || `Mood recorded as ${label}.`,
    category: 'wellness',
  });

  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/student');
  revalidatePath('/admin');
  return { success: true, checkin: data };
}

export async function studentConfirmHomeSafeAction(studentId: string, tripId: string) {
  await requireAuth();
  const supabase = createClient();

  const { error } = await supabase
    .from('student_journey')
    .update({
      status: 'home_safe',
      home_safe_at: new Date().toISOString(),
      confirmed_by: `student:${studentId}`,
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', studentId)
    .eq('trip_id', tripId);

  if (error) {
    throw new Error(`Failed to confirm home safe: ${error.message}`);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'home_safe_confirmed',
    studentId,
    actorRole: 'student',
    title: 'Student confirmed home safe',
    body: `${studentId} confirmed safe arrival at home.`,
    metadata: { tripId },
  });

  const recipients = await getStudentCareTeamRecipients(supabase, studentId, {
    includeGuardians: true,
    includeTeacher: true,
  });

  await createEcosystemNotifications(supabase, recipients, {
    studentId,
    title: 'Home safe confirmed',
    body: 'Your child has confirmed they arrived home safely.',
    category: 'safety',
  });

  revalidatePath('/student');
  revalidatePath('/parent');
  revalidatePath('/teacher');
  revalidatePath('/driver');
  revalidatePath('/admin');
  return { success: true };
}
