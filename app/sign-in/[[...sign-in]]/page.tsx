'use client';

import { SignIn, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { DEMO_ROLES, LOADING_STEPS } from '@/lib/demo/data';

// ---------------------------------------------------------------------------
// Friendly error message — never expose raw Clerk internals to the UI
// ---------------------------------------------------------------------------
const FRIENDLY_ERROR_MSG = 'Demo account is currently unavailable.';

export default function SignInPage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<string | null>(roleParam);
  const [showStandardSignIn, setShowStandardSignIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showFallbackSignIn, setShowFallbackSignIn] = useState(false);

  // Guard against multiple rapid clicks — ref survives re-renders
  const authLockRef = useRef(false);

  // -----------------------------------------------------------------------
  // Post-auth redirect: if already signed in, go to the stored role dashboard
  // -----------------------------------------------------------------------
  const performStoredRedirect = useCallback(() => {
    const storedRole = localStorage.getItem('edusync-dev-role');
    if (storedRole && DEMO_ROLES[storedRole]) {
      const targetPath = `/${storedRole}`;
      router.replace(targetPath);
    } else {
      router.replace('/');
    }
  }, [router]);

  // On mount: if the user is already authenticated, redirect immediately.
  // This happens when returning from Clerk's hosted sign-in after the ticket is processed.
  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      // Small delay to let Clerk fully hydrate
      const t = setTimeout(() => performStoredRedirect(), 300);
      return () => clearTimeout(t);
    }
  }, [isAuthLoaded, isSignedIn, performStoredRedirect]);

  // Sync state if URL search param updates
  useEffect(() => {
    if (roleParam && DEMO_ROLES[roleParam]) {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  // Loading animation message cycler
  useEffect(() => {
    if (!isAuthenticating) return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 280);
    return () => clearInterval(interval);
  }, [isAuthenticating]);

  // -----------------------------------------------------------------------
  // Dummy demo login — just sets a cookie + localStorage and redirects
  // No Clerk auth, no passwords, no redirects to Clerk-hosted pages.
  // -----------------------------------------------------------------------
  const handleDemoLogin = async (roleId: string) => {
    // Double-click / rapid-fire guard
    if (isAuthenticating || authLockRef.current) return;
    authLockRef.current = true;

    setIsAuthenticating(true);
    setLoadingStepIndex(0);
    setErrorMsg(null);
    setShowFallbackSignIn(false);

    try {
      // Request a signed demo session cookie from the server.
      const resp = await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleId }),
      });

      if (!resp.ok) {
        throw new Error('Failed to create demo session');
      }

      // Always persist role locally for UI flows (client cannot read HttpOnly cookie)
      localStorage.setItem('edusync-dev-role', roleId);

      // Smooth loader screen delay (850ms) — feels premium
      await new Promise((resolve) => setTimeout(resolve, 850));

      // Redirect to the correct portal
      const targetPath = `/${roleId}`;
      window.location.href = targetPath;

      // isAuthenticating stays true so the loader persists until navigation
    } catch (err: any) {
      // Log the full error to the developer console only
      console.error('[ShikshaSetu Demo] Dummy login error:', {
        message: err?.message,
      });

      // Show a friendly message — NEVER expose raw error strings
      setErrorMsg(FRIENDLY_ERROR_MSG);
      setShowFallbackSignIn(true);
      setIsAuthenticating(false);
      authLockRef.current = false;
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setErrorMsg(null);
    setShowFallbackSignIn(false);
    // Update the URL query param seamlessly without full page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('role', roleId);
    window.history.pushState({}, '', url.toString());
  };

  const activeRole = selectedRole ? DEMO_ROLES[selectedRole] : null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fbf8f3] text-[#1f4e5f] relative overflow-hidden font-sans p-6 select-none">
      {/* Decorative luxury gradient spots */}
      <div className="absolute top-[-30%] left-[-20%] w-[600px] h-[600px] rounded-full bg-[#e8a33d]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#6b9080]/10 blur-[120px] pointer-events-none" />

      {/* Full-screen Loading Overlay — premium feel */}
      <AnimatePresence>
        {isAuthenticating && activeRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#fbf8f3] flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8">
              {/* Pulsing Emoji */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl"
              >
                {activeRole.emoji}
              </motion.div>

              {/* Progress bar */}
              <div className="h-[2px] w-48 bg-[#1f4e5f]/10 mx-auto rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#1f4e5f] to-transparent"
                />
              </div>

              {/* Cycling Status Text */}
              <div className="h-6">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStepIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-semibold tracking-wide text-[#1f4e5f]/70 uppercase"
                  >
                    {LOADING_STEPS[loadingStepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[940px] flex flex-col items-center relative z-10">
        {/* Logo and header */}
        <header className="text-center mb-16 space-y-2">
          <h1 
            onClick={() => {
              setSelectedRole(null);
              setShowStandardSignIn(false);
              setErrorMsg(null);
              setShowFallbackSignIn(false);
              const url = new URL(window.location.href);
              url.searchParams.delete('role');
              window.history.pushState({}, '', url.toString());
            }}
            className="font-extrabold text-2xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          >
            ShikshaSetu
          </h1>
          <p className="text-xs text-[#1f4e5f]/40 font-medium uppercase tracking-[0.2em]">The Intelligent School Ecosystem</p>
        </header>

        {/* Outer Shell with absolute height stability */}
        <div className="w-full min-h-[480px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {showStandardSignIn ? (
              /* State 3: Normal Clerk Authentication Form */
              <motion.div
                key="standard-signin"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm flex flex-col items-center space-y-6"
              >
                <div className="flex items-center justify-center w-full">
                  <SignIn
                    routing="hash"
                    appearance={{
                      variables: {
                        colorPrimary: '#1f4e5f',
                        colorBackground: '#fbf8f3',
                        fontFamily: 'system-ui, sans-serif',
                      },
                      elements: {
                        card: 'shadow-2xl border border-[#1f4e5f]/5 rounded-3xl w-full p-4 bg-white/70 backdrop-blur-md',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        logoImage: 'hidden',
                        logoBox: 'hidden',
                      }
                    }}
                  />
                </div>

                <button
                  onClick={() => setShowStandardSignIn(false)}
                  className="text-xs font-semibold text-[#1f4e5f]/50 hover:text-[#1f4e5f] transition-colors"
                >
                  ← Go back to demo portal
                </button>
              </motion.div>
            ) : activeRole ? (
              /* State 2: High-end Role Confirmation (Stripe/Linear style) */
              <motion.div
                key={`confirm-${activeRole.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[500px] bg-white/60 border border-black/[0.03] shadow-[0_24px_50px_-12px_rgba(31,78,95,0.06)] rounded-[32px] p-10 flex flex-col items-center text-center space-y-8"
              >
                {/* Large role badge */}
                <div className={`w-20 h-20 rounded-[28px] ${activeRole.bgAccent} flex items-center justify-center text-4xl shadow-sm transition-transform duration-500 hover:scale-105`}>
                  {activeRole.emoji}
                </div>

                {/* Typography details */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#1f4e5f]">
                    {activeRole.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#1f4e5f]/70 font-normal px-2 max-w-sm">
                    {activeRole.description}
                  </p>
                </div>

                {/* CTAs */}
                <div className="w-full space-y-3.5 pt-4">
                  <button
                    onClick={() => handleDemoLogin(activeRole.id)}
                    disabled={isAuthenticating}
                    className={`w-full py-4 rounded-2xl font-semibold text-sm shadow-[0_12px_24px_rgba(31,78,95,0.15)] transition-all duration-300 ${
                      isAuthenticating
                        ? 'bg-[#1f4e5f]/60 text-[#fbf8f3]/80 cursor-not-allowed'
                        : 'bg-[#1f4e5f] text-[#fbf8f3] hover:bg-[#1a4250] hover:shadow-[0_12px_28px_rgba(31,78,95,0.25)] hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    {isAuthenticating ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Authenticating…
                      </span>
                    ) : (
                      <>Continue as {activeRole.title.split(' ')[0]} ➔</>
                    )}
                  </button>

                  <button
                    onClick={() => setShowStandardSignIn(true)}
                    disabled={isAuthenticating}
                    className={`w-full py-3.5 rounded-2xl border border-[#1f4e5f]/10 text-xs font-semibold tracking-wide transition-all duration-300 ${
                      isAuthenticating
                        ? 'bg-white/20 cursor-not-allowed opacity-50'
                        : 'bg-white/40 hover:bg-white/95 text-[#1f4e5f]/80'
                    }`}
                  >
                    Sign in with email
                  </button>
                </div>

                {/* Error state — friendly message + automatic fallback CTA */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-3"
                  >
                    <p className="text-xs font-medium text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 text-center">
                      {errorMsg}
                    </p>

                    {showFallbackSignIn && (
                      <button
                        onClick={() => {
                          setShowStandardSignIn(true);
                          setErrorMsg(null);
                          setShowFallbackSignIn(false);
                        }}
                        className="w-full py-3 rounded-2xl bg-[#1f4e5f]/5 border border-[#1f4e5f]/10 text-xs font-bold text-[#1f4e5f]/70 hover:bg-[#1f4e5f]/10 transition-all duration-300"
                      >
                        🔐 Sign in with your own account
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Back Link */}
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setErrorMsg(null);
                    setShowFallbackSignIn(false);
                    const url = new URL(window.location.href);
                    url.searchParams.delete('role');
                    window.history.pushState({}, '', url.toString());
                  }}
                  className="text-xs font-bold text-[#1f4e5f]/30 hover:text-[#1f4e5f]/60 transition-colors"
                >
                  ← Choose another role
                </button>
              </motion.div>
            ) : (
              /* State 1: Role Selection Grid */
              <motion.div
                key="role-grid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center space-y-8"
              >
                <div className="text-center max-w-md space-y-2">
                  <h2 className="text-xl font-extrabold tracking-tight">Select your demo experience</h2>
                  <p className="text-xs leading-relaxed text-[#1f4e5f]/50">Choose a school role below to automatically authenticate via Clerk and explore the unified environment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                  {Object.values(DEMO_ROLES).map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className="group cursor-pointer p-6 bg-white/50 border border-black/[0.02] hover:border-[#1f4e5f]/15 rounded-3xl hover:bg-white/95 transition-all duration-300 shadow-[0_4px_12px_rgba(31,78,95,0.01)] hover:shadow-[0_12px_32px_rgba(31,78,95,0.04)] hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${role.bgAccent} flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-300`}>
                          {role.emoji}
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-extrabold tracking-tight text-[#1f4e5f]">{role.title}</h4>
                          <p className="text-[10px] font-bold text-[#1f4e5f]/40 uppercase tracking-wider mt-0.5">Explore Ecosystem</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowStandardSignIn(true)}
                    className="text-xs font-semibold text-[#1f4e5f]/40 hover:text-[#1f4e5f] transition-colors"
                  >
                    🔐 Sign in with custom credentials
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
