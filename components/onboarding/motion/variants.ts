import type { Transition, Variants } from 'framer-motion';

export const premiumEase = [0.16, 1, 0.3, 1] as const;

export const springOpen: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 38,
  mass: 0.72,
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: premiumEase,
    },
  }),
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.28, ease: premiumEase },
  },
};

export const modalShellVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 24,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...springOpen,
      duration: 0.35,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    transition: { duration: 0.28, ease: premiumEase },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: premiumEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: premiumEase },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

export const roleCardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: premiumEase,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.96,
    transition: { duration: 0.3, ease: premiumEase },
  },
};

export const timelineStepVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      delay: index * 0.12,
      ease: premiumEase,
    },
  }),
};
