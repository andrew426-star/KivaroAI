import { useEffect, useRef, useState } from 'react';
import { useInView } from './useInView';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REFRESH_INTERVAL_MS = 2600;
const DRIFT_RANGE = 9; // deliberately subtle — "never a big obvious jump"
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 94;

// Shared scroll-reveal + idle-drift engine behind every ambient data-graph
// variant (SparkBars/Sparkline/CandlestickStrip) — generalizes the pattern
// MarketBars.tsx pioneered, fixing the one real gap in that original
// version: no prefers-reduced-motion handling at all. These are decorative
// "live system" texture (same honest framing MarketBars/WorkflowDiagram
// already established), never a claim about real historical metrics.
export function useAmbientBars(count: number, seedMin = 20, seedMax = 80) {
  const [ref, inView] = useInView(0.2);
  const reducedMotion = usePrefersReducedMotion();
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: count }, () => seedMin + Math.random() * (seedMax - seedMin)),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (reducedMotion || !inView) return;
    intervalRef.current = setInterval(() => {
      setHeights((prev) =>
        prev.map((h) => {
          const next = h + (Math.random() - 0.5) * DRIFT_RANGE * 2;
          return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, next));
        }),
      );
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [inView, reducedMotion]);

  return { ref, inView, heights, reducedMotion };
}
