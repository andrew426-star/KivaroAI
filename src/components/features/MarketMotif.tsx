import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMorphState, shapeVisibility } from '@/lib/three/heroMorphCycle';
import { INSTRUMENT_CENTER } from './Instrument';

// The hero's second particle-morph subject — a candlestick chart
// silhouette, the confirmed "market/data motif" direction, sharing
// Instrument.tsx's exact material/color/lighting conventions (same
// RING_COLOR-family green, same metalness/roughness, lit by the shared
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

// Fits inside heroMorphCycle's ASSEMBLE_DURATION (2.8s): the last candle
// (index 10) starts at 10*0.2=2.0s and finishes at 2.0+0.75=2.75s.
const CANDLE_STAGGER = 0.2;
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
    <group position={INSTRUMENT_CENTER}>
      <CandleBodies />
      <CandleWicks />
      <TrendLine />
    </group>
  );
}

// Re-exported for HeroScene.tsx's fine-dust AssemblyField layer, which
// condenses toward the market motif's own volume during its turn in the
// cycle — mirrors sampleInstrumentVolumePoint's role for the other shape.
export function sampleMarketMotifVolumePoint(): THREE.Vector3 {
  return new THREE.Vector3(
    INSTRUMENT_CENTER[0] + (Math.random() - 0.5) * (CANDLE_SPACING * CANDLE_COUNT + 0.6),
    INSTRUMENT_CENTER[1] + (Math.random() - 0.5) * (AMPLITUDE * 2 + 0.8),
    INSTRUMENT_CENTER[2] + (Math.random() - 0.5) * 0.9,
  );
}
