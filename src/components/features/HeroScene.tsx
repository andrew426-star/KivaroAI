import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Live data-terrain shader: an undulating wireframe surface (volatility-surface /
 * market-depth motif) driven entirely on the GPU via layered sine waves.
 */
const TerrainMaterial = shaderMaterial(
  { uTime: 0, uIntro: 0, uColorMid: new THREE.Color('#1cce7b'), uColorHigh: new THREE.Color('#a5e830') },
  /* vertex */ `
    uniform float uTime;
    uniform float uIntro;
    varying float vElevation;
    varying vec2 vUv;

    float wave(vec2 p, float freq, float speed, float amp, float t) {
      return sin(p.x * freq + t * speed) * cos(p.y * freq * 0.8 - t * speed * 0.7) * amp;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float elevation = 0.0;
      elevation += wave(pos.xy, 0.16, 0.55, 1.0, uTime);
      elevation += wave(pos.xy, 0.37, 0.85, 0.4, uTime * 1.25);
      elevation += wave(pos.xy * 1.7, 0.52, 0.35, 0.16, uTime * 0.6);
      pos.z += elevation * 0.55 * uIntro;
      vElevation = elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* fragment */ `
    uniform vec3 uColorMid;
    uniform vec3 uColorHigh;
    uniform float uIntro;
    varying float vElevation;
    varying vec2 vUv;

    void main() {
      float t = clamp(vElevation * 0.6 + 0.5, 0.0, 1.0);
      vec3 color = mix(uColorMid, uColorHigh, t);

      float d = distance(vUv, vec2(0.5, 0.62));
      float fade = smoothstep(0.78, 0.1, d);

      gl_FragColor = vec4(color, fade * 0.5 * uIntro);
    }
  `
);

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

extend({ TerrainMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    terrainMaterial: Record<string, unknown>;
  }
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

function DataParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 5 - 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      spd[i] = 0.08 + Math.random() * 0.18;
    }
    return [pos, spd];
  }, [count]);

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
      materialRef.current.opacity = PARTICLE_BASE_OPACITY * easeOutCubic(progress);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.035}
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

function Scene({
  reducedMotion,
  segments,
  particleCount,
  assemblyCount,
}: {
  reducedMotion: boolean;
  segments: number;
  particleCount: number;
  assemblyCount: number;
}) {
  useFrame((state) => {
    if (reducedMotion) state.invalidate();
  });

  return (
    <>
      <fog attach="fog" args={['#080c0a', 6, 15]} />
      <Terrain segments={segments} reducedMotion={reducedMotion} />
      {!reducedMotion && <AssemblyField count={assemblyCount} />}
      {!reducedMotion && <DataParticles count={particleCount} />}
      {!reducedMotion && <CameraRig />}
    </>
  );
}

export default function HeroScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sizeQuery = window.matchMedia('(max-width: 768px)');
    setReducedMotion(motionQuery.matches);
    setIsSmall(sizeQuery.matches);
    const onMotion = () => setReducedMotion(motionQuery.matches);
    const onSize = () => setIsSmall(sizeQuery.matches);
    motionQuery.addEventListener('change', onMotion);
    sizeQuery.addEventListener('change', onSize);
    return () => {
      motionQuery.removeEventListener('change', onMotion);
      sizeQuery.removeEventListener('change', onSize);
    };
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        camera={{ position: [0, 1.1, 4.4], fov: 55, near: 0.1, far: 20 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene
            reducedMotion={reducedMotion}
            segments={isSmall ? 48 : 80}
            particleCount={isSmall ? 60 : 140}
            assemblyCount={isSmall ? 110 : 280}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
