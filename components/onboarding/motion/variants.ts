import type { Transition, Variants } from 'framer-motion';

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const springOpen: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 38,
  mass: 1.2,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 40,
  mass: 1.1,
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.4,
      delay,
      ease: premiumEase,
    },
  }),
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.7, ease: premiumEase },
  },
};

export const modalShellVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 28,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...springOpen,
      duration: 0.9,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: { duration: 0.7, ease: premiumEase },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: premiumEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.6, ease: premiumEase },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.12,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.12,
      staggerDirection: -1,
    },
  },
};

export const roleCardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.3,
      ease: premiumEase,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.96,
    transition: { duration: 0.6, ease: premiumEase },
  },
};

export const timelineStepVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      delay: index * 0.45,
      ease: premiumEase,
    },
  }),
};
