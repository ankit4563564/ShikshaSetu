'use client';

import { memo, useCallback, useRef, useState } from 'react';
import {
  AnimatePresence,
  m,
  useReducedMotion,
} from 'framer-motion';
import Icon from '@/components/landing/Icon';
import { springSnappy } from './motion/variants';

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type SchoolStoryButtonProps = {
  onOpen: () => void;
  disabled?: boolean;
};

function SchoolStoryButtonComponent({ onOpen, disabled }: SchoolStoryButtonProps) {
  const reduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [arrowShift, setArrowShift] = useState(false);
  const rippleId = useRef(0);

  const spawnRipple = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const id = rippleId.current++;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setRipples((current) => [...current, { id, x, y }]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id));
      }, 650);
    },
    [],
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    spawnRipple(event);
    setArrowShift(true);
    window.setTimeout(() => setArrowShift(false), reduceMotion ? 0 : 420);
    onOpen();
  };

  return (
    <m.button
      ref={buttonRef}
      type="button"
      aria-haspopup="dialog"
      aria-label="Start your school story — open immersive onboarding"
      disabled={disabled}
      onClick={handleClick}
      className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-marigold px-7 py-4 text-sm font-bold text-deep-teal shadow-[0_14px_35px_rgba(31,78,95,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 disabled:cursor-not-allowed disabled:opacity-70"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
    >
      <span className="relative z-10">Start your school story</span>
      <m.span
        className="relative z-10 inline-flex"
        animate={
          reduceMotion
            ? undefined
            : arrowShift
              ? { x: 10 }
              : { x: [0, 4, 0] }
        }
        transition={
          arrowShift
            ? { type: 'spring', stiffness: 520, damping: 28 }
            : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <Icon name="arrow" className="h-5 w-5" />
      </m.span>

      <AnimatePresence>
        {ripples.map((ripple) => (
          <m.span
            key={ripple.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-white/35"
            style={{ left: ripple.x, top: ripple.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.55 }}
            animate={{
              width: 220,
              height: 220,
              x: -110,
              y: -110,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.62, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </m.button>
  );
}

export const SchoolStoryButton = memo(SchoolStoryButtonComponent);
