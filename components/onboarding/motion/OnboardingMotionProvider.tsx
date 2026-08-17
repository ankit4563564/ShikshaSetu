'use client';

import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  useReducedMotion,
} from 'framer-motion';
import type { ReactNode } from 'react';

type OnboardingMotionProviderProps = {
  children: ReactNode;
};

export function OnboardingMotionProvider({ children }: OnboardingMotionProviderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        reducedMotion={reduceMotion ? 'always' : 'never'}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : { type: 'spring', stiffness: 420, damping: 34 }
        }
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
