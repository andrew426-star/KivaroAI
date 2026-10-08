import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import LogoMark, {
  HeroLighting,
  CAMERA_LOOK_TARGET,
  CAMERA_BASE_POSITION,
  HERO_CENTER,
  CUBE_STAGGER,
  LOGO_LIME,
  logoMarkMatrix,
  sampleLogoMarkPoint,
} from './LogoMark';
import MarketMotif, { sampleMarketMotifPoint } from './MarketMotif';
import { getMorphState, phaseIndex, ASSEMBLE_DURATION, DISPERSE_DURATION } from '@/lib/three/heroMorphCycle';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Landing/loop sequence, driven off the shared heroMorphCycle module
// (elapsed-time driven off state.clock, so every layer stays in sync off
// one shared clock) — a repeating two-shape cycle, not a one-shot intro:
//   1. AssemblyField — a scattered cloud of fine dust spirals inward and
//      lands on the surface of whichever shape is "on" (the Kivaro cube
//      mark, then the candlestick chart), then lifts off along the same
//      arc in reverse before condensing onto the next one.
//   2. LogoMark / MarketMotif — the solid shape builds in under the
//      settling dust, holds alone, then dissolves back out.
//
// All particle motion runs in the vertex shader: the CPU only updates a
// handful of uniforms per frame, which is what lets the field carry
// thousands of particles where the old per-particle JS loop had to be cut
// to ~130 to keep the hero above 30fps.
const REVEAL_START = 1.2;
const REVEAL_DURATION = 1.4;
// How long the dust takes to fade fully out/in around a held shape — out
// over the tail of assemble, in over the head of disperse — so "just the
// graphic, no dust" during hold reads as a crossfade, not a hard cut.
const DUST_CROSSFADE = 0.5;
// Each particle's own flight time from scatter to surface. Delays below
// are chosen so delay + FLIGHT always lands inside ASSEMBLE_DURATION.
const FLIGHT = 1.0;

const ASSEMBLY_COUNT = 2400;
const NEAR_DUST_COUNT = 420;
const FAR_DUST_COUNT = 600;

const DUST_COLOR = new THREE.Color('#3adfad');

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Shared by both particle layers: a round soft halo with a brighter core,
// drawn analytically (no sprite texture to sample or blur), fogged by
// depth to match the scene's <fog>.
const PARTICLE_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vMix;
  varying float vFog;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float halo = pow(1.0 - d * 2.0, 2.0);
    float core = smoothstep(0.16, 0.0, d);
    vec3 color = mix(uColorA, uColorB, vMix) + core * 0.35;
    gl_FragColor = vec4(color, (halo * 0.75 + core * 0.5) * vAlpha * vFog * uOpacity);
  }
