import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMorphState, shapeVisibility } from '@/lib/three/heroMorphCycle';
import { HERO_CENTER } from './LogoMark';

// The hero's second particle-morph subject — a candlestick chart
// silhouette, the confirmed "market/data motif" direction, sharing
// LogoMark.tsx's lighting rig and the site's signal-green family (same same metalness/roughness, lit by the shared
// HeroLighting rig) so the two graphics read as two faces of one system,
// not two unrelated styles. Ties into the trading/market-data visual
// language already used elsewhere on the site (MarketBars, ticker strips).
const MOTIF_COLOR = new THREE.Color().setHSL(152 / 360, 0.76, 0.5);
const UP_COLOR = new THREE.Color().setHSL(152 / 360, 0.82, 0.6);
const DOWN_COLOR = new THREE.Color().setHSL(152 / 360, 0.38, 0.26);

interface RawCandle {
  open: number;
  close: number;
  high: number;
  low: number;
}

// A fixed, hand-authored illustrative up-trending sequence (each candle's
// open continues the prior close) — not real market data, not randomly
// generated, so the shape is deterministic and stable across reloads.
const RAW_CANDLES: RawCandle[] = [
  { open: -0.1, close: 0.25, high: 0.35, low: -0.18 },
  { open: 0.25, close: 0.1, high: 0.4, low: 0.02 },
  { open: 0.1, close: 0.55, high: 0.62, low: 0.05 },
  { open: 0.55, close: 0.35, high: 0.6, low: 0.28 },
  { open: 0.35, close: 0.7, high: 0.78, low: 0.3 },
  { open: 0.7, close: 0.5, high: 0.75, low: 0.42 },
  { open: 0.5, close: 0.85, high: 0.92, low: 0.45 },
  { open: 0.85, close: 0.6, high: 0.9, low: 0.55 },
  { open: 0.6, close: 0.95, high: 1.0, low: 0.55 },
  { open: 0.95, close: 0.72, high: 1.0, low: 0.68 },
  { open: 0.72, close: 1.05, high: 1.1, low: 0.68 },
];

const CANDLE_COUNT = RAW_CANDLES.length;
const CANDLE_SPACING = 0.38;
const CANDLE_WIDTH = 0.22;
const WICK_RADIUS = 0.02;
const AMPLITUDE = 1.7;
// Matches LogoMark's footprint so the two halves of the cycle balance.
const MOTIF_SCALE = 0.68;
// The rising trend weights the chart's mass low-left; lift it so it sits
// on the same visual centre as the logo mark.
const MOTIF_POSITION: [number, number, number] = [HERO_CENTER[0], HERO_CENTER[1] + 0.2, HERO_CENTER[2]];

const ALL_VALUES = RAW_CANDLES.flatMap((c) => [c.open, c.close, c.high, c.low]);
const VALUE_MIN = Math.min(...ALL_VALUES);
const VALUE_MAX = Math.max(...ALL_VALUES);
const VALUE_MID = (VALUE_MIN + VALUE_MAX) / 2;
const VALUE_RANGE = VALUE_MAX - VALUE_MIN;

function normalize(v: number): number {
  return ((v - VALUE_MID) / VALUE_RANGE) * AMPLITUDE * 2;
}

interface CandleLayout {
  x: number;
  bodyBottom: number;
  bodyTop: number;
  wickBottom: number;
  wickTop: number;
  closeY: number;
  up: boolean;
}

const LAYOUT: CandleLayout[] = RAW_CANDLES.map((c, i) => {
  const open = normalize(c.open);
  const close = normalize(c.close);
  return {
    x: (i - (CANDLE_COUNT - 1) / 2) * CANDLE_SPACING,
    bodyBottom: Math.min(open, close),
    bodyTop: Math.max(open, close),
    wickBottom: normalize(c.low),
    wickTop: normalize(c.high),
    closeY: close,
    up: c.close >= c.open,
  };
});

// Fits inside heroMorphCycle's ASSEMBLE_DURATION (2.4s): the last candle
// (index 10) starts at 10*0.16=1.6s and finishes at 1.6+0.75=2.35s.
export const CANDLE_STAGGER = 0.16;
const CANDLE_ASSEMBLE_DURATION = 0.75;

