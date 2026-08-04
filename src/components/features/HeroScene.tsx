import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { TerrainMaterial } from '@/lib/shaders/terrainMaterial';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

extend({ TerrainMaterial });

// Landing-animation boot sequence, in two overlapping stages (elapsed-time
// driven off state.clock, not per-component accumulators, so every stage
// stays in sync off one shared clock):
//   1. AssemblyField — a scattered particle cloud streams inward and
//      resolves onto the terrain's own flat (pre-elevation) grid, echoing
//      "raw data resolving into a connected structure."
//   2. Terrain reveal — once the particles have mostly arrived, the
//      wireframe grid itself fades in and its elevation grows out of that
//      flat plane (the existing uIntro ramp), completing the handoff from
//      discrete points to the connected structure they were building.
const ASSEMBLY_PARTICLE_DURATION = 1.7;
const ASSEMBLY_STAGGER = 1.0;
const ASSEMBLY_FADE_DURATION = 0.9;
const TERRAIN_REVEAL_START = 2.0;
const TERRAIN_REVEAL_DURATION = 1.6;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

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
        transparent
        wireframe
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const PARTICLE_BASE_OPACITY = 0.55;

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
      // Target: scattered across the terrain's own flat XY extent
      // (matches planeGeometry(16,16,...)'s span), z=0 — the terrain's
      // rest plane before uIntro's elevation kicks in, so arriving
      // particles hand off directly into the grid that grows under them.
      const tx = (Math.random() - 0.5) * 15;
      const ty = (Math.random() - 0.5) * 15;
      target[i * 3] = tx;
      target[i * 3 + 1] = ty;
      target[i * 3 + 2] = 0;

      // Scatter: offset from the target within the camera's own visible
      // range (a wide swing here lands well outside the frustum given
      // this group's steep rotation — verified empirically, not assumed —
      // so this stays close enough to read as disorder without particles
      // spending their approach off-screen).
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 4.5;
      scatter[i * 3] = tx + Math.cos(angle) * radius;
      scatter[i * 3 + 1] = ty + Math.sin(angle) * radius * 0.6;
      scatter[i * 3 + 2] = 0.3 + Math.random() * 2;

      delays[i] = Math.random() * ASSEMBLY_STAGGER;
    }
    return { scatter, target, delays };
  }, [count]);
}

// Scattered particle cloud that streams inward and resolves onto the
// terrain's own flat grid — the "raw data becomes a connected structure"
// beat. Only ever mounted when !reducedMotion (gated in Scene, matching
// DataParticles/CameraRig's own gating), so no internal reduced-motion
// branch is needed here.
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
    <group rotation={[-Math.PI / 2.35, 0, 0]} position={[0, -1.6, 2]}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[current, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={0.09}
          color="#3adfad"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
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
    camera.lookAt(0, -0.4, 0);
  });

  return null;
}

// Fixed desktop-tier constants on every viewport — per "maximize visuals
// everywhere," this scene no longer scales geometry/particle counts down
// on mobile. prefers-reduced-motion remains the only gate (an
// accessibility contract, never a quality dial).
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
      <fog attach="fog" args={['#080c0a', 6, 17]} />
      <Terrain segments={SEGMENTS} reducedMotion={reducedMotion} />
      {!reducedMotion && <AssemblyField count={ASSEMBLY_COUNT} />}
      {!reducedMotion && <DataParticles count={PARTICLE_COUNT} />}
      {!reducedMotion && (
        <DataParticles count={FAR_PARTICLE_COUNT} size={0.02} baseOpacity={0.28} zSpread={20} speedRange={[0.03, 0.09]} />
      )}
      {!reducedMotion && <CameraRig />}
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