`;

// Mirrors shapeVisibility() in heroMorphCycle.ts: an eased, per-particle
// staggered flight on assemble, and on disperse the exact same curve run
// backwards — every particle retraces its own arc out.
const ASSEMBLY_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uLocal;
  uniform float uActive;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform mat4 uLogoMatrix;
  attribute vec3 aLogo;
  attribute vec3 aMarket;
  attribute vec2 aDelay;
  attribute float aSeed;
  attribute float aSize;
  varying float vAlpha;
  varying float vMix;
  varying float vFog;

  const float DISPERSE = ${DISPERSE_DURATION.toFixed(3)};
  const float FLIGHT = ${FLIGHT.toFixed(3)};
  const float PI = 3.14159265;

  float easeOutCubic(float t) { float u = 1.0 - t; return 1.0 - u * u * u; }

  float landed(float delay) {
    if (uPhase < 0.5) return easeOutCubic(clamp((uLocal - delay) / FLIGHT, 0.0, 1.0));
    if (uPhase < 1.5) return 1.0;
    if (uPhase < 2.5) return easeOutCubic(clamp((DISPERSE - uLocal - delay) / FLIGHT, 0.0, 1.0));
    return 0.0;
  }

  void main() {
    float isMarket = step(0.5, uActive);
    vec3 target = mix((uLogoMatrix * vec4(aLogo, 1.0)).xyz, aMarket, isMarket);
    float e = landed(mix(aDelay.x, aDelay.y, isMarket));
    float s = aSeed * 6.2831853;

    // The scattered cloud keeps breathing while it waits, so the pause
    // between shapes never reads as a freeze.
    vec3 drift = vec3(sin(uTime * 0.31 + s), cos(uTime * 0.27 + s * 1.7), sin(uTime * 0.23 + s * 2.3)) * 0.22;
    vec3 from = position + drift;
    vec3 travel = target - from;

    // Every particle bows the same way round the vertical axis, peaking
    // mid-flight, so the whole field spirals in as one current instead of
    // each speck taking a straight line.
    vec3 side = normalize(cross(travel, vec3(0.0, 1.0, 0.0)) + 1e-4);
    float arc = sin(PI * e);
    vec3 p = mix(from, target, e)
      + side * arc * (0.3 + 0.2 * fract(aSeed * 7.3)) * length(travel) * 0.35
      + vec3(0.0, arc * 0.15 * sin(s), 0.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (1.0 + 0.5 * arc) * uPixelRatio * uScale / -mv.z;

    float twinkle = 0.78 + 0.22 * sin(uTime * (1.5 + aSeed * 2.0) + s);
    vAlpha = twinkle * (0.55 + 0.45 * e);
    // Dust warms from the site's signal green toward the logo's lime as it lands.
    vMix = clamp(fract(aSeed * 13.7) * 0.35 + e * 0.65, 0.0, 1.0);
    vFog = smoothstep(19.0, 6.0, -mv.z);
  }
`;

const AMBIENT_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform float uMinY;
  uniform float uRangeY;
  attribute float aSpeed;
  attribute float aSeed;
  attribute float aSize;
  varying float vAlpha;
  varying float vMix;
  varying float vFog;

  void main() {
    float s = aSeed * 6.2831853;
    float y = uMinY + mod(position.y - uMinY + aSpeed * uTime, uRangeY);
    vec3 p = vec3(position.x + sin(uTime * 0.2 + s) * 0.15, y, position.z + cos(uTime * 0.17 + s) * 0.1);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * uScale / -mv.z;
    // Fade in at the bottom of the band and out at the top, so wrapping
    // round never pops a particle in or out of existence.
    float edge = smoothstep(0.0, 0.8, y - uMinY) * smoothstep(0.0, 0.8, uMinY + uRangeY - y);
    vAlpha = edge * (0.7 + 0.3 * sin(uTime * (1.1 + aSeed) + s));
    vMix = fract(aSeed * 5.1) * 0.4;
    vFog = smoothstep(19.0, 6.0, -mv.z);
  }
