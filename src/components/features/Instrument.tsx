import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { getMorphState, shapeVisibility } from '@/lib/three/heroMorphCycle';

// "Instrument, not diagram" — the hero's centerpiece is a rotating
// navigational instrument (astrolabe/orrery register) built from real ring
// geometry with engraved tick marks, not a flat grid or a 2D node graph.
// Old-world material precision (rings, ticks) rendered with new-world
// physics (bloom, particles, glow) — pure signal-green, no new hue, per
// the confirmed decision to stay disciplined on the existing token set.
//
// Round 2: the first pass under-delivered on presence — a thin, faint
// ring outline read as decorative sketch, not a focal point. This pass
// scales the geometry up substantially, staggers each ring along its own
// depth axis (so DepthOfField in HeroScene.tsx has real front-to-back
// separation to act on — one ring crisp, the furthest genuinely soft),
// and adds real key/fill/point lighting so the metalness on the material
// actually has directional light to respond to.
// Shifted right (was x=0.85) so the graphic sits clear of both the text
// column and the "AI Workflow Pipeline" card now stacked beneath it — both
// live in the left ~45% of the hero. The camera still aims at
// CAMERA_LOOK_TARGET, a fixed point *left* of this — since a camera always
// centers whatever it looks at, moving this position alone wouldn't shift
// anything on screen without also decoupling the look-at target from it.
export const INSTRUMENT_CENTER: [number, number, number] = [2.15, 0.35, -0.2];
export const CAMERA_LOOK_TARGET: [number, number, number] = [0.85, 0.35, -0.2];

const RING_COLOR = new THREE.Color().setHSL(152 / 360, 0.76, 0.5);

interface RingSpec {
  radius: number;
  tube: number;
  tilt: [number, number, number];
  /** Local Z offset (applied before tilt) — the front ring sits closer to
   * camera (crisp focal plane), the back ring recedes into DepthOfField
   * blur. This is what actually sells "3D" over "flat outline." */
  depthOffset: number;
  spinAxis: 'x' | 'y' | 'z';
  spinSpeed: number;
  tickCount: number;
  /** Count of small stream particles flowing along this ring's path —
   * "a subtle particle stream flowing along the rings' paths." */
  streamCount: number;
  streamSpeed: number;
}

const RINGS: RingSpec[] = [
  { radius: 1.95, tube: 0.034, tilt: [1.15, 0.3, 0], depthOffset: 0.35, spinAxis: 'y', spinSpeed: 0.08, tickCount: 56, streamCount: 10, streamSpeed: 0.3 },
  { radius: 1.5, tube: 0.027, tilt: [0.5, -0.9, 0.2], depthOffset: 0, spinAxis: 'x', spinSpeed: -0.11, tickCount: 42, streamCount: 8, streamSpeed: -0.45 },
  { radius: 1.05, tube: 0.023, tilt: [-0.7, 0.6, -0.4], depthOffset: -0.4, spinAxis: 'z', spinSpeed: 0.15, tickCount: 30, streamCount: 6, streamSpeed: 0.58 },
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
      <boxGeometry args={[0.042, 0.009, 0.009]} />
      <meshStandardMaterial color={RING_COLOR} emissive={RING_COLOR} emissiveIntensity={0.75} roughness={0.22} metalness={0.75} toneMapped={false} />
    </instancedMesh>
  );
}

