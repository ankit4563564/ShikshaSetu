'use client';

import React, { useState } from 'react';
import { useClerk } from '@clerk/nextjs';

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

export function SignOutButton({ className, children, title }: SignOutButtonProps) {
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // 1. Clear demo session cookie via API
      await fetch('/api/auth/demo-session', { method: 'DELETE' }).catch(() => {});

      // 2. Attempt Clerk sign out if Clerk is initialized
      if (clerk && typeof clerk.signOut === 'function') {
        await clerk.signOut().catch(() => {});
      }
    } catch (err) {
      console.warn('[SignOut] Notice:', err);
    } finally {
      // 3. Hard navigate to /login to ensure complete session wipe & clean page load
      window.location.href = '/login';
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={className}
      title={title || 'Sign Out'}
    >
      {isSigningOut ? (
        <span className="flex items-center gap-1.5 opacity-70">
          <span className="animate-spin text-xs">🌀</span>
          <span>Signing out...</span>
        </span>
      ) : (
        children || (
          <span className="flex items-center gap-1.5">
            <span>🚪</span>
            <span>Sign Out</span>
          </span>
        )
      )}
    </button>
  );
}
export default SignOutButton;
