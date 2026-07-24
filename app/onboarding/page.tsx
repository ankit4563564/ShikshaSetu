'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { RoleSelector } from '@/components/onboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);

  useEffect(() => {
    // Redirect if not signed in
    if (userLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check if user already has a selected role in metadata
    if (userLoaded && user) {
      const selectedRole = user.unsafeMetadata?.selectedRole as string | undefined;
      if (selectedRole) {
        setHasSelectedRole(true);
        // Redirect to the appropriate portal
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
          router.push(redirectPath);
        }
      } else {
        // Show role selector if no role is selected yet
        setShowRoleSelector(true);
      }
    }
  }, [userLoaded, isSignedIn, user, router]);

  if (!userLoaded || !isSignedIn || hasSelectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-deep-teal/20 border-t-deep-teal rounded-full animate-spin mx-auto mb-4" />
          <p className="text-deep-teal/60">Setting up your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <RoleSelector 
        isOpen={showRoleSelector}
        onClose={() => {
          // Don't allow closing without selecting a role
        }}
      />
    </div>
  );
}
