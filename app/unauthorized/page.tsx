'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const portal = searchParams.get('portal') || '';
  const currentRole = searchParams.get('currentRole') || '';

  // Contextual text based on routing violation
  let title = 'Access Restricted';
  let message = 'You do not have permission to view this page.';
  let primaryActionUrl = '/';
  let primaryActionLabel = 'Go to Home';

  if (portal === 'teacher' && (currentRole === 'parent' || currentRole === 'guardian')) {
    title = '🚫 Access Restricted';
    message = 'This account is registered as a Parent. The Teacher Portal is available only to school staff.';
    primaryActionUrl = '/parent';
    primaryActionLabel = 'Go to Parent Portal';
  } else if (portal === 'parent' && currentRole === 'teacher') {
    title = '🚫 Access Restricted';
    message = 'This account is registered as a Teacher. Please use the Teacher Dashboard.';
    primaryActionUrl = '/teacher';
    primaryActionLabel = 'Open Teacher Dashboard';
  } else if (portal === 'admin') {
    title = '🚫 Access Restricted';
    message = 'Admin routes require verified administrator permissions.';
    primaryActionUrl = currentRole === 'teacher' ? '/teacher' : '/parent';
    primaryActionLabel = currentRole === 'teacher' ? 'Teacher Dashboard' : 'Parent Portal';
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-deep-teal antialiased">
      <div className="max-w-md rounded-2xl border border-deep-teal/5 bg-white p-8 shadow-sm space-y-6">
        <div className="space-y-3">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-warm-clay">
            {title}
          </h1>
          <p className="font-body text-sm font-semibold leading-relaxed text-deep-teal/80">
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href={primaryActionUrl}
            className="w-full rounded-xl bg-deep-teal hover:bg-deep-teal/95 text-white font-display text-xs font-bold py-2.5 transition-all active:scale-98 shadow-2xs text-center"
          >
            {primaryActionLabel}
          </Link>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="w-full rounded-xl border border-deep-teal/15 bg-white hover:bg-deep-teal/5 text-deep-teal/70 font-display text-xs font-semibold py-2.5 transition-all active:scale-98"
            >
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-deep-teal antialiased">
        <div className="max-w-md rounded-2xl border border-deep-teal/5 bg-white p-8 shadow-sm">
          <p className="font-body text-sm font-semibold text-deep-teal/40">Loading...</p>
        </div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
