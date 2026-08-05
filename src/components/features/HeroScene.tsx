import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getSoftParticleTexture } from '@/lib/three/softParticleTexture';
import Instrument, { INSTRUMENT_CENTER, sampleInstrumentVolumePoint } from './Instrument';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useElementInViewport } from '@/hooks/useElementInViewport';

// Landing-animation boot sequence, in two overlapping stages (elapsed-time
// driven off state.clock, not per-component accumulators, so both stay in
// sync off one shared clock):
//   1. AssemblyField — a scattered fine-particle cloud streams inward from
//      every direction and condenses toward the instrument's own volume —
//      "raw data dissolving toward a shape."
//   2. Instrument — the ring system booms in ring-by-ring underneath/
//      alongside that dust, resolving into the actual hero subject: a
//      rotating navigational instrument, not an abstract network or a
//      flat grid.
const ASSEMBLY_PARTICLE_DURATION = 1.7;
const ASSEMBLY_STAGGER = 1.0;
const REVEAL_START = 1.2;
const REVEAL_DURATION = 1.4;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const PARTICLE_BASE_OPACITY = 0.68;

interface DataParticlesProps {
  count: number;
  size?: number;
  baseOpacity?: number;
  zSpread?: number;
  speedRange?: [number, number];
}

function DataParticles({ count, size = 0.035, baseOpacity = PARTICLE_BASE_OPACITY, zSpread = 12, speedRange = [0.08, 0.26] }: DataParticlesProps) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 5 - 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * zSpread;
      spd[i] = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
    }
    return [pos, spd];
  }, [count, zSpread, speedRange]);

  useFrame((state, delta) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      if (arr[i * 3 + 1] > 3.5) arr[i * 3 + 1] = -1.5;
    }
    geo.attributes.position.needsUpdate = true;

    if (materialRef.current) {
      const progress = THREE.MathUtils.clamp(
        (state.clock.elapsedTime - REVEAL_START) / REVEAL_DURATION,
        0,
        1,
      );
      materialRef.current.opacity = baseOpacity * easeOutCubic(progress);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={size}
        map={getSoftParticleTexture()}
        color="#3adfad"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function useAssemblyPoints(count: number) {
  return useMemo(() => {
    const scatter = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Target: sampled from the instrument's own volume, so the fine dust
      // condenses toward the same region the ring system occupies instead
      // of an unrelated cloud.
      const t = sampleInstrumentVolumePoint();
      target[i * 3] = t.x;
      target[i * 3 + 1] = t.y;
      target[i * 3 + 2] = t.z;

      // Scatter: a point on a sphere around the target, arriving from
      // every direction in 3D (not a flattened plane-scatter) — matches
      // the turbulent, all-directions dispersal Meuze's own hero uses.
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI - Math.PI / 2;
      const radius = 2 + Math.random() * 4;
      scatter[i * 3] = t.x + Math.cos(angle) * Math.cos(elevation) * radius;
      scatter[i * 3 + 1] = t.y + Math.sin(elevation) * radius * 0.8;
      scatter[i * 3 + 2] = t.z + Math.sin(angle) * Math.cos(elevation) * radius;

      delays[i] = Math.random() * ASSEMBLY_STAGGER;
    }
    return { scatter, target, delays };
  }, [count]);
}

// Fine dissolving-data particle cloud — the corona of dust that condenses
// alongside the instrument's own boot-in. Only ever mounted when
// !reducedMotion (gated in Scene, matching DataParticles/CameraRig's own
// gating) — it's ambient texture, not the hero's actual content; the
// content itself (Instrument) renders its final static state under
// reduced motion instead of being skipped.
function AssemblyField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const { scatter, target, delays } = useAssemblyPoints(count);
  const current = useMemo(() => new Float32Array(scatter), [scatter]);

  useFrame((state) => {
    const geo = ref.current?.geometry;
    if (!geo || !materialRef.current) return;
    const t = state.clock.elapsedTime;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const localT = THREE.MathUtils.clamp((t - delays[i]) / ASSEMBLY_PARTICLE_DURATION, 0, 1);
      const eased = easeOutCubic(localT);
      arr[i * 3] = THREE.MathUtils.lerp(scatter[i * 3], target[i * 3], eased);
      arr[i * 3 + 1] = THREE.MathUtils.lerp(scatter[i * 3 + 1], target[i * 3 + 1], eased);
      arr[i * 3 + 2] = THREE.MathUtils.lerp(scatter[i * 3 + 2], target[i * 3 + 2], eased);
    }
    geo.attributes.position.needsUpdate = true;

    const fadeIn = THREE.MathUtils.clamp(t / 0.4, 0, 1);
    const fadeOut = THREE.MathUtils.clamp((t - REVEAL_START) / 1.1, 0, 1);
    materialRef.current.opacity = 0.9 * fadeIn * (1 - fadeOut * 0.7);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.045}
        map={getSoftParticleTexture()}
        color="#3adfad"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// Idle rotation + pointer-parallax + a gentle scroll-linked drift, so the
