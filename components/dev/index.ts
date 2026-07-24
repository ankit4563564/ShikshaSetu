// ┌─────────────────────────────────────────────────────────┐
// │  DEV-ONLY: Remove this barrel when real auth is        │
// │  implemented. Search the codebase for "DEV-ONLY" to    │
// │  find every piece that needs to go.                    │
// └─────────────────────────────────────────────────────────┘

export { DevRoleProvider } from './DevRoleProvider';
export { DevRoleShell } from './DevRoleShell';
export { RoleProvider, useRole } from './RoleContext';
export { RoleSwitcher } from './RoleSwitcher';
