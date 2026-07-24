import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectAndTranslateSpeech } from '@/lib/ai-narration';
import { recordEcosystemEvent } from '@/lib/ecosystem';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/routeGuard';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['student']);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { worryId, studentName, content } = body;
    const studentId = auth.roleId;

    if (!worryId || !studentId || !studentName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Run language detection and translation on the worry content via Gemini
    let processedContent = content;
    let originalWithTranslation = content;
    try {
      const speech = await detectAndTranslateSpeech(content);
      if (speech.language !== 'en') {
        originalWithTranslation = `${content} (Translation: ${speech.analysisTranscript})`;
        processedContent = originalWithTranslation;
      }
    } catch (e) {
      console.error('[Worry Jar API] Language processing failed, using original:', e);
    }

    const supabase = createClient();

    // 1. Fetch the student's class teacher ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('class_teacher_id')
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('[Worry Jar] Failed to fetch student teacher:', studentError);
      return NextResponse.json(
        { error: 'Failed to find student teacher record' },
        { status: 500 }
      );
    }

    const teacherId = student?.class_teacher_id;

    // 2. Insert the worry as a low-mood check-in so it affects rules engine status flags
    const { error: moodError } = await supabase
      .from('mood_checkins')
      .insert({
        student_id: studentId,
        mood_value: 1, // 1 = very low / distressed, triggers attention alerts
        mood_label: 'anxious',
        note: `Shared Worry: ${processedContent}`,
        checked_in_by: 'student',
        checked_in_at: new Date().toISOString(),
      });

    if (moodError) {
      console.error('[Worry Jar] Failed to insert mood check-in:', moodError);
      return NextResponse.json(
        { error: 'Failed to record wellness check-in' },
        { status: 500 }
      );
    }

    // 3. Send an immediate notification to the assigned class teacher
    if (teacherId) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: teacherId,
          recipient_role: 'teacher',
          student_id: studentId,
          title: 'Shared Worry Alert',
          body: `${studentName} shared a worry from their Worry Jar: "${processedContent}"`,
          category: 'wellness',
          is_read: false,
        });

      if (notifError) {
        console.error('[Worry Jar] Failed to create teacher notification:', notifError);
        // We do not fail the request if just notification fails, since mood_checkin succeeded
      }
    }

    await recordEcosystemEvent(supabase, {
      eventType: 'evidence_logged',
      studentId,
      actorId: studentId,
      actorRole: 'student',
      title: 'Shared Worry Alert',
      body: `${studentName} shared a worry from their Worry Jar.`,
      metadata: {
        worryId,
        source: 'worry_jar',
        processedContent,
      },
    });

    revalidatePath('/student');
    revalidatePath('/teacher');
    revalidatePath('/parent');
    revalidatePath('/admin');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Worry Jar] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share worry' },
      { status: 500 }
    );
  }
}
