'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createEcosystemNotifications, getStudentCareTeamRecipients, recordEcosystemEvent } from '@/lib/ecosystem';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

/**
 * Creates an evidence log record when a student completes a quest or unlocks a reward
 */
export async function createStudentAchievementAction(
  studentId: string,
  headline: string,
  description: string,
  sourceType: 'academic' | 'wellness' | 'homework' | 'attendance' = 'academic'
) {
  await requireRole(['admin', 'teacher', 'student', 'parent']);
  const supabase = createClient();
  const evidenceSourceType = sourceType === 'academic' ? 'grades' : sourceType === 'wellness' ? 'mood' : sourceType;

  const { data, error } = await supabase
    .from('evidence_logs')
    .insert({
      student_id: studentId,
      source_type: evidenceSourceType,
      headline,
      bullets: [description],
      raw_data: {
        ecosystemSourceType: sourceType,
      },
      generated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Student Action] Failed to insert student achievement:', error);
    return { success: false, error: error.message };
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'student_achievement_created',
    studentId,
    actorRole: 'student',
    title: headline,
    body: description,
    metadata: {
      evidenceLogId: data?.id,
      sourceType,
    },
  });

  const recipients = await getStudentCareTeamRecipients(supabase, studentId, {
    includeGuardians: true,
    includeTeacher: true,
  });

  await createEcosystemNotifications(supabase, recipients, {
    studentId,
    title: headline,
    body: description,
    category: sourceType === 'wellness' ? 'wellness' : 'academic',
  });

  // Clear caches to propagate the updates immediately in real-time
  revalidatePath('/teacher');
  revalidatePath('/parent');
  revalidatePath('/student');

  return { success: true, logId: data?.id };
}
