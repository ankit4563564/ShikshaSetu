'use client';

import { SignIn, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveAuthenticatedPortalRoute } from '@/app/actions/authRoutingActions';

export default function LoginClient() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);

  // Client-side backup check if Clerk hydrates after page load
  useEffect(() => {
    if (isLoaded && isSignedIn && !isResolving) {
      setIsResolving(true);
      resolveAuthenticatedPortalRoute().then((target) => {
        if (target) {
          router.replace(target);
        } else {
          setIsResolving(false);
        }
      });
    }
  }, [isLoaded, isSignedIn, isResolving, router]);

  if (isResolving) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] text-[#1f4e5f] flex flex-col items-center justify-center p-6 antialiased select-none">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-[#1f4e5f]/20 border-t-[#1f4e5f] rounded-full animate-spin mx-auto" />
          <p className="font-sans text-xs font-bold text-[#1f4e5f]/70 uppercase tracking-widest">
            Signing you in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#1f4e5f] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Subtle luxury background blur spots */}
      <div className="absolute top-[-25%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#e8a33d]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6b9080]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1f4e5f] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md tracking-tight">
            S
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-[#1f4e5f] mt-3">
            ShikshaSetu
          </h1>
          <h2 className="font-bold text-sm text-[#1f4e5f]/70">
            Welcome back
          </h2>
          <p className="text-xs text-[#1f4e5f]/50 font-medium">
            Sign in to your school account
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="w-full flex justify-center">
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/login"
            appearance={{
              variables: {
                colorPrimary: '#1f4e5f',
                colorBackground: '#ffffff',
                colorText: '#1f4e5f',
                fontFamily: 'inherit',
                borderRadius: '1rem',
              },
              elements: {
                card: 'shadow-xl border border-black/[0.04] rounded-3xl w-full p-6 bg-white/90 backdrop-blur-md',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                logoImage: 'hidden',
                logoBox: 'hidden',
                footer: 'hidden',
                formButtonPrimary: 'bg-[#1f4e5f] hover:bg-[#1a4250] text-white font-semibold py-3 text-xs shadow-md transition-all',
              },
            }}
          />
        </div>

        {/* Footer Support Text */}
        <footer className="text-center space-y-1 pt-2">
          <p className="text-xs font-semibold text-[#1f4e5f]/40">
            Secure access to your school ecosystem
          </p>
          <p className="text-[11px] text-[#1f4e5f]/50">
            Need help? Contact your school administrator
          </p>
        </footer>
      </div>
    </main>
  );
}
