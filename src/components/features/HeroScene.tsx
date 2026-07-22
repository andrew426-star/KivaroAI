import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Live data-terrain shader: an undulating wireframe surface (volatility-surface /
 * market-depth motif) driven entirely on the GPU via layered sine waves.
 */
const TerrainMaterial = shaderMaterial(
  { uTime: 0, uColorMid: new THREE.Color('#1cce7b'), uColorHigh: new THREE.Color('#a5e830') },
  /* vertex */ `
    uniform float uTime;
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
      pos.z += elevation * 0.55;
      vElevation = elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* fragment */ `
    uniform vec3 uColorMid;
    uniform vec3 uColorHigh;
    varying float vElevation;
    varying vec2 vUv;

    void main() {
      float t = clamp(vElevation * 0.6 + 0.5, 0.0, 1.0);
      vec3 color = mix(uColorMid, uColorHigh, t);

      float d = distance(vUv, vec2(0.5, 0.62));
      float fade = smoothstep(0.78, 0.1, d);

      gl_FragColor = vec4(color, fade * 0.5);
    }
  `
);

extend({ TerrainMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    terrainMaterial: Record<string, unknown>;
  }
}

function Terrain({ segments }: { segments: number }) {
  const ref = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.uniforms.uTime.value += delta;
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

function DataParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

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

  useFrame((_, delta) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      if (arr[i * 3 + 1] > 3.5) arr[i * 3 + 1] = -1.5;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#3adfad"
        transparent
        opacity={0.55}
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
    camera.lookAt(0, -0.4, 0);
  });

  return null;
}

function Scene({ reducedMotion, segments, particleCount }: { reducedMotion: boolean; segments: number; particleCount: number }) {
  useFrame((state) => {
    if (reducedMotion) state.invalidate();
  });

  return (
    <>
      <fog attach="fog" args={['#080c0a', 6, 15]} />
      <Terrain segments={segments} />
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
          <Scene reducedMotion={reducedMotion} segments={isSmall ? 48 : 80} particleCount={isSmall ? 60 : 140} />
        </Suspense>
      </Canvas>
    </div>
  );
}
