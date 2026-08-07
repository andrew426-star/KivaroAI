import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getSoftParticleTexture } from '@/lib/three/softParticleTexture';
import Instrument, { HeroLighting, INSTRUMENT_CENTER, CAMERA_LOOK_TARGET, sampleInstrumentVolumePoint } from './Instrument';
import MarketMotif, { sampleMarketMotifVolumePoint } from './MarketMotif';
import { getMorphState, shapeVisibility, ASSEMBLE_DURATION } from '@/lib/three/heroMorphCycle';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Landing/loop boot sequence, driven off the shared heroMorphCycle module
// (elapsed-time driven off state.clock, not per-component accumulators, so
// every layer stays in sync off one shared clock) — a repeating two-shape
// cycle, not a one-shot intro:
//   1. AssemblyField — a scattered fine-particle cloud streams inward from
//      every direction and condenses toward whichever shape is "on" —
//      "raw data dissolving toward a shape," then dissolving back to
//      scatter before condensing toward the next one.
//   2. Instrument / MarketMotif — the ring system or the candlestick
//      motif booms in underneath/alongside that dust, resolving into the
//      hero's actual subject for that turn of the cycle, then recedes as
//      the cycle moves to the other shape.
const ASSEMBLY_PARTICLE_DURATION = 1.7;
const ASSEMBLY_STAGGER = 1.0;
const REVEAL_START = 1.2;
const REVEAL_DURATION = 1.4;
// How long the fine dust takes to fade fully out/in around a held shape —
// out over the tail of assemble, in over the head of disperse — so "just
// the graphic, no dust" during hold reads as a crossfade, not a hard cut.
const DUST_CROSSFADE = 0.5;

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
    const instrumentTarget = new Float32Array(count * 3);
    const marketTarget = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Targets: sampled from each shape's own volume, so the fine dust
      // condenses toward whichever shape the shared morph cycle currently
      // has "on" instead of an unrelated cloud. Both shapes occupy the
      // same central locus (INSTRUMENT_CENTER), so one shared scatter
      // cloud (below) works for condensing toward either.
      const ti = sampleInstrumentVolumePoint();
      instrumentTarget[i * 3] = ti.x;
      instrumentTarget[i * 3 + 1] = ti.y;
      instrumentTarget[i * 3 + 2] = ti.z;

      const tm = sampleMarketMotifVolumePoint();
      marketTarget[i * 3] = tm.x;
      marketTarget[i * 3 + 1] = tm.y;
      marketTarget[i * 3 + 2] = tm.z;

      // Scatter: a point on a sphere around the instrument target,
      // arriving from every direction in 3D (not a flattened
      // plane-scatter) — matches the turbulent, all-directions dispersal
      // Meuze's own hero uses.
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI - Math.PI / 2;
      const radius = 2 + Math.random() * 4;
      scatter[i * 3] = ti.x + Math.cos(angle) * Math.cos(elevation) * radius;
      scatter[i * 3 + 1] = ti.y + Math.sin(elevation) * radius * 0.8;
      scatter[i * 3 + 2] = ti.z + Math.sin(angle) * Math.cos(elevation) * radius;

      delays[i] = Math.random() * ASSEMBLY_STAGGER;
    }
    return { scatter, instrumentTarget, marketTarget, delays };
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
  const { scatter, instrumentTarget, marketTarget, delays } = useAssemblyPoints(count);
  const current = useMemo(() => new Float32Array(scatter), [scatter]);

  useFrame((state) => {
    const geo = ref.current?.geometry;
    if (!geo || !materialRef.current) return;
    const t = state.clock.elapsedTime;
    const morph = getMorphState(t, false);
    const activeTarget = morph.activeShape === 'instrument' ? instrumentTarget : marketTarget;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const eased = shapeVisibility(morph.activeShape, delays[i], ASSEMBLY_PARTICLE_DURATION, morph);
      arr[i * 3] = THREE.MathUtils.lerp(scatter[i * 3], activeTarget[i * 3], eased);
      arr[i * 3 + 1] = THREE.MathUtils.lerp(scatter[i * 3 + 1], activeTarget[i * 3 + 1], eased);
      arr[i * 3 + 2] = THREE.MathUtils.lerp(scatter[i * 3 + 2], activeTarget[i * 3 + 2], eased);
    }
    geo.attributes.position.needsUpdate = true;

    // The requested beat is a clean four-part loop: scattered dust -> dust
    // streams together into the shape -> the shape stands alone, no dust
    // -> the shape dissolves back into dust -> repeat. That means opacity
    // has to reach true 0 while held (not just dim), with a short
    // crossfade at each boundary so the dust doesn't hard-cut in/out —
    // it fades out over the tail of assemble, exactly as the solid shape
    // (Ring/Candle opacity, driven by the same formProgress) finishes
    // fading in, and fades back in over the head of disperse as the shape
    // starts dissolving.
    const fadeIn = THREE.MathUtils.clamp(t / 0.4, 0, 1);
    let dustVisibility: number;
    if (morph.phase === 'assemble') {
      dustVisibility = THREE.MathUtils.clamp((ASSEMBLE_DURATION - morph.phaseElapsed) / DUST_CROSSFADE, 0, 1);
    } else if (morph.phase === 'hold') {
      dustVisibility = 0;
    } else if (morph.phase === 'disperse') {
      dustVisibility = THREE.MathUtils.clamp(morph.phaseElapsed / DUST_CROSSFADE, 0, 1);
    } else {
      dustVisibility = 1;
    }
    materialRef.current.opacity = 0.9 * fadeIn * dustVisibility;
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
    camera.lookAt(CAMERA_LOOK_TARGET[0], CAMERA_LOOK_TARGET[1], CAMERA_LOOK_TARGET[2]);
  });

  return null;
}

