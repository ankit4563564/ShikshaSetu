// ┌─────────────────────────────────────────────────────────┐
// │  DEV-ONLY: Remove this entire file when real auth is   │
// │  implemented. Search the codebase for "DEV-ONLY" to    │
// │  find every piece that needs to go.                    │
// └─────────────────────────────────────────────────────────┘

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Portal } from '@/types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type RoleContextValue = {
  /** Currently active portal role. */
  role: Portal;
  /** Switch to a different role. Navigates to that portal's root. */
  setRole: (role: Portal) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'edusync-dev-role';

/** Derive portal role from the current URL pathname. */
function roleFromPath(pathname: string): Portal {
  if (pathname.startsWith('/parent')) return 'parent';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/student')) return 'student';
  if (pathname.startsWith('/gate')) return 'gate';
  if (pathname.startsWith('/driver')) return 'driver';
  return 'teacher';
}

/** Read the last-used role from localStorage, if available. */
function getStoredRole(): Portal | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (
    stored === 'teacher' ||
    stored === 'parent' ||
    stored === 'admin' ||
    stored === 'student' ||
    stored === 'gate' ||
    stored === 'driver'
  ) {
    return stored;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Always initialize from the URL path — never from localStorage during SSR,
  // because localStorage doesn't exist on the server and would cause a
  // hydration mismatch.
  const [role, setRoleState] = useState<Portal>(() => roleFromPath(pathname));

  // After mount, restore the stored role if we're on the root path.
  // This runs client-only, so no hydration mismatch.
  useEffect(() => {
    if (pathname === '/') {
      const stored = getStoredRole();
      if (stored && stored !== role) {
        setRoleState(stored);
        // Avoid automatic redirect to allow landing page to load.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // Keep role in sync when the URL changes (e.g. browser back/forward).
  useEffect(() => {
    setRoleState(roleFromPath(pathname));
  }, [pathname]);

  const setRole = useCallback(
    (nextRole: Portal) => {
      setRoleState(nextRole);
      localStorage.setItem(STORAGE_KEY, nextRole);
      router.push(`/${nextRole}`);
    },
    [router],
  );

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return (
    <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the current dev role and setter.
 * Must be used inside `<RoleProvider>`.
 */
export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error(
      'useRole must be used within <RoleProvider>. ' +
        'Wrap your component tree with <DevRoleProvider> or <DevRoleShell>.',
    );
  }

  return context;
}
