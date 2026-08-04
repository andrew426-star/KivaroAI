import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TerrainMaterial } from '@/lib/shaders/terrainMaterial';
import { getSoftParticleTexture } from '@/lib/three/softParticleTexture';
import NetworkLattice, { sampleLatticePoint } from './NetworkLattice';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

extend({ TerrainMaterial });

// Landing-animation boot sequence, in three overlapping stages (elapsed-time
// driven off state.clock, not per-component accumulators, so every stage
// stays in sync off one shared clock):
//   1. AssemblyField — a scattered fine-particle cloud streams inward from
//      every direction and condenses into the same volumetric region
//      NetworkLattice targets — "raw data dissolving toward a shape."
//   2. NetworkLattice — a second, bolder wave of hub points converges into
//      that same region slightly after, then fades in real connecting
//      edges between nearest neighbors once the whole lattice has landed —
//      the actual subject of the morph: an intelligence/agent network
//      materializing, not the flat terrain grid this used to dissolve onto.
//   3. Terrain reveal — the wireframe ground grows out of a flat plane
//      beneath/behind the lattice, now a dimmed ambient floor rather than
//      the primary visual.
const ASSEMBLY_PARTICLE_DURATION = 1.7;
const ASSEMBLY_STAGGER = 1.0;
const ASSEMBLY_FADE_DURATION = 0.9;
const ASSEMBLY_RADIUS_SCALE = 1.6; // a bit past NetworkLattice's own radius=1, so fine dust forms a corona around the bold hub shape
const TERRAIN_REVEAL_START = 2.0;
const TERRAIN_REVEAL_DURATION = 1.6;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Terrain is now a dimmed ambient floor beneath NetworkLattice, the hero's
// actual subject — these colors are still read directly off the real
// --primary / --kv-lime HSL tokens (same hue/saturation as before) via
// setHSL, just at lower lightness so the terrain recedes rather than
// competing with the lattice for attention.
const TERRAIN_COLOR_MID = new THREE.Color().setHSL(152 / 360, 0.76, 0.24);
const TERRAIN_COLOR_HIGH = new THREE.Color().setHSL(82 / 360, 0.8, 0.3);
const TERRAIN_AMPLITUDE_SCALE = 0.55;

function Terrain({ segments, reducedMotion }: { segments: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (reducedMotion && ref.current) {
      ref.current.uniforms.uIntro.value = 1;
    }
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value += delta;
    if (!reducedMotion) {
      const progress = THREE.MathUtils.clamp(
        (state.clock.elapsedTime - TERRAIN_REVEAL_START) / TERRAIN_REVEAL_DURATION,
        0,
        1,
      );
      ref.current.uniforms.uIntro.value = easeOutCubic(progress);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2.35, 0, 0]} position={[0, -1.6, 2]}>
      <planeGeometry args={[16, 16, segments, segments]} />
      <terrainMaterial
        ref={ref}
        uColorMid={TERRAIN_COLOR_MID}
        uColorHigh={TERRAIN_COLOR_HIGH}
        uAmplitudeScale={TERRAIN_AMPLITUDE_SCALE}
        transparent
        wireframe
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
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
        (state.clock.elapsedTime - TERRAIN_REVEAL_START) / TERRAIN_REVEAL_DURATION,
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
      // Target: sampled from the same volumetric region NetworkLattice's
      // hub nodes converge into, so the fine dust and the bold connected
      // lattice condense into one coherent shape instead of two
      // independent clouds — a corona of fine texture around a bold core.
      const t = sampleLatticePoint(ASSEMBLY_RADIUS_SCALE);
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
// alongside NetworkLattice's bolder hub nodes. Only ever mounted when
// !reducedMotion (gated in Scene, matching DataParticles/CameraRig's own
// gating) — it's ambient texture, not the hero's actual content; the
// content itself (NetworkLattice) renders its final static state under
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
    const fadeOut = THREE.MathUtils.clamp((t - TERRAIN_REVEAL_START) / ASSEMBLY_FADE_DURATION, 0, 1);
    materialRef.current.opacity = 0.95 * fadeIn * (1 - fadeOut);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.09}
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

function CameraRig() {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useFrame(() => {
    camera.position.x += (target.current.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (1.1 - target.current.y * 0.25 - camera.position.y) * 0.02;
    camera.lookAt(0.15, 0.1, 0.3);
  });

  return null;
}

// Fixed desktop-tier constants on every viewport — per "maximize visuals
// everywhere," this scene no longer scales geometry/particle counts down
// on mobile. prefers-reduced-motion remains the only gate (an
// accessibility contract, never a quality dial) for the ambient/decorative
// layers; NetworkLattice itself always renders (static final state when
// reduced motion is on) since it's the hero's actual content.
const SEGMENTS = 80;
const PARTICLE_COUNT = 140;
const ASSEMBLY_COUNT = 280;
const FAR_PARTICLE_COUNT = 70;

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((state) => {
    if (reducedMotion) state.invalidate();
  });

  return (
    <>
      <fog attach="fog" args={['#080c0a', 6, 19]} />
      <Terrain segments={SEGMENTS} reducedMotion={reducedMotion} />
      <NetworkLattice reducedMotion={reducedMotion} />
      {!reducedMotion && <AssemblyField count={ASSEMBLY_COUNT} />}
      {!reducedMotion && <DataParticles count={PARTICLE_COUNT} />}
      {!reducedMotion && (
        <DataParticles count={FAR_PARTICLE_COUNT} size={0.02} baseOpacity={0.28} zSpread={20} speedRange={[0.03, 0.09]} />
      )}
      {!reducedMotion && <CameraRig />}
      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={0.85} radius={0.55} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
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
