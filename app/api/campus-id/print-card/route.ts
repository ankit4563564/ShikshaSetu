import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveCardsForStudent } from '@/lib/campus-id/campusCard';
import { generateQrContentForCard } from '@/lib/campus-id/qrToken';
import { generateCardHtml } from '@/lib/campus-id/cardPdf';
import { requireRole } from '@/lib/auth/routeGuard';

export async function GET(request: NextRequest) {
  const auth = await requireRole(['teacher', 'admin']);
  if (auth instanceof NextResponse) return auth;

  const studentId = request.nextUrl.searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId parameter' }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { data: student } = await supabase
      .from('students')
      .select('id, display_name, grade, section, roll_number, avatar_url')
      .eq('id', studentId)
      .single();

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const cards = await getActiveCardsForStudent(studentId);
    const primaryCard = cards.find((c) => c.cardType === 'student_id') || cards[0];

    let qrContent = '';
    if (primaryCard) {
      qrContent = generateQrContentForCard(primaryCard.id);
    }

    const html = await generateCardHtml({
      studentName: student.display_name,
      grade: student.grade,
      section: student.section,
      rollNumber: student.roll_number,
      photoUrl: student.avatar_url,
      qrContent,
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[PrintCard] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
