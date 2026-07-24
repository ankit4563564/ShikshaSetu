import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDemoSessionFromRequest } from '@/lib/demo/session';

// Match public authentication routes and the landing page
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/unauthorized(.*)',
  '/',
  '/landing(.*)',
  '/demo(.*)',
  '/api/demo/runner(.*)',
  '/api/auth/demo-session(.*)',
  '/api/seed-clerk-users(.*)',
  '/api/auth/demo-login(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Demo mode bypass: if a valid demo session cookie exists, skip Clerk auth
  const demo = await getDemoSessionFromRequest(req);
  if (demo?.active) return NextResponse.next();

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Ensure user is signed in
  const session = await auth();
  if (!session.userId) {
    return session.redirectToSignIn({ returnBackUrl: req.url });
  }

  // For hackathon demo: allow authenticated users to access all portals.
  // Page-level components handle role-specific data filtering.
  return NextResponse.next();
});

export const config = {
  // Run middleware on all routes except static assets
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
