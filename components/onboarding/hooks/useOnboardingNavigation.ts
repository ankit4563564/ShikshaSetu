'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SchoolRole } from '../types';
import {
  DEMO_STORAGE_KEY,
  DEV_ROLE_STORAGE_KEY,
  ROLE_ROUTES,
} from '../constants';

export function useOnboardingNavigation() {
  const router = useRouter();

  const enableDemoSession = useCallback((role: SchoolRole) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    localStorage.setItem(DEV_ROLE_STORAGE_KEY, role);
    sessionStorage.setItem('shikshasetu-onboarding-complete', role);
  }, []);

  const navigateToPortal = useCallback(
    (role: SchoolRole) => {
      enableDemoSession(role);
      router.push(ROLE_ROUTES[role] ?? '/');
    },
    [enableDemoSession, router],
  );

  return { enableDemoSession, navigateToPortal };
}
