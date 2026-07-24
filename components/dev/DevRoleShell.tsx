// ┌─────────────────────────────────────────────────────────┐
// │  DEV-ONLY: Remove this wrapper when real auth is       │
// │  implemented. Search the codebase for "DEV-ONLY" to    │
// │  find every piece that needs to go.                    │
// └─────────────────────────────────────────────────────────┘

'use client';

import { DevRoleProvider } from './DevRoleProvider';

/**
 * Gate component used in the root layout.
 *
 * In development: wraps children in DevRoleProvider (context + floating switcher).
 * In production:  renders children directly — zero overhead.
 */
export function DevRoleShell({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return <DevRoleProvider>{children}</DevRoleProvider>;
}
