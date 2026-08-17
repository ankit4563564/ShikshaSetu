import { redirect } from 'next/navigation';
import { resolveAuthenticatedPortalRoute } from '@/app/actions/authRoutingActions';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // If user is already authenticated with Clerk, server-side resolve role and redirect
  const portalRedirect = await resolveAuthenticatedPortalRoute();
  if (portalRedirect) {
    redirect(portalRedirect);
  }

  return <LoginClient />;
}
