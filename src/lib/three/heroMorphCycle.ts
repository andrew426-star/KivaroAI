import * as THREE from 'three';

// Shared two-shape repeating morph cycle driving every hero-scene layer
// (the GPU dust field, the LogoMark cubes, the MarketMotif candlestick
// chart) off one clock: particles -> LogoMark -> particles -> MarketMotif
// -> repeat. Every consumer calls getMorphState() independently inside its
// own useFrame — a per-frame value computed by a PARENT's useFrame and
// passed down as a React prop never updates a child's rendering (useFrame
// mutations don't trigger re-renders), so there is deliberately no "morph
// controller" component; this is a pure function every layer reads for
// itself from the same elapsedTime input.
export type MorphShape = 'logo' | 'market';
export type MorphPhase = 'assemble' | 'hold' | 'disperse' | 'scattered';

export interface MorphState {
  activeShape: MorphShape;
  phase: MorphPhase;
  /** Seconds elapsed since the current phase began. */
  phaseElapsed: number;
  /** 0 (fully scattered) -> 1 (fully formed), already eased — safe to use
   * directly for anything that doesn't need its own per-element stagger. */
  formProgress: number;
}

// Assemble and disperse are the same length, and disperse plays the
// assemble stagger backwards (see shapeVisibility) — the shape leaves the
// way it arrived, so the loop reads as one breath in and out rather than a
// slow build followed by a quick blink-out.
export const ASSEMBLE_DURATION = 2.4;
export const HOLD_DURATION = 4.2;
export const DISPERSE_DURATION = ASSEMBLE_DURATION;
export const SCATTER_HOLD_DURATION = 0.8;

const SEGMENT_DURATION = ASSEMBLE_DURATION + HOLD_DURATION + DISPERSE_DURATION + SCATTER_HOLD_DURATION;
const CYCLE_DURATION = SEGMENT_DURATION * 2;

const PHASE_INDEX: Record<MorphPhase, number> = { assemble: 0, hold: 1, disperse: 2, scattered: 3 };

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// prefers-reduced-motion contract: freeze on shape 1 (LogoMark), fully
// formed, rather than skipping motion entirely — matches this scene's
// established "content stays visible, only motion stops" accessibility rule.
const REDUCED_MOTION_STATE: MorphState = {
  activeShape: 'logo',
  phase: 'hold',
  phaseElapsed: 0,
  formProgress: 1,
};

export function getMorphState(elapsedTime: number, reducedMotion: boolean): MorphState {
  if (reducedMotion) return REDUCED_MOTION_STATE;

  const t = elapsedTime % CYCLE_DURATION;
  const inFirstHalf = t < SEGMENT_DURATION;
  const local = inFirstHalf ? t : t - SEGMENT_DURATION;
  const activeShape: MorphShape = inFirstHalf ? 'logo' : 'market';

  if (local < ASSEMBLE_DURATION) {
    return { activeShape, phase: 'assemble', phaseElapsed: local, formProgress: easeInOutCubic(local / ASSEMBLE_DURATION) };
  }
  const afterAssemble = local - ASSEMBLE_DURATION;
  if (afterAssemble < HOLD_DURATION) {
    return { activeShape, phase: 'hold', phaseElapsed: afterAssemble, formProgress: 1 };
  }
  const afterHold = afterAssemble - HOLD_DURATION;
  if (afterHold < DISPERSE_DURATION) {
    return {
      activeShape,
      phase: 'disperse',
      phaseElapsed: afterHold,
      formProgress: 1 - easeInOutCubic(afterHold / DISPERSE_DURATION),
    };
  }
  const afterDisperse = afterHold - DISPERSE_DURATION;
  return { activeShape, phase: 'scattered', phaseElapsed: afterDisperse, formProgress: 0 };
}

/** Phase as a number, for shader uniforms (assemble 0, hold 1, disperse 2, scattered 3). */
export function phaseIndex(state: MorphState): number {
  return PHASE_INDEX[state.phase];
}

/**
 * How "formed" one staggered element (a cube, a candle, a dust particle)
 * of `shape` should be right now: 0 outside its own shape's turn, a
 * staggered ease-in during assemble, 1 while held, and on disperse the
 * exact mirror of its assemble curve — so the last element in is the
 * first out, and every element retraces its own path at its own pace.
 * The GPU dust field re-implements this same function in GLSL
 * (HeroScene.tsx) and must be kept in step with it.
 */
export function shapeVisibility(shape: MorphShape, delay: number, duration: number, state: MorphState): number {
  if (state.activeShape !== shape) return 0;
  if (state.phase === 'hold') return 1;
  if (state.phase === 'scattered') return 0;
  const x = state.phase === 'assemble' ? state.phaseElapsed : DISPERSE_DURATION - state.phaseElapsed;
  return easeOutCubic(THREE.MathUtils.clamp((x - delay) / duration, 0, 1));
}
