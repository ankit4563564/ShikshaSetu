'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { resolveAuthenticatedPortalRoute } from '@/app/actions/authRoutingActions';

type MagicLinkStatus = 'idle' | 'sending' | 'sent' | 'expired' | 'invalid' | 'complete';

export default function LoginClient() {
  const { isLoaded: isClerkLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<MagicLinkStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const magicLinkFlowRef = useRef<ReturnType<NonNullable<typeof signIn>['createMagicLinkFlow']> | null>(null);

  // If already authenticated via Clerk session, automatically route to the authorized portal
  useEffect(() => {
    if (isAuthLoaded && isSignedIn && !isResolving) {
      setIsResolving(true);
      resolveAuthenticatedPortalRoute().then((target) => {
        if (target) {
          router.replace(target);
        } else {
          setIsResolving(false);
        }
      });
    }
  }, [isAuthLoaded, isSignedIn, isResolving, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid school email address.');
      return;
    }

    setErrorMessage(null);
    setStatus('sending');

    try {
      // If Clerk is not yet loaded, wait up to 3.5 seconds
      let activeSignIn = signIn;
      if (!isClerkLoaded || !activeSignIn) {
        for (let i = 0; i < 15; i++) {
          await new Promise((r) => setTimeout(r, 250));
          if (signIn) {
            activeSignIn = signIn;
            break;
          }
        }
      }

      if (!activeSignIn) {
        // In local development mode when Clerk CDN is blocked by ad-blocker or unconfigured
        setErrorMessage(
          'Connecting to authentication server timed out. If you have an ad-blocker enabled, please allow clerk.accounts.dev or check your network connection.'
        );
        setStatus('idle');
        return;
      }

      // 1. Create a sign-in attempt with email identifier
      const signInAttempt = await activeSignIn.create({
        identifier: email.trim().toLowerCase(),
      });

      // 2. Locate the email_link factor in supported first factors
      const emailLinkFactor = signInAttempt.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === 'email_link'
      ) as { emailAddressId: string } | undefined;

      if (!emailLinkFactor) {
        // If email_link strategy is not enabled in Clerk dashboard
        setErrorMessage(
          'Email magic link is not enabled on this authentication instance. Please enable "Email verification link (Magic links)" in Clerk Dashboard under Authentication Factors.'
        );
        setStatus('idle');
        return;
      }

      // 3. Initialize Clerk Magic Link flow
      const magicLinkFlow = activeSignIn.createMagicLinkFlow();
      magicLinkFlowRef.current = magicLinkFlow;

      setStatus('sent');

      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await magicLinkFlow.startMagicLinkFlow({
        emailAddressId: emailLinkFactor.emailAddressId,
        redirectUrl: `${redirectOrigin}/login`,
      });

      const verification = response.firstFactorVerification;

      if (verification?.status === 'expired') {
        setStatus('expired');
        setErrorMessage('This sign-in link has expired. Request a new one.');
        return;
      }

      if (response.status === 'complete') {
        setStatus('complete');
        setIsResolving(true);
        if (response.createdSessionId) {
          await setActive({ session: response.createdSessionId });
        }
        const target = await resolveAuthenticatedPortalRoute();
        router.replace(target || '/login');
      } else {
        setStatus('invalid');
        setErrorMessage("We couldn't verify that sign-in link. Please request a new one.");
      }
    } catch (err: any) {
      console.error('[Clerk Magic Link Error]:', err);
      const clerkErrorMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message;
      setErrorMessage(clerkErrorMsg || 'An error occurred sending your sign-in link. Please try again.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (magicLinkFlowRef.current) {
      magicLinkFlowRef.current.cancelMagicLinkFlow();
    }
    setStatus('idle');
    setErrorMessage(null);
  };

  if (isResolving) {
    return (
      <main className="min-h-screen bg-[#fbf8f3] text-[#1f4e5f] flex flex-col items-center justify-center p-6 antialiased select-none">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-[#1f4e5f]/20 border-t-[#1f4e5f] rounded-full animate-spin mx-auto" />
          <p className="font-sans text-xs font-bold text-[#1f4e5f]/70 uppercase tracking-widest">
            Resolving portal access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#1f4e5f] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#e8a33d]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#6b9080]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1f4e5f] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md tracking-tight">
            S
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-[#1f4e5f] mt-3">
            Welcome back
          </h1>
          <p className="text-sm font-semibold text-[#1f4e5f]/70">
            Sign in to your school
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-black/[0.04] space-y-5">
          {status === 'sent' ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ✉️
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-base text-[#1f4e5f]">
                  Check your email
                </h3>
                <p className="text-xs text-[#1f4e5f]/70 font-medium leading-relaxed">
                  We sent a secure sign-in link to:
                  <span className="block font-bold text-[#1f4e5f] mt-0.5">{email}</span>
                </p>
              </div>
              <p className="text-[11px] text-[#1f4e5f]/50 leading-relaxed bg-[#fbf8f3] p-3 rounded-xl border border-black/[0.03]">
                Click the link in your email to open your portal. You can keep this window open.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-[#1f4e5f] hover:underline pt-2 block mx-auto cursor-pointer"
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="school-email" className="block text-xs font-bold text-[#1f4e5f]/80 mb-2">
                  School Email
                </label>
                <input
                  id="school-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  disabled={status === 'sending'}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#fbf8f3] border border-black/[0.08] text-sm text-[#1f4e5f] placeholder-[#1f4e5f]/35 font-medium outline-none focus:ring-2 focus:ring-[#1f4e5f]/20 focus:border-[#1f4e5f] transition-all disabled:opacity-50"
                />
              </div>

              {errorMessage && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {status === 'expired' && (
                <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  This sign-in link has expired. Request a new one.
                </div>
              )}

              {status === 'invalid' && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  We couldn't verify that sign-in link. Please request a new one.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1f4e5f] hover:bg-[#183e4c] text-white font-extrabold text-xs tracking-wider uppercase shadow-md transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {status === 'sending' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending your sign-in link...</span>
                  </>
                ) : (
                  <span>Send sign-in link →</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Support */}
        <footer className="text-center space-y-1.5 pt-2">
          <p className="text-xs font-bold text-[#1f4e5f]/60">
            Secure access
          </p>
          <p className="text-[11px] text-[#1f4e5f]/50">
            Need help? Contact your school admin
          </p>
        </footer>
      </div>
    </main>
  );
}
