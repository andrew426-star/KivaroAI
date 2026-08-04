import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const PARTICLE_COUNT = 50;

// Lightest treatment of all 6 pages, deliberately — the real Supabase-backed
// lead-gen form is this page's actual job and must stay the clear focus.
// No terrain mesh, no pointer-parallax camera rig (a moving camera would
// draw more attention than this page should have). Confined to the hero
// via a gradient-mask fade toward the form column below.
function DriftParticles() {
  const ref = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const spd = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 4 - 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      spd[i] = 0.06 + Math.random() * 0.12;
    }
    return [pos, spd];
  }, []);

  useFrame((_, delta) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      if (arr[i * 3 + 1] > 2.5) arr[i * 3 + 1] = -1.5;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        color="#3adfad"
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export default function ContactField() {
  const reducedMotion = usePrefersReducedMotion();

  // The one deliberate exception in this site's 3D work: this carries zero
  // informational content (pure atmosphere), so under reduced motion it's
  // correct not to mount it at all rather than freeze it — unlike every
  // other scene, where the 3D layer IS content and must stay visible.
  if (reducedMotion) return null;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.5, 4], fov: 55, near: 0.1, far: 15 }}
        style={{ pointerEvents: 'none' }}
      >
        <DriftParticles />
      </Canvas>
    </div>
  );
}
