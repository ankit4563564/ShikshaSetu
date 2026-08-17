import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDemoSessionFromRequest } from '@/lib/demo/session';

// Match public unauthenticated routes (landing, marketing, login, demo)
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/unauthorized(.*)',
  '/',
  '/landing(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/pricing(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/resources(.*)',
  '/blog(.*)',
  '/demo(.*)',
  '/api/demo/runner(.*)',
  '/api/auth/demo-session(.*)',
  '/api/seed-clerk-users(.*)',
  '/api/auth/demo-login(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Demo mode bypass: if explicit demo session cookie exists, allow access
  const demo = await getDemoSessionFromRequest(req);
  if (demo?.active) return NextResponse.next();

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Enforce Clerk authentication for all protected portal routes
  const session = await auth();
  if (!session.userId) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on all routes except static assets
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
