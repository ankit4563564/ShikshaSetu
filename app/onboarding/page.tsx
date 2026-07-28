'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { RoleSelector } from '@/components/onboarding';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_TIPS = [
  'Connecting to your classroom...',
  'Loading your schedule...',
  'Syncing live campus signals...',
  'Preparing your personalized experience...',
  'Almost there...',
];

function BrandedLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12, 92));
    }, 300);

    // Tip rotation
    const tipInterval = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
        setTipVisible(true);
      }, 400);
    }, 2200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[100px]" />
        <div className="absolute top-2/3 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-500/8 blur-[80px]" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm w-full text-center"
      >
        {/* Logo */}
        <div className="space-y-3">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F766E] via-[#14b8a6] to-[#F4B942] p-0.5 mx-auto shadow-[0_0_32px_rgba(15,118,110,0.35)]"
          >
            <div className="w-full h-full rounded-[14px] bg-[#0a0f1a] flex items-center justify-center text-2xl">
              🏫
            </div>
          </motion.div>
          <div>
            <h1 className="text-xl font-extrabold text-white font-display tracking-tight">ShikshaSetu</h1>
            <p className="text-xs text-teal-400 font-mono mt-0.5">One Connected School Day</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2.5">
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 relative"
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            </motion.div>
          </div>

          {/* Rotating tip */}
          <div className="h-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {tipVisible && (
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-slate-400 font-mono"
                >
                  {LOADING_TIPS[tipIndex]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pulse dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-teal-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (userLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (userLoaded && user) {
      const selectedRole = user.unsafeMetadata?.selectedRole as string | undefined;
      if (selectedRole) {
        setHasSelectedRole(true);
        const ROLE_ROUTES: Record<string, string> = {
          parent: '/parent',
          teacher: '/teacher',
          student: '/student',
          admin: '/admin',
          vendor: '/vendor',
          gate: '/gate',
          driver: '/driver',
        };
        const redirectPath = ROLE_ROUTES[selectedRole];
        if (redirectPath) {
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => router.push(redirectPath), 400);
          }, 600);
        }
      } else {
        setTimeout(() => setShowRoleSelector(true), 500);
      }
    }
  }, [userLoaded, isSignedIn, user, router]);

  if (!userLoaded || !isSignedIn || hasSelectedRole) {
    return (
      <AnimatePresence>
        {!fadeOut && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BrandedLoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-paper"
    >
      <RoleSelector
        isOpen={showRoleSelector}
        onClose={() => {
          // Don't allow closing without selecting a role
        }}
      />
    </motion.div>
  );
}
