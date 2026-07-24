/**
 * Demo Login API Route
 *
 * POST /api/auth/demo-login
 *
 * Creates a Clerk sign-in token for the requested demo role.
 * The client then redirects to the token URL to complete authentication
 * via Clerk's hosted sign-in (ticket-based, no password entry required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { VALID_ROLES, DemoRole } from '@/lib/demo/session';

// Email domain MUST match the seeded demo users in Clerk
const DEMO_EMAIL_DOMAIN = 'shikshasetu.com';

function isValidRole(role: unknown): role is DemoRole {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role as string);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 },
      );
    }

    // Check if this is a demo mode request
    const isDemoMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NODE_ENV === 'development';

    if (!isDemoMode) {
      return NextResponse.json(
        { error: 'Demo mode not enabled' },
        { status: 403 },
      );
    }

    const email = `${role}@${DEMO_EMAIL_DOMAIN}`;

    // Verify the user exists in Clerk
    const users = await clerkClient().users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length === 0) {
      console.warn(`[Demo Login] User not found for role "${role}" (${email})`);
      return NextResponse.json(
        { error: 'Demo user not found. Please seed demo users first.' },
        { status: 404 },
      );
    }

    const user = users.data[0];

    // Create a sign-in token for the user (expires in 10 minutes, single-use)
    // Clerk will authenticate the user when they visit the token URL
    const signInToken = await clerkClient().signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 600,
    });

    // Log server-side only
    console.info(
      `[Demo Login] Sign-in token created for ${email} (role: ${role})`,
    );

    // Return the token URL — the client redirects the browser there to complete auth
    return NextResponse.json({
      success: true,
      userId: user.id,
      role,
      email,
      tokenUrl: signInToken.url,
    });
  } catch (error: any) {
    // Log full error server-side only — never expose to client
    console.error('[Demo Login] Internal error:', error.message, error.errors);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
