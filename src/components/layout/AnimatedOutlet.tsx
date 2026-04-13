import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import PageTransition from '@/components/features/PageTransition';

/**
 * A custom outlet that wraps route content with AnimatePresence
 * for smooth page-to-page transition animations.
 *
 * We freeze the outlet element per pathname so AnimatePresence
 * can animate the exiting page while the new one enters.
 */
export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  // Cache the outlet element per pathname so the exiting route
  // keeps rendering its content during the exit animation.
  const outletCache = useRef<Record<string, React.ReactNode>>({});

  if (outlet) {
    outletCache.current[location.pathname] = outlet;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location.pathname}>
        {outletCache.current[location.pathname] ?? outlet}
      </PageTransition>
    </AnimatePresence>
  );
}