`;

function useParticleUniforms<T extends Record<string, THREE.IUniform>>(extra: T) {
  return useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
      uScale: { value: 1 },
      uColorA: { value: DUST_COLOR.clone() },
      uColorB: { value: LOGO_LIME.clone() },
      ...extra,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}

function useSizeUniforms(uniforms: { uPixelRatio: THREE.IUniform; uScale: THREE.IUniform }) {
  const { size, viewport } = useThree();
  useEffect(() => {
    uniforms.uPixelRatio.value = viewport.dpr;
    uniforms.uScale.value = size.height / 2;
  }, [size.height, viewport.dpr, uniforms]);
}

interface AmbientDustProps {
  count: number;
  size: number;
  baseOpacity: number;
  zSpread: number;
  speedRange: [number, number];
}

const AMBIENT_MIN_Y = -1.5;
const AMBIENT_RANGE_Y = 5;

// Fine dust rising slowly through the whole hero — ambient depth, not content.
function AmbientDust({ count, size, baseOpacity, zSpread, speedRange }: AmbientDustProps) {
  const uniforms = useParticleUniforms({ uMinY: { value: AMBIENT_MIN_Y }, uRangeY: { value: AMBIENT_RANGE_Y } });
  useSizeUniforms(uniforms);

  const attributes = useMemo(() => {
    const position = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const seed = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      position[i * 3] = (Math.random() - 0.5) * 14;
      position[i * 3 + 1] = AMBIENT_MIN_Y + Math.random() * AMBIENT_RANGE_Y;
      position[i * 3 + 2] = (Math.random() - 0.5) * zSpread;
      speed[i] = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      seed[i] = Math.random();
      sizes[i] = size * (0.5 + Math.random());
    }
    return { position, speed, seed, sizes };
  }, [count, size, zSpread, speedRange]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uOpacity.value = baseOpacity * easeOutCubic(THREE.MathUtils.clamp((t - REVEAL_START) / REVEAL_DURATION, 0, 1));
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.position, 3]} />
        <bufferAttribute attach="attributes-aSpeed" args={[attributes.speed, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seed, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[attributes.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={AMBIENT_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function useAssemblyAttributes(count: number) {
  return useMemo(() => {
    const scatter = new Float32Array(count * 3);
    const logo = new Float32Array(count * 3);
    const market = new Float32Array(count * 3);
    const delay = new Float32Array(count * 2);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Targets sit on each shape's actual surface, and each particle's
      // delay follows the part it lands on (its cube, its candle), so the
      // dust builds the shape in the same order the solid version does.
      const cube = i % 3;
      const tl = sampleLogoMarkPoint(cube);
      logo.set([tl.x, tl.y, tl.z], i * 3);
      delay[i * 2] = cube * CUBE_STAGGER + Math.random() * 0.5;

      const tm = sampleMarketMotifPoint();
      market.set([tm.point.x, tm.point.y, tm.point.z], i * 3);
      delay[i * 2 + 1] = tm.candle * 0.11 + Math.random() * 0.2;

      // Scatter: a shell around the shared centre, arriving from every
      // direction in 3D rather than from a flattened plane.
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.asin(Math.random() * 2 - 1);
      const radius = 2.2 + Math.pow(Math.random(), 0.7) * 3.6;
      scatter[i * 3] = HERO_CENTER[0] + Math.cos(angle) * Math.cos(elevation) * radius;
      scatter[i * 3 + 1] = HERO_CENTER[1] + Math.sin(elevation) * radius * 0.75;
      scatter[i * 3 + 2] = HERO_CENTER[2] + Math.sin(angle) * Math.cos(elevation) * radius;

      seed[i] = Math.random();
      size[i] = 0.022 + Math.pow(Math.random(), 3) * 0.05;
    }
    return { scatter, logo, market, delay, seed, size };
  }, [count]);
}

// The dust that condenses into each shape. Only ever mounted when
// !reducedMotion (gated in Scene) — it's motion, not content; the content
// itself (LogoMark) renders its final static state under reduced motion.
function AssemblyField({ count }: { count: number }) {
  const attributes = useAssemblyAttributes(count);
  const uniforms = useParticleUniforms({
    uPhase: { value: 3 },
    uLocal: { value: 0 },
    uActive: { value: 0 },
    uLogoMatrix: { value: new THREE.Matrix4() },
  });
  useSizeUniforms(uniforms);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const morph = getMorphState(t, false);
    uniforms.uTime.value = t;
    uniforms.uPhase.value = phaseIndex(morph);
    uniforms.uLocal.value = morph.phaseElapsed;
    uniforms.uActive.value = morph.activeShape === 'logo' ? 0 : 1;
    logoMarkMatrix(t, morph.formProgress, false, uniforms.uLogoMatrix.value);

    // Scattered dust -> dust streams into the shape -> the shape stands
    // alone, no dust -> the shape dissolves back into dust -> repeat. The
    // fade at each end of the hold is the same length, so in and out
    // mirror each other.
    let dustVisibility = 1;
    if (morph.phase === 'assemble') {
      dustVisibility = THREE.MathUtils.clamp((ASSEMBLE_DURATION - morph.phaseElapsed) / DUST_CROSSFADE, 0, 1);
    } else if (morph.phase === 'hold') {
      dustVisibility = 0;
    } else if (morph.phase === 'disperse') {
      dustVisibility = THREE.MathUtils.clamp(morph.phaseElapsed / DUST_CROSSFADE, 0, 1);
    }
    uniforms.uOpacity.value = 0.95 * THREE.MathUtils.clamp(t / 0.4, 0, 1) * dustVisibility;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.scatter, 3]} />
        <bufferAttribute attach="attributes-aLogo" args={[attributes.logo, 3]} />
        <bufferAttribute attach="attributes-aMarket" args={[attributes.market, 3]} />
        <bufferAttribute attach="attributes-aDelay" args={[attributes.delay, 2]} />
        <bufferAttribute attach="attributes-aSeed" args={[attributes.seed, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[attributes.size, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={ASSEMBLY_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Idle drift + pointer-parallax + a gentle scroll-linked drift, so the
// camera reads as alive even before the user moves the mouse. Scroll is
// read directly off window.scrollY inside the frame loop and clamped to a
// small range so it never fights the page's own scroll feel. Damped by
// real elapsed time rather than a fixed per-frame fraction, so the glide
// feels the same on 60Hz and 120Hz screens.
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

  useFrame((state, delta) => {
    const scrollDrift = THREE.MathUtils.clamp(window.scrollY / 900, 0, 1);
    const idle = Math.sin(state.clock.elapsedTime * 0.06) * 0.15;
    const dt = Math.min(delta, 0.1);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, CAMERA_BASE_POSITION[0] + pointerTarget.current.x * 0.5 + idle - scrollDrift * 0.35, 1.3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, CAMERA_BASE_POSITION[1] - pointerTarget.current.y * 0.25 - scrollDrift * 0.3, 1.3, dt);
    camera.lookAt(CAMERA_LOOK_TARGET[0], CAMERA_LOOK_TARGET[1], CAMERA_LOOK_TARGET[2]);
  });

  return null;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((state) => {
    if (reducedMotion) state.invalidate();
  });

  return (
    <>
      <fog attach="fog" args={['#080c0a', 6, 19]} />
      <HeroLighting />
      <LogoMark reducedMotion={reducedMotion} />
      <MarketMotif reducedMotion={reducedMotion} />
      {!reducedMotion && <AssemblyField count={ASSEMBLY_COUNT} />}
      {!reducedMotion && <AmbientDust count={NEAR_DUST_COUNT} size={0.03} baseOpacity={0.6} zSpread={12} speedRange={[0.08, 0.26]} />}
      {!reducedMotion && <AmbientDust count={FAR_DUST_COUNT} size={0.018} baseOpacity={0.3} zSpread={20} speedRange={[0.03, 0.09]} />}
      {!reducedMotion && <CameraRig />}
      <EffectComposer>
        {/* focusDistance is normalized [0,1] across the camera's near..far
            range, not world units. A tight focal window (0.11 / 2.6)
            blurred the whole hero graphic into near-invisibility; this
            wider window keeps the shape's own surface legible while still
            softening the far dust. Bloom is kept modest so glow doesn't
            smear over the cubes' seams or the candles' edges. */}
        <DepthOfField focusDistance={0.22} focalLength={0.32} bokehScale={1.15} height={480} />
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.85} intensity={0.75} radius={0.42} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  // Always-on frameloop for the hero: an earlier viewport-based switch to
  // 'demand' froze the morph cycle (nothing calls invalidate() for this
  // clock-driven animation), so only reduced motion drops to 'demand'.
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        // Bloom/DepthOfField are full-screen passes whose cost scales with
        // pixel count, so DPR stays capped below 2.
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: CAMERA_BASE_POSITION, fov: 55, near: 0.1, far: 24 }}
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