// Trimmed from 140/220/70 — real production measurement (rAF ticks over
// a fixed window, on the live site) showed the hero rendering at ~4fps
// (2 frames in 500ms, vs. ~30 expected at 60fps) with the old counts,
// confirmed as a real, severe perf problem rather than a subjective
// impression. This scene has no viewport-based frameloop gate (removed
// earlier this session after it froze the morph cycle on scroll-back —
// see the frameloop comment below), so it renders every frame for as
// long as the tab is open regardless of scroll position, making its
// per-frame cost the single biggest lever available for "the site feels
// slow." prefers-reduced-motion remains the only *content* gate (an
// accessibility contract, never a quality dial); these counts are a
// quality/perf dial, not a content change — the dust field still reads
// as a real field at these counts, just costs meaningfully less per frame.
const PARTICLE_COUNT = 85;
const ASSEMBLY_COUNT = 130;
const FAR_PARTICLE_COUNT = 45;

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((state) => {
    if (reducedMotion) state.invalidate();
  });

  return (
    <>
      <fog attach="fog" args={['#080c0a', 6, 19]} />
      <HeroLighting />
      <Instrument reducedMotion={reducedMotion} />
      <MarketMotif reducedMotion={reducedMotion} />
      {!reducedMotion && <AssemblyField count={ASSEMBLY_COUNT} />}
      {!reducedMotion && <DataParticles count={PARTICLE_COUNT} />}
      {!reducedMotion && (
        <DataParticles count={FAR_PARTICLE_COUNT} size={0.02} baseOpacity={0.28} zSpread={20} speedRange={[0.03, 0.09]} />
      )}
      {!reducedMotion && <CameraRig />}
      <EffectComposer>
        {/* focusDistance is normalized [0,1] across the camera's near..far
            range, not world units. Round 2: Instrument.tsx now staggers
            its 3 rings along their own depth axis (front ring ~4.16 world
            units out, back ring ~5.37) specifically so this pass has real
            front-to-back separation to blur across — focus sits on the
            front ring (~0.17 normalized) so it reads crisp while the back
            ring genuinely softens, a tighter focalLength + higher
            bokehScale than before makes that falloff visible rather than
            uniform. */}
        {/* focusDistance is normalized [0,1] across the camera's near..far
            range. The first attempt at a tight focalLength/high bokehScale
            (0.11 / 2.6) blurred the entire instrument into near-invisibility
            — a tilted torus this large already spans real depth across its
            own geometry, so a narrow focal window wiped out even the "in
            focus" ring along with the back one. A wider focalLength keeps
            each ring's own surface legible while still visibly softening
            the back ring relative to the front. */}
        {/* A tight focalLength/high bokehScale (0.11 / 2.6) blurred the
            whole instrument into near-invisibility — a tilted torus this
            large already spans real depth across its own geometry, so a
            narrow focal window wiped out the "in focus" ring along with
            the back one. This wider window keeps every ring's own surface
            legible while still visibly softening the back ring relative
            to the front (confirmed via real screenshots, not computed
            blind — the exact focus math is only an approximation once
            multiple large tilted rings are staggered in depth). */}
        {/* Sharpened per direct feedback that the scene read as too soft:
            a wider focalLength keeps more of the depth range in genuine
            focus, and a lower bokehScale caps how much the out-of-focus
            portion blurs — both confirmed via real screenshots against
            the same failure mode noted above (too tight in the other
            direction wipes the whole instrument out). Bloom's radius/
            intensity trimmed to match — less glow-smear bleeding over
            the rings'/candles' own edges. */}
        <DepthOfField focusDistance={0.22} focalLength={0.32} bokehScale={1.15} height={480} />
        <Bloom luminanceThreshold={0.14} luminanceSmoothing={0.85} intensity={0.85} radius={0.42} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  // frameloop used to also drop to 'demand' whenever useElementInViewport
  // reported the hero as scrolled out of view, to avoid burning GPU work
  // (and, per real screenshots from an earlier pass, starving other
  // rAF-driven work like framer-motion's animate() calls) while it's off
  // screen. Removed after this session's own repeating two-shape morph
  // cycle exposed a real, confirmed bug in that gate: once frameloop
  // toggled to 'demand' — which happened even during an ordinary top-of-
  // page load, not just after scrolling away — the scene's continuous,
  // non-React-state-driven animation (reading state.clock.elapsedTime
  // every frame) never resumed updating even after intersection flipped
  // back to true, since nothing in that polling-based system calls
  // invalidate() to request a new frame in demand mode. Always-on is the
  // safe choice for the hero specifically (first thing on the page, and
  // AgentConstellation further down the page keeps its own independent
  // visibility gate untouched).
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        // Capped from [1,2] for a real, measured perf fix (Bloom/
        // DepthOfField are full-screen, resolution-dependent passes; 2x
        // DPI quadruples their pixel count vs. 1x). Nudged back up from
        // 1.5 to 1.75 after direct "sharpen it" feedback — still well
        // under the original uncapped cost, but with the particle-count
        // trim already in place there's headroom for a bit more
        // resolution before it reintroduces the frame-rate problem.
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.1, 4.4], fov: 55, near: 0.1, far: 24 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
