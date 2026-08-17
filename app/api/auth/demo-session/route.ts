import { NextRequest, NextResponse } from 'next/server';
import { createSignedSessionValue, COOKIE_NAME, VALID_ROLES } from '@/lib/demo/session';

function isValidRole(role: unknown): role is (typeof VALID_ROLES)[number] {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role as string);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const ttl = 24 * 60 * 60; // 1 day
    const value = await createSignedSessionValue(role, ttl);

    const res = NextResponse.json({ success: true, role });
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.headers.set('Set-Cookie', `${COOKIE_NAME}=${value}; Path=/; Max-Age=${ttl}; HttpOnly${secure}; SameSite=Lax`);
    return res;
  } catch (err: any) {
    console.error('[Demo Session] Error creating session:', err?.message || err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return res;
}
