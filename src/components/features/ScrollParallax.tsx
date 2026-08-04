import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrollProgress, useParallaxY } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

interface ScrollParallaxProps {
  children: ReactNode;
  className?: string;
  distance?: number;
}

// Opt-in scroll-linked motion, layered alongside SectionReveal (which
// stays viewport-triggered/one-shot) — not a replacement for it. Applied
// narrowly per the design plan, not globally, to avoid stacking continuous
// scroll listeners on pages that are already canvas/animation-heavy.
export default function ScrollParallax({ children, className, distance = 40 }: ScrollParallaxProps) {
  const { ref, scrollYProgress } = useScrollProgress<HTMLDivElement>();
  const y = useParallaxY(scrollYProgress, distance);

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