// camera reads as alive even before the user moves the mouse — the brief's
// "camera has a gentle idle rotation plus parallax response to
// mouse/scroll." Scroll is read directly off window.scrollY inside the
// frame loop (no extra listener/state — this Canvas only exists while
// Section01Brain is likely near the top of the page anyway) and clamped to
// a small range so it never fights the page's own scroll feel.
function CameraRig() {
  const { camera } = useThree();
  const pointerTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      pointerTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useFrame((state) => {
    const scrollDrift = THREE.MathUtils.clamp(window.scrollY / 900, 0, 1);
    const idle = Math.sin(state.clock.elapsedTime * 0.06) * 0.15;
    camera.position.x += (pointerTarget.current.x * 0.5 + idle - scrollDrift * 0.35 - camera.position.x) * 0.02;
    camera.position.y += (1.1 - pointerTarget.current.y * 0.25 - scrollDrift * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(INSTRUMENT_CENTER[0], INSTRUMENT_CENTER[1], INSTRUMENT_CENTER[2]);
  });

  return null;
}

// Fixed desktop-tier constants on every viewport — per "maximize visuals
// everywhere," this scene no longer scales geometry/particle counts down
// on mobile. prefers-reduced-motion remains the only gate (an
// accessibility contract, never a quality dial) for the ambient/decorative
// layers; Instrument itself always renders (static final state when
// reduced motion is on) since it's the hero's actual content.
const PARTICLE_COUNT = 140;
const ASSEMBLY_COUNT = 220;
const FAR_PARTICLE_COUNT = 70;

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((state) => {
    if (reducedMotion) state.invalidate();
  });

  return (
    <>
      <fog attach="fog" args={['#080c0a', 6, 19]} />
      <Instrument reducedMotion={reducedMotion} />
      {!reducedMotion && <AssemblyField count={ASSEMBLY_COUNT} />}
      {!reducedMotion && <DataParticles count={PARTICLE_COUNT} />}
      {!reducedMotion && (
        <DataParticles count={FAR_PARTICLE_COUNT} size={0.02} baseOpacity={0.28} zSpread={20} speedRange={[0.03, 0.09]} />
      )}
      {!reducedMotion && <CameraRig />}
      <EffectComposer>
        {/* focusDistance is normalized [0,1] across the camera's near..far
            range, not world units — the instrument sits ~4.8 world units
            from the camera against a near/far of 0.1/24, so 0.012 (almost
            AT the camera) blurred the entire scene into unreadable blobs.
            0.2 puts the focus plane right on the instrument itself. */}
        <DepthOfField focusDistance={0.2} focalLength={0.15} bokehScale={2} height={480} />
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={0.85} radius={0.55} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  // On this single-page site every section stays mounted forever — with
  // no gate, this Canvas (plus AgentConstellation's, further down the
  // page) would both keep rendering every frame with full Bloom+DOF
  // postprocessing indefinitely, even scrolled far out of view. That's
  // wasted GPU work on its own, and empirically (confirmed via real
  // screenshots showing StatCounter/RadialGauge permanently stuck at
  // their starting value even after 8 real seconds in view) heavy enough
  // to starve other rAF-driven work on the page, like framer-motion's
  // animate() calls elsewhere. frameloop drops to 'demand' once this
  // scene scrolls out of the viewport (plus a 200px margin so it's
  // already rendering by the time it becomes visible).
  const [viewportRef, inViewport] = useElementInViewport<HTMLDivElement>();

  return (
    <div ref={viewportRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.1, 4.4], fov: 55, near: 0.1, far: 24 }}
        frameloop={reducedMotion || !inViewport ? 'demand' : 'always'}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
