'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  categorizeVoiceNote,
  detectAndTranslateSpeech,
  SpeechLanguage,
  SpeechProcessingError,
  translateSpeechTranscript,
  VoiceNoteCategorization,
} from '@/lib/ai-narration';
import { recordEcosystemEvent } from '@/lib/ecosystem';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

export interface VoiceTranscriptInput {
  originalTranscript: string;
  inputMode: 'speech' | 'text';
}

/**
 * Voice-First Quick Log Action (PRD §15)
 * 
 * Takes a transcribed voice note, uses AI to categorize it (student + evidence type),
 * and appends it to the evidence_logs table.
 */
export async function logVoiceNoteAction(input: VoiceTranscriptInput, teacherId: string) {
  await requireAuth();
  const originalTranscript = input.originalTranscript.trim();
  if (!originalTranscript) throw new Error('Please speak or type a note first.');
  if (!teacherId) throw new Error('Your teacher profile could not be verified. Please sign in again.');

  const supabase = createClient();

  // Gemini is intentionally invoked only after the user submits a real transcript.
  // It never runs during portal navigation or component rendering.
  let speech: { language: SpeechLanguage; analysisTranscript: string };
  try {
    speech = await detectAndTranslateSpeech(originalTranscript);
  } catch (error) {
    if (error instanceof SpeechProcessingError) throw new Error(error.message);
    console.error('[Voice Log] Language processing failed:', error);
    throw new Error('Language processing is temporarily unavailable. Please try again.');
  }

  // Fetch student roster dynamically for this teacher to inject into AI prompt
  const { data: students, error: rosterError } = await supabase
    .from('students')
    .select('id, display_name')
    .eq('class_teacher_id', teacherId);

  if (rosterError) {
    console.error('[Voice Log] Failed to fetch teacher student roster:', rosterError);
  }

  // 1. Use AI to categorize the voice note with the dynamic class list
  let categorization: VoiceNoteCategorization;
  try {
    categorization = await categorizeVoiceNote(speech.analysisTranscript, students || []);
    console.log('[Voice Log] AI categorization result:', categorization);
  } catch (error: any) {
    console.error('[Voice Log] AI categorization failed:', error);
    throw new Error('The note could not be categorized. Please mention the student name clearly and try again.');
  }

  // 2. Validate that we identified a student
  if (categorization.studentId === 'unknown' || categorization.confidence < 0.5) {
    throw new Error('Could not confidently identify which student this note refers to. Please mention the student name clearly.');
  }

  // Fetch preferred languages for the identified student's guardians. The original
  // transcript is preserved, and translations are created only when needed.
  const { data: guardianAccess } = await supabase
    .from('guardian_access')
    .select('guardian_id, guardians ( preferred_language )')
    .eq('student_id', categorization.studentId);

  const parentLanguages = Array.from(new Set(
    (guardianAccess || [])
      .map((access: any) => access.guardians?.preferred_language)
      .filter((language: unknown): language is SpeechLanguage => typeof language === 'string' && language in { en: true, hi: true, ta: true, te: true, kn: true, ml: true, mr: true, gu: true, bn: true, pa: true }),
  ));

  const translations: Record<string, string> = {};
  try {
    await Promise.all(parentLanguages.filter((language) => language !== speech.language).map(async (language) => {
      translations[language] = await translateSpeechTranscript(originalTranscript, speech.language, language);
    }));
  } catch (error) {
    if (error instanceof SpeechProcessingError) throw new Error(error.message);
    console.error('[Voice Log] Parent translation failed:', error);
    throw new Error('The parent-language translation could not be completed. Please try again.');
  }

  const evidenceBullets = [...categorization.bullets, `Original (${speech.language}): ${originalTranscript}`];
  if (speech.analysisTranscript !== originalTranscript) evidenceBullets.push(`English translation: ${speech.analysisTranscript}`);

  // 3. Insert into the existing evidence_logs table. raw_data is the existing
  // structured column used to retain both original and translated transcripts.
  const { data: evidenceLog, error: insertError } = await supabase
    .from('evidence_logs')
    .insert({
      student_id: categorization.studentId,
      source_type: categorization.sourceType === 'behavior' ? 'voice_log' : categorization.sourceType,
      headline: categorization.headline,
      bullets: evidenceBullets,
      raw_data: {
        inputMode: input.inputMode,
        originalTranscript,
        detectedLanguage: speech.language,
        analysisTranscript: speech.analysisTranscript,
        parentTranslations: translations,
      },
      generated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertError || !evidenceLog) {
    console.error('[Voice Log] Failed to insert evidence log:', insertError);
    throw new Error('The evidence note could not be saved. Please try again.');
  }

  // Notify guardians through the existing notification/realtime pipeline.
  const guardianIds = (guardianAccess || []).map((access: any) => access.guardian_id).filter(Boolean);
  if (guardianIds.length > 0) {
    const { error: notificationError } = await supabase.from('notifications').insert(
      guardianIds.map((guardianId: string) => ({
        recipient_id: guardianId,
        recipient_role: 'parent',
        student_id: categorization.studentId,
        title: 'New teacher observation',
        body: categorization.headline,
        category: 'academic',
        is_read: false,
      })),
    );
    if (notificationError) console.error('[Voice Log] Failed to create guardian notifications:', notificationError);
  }

  await recordEcosystemEvent(supabase, {
    eventType: 'evidence_logged',
    studentId: categorization.studentId,
    actorId: teacherId,
    actorRole: 'teacher',
    title: categorization.headline,
    body: speech.analysisTranscript,
    metadata: {
      evidenceLogId: evidenceLog.id,
      sourceType: categorization.sourceType,
      detectedLanguage: speech.language,
      translated: speech.analysisTranscript !== originalTranscript,
    },
  });

  // Preserve existing cache invalidation paths after the real database mutation.
  revalidatePath('/teacher');
  revalidatePath('/parent');
  revalidatePath('/student');
  revalidatePath('/admin');

  return {
    success: true,
    evidenceLogId: evidenceLog.id,
    categorization,
    language: speech.language,
    translated: speech.analysisTranscript !== originalTranscript,
  };
}
