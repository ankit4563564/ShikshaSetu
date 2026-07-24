import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreToken, getActiveTokenForCard } from '@/lib/campus-id/qrToken';
import { requireRole } from '@/lib/auth/routeGuard';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['teacher', 'admin']);
    if (auth instanceof NextResponse) return auth;

    const { cardId } = await request.json();

    if (!cardId || typeof cardId !== 'string') {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
    }

    // Check for an existing valid token first
    const existing = await getActiveTokenForCard(cardId);
    if (existing) {
      const { generateQrContentForCard } = await import('@/lib/campus-id/qrToken');
      const qrContent = await generateQrContentForCard(cardId);
      return NextResponse.json({ qrContent, tokenId: existing.id });
    }

    const result = await generateAndStoreToken(cardId);
    if (!result) {
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }

    return NextResponse.json({ qrContent: result.qrContent, tokenId: result.tokenId });
  } catch (error) {
    console.error('[GenerateToken] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
