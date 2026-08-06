import * as THREE from 'three';

// Shared two-shape repeating morph cycle driving every hero-scene layer
// (the fine-dust AssemblyField, the Instrument ring system, the
// MarketMotif candlestick chart) off one clock: particles -> Instrument ->
// particles -> MarketMotif -> repeat. Every consumer calls getMorphState()
// independently inside its own useFrame — a per-frame value computed by a
// PARENT's useFrame and passed down as a React prop never updates a
// child's rendering (useFrame mutations don't trigger re-renders), so
// there is deliberately no "morph controller" component; this is a pure
// function every layer reads for itself from the same elapsedTime input.
export type MorphShape = 'instrument' | 'market';
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

export const ASSEMBLE_DURATION = 2.8;
export const HOLD_DURATION = 4.4;
export const DISPERSE_DURATION = 1.9;
export const SCATTER_HOLD_DURATION = 0.9;

const SEGMENT_DURATION = ASSEMBLE_DURATION + HOLD_DURATION + DISPERSE_DURATION + SCATTER_HOLD_DURATION;
const CYCLE_DURATION = SEGMENT_DURATION * 2;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// prefers-reduced-motion contract: freeze on shape 1 (Instrument), fully
// formed, rather than skipping motion entirely — matches this scene's
// established "content stays visible, only motion stops" accessibility rule.
const REDUCED_MOTION_STATE: MorphState = {
  activeShape: 'instrument',
  phase: 'hold',
  phaseElapsed: 0,
  formProgress: 1,
};

export function getMorphState(elapsedTime: number, reducedMotion: boolean): MorphState {
  if (reducedMotion) return REDUCED_MOTION_STATE;

  const t = elapsedTime % CYCLE_DURATION;
  const inFirstHalf = t < SEGMENT_DURATION;
  const local = inFirstHalf ? t : t - SEGMENT_DURATION;
  const activeShape: MorphShape = inFirstHalf ? 'instrument' : 'market';

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

/**
 * How "formed" one staggered element (a ring, a candle, a dust particle)
 * of `shape` should be right now: 0 outside its own shape's turn, a
 * staggered ease-in during that shape's assemble phase (via `delay` +
 * `duration`), and the shared `formProgress` otherwise (1 while held,
 * fading uniformly on disperse) — so individual elements only need their
 * own entrance stagger, not a whole reimplementation of the hold/disperse
 * logic already captured in `state`.
 */
export function shapeVisibility(shape: MorphShape, delay: number, duration: number, state: MorphState): number {
  if (state.activeShape !== shape) return 0;
  if (state.phase !== 'assemble') return state.formProgress;
  return easeOutCubic(THREE.MathUtils.clamp((state.phaseElapsed - delay) / duration, 0, 1));
}
