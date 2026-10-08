// One motion vocabulary for the whole site, so every reveal, stagger and
// expand moves with the same rhythm: a single expo-out curve (fast start,
// long settle — the headline's own curve) and a single stagger step.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_OUT_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Delay between siblings in a staggered group, in seconds (framer-motion). */
export const STAGGER = 0.08;
/** The same step in milliseconds, for CSS-driven reveals (SectionReveal). */
export const STAGGER_MS = 80;

export const REVEAL_DURATION_MS = 800;
