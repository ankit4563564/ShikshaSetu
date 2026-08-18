'use client';

import React, { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { resolveAuthenticatedPortalRoute } from '@/app/actions/authRoutingActions';

export default function LoginClient() {
  const { isLoaded: isClerkLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

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
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

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
        setErrorMessage(
          'Connecting to authentication server timed out. If you have an ad-blocker enabled, please allow clerk.accounts.dev or check your network connection.'
        );
        setIsLoading(false);
        return;
      }

      // Attempt sign-in with email identifier and password
      const result = await activeSignIn.create({
        identifier: email.trim().toLowerCase(),
        password: password,
      });

      if (result.status === 'complete') {
        setIsResolving(true);
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        const target = await resolveAuthenticatedPortalRoute();
        router.replace(target || '/login');
      } else {
        console.warn('[Clerk SignIn Status]:', result.status);
        setErrorMessage(`Sign-in requires additional verification (${result.status}). Please contact your school administrator.`);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('[Clerk Password Sign-In Error]:', err);
      const clerkCode = err?.errors?.[0]?.code;
      const clerkErrorMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message;

      if (clerkCode === 'form_identifier_not_found') {
        setErrorMessage("No account found with this email address. Please check your spelling or contact your administrator.");
      } else if (clerkCode === 'form_password_incorrect') {
        setErrorMessage("Incorrect password. Please try again.");
      } else {
        setErrorMessage(clerkErrorMsg || 'Invalid email or password. Please try again.');
      }
      setIsLoading(false);
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
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
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#fbf8f3] border border-black/[0.08] text-sm text-[#1f4e5f] placeholder-[#1f4e5f]/35 font-medium outline-none focus:ring-2 focus:ring-[#1f4e5f]/20 focus:border-[#1f4e5f] transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="school-password" className="block text-xs font-bold text-[#1f4e5f]/80">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="school-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-[#fbf8f3] border border-black/[0.08] text-sm text-[#1f4e5f] placeholder-[#1f4e5f]/35 font-medium outline-none focus:ring-2 focus:ring-[#1f4e5f]/20 focus:border-[#1f4e5f] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1f4e5f]/50 hover:text-[#1f4e5f] p-1 text-xs font-medium cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1f4e5f] hover:bg-[#183e4c] text-white font-extrabold text-xs tracking-wider uppercase shadow-md transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in →</span>
              )}
            </button>
          </form>
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
