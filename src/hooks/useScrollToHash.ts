import { useEffect } from 'react';

// Landing on a #fragment URL before React has mounted/painted the target
// element means a browser's native scroll-to-hash fires too early and
// misses. Double rAF defers past initial paint and Suspense-boundary
// settling; called once from Home.tsx.
export function useScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }, []);
}
