# ShikshaSetu — Login & Authentication Architecture Audit

**Date**: August 17, 2026  
**Status**: Comprehensive Audit Completed (Phase 1)

---

## 1. Current Authentication Flow

The application uses **Clerk** (`@clerk/nextjs`) for user authentication:
1. Environment variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` configure Clerk server & client SDKs.
2. User authenticates via Clerk components (`<SignIn />`) or Clerk API tokens.
3. Upon first login, `linkClerkUser(userId, email)` in `lib/auth/authOnboarding.ts` performs an email lookup across `teachers`, `guardians`, `admins`, and `vendors` tables via Supabase admin (service role) client. If a match is found, it populates `clerk_user_id` on the database record and updates Clerk `publicMetadata.role`.

---

## 2. Current Role Resolution

Role resolution happens via two paths:
1. **`getAuthContext()`** (`lib/auth/getAuthContext.ts`):
   - Resolves Clerk `userId` via `auth()`.
   - Queries `user_mappings` table: `SELECT user_id, school_id, role FROM user_mappings WHERE clerk_user_id = :clerkUserId`.
   - Returns immutable `AuthContext` object containing `userId`, `clerkUserId`, `schoolId`, `role` (`admin | principal | teacher | parent | student | driver | gate | vendor`), and `permissions`.
2. **`getUser.ts`**:
   - Sequentially queries `teachers`, `students`, `guardians`, `drivers`, `admins`, `vendors`, `gate_operators` by `clerk_user_id`.

---

## 3. Current Route Guards

- **Middleware (`middleware.ts`)**:
  - `isPublicRoute` matcher marks `/sign-in(.*)`, `/sign-up(.*)`, `/parent(.*)`, `/teacher(.*)`, `/student(.*)`, `/admin(.*)`, `/driver(.*)`, `/gate(.*)`, `/vendor(.*)` as public or bypasses role checks.
  - Comment in code states: `"For hackathon demo: allow authenticated users to access all portals. Page-level components handle role-specific data filtering."`
- **Portal Pages & Layouts**:
  - `/gate`, `/driver`, `/vendor` layouts perform server-side checks and redirect to `/sign-in` or `/unauthorized`.
  - `/teacher`, `/parent`, `/student`, `/admin` pages check `auth()` and query Supabase, but rely on page-level code rather than unified middleware route protection.

---

## 4. Current Demo Handling

- Demo session is tracked via cookie (`shikshasetu-demo-session`) and `localStorage.getItem('edusync-dev-role')`.
- `middleware.ts` checks `getDemoSessionFromRequest(req)` and skips Clerk auth entirely if `demo?.active` is true.
- `getAuthContext.ts` returns a synthetic AuthContext (`userId: 'demo-teacher'`) if no Clerk session is active and demo mode is enabled or running in non-production.

---

## 5. Current Login UI

- Route: `/sign-in/[[...sign-in]]/page.tsx`
- Layout: Renders a 3-state role selection grid (`Teacher`, `Parent`, `Student`, `Driver`, `Vendor`, `Gate`, `Admin`) where users are required to pick a role manually before logging in.
- Clerk `<SignIn />` form is hidden behind a small `🔐 Sign in with custom credentials` button.
- URL is `/sign-in` rather than the required `/login`.

---

## 6. Problems & Vulnerabilities Identified

1. **No `/login` Entry Point**: The canonical entry point `/login` does not exist.
2. **Role Selection Friction**: Users are forced to choose their role manually before logging in, which is confusing and non-standard for real school users.
3. **Middleware Bypasses Portal Security**: `middleware.ts` treats all portal routes as public or allows cross-role access (e.g. parent visiting `/admin`).
4. **Demo UI Leakage**: Demo role selection cards are exposed directly on the primary sign-in page.
5. **No Automatic Role Redirect on Login / Existing Session**: Visiting `/sign-in` with an existing valid Clerk session does not automatically resolve the user's role from the DB and redirect to their portal; it relies on `localStorage` role keys.
6. **Unhandled Unlinked Account State**: Users authenticated in Clerk but missing a `user_mappings` record throw unhandled exceptions instead of rendering a clear "Your school account has not been configured yet" message.

---

## 7. Proposed SaaS Production Changes

1. **Create `/login` Route (`app/login/page.tsx`)**:
   - Single, clean, mobile-friendly production login screen following Phase 8 specifications:
     `Logo -> Welcome Back -> Sign in to your school -> Email/Credentials Input -> Continue`.
   - Remove role-selection buttons (`Teacher`, `Parent`, `Student`, etc.) entirely from `/login`.
   - Redirect `/sign-in` requests to `/login`.
2. **Automatic Server-Side Role Resolution & Redirect**:
   - If an authenticated user visits `/login` (or finishes Clerk auth), server-side resolve their role from `user_mappings` and redirect immediately to `/teacher`, `/parent`, `/student`, `/admin`, `/gate`, `/driver`, or `/vendor`.
3. **Server-Authoritative Route Protection in Middleware**:
   - Update `middleware.ts` so that `/teacher/*`, `/parent/*`, `/student/*`, `/admin/*`, `/gate/*`, `/driver/*`, `/vendor/*` require valid Clerk authentication and matching role authorization in production mode.
   - Cross-role attempts (e.g., Parent attempting `/admin`) will be redirected to `/unauthorized` or their respective authorized portal.
4. **Isolate Demo Mode to Development Path**:
   - Move demo role selector UI to `/demo` or a development-only page.
   - Production `/login` requires real Clerk authentication; demo cookies are ignored in production auth context.
5. **Clear Error & Configuration States**:
   - Render helpful, friendly error messages for unlinked accounts, inactive accounts, missing roles, and invalid credentials.
6. **Clean Portal Sign-Out**:
   - Ensure all portal headers/sidebars use standard Clerk sign-out flow redirecting to `/login`.

---

## 8. Files to Modify / Create

- `docs/login-auth-audit.md` (CREATED)
- `app/login/page.tsx` (NEW)
- `middleware.ts` (MODIFY)
- `app/sign-in/[[...sign-in]]/page.tsx` (MODIFY - redirect to `/login`)
- `lib/auth/getAuthContext.ts` (MODIFY - robust role resolution & error handling)
- `lib/auth/authOnboarding.ts` (MODIFY - seamless user mapping)
- `app/unauthorized/page.tsx` (MODIFY - clear role restriction messaging)
- `app/teacher/page.tsx`, `app/parent/page.tsx`, `app/student/page.tsx`, `app/admin/page.tsx`, `app/gate/layout.tsx`, `app/driver/layout.tsx`, `app/vendor/layout.tsx` (MODIFY - verify server-side role enforcement)
- `components/landing/Navbar.tsx`, `components/landing/LandingNavbar.tsx`, `components/landing/PortalGrid.tsx`, `components/landing/CTA.tsx` (MODIFY - update `/sign-in` links to `/login`)

---

## 9. Test Suite Matrix

1. **Unauthenticated Access**: Unauthenticated user visiting `/login` sees clean auth surface without role cards.
2. **Automatic Teacher Redirect**: Authenticated Teacher visiting `/login` automatically redirects to `/teacher`.
3. **Automatic Parent Redirect**: Authenticated Parent visiting `/login` automatically redirects to `/parent`.
4. **Automatic Student Redirect**: Authenticated Student visiting `/login` automatically redirects to `/student`.
5. **Automatic Admin Redirect**: Authenticated Admin visiting `/login` automatically redirects to `/admin`.
6. **Automatic Gate Staff Redirect**: Authenticated Gate staff visiting `/login` automatically redirects to `/gate`.
7. **Automatic Driver Redirect**: Authenticated Driver visiting `/login` automatically redirects to `/driver`.
8. **Role Enforcing Security**: Parent navigating to `/admin` is blocked and redirected to `/unauthorized` or `/parent`.
9. **Unlinked Account Handling**: User authenticated in Clerk without a `user_mappings` record receives clear configuration error.
10. **Demo Isolation**: Demo session cannot bypass Clerk authentication in production environment.
