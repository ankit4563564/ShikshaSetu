'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

export const easeOut = [0.16, 1, 0.3, 1] as const;

export function LandingMotion({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}) {
  const reduce = useReducedMotion();
  const hidden = reduce
    ? { opacity: 0 }
    : direction === 'left'
      ? { opacity: 0, x: -22 }
      : direction === 'right'
        ? { opacity: 0, x: 22 }
        : direction === 'scale'
          ? { opacity: 0, scale: 0.97 }
          : { opacity: 0, y: 20 };

  return (
    <m.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay, ease: easeOut }}
    >
      {children}
    </m.div>
  );
}

export const interactiveMotion: HTMLMotionProps<'div'> = {
  whileHover: { y: -4, scale: 1.015 },
  whileTap: { scale: 0.985 },
  transition: { type: 'spring', stiffness: 420, damping: 30 },
};
