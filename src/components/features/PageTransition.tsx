import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 24,
    filter: 'blur(6px)',
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      filter: { duration: 0.4 },
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Near-instant opacity-only crossfade — no y-drift, no blur — when the
// user has asked for reduced motion. This file previously had no
// reduced-motion handling at all.
const reducedVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export default function PageTransition({ children, className }: PageTransitionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      variants={reducedMotion ? reducedVariants : pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
