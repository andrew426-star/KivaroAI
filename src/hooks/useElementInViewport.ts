import { useEffect, useRef, useState, type RefObject } from 'react';

// Continuous (not one-shot) viewport-intersection tracking — distinct from
// useInView.ts's unobserve-after-first-true pattern, which is wrong here:
// this gates a WebGL Canvas's own render loop, and needs to know when the
// element leaves the viewport again, not just when it first entered.
// Defaults to true so the very first paint (before the observer has had a
// chance to attach and fire) never gates an above-the-fold scene off.
export function useElementInViewport<T extends HTMLElement>(rootMargin = '200px'): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inViewport];
}
