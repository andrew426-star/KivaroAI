import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// "Instrument, not diagram" — the hero's centerpiece is now a rotating
// navigational instrument (astrolabe/orrery register) built from real ring
// geometry with engraved tick marks, not a flat grid or a 2D node graph.
// Old-world material precision (rings, ticks) rendered with new-world
// physics (bloom, particles, glow) — pure signal-green, no new hue, per
// the confirmed decision to stay disciplined on the existing token set.
export const INSTRUMENT_CENTER: [number, number, number] = [0.9, 0.4, -0.3];

const RING_COLOR = new THREE.Color().setHSL(152 / 360, 0.76, 0.5);

interface RingSpec {
  radius: number;
  tube: number;
  tilt: [number, number, number];
  spinAxis: 'x' | 'y' | 'z';
  spinSpeed: number;
  tickCount: number;
  orbiters: number;
  orbiterSpeed: number;
}

const RINGS: RingSpec[] = [
  { radius: 1.15, tube: 0.022, tilt: [1.15, 0.3, 0], spinAxis: 'y', spinSpeed: 0.09, tickCount: 48, orbiters: 2, orbiterSpeed: 0.35 },
  { radius: 0.85, tube: 0.018, tilt: [0.5, -0.9, 0.2], spinAxis: 'x', spinSpeed: -0.13, tickCount: 36, orbiters: 1, orbiterSpeed: -0.5 },
  { radius: 0.55, tube: 0.016, tilt: [-0.7, 0.6, -0.4], spinAxis: 'z', spinSpeed: 0.17, tickCount: 24, orbiters: 1, orbiterSpeed: 0.62 },
];

function RingTicks({ radius, count }: { radius: number; count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Tick positions never change after mount — laid out once (guarded by
  // userData.laidOut) rather than recomputed every frame.
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || mesh.userData.laidOut) return;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      dummy.rotation.z = angle;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.laidOut = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.028, 0.006, 0.006]} />
      <meshStandardMaterial color={RING_COLOR} emissive={RING_COLOR} emissiveIntensity={0.6} roughness={0.4} metalness={0.3} toneMapped={false} />
    </instancedMesh>
  );
}

function RingOrbiters({ radius, count, speed }: { radius: number; count: number; speed: number }) {
  const coreRef = useRef<THREE.InstancedMesh>(null);
  const haloRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useMemo(() => Array.from({ length: count }, () => Math.random() * Math.PI * 2), [count]);

  useFrame((state) => {
    const core = coreRef.current;
    const halo = haloRef.current;
    if (!core || !halo) return;
    const t = state.clock.elapsedTime;
    offsets.forEach((offset, i) => {
      const angle = offset + t * speed;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      core.setMatrixAt(i, dummy.matrix);
      dummy.scale.setScalar(2.4);
      dummy.updateMatrix();
      halo.setMatrixAt(i, dummy.matrix);
    });
    core.instanceMatrix.needsUpdate = true;
    halo.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={haloRef} args={[undefined, undefined, count]} raycast={() => null}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshBasicMaterial color={RING_COLOR} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={coreRef} args={[undefined, undefined, count]} raycast={() => null}>
        <sphereGeometry args={[0.028, 14, 14]} />
        <meshBasicMaterial color={RING_COLOR} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function Ring({ spec, bootStart, reducedMotion }: { spec: RingSpec; bootStart: number; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Computes its own boot-in opacity every frame from the shared clock —
  // a parent-level ref mutated in a *different* component's useFrame and
  // passed down as a React prop would only ever reflect whatever value it
  // held at the last React render (props don't update on ref mutation),
  // which is exactly the bug that left every ring stuck at opacity 0.
  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation[spec.spinAxis] += delta * spec.spinSpeed;
    if (materialRef.current) {
      const progress = reducedMotion
        ? 1
        : THREE.MathUtils.clamp((state.clock.elapsedTime - bootStart) / BOOT_DURATION, 0, 1);
      materialRef.current.opacity = easeOutCubic(progress);
    }
  });

  return (
    <group rotation={spec.tilt}>
      <group ref={groupRef}>
        <mesh>
          <torusGeometry args={[spec.radius, spec.tube, 12, 96]} />
          <meshStandardMaterial
            ref={materialRef}
            color={RING_COLOR}
            emissive={RING_COLOR}
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.5}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
        <RingTicks radius={spec.radius} count={spec.tickCount} />
        <RingOrbiters radius={spec.radius} count={spec.orbiters} speed={spec.orbiterSpeed} />
      </group>
    </group>
  );
}

const BOOT_START = 0.3;
const BOOT_STAGGER = 0.5;
const BOOT_DURATION = 1.6;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function RingSystem({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !reducedMotion) groupRef.current.rotation.y += delta * 0.03;
  });

  return (
    <group ref={groupRef}>
      {RINGS.map((spec, i) => (
        <Ring key={i} spec={spec} bootStart={BOOT_START + i * BOOT_STAGGER} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

export default function Instrument({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group position={INSTRUMENT_CENTER}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 2, 3]} intensity={0.9} color="#dfffe6" />
      <RingSystem reducedMotion={reducedMotion} />
      {!reducedMotion && (
        <Sparkles
          count={90}
          scale={[3.4, 3, 3]}
          size={2.2}
          speed={0.15}
          opacity={0.35}
          color={new THREE.Color().setHSL(152 / 360, 0.7, 0.55)}
          noise={0.4}
        />
      )}
    </group>
  );
}

// Re-exported for HeroScene.tsx's separate fine-dust AssemblyField layer,
// which converges toward the instrument's general position/volume before
// the ring system itself finishes booting in — matching the established
// "fine dust condenses toward the same region the bold structure occupies"
// pattern from the previous hero pass.
export function sampleInstrumentVolumePoint(radiusScale = 1.3): THREE.Vector3 {
  const r = Math.cbrt(Math.random()) * radiusScale;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    INSTRUMENT_CENTER[0] + r * Math.sin(phi) * Math.cos(theta) * 1.3,
    INSTRUMENT_CENTER[1] + r * Math.sin(phi) * Math.sin(theta) * 1.1,
    INSTRUMENT_CENTER[2] + r * Math.cos(phi) * 1.0,
  );
}
