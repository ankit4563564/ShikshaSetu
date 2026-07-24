'use client';

import { useEffect } from 'react';

export function CampusIdInitializer() {
  useEffect(() => {
    import('@/lib/campus-id/init').then((mod) => {
      mod.initializeCampusIdSystem();
    });
  }, []);
  return null;
}
