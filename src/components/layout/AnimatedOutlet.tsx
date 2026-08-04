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
 *
 * Kept at `mode="wait"` — a genuine "sync"/overlapping mode was tried and
 * reverted: it left the outlet showing the outgoing page's frozen content
 * indefinitely after navigating (confirmed via real browser testing, not
 * assumed — the URL and nav highlight updated correctly but the rendered
 * page did not), because this outletCache pattern only ever supplies ONE
 * child per render and relies on AnimatePresence's own wait-then-mount
 * sequencing to hand off correctly. The scroll-reset is still synced to
 * the outgoing page's exit completing (via onExitComplete) instead of
 * firing the instant the route changes, so the jump-to-top lands while
 * the old page is still fading/blurring out rather than snapping
 * underneath it — that part is real and safe independent of the mode.
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
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
      <PageTransition key={location.pathname}>
        {outletCache.current[location.pathname] ?? outlet}
      </PageTransition>
    </AnimatePresence>
  );
}
