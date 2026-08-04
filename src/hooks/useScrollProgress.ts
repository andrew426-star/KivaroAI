import { useRef } from 'react';
import { useScroll, useTransform, type MotionValue } from 'framer-motion';

// Scroll-linked (not viewport-triggered) progress, distinct from
// useInView.ts's one-shot SectionReveal system. Tracks how far a target
// element has moved through the viewport as a continuous 0-1 value.
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  return { ref, scrollYProgress };
}

export function useParallaxY(scrollYProgress: MotionValue<number>, distance = 40): MotionValue<number> {
  return useTransform(scrollYProgress, [0, 1], [distance, -distance]);
}