function CandleBodies() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;
    const morph = getMorphState(state.clock.elapsedTime, false);
    let maxVisibility = 0;
    LAYOUT.forEach((c, i) => {
      const visibility = shapeVisibility('market', i * CANDLE_STAGGER, CANDLE_ASSEMBLE_DURATION, morph);
      maxVisibility = Math.max(maxVisibility, visibility);
      const height = Math.max(c.bodyTop - c.bodyBottom, 0.04);
      dummy.position.set(c.x, (c.bodyTop + c.bodyBottom) / 2, 0);
      dummy.scale.set(1, Math.max(height, 0.0001), 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, c.up ? UP_COLOR : DOWN_COLOR);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    material.opacity = maxVisibility;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CANDLE_COUNT]} frustumCulled={false}>
      <boxGeometry args={[CANDLE_WIDTH, 1, CANDLE_WIDTH]} />
      <meshStandardMaterial
        ref={materialRef}
        color={MOTIF_COLOR}
        emissive={MOTIF_COLOR}
        emissiveIntensity={0.7}
        roughness={0.22}
        metalness={0.75}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function CandleWicks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;
    const morph = getMorphState(state.clock.elapsedTime, false);
    let maxVisibility = 0;
    LAYOUT.forEach((c, i) => {
      const visibility = shapeVisibility('market', i * CANDLE_STAGGER, CANDLE_ASSEMBLE_DURATION, morph);
      maxVisibility = Math.max(maxVisibility, visibility);
      const height = Math.max(c.wickTop - c.wickBottom, 0.001);
      dummy.position.set(c.x, (c.wickTop + c.wickBottom) / 2, 0);
      dummy.scale.set(1, height, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    material.opacity = maxVisibility * 0.85;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CANDLE_COUNT]} raycast={() => null} frustumCulled={false}>
      <cylinderGeometry args={[WICK_RADIUS, WICK_RADIUS, 1, 6]} />
      <meshStandardMaterial
        ref={materialRef}
        color={MOTIF_COLOR}
        emissive={MOTIF_COLOR}
        emissiveIntensity={0.6}
        roughness={0.3}
        metalness={0.6}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

const ASSEMBLE_LINE_DELAY = (CANDLE_COUNT - 1) * CANDLE_STAGGER;

// A thin trend line tracing each candle's close price — the detail that
// pushes this from "a row of boxes" to unmistakably "a price chart,"
// echoing the ticker-line register used elsewhere on the site.
function TrendLine() {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(CANDLE_COUNT * 3);
    LAYOUT.forEach((c, i) => {
      arr[i * 3] = c.x;
      arr[i * 3 + 1] = c.closeY + 0.16;
      arr[i * 3 + 2] = 0.02;
    });
    return arr;
  }, []);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    const morph = getMorphState(state.clock.elapsedTime, false);
    material.opacity = shapeVisibility('market', ASSEMBLE_LINE_DELAY, CANDLE_ASSEMBLE_DURATION, morph) * 0.7;
  });

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial ref={materialRef} color={MOTIF_COLOR} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </line>
  );
}

export default function MarketMotif({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return null;

  return (
    <group position={MOTIF_POSITION} scale={MOTIF_SCALE}>
      <CandleBodies />
      <CandleWicks />
      <TrendLine />
    </group>
  );
}

export { CANDLE_COUNT };

/**
 * A world-space point on the chart itself — candle body surfaces, wicks
 * and the trend line — plus the index of the candle it belongs to, so the
 * dust field can time each particle's arrival to its own candle's build.
 */
export function sampleMarketMotifPoint(): { point: THREE.Vector3; candle: number } {
  const candle = Math.floor(Math.random() * CANDLE_COUNT);
  const c = LAYOUT[candle];
  const half = CANDLE_WIDTH / 2;
  const roll = Math.random();
  const p = new THREE.Vector3();
  if (roll < 0.72) {
    // Body: a random face of the box, a third of the time pinned to an edge.
    const height = Math.max(c.bodyTop - c.bodyBottom, 0.04);
    const axis = Math.floor(Math.random() * 3);
    const side = Math.random() < 0.5 ? -1 : 1;
    const extent = [half, height / 2, half];
    const coords = [0, 1, 2].map((a) => (Math.random() * 2 - 1) * extent[a]);
    coords[axis] = side * extent[axis];
    if (Math.random() < 0.33) {
      const other = (axis + 1 + Math.floor(Math.random() * 2)) % 3;
      coords[other] = Math.sign(coords[other] || 1) * extent[other];
    }
    p.set(c.x + coords[0], (c.bodyTop + c.bodyBottom) / 2 + coords[1], coords[2]);
  } else if (roll < 0.88) {
    p.set(c.x, THREE.MathUtils.lerp(c.wickBottom, c.wickTop, Math.random()), 0);
  } else {
    // Trend line, between this candle's close and the next one's.
    const next = LAYOUT[Math.min(candle + 1, CANDLE_COUNT - 1)];
    const f = Math.random();
    p.set(THREE.MathUtils.lerp(c.x, next.x, f), THREE.MathUtils.lerp(c.closeY, next.closeY, f) + 0.16, 0.02);
  }
  p.multiplyScalar(MOTIF_SCALE).add(new THREE.Vector3(...MOTIF_POSITION));
  return { point: p, candle };
}
