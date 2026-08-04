import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const FADE_THRESHOLD = 120;

// "Scroll to explore" nudge anchored to the hero — fades out once the user
// actually starts scrolling, using the same inline scrollY-threshold
// pattern Header.tsx already uses for its own `scrolled` state (no new
// hook needed for a single boolean).
export default function ScrollCue() {
  const [pastThreshold, setPastThreshold] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setPastThreshold(window.scrollY > FADE_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-base"
      animate={{ opacity: pastThreshold ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      <span className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground/50">
        Scroll
      </span>
      <div className="relative h-9 w-5 rounded-full border border-border/60">
        <motion.span
          className="absolute left-1/2 top-1.5 size-1.5 -translate-x-1/2 rounded-full bg-primary"
          animate={reducedMotion ? {} : { y: [0, 14, 0], opacity: [1, 0.3, 1] }}
          transition={reducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}
