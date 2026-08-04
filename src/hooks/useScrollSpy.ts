import { useEffect, useState } from 'react';

// Just below the fixed 64px header — matches each section's scroll-mt-16.
const HEADER_OFFSET = 80;

// Continuous, bidirectional section tracking for nav scroll-spy — distinct
// from useInView.ts's one-shot unobserve-after-first-true pattern, which is
// wrong here since nav highlighting must keep tracking as the user scrolls
// back up. IntersectionObserver is used only as a low-cost trigger for
// "something changed, recompute" — the actual "which section is active"
// answer comes from a fresh getBoundingClientRect() pass on every trigger,
// not from the entries IntersectionObserver hands back. Section elements
// are non-overlapping and appear in the same vertical order as sectionIds,
// so the active section is simply the last one whose top has crossed the
// header line; picking straight from IO's entries broke this once a tall
// section's spent bottom sliver was still barely intersecting — its very
// negative top made it look "more topmost" than the section actually
// occupying the reading zone.
export function useScrollSpy(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const recompute = () => {
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= HEADER_OFFSET) {
          current = el.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    const observer = new IntersectionObserver(recompute, {
      threshold: [0, 0.01, 0.25, 0.5, 0.75, 1],
    });

    elements.forEach((el) => observer.observe(el));
    recompute();

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
