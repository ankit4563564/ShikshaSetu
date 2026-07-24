import type { Variants, Transition } from 'framer-motion';

export const fastTransition: Transition = { duration: 0.2, ease: 'easeOut' };
export const normalTransition: Transition = { duration: 0.3, ease: 'easeOut' };
export const springTransition: Transition = { type: 'spring', stiffness: 300, damping: 25 };

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: normalTransition },
};

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: normalTransition },
};

export const fadeSlideDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: normalTransition },
};

export const fadeSlideLeft: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: normalTransition },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
};

export const pulseOnce: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.04, 1],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const shakeError: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.35, ease: 'easeInOut' },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 28 } },
  exit: { opacity: 0, x: 48, transition: { duration: 0.2 } },
};

export const expandCollapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};