// A denser, faster-moving stream of small particles flowing along the
// ring's own circumference — distinct from the discrete orbiting "node"
// spheres below — reading as "data flowing along the instrument's rings"
// rather than a handful of satellites.
function RingStream({ radius, count, speed }: { radius: number; count: number; speed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2), [count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    offsets.forEach((offset, i) => {
      const angle = offset + t * speed;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} raycast={() => null}>
      <sphereGeometry args={[0.016, 8, 8]} />
      <meshBasicMaterial color={RING_COLOR} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
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
        <sphereGeometry args={[0.042, 10, 10]} />
        <meshBasicMaterial color={RING_COLOR} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={coreRef} args={[undefined, undefined, count]} raycast={() => null}>
        <sphereGeometry args={[0.042, 14, 14]} />
        <meshBasicMaterial color={RING_COLOR} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function Ring({ spec, ringIndex, reducedMotion }: { spec: RingSpec; ringIndex: number; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Computes its own visibility every frame from the shared clock via the
  // hero's morph-cycle module — a parent-level ref mutated in a
  // *different* component's useFrame and passed down as a React prop
  // would only ever reflect whatever value it held at the last React
  // render (props don't update on ref mutation), which is exactly the bug
  // that once left every ring stuck at opacity 0.
  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation[spec.spinAxis] += delta * spec.spinSpeed;
    if (materialRef.current) {
      const morph = getMorphState(state.clock.elapsedTime, reducedMotion);
      materialRef.current.opacity = shapeVisibility('instrument', ringIndex * BOOT_STAGGER, BOOT_DURATION, morph);
    }
  });

  return (
    <group position={[0, 0, spec.depthOffset]}>
      <group rotation={spec.tilt}>
        <group ref={groupRef}>
          <mesh>
            <torusGeometry args={[spec.radius, spec.tube, 16, 128]} />
            <meshStandardMaterial
              ref={materialRef}
              color={RING_COLOR}
              emissive={RING_COLOR}
              emissiveIntensity={0.65}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <RingTicks radius={spec.radius} count={spec.tickCount} />
          <RingOrbiters radius={spec.radius} count={2} speed={spec.spinSpeed > 0 ? 0.4 : -0.4} />
          <RingStream radius={spec.radius} count={spec.streamCount} speed={spec.streamSpeed} />
        </group>
      </group>
    </group>
  );
}

// Fits inside heroMorphCycle's ASSEMBLE_DURATION (2.8s): the last ring
// (index 2) starts at 2*BOOT_STAGGER=1.0s and finishes at 1.0+1.6=2.6s.
const BOOT_STAGGER = 0.5;
const BOOT_DURATION = 1.6;

function RingSystem({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !reducedMotion) groupRef.current.rotation.y += delta * 0.025;
  });

  return (
    <group ref={groupRef}>
      {RINGS.map((spec, i) => (
        <Ring key={i} spec={spec} ringIndex={i} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

const NEAR_PARTICLE_COLOR = new THREE.Color().setHSL(152 / 360, 0.75, 0.62);
const FAR_PARTICLE_COLOR = new THREE.Color().setHSL(152 / 360, 0.65, 0.42);

// Lighting for the shared central locus both Instrument and MarketMotif
// occupy (mounted once by HeroScene.tsx, not per-shape) — a real point/
// directional light nested inside each shape's own group would double up
// on whichever shape is currently visible, since lights aren't scoped to
// their sibling meshes in three.js's scene graph.
export function HeroLighting() {
  return (
    <group position={INSTRUMENT_CENTER}>
      <ambientLight intensity={0.32} />
      {/* Key light — the primary directional source the metallic rings/candles respond to. */}
      <directionalLight position={[2.2, 2.4, 3.2]} intensity={1.5} color="#eaffef" />
      {/* Cool fill from the opposite side, lower intensity, so specular
          highlights read as directional rather than flat/shadeless. */}
      <directionalLight position={[-2.4, -1.2, 1.6]} intensity={0.45} color="#bfeede" />
      {/* A point light seated at the shared core — this is what makes
          whichever shape is active read as a real light source lighting
          the particles drifting near it, not just a glowing decal. */}
      <pointLight position={[0, 0, 0.4]} intensity={2.2} distance={4.5} decay={2} color={RING_COLOR} />
    </group>
  );
}

export default function Instrument({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group position={INSTRUMENT_CENTER}>
      <RingSystem reducedMotion={reducedMotion} />
      {!reducedMotion && (
        <>
          {/* Near layer: fewer, larger, brighter — reads as close dust in a light beam. */}
          <Sparkles count={70} scale={[3.6, 3.1, 2.4]} size={4.5} speed={0.22} opacity={0.55} color={NEAR_PARTICLE_COLOR} noise={0.5} />
          {/* Far layer: numerous, small, dim, mostly static — reads as distance. */}
          <Sparkles count={160} scale={[6.5, 5.4, 5.5]} size={1.1} speed={0.05} opacity={0.22} color={FAR_PARTICLE_COLOR} noise={0.3} />
        </>
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
    INSTRUMENT_CENTER[0] + r * Math.sin(phi) * Math.cos(theta) * 1.9,
    INSTRUMENT_CENTER[1] + r * Math.sin(phi) * Math.sin(theta) * 1.6,
    INSTRUMENT_CENTER[2] + r * Math.cos(phi) * 1.3,
  );
}
