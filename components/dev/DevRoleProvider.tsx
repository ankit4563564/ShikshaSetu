// ┌─────────────────────────────────────────────────────────┐
// │  DEV-ONLY: Remove this entire file when real auth is   │
// │  implemented. Search the codebase for "DEV-ONLY" to    │
// │  find every piece that needs to go.                    │
// └─────────────────────────────────────────────────────────┘

'use client';

import { RoleProvider } from './RoleContext';
import { RoleSwitcher } from './RoleSwitcher';

/**
 * Wraps children in the dev RoleProvider and renders the floating
 * RoleSwitcher dropdown. Used by DevRoleShell (which gates on NODE_ENV).
 */
export function DevRoleProvider({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      {children}
      <RoleSwitcher />
    </RoleProvider>
  );
}
