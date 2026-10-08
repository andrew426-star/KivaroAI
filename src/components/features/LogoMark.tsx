import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMorphState, shapeVisibility } from '@/lib/three/heroMorphCycle';

// The hero's first morph subject is the Kivaro mark itself — three
// isometric cubes, built in real 3D so the dust field has an actual
// brand shape to condense onto (it replaced an abstract ring
// "instrument" that read as generic sci-fi rather than as Kivaro).
//
// The cubes sit at s·(0,1,0), s·(1,0,0) and s·(0,0,1), then the group is
// turned to the isometric view (looking down the (1,1,1) diagonal) and
// aimed at the camera — from there the three read exactly as the logo
// (one on top, two below), and a gentle symmetric sway shows real depth
// without ever drifting far from the logo's own silhouette.
//
// Each cube is six inset face plates around a dark core rather than one
// solid box: the gaps between plates are the logo's seams, and the
// per-vertex gradient (lime top-left to green bottom-right) is sampled
// straight from kivaro-logo.png.
// Shifted right so the graphic sits clear of the text column and the
// "AI Workflow Pipeline" card stacked beneath it — both live in the left
// ~45% of the hero. The camera still aims at CAMERA_LOOK_TARGET, a fixed
// point *left* of this — since a camera always centers whatever it looks
// at, moving this position alone wouldn't shift anything on screen
// without also decoupling the look-at target from it.
export const HERO_CENTER: [number, number, number] = [2.15, 0.7, -0.2];
export const CAMERA_LOOK_TARGET: [number, number, number] = [0.85, 0.35, -0.2];
/** The camera's resting position (CameraRig in HeroScene drifts gently around it). */
export const CAMERA_BASE_POSITION: [number, number, number] = [0, 1.1, 4.4];

export const LOGO_LIME = new THREE.Color('#cce788');
export const LOGO_GREEN = new THREE.Color('#70f087');
const SEAM_COLOR = new THREE.Color('#06100b');

const CUBE_EDGE = 0.92;
const CUBE_SPACING = 1.14;
const PLATE_INSET = 0.075;
const PLATE_THICKNESS = 0.05;

// Bottom-left, bottom-right, then top — the order they build in, like
// stacking blocks.
const CUBE_OFFSETS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, CUBE_SPACING),
  new THREE.Vector3(CUBE_SPACING, 0, 0),
  new THREE.Vector3(0, CUBE_SPACING, 0),
];
// Recentres the trio on its own centroid, which lies on the view axis.
const CENTROID = new THREE.Vector3(1, 1, 1).multiplyScalar(CUBE_SPACING / 3);

// Fits inside heroMorphCycle's ASSEMBLE_DURATION (2.4s): the last cube
// (index 2) starts at 0.8s and finishes at 2.3s.
export const CUBE_STAGGER = 0.4;
const CUBE_BUILD_DURATION = 1.5;

// Screen "up-left" expressed in the cube's own (pre-rotation) axes — the
// direction the logo's gradient runs along, so every cube carries the
// same lime-to-green sweep the flat logo does.
const GRADIENT_DIR = new THREE.Vector3(-0.79, 0.58, 0.21).normalize();

const ISO_ROTATION = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.atan(1 / Math.SQRT2), -Math.PI / 4, 0, 'XYZ'));
const FACE_CAMERA = new THREE.Matrix4().lookAt(
  new THREE.Vector3(...CAMERA_BASE_POSITION),
  new THREE.Vector3(...HERO_CENTER),
  new THREE.Vector3(0, 1, 0),
);
const _sway = new THREE.Matrix4();
const _spin = new THREE.Matrix4();
const _translate = new THREE.Matrix4().makeTranslation(...HERO_CENTER);
const _recentre = new THREE.Matrix4().makeTranslation(-CENTROID.x, -CENTROID.y, -CENTROID.z);
// Sized to sit inside the open right side of the hero with margin, at the
// same footprint as MarketMotif so the two halves of the cycle balance.
const LOGO_SCALE = 0.64;
const _scale = new THREE.Matrix4().makeScale(LOGO_SCALE, LOGO_SCALE, LOGO_SCALE);

/**
 * World matrix of the cube trio at `elapsedTime` — a pure function of the
 * shared clock, so the dust field (which condenses onto points sampled in
 * this same local space) and the cubes themselves can never drift apart.
 */
export function logoMarkMatrix(elapsedTime: number, formProgress: number, reducedMotion: boolean, out: THREE.Matrix4): THREE.Matrix4 {
  // A slow, even sway about the view's vertical axis, plus a quarter-turn
  // that unwinds as the mark assembles and winds back up as it disperses
  // (formProgress is symmetric across the two, so the motion is too).
  const sway = reducedMotion ? 0 : Math.sin(elapsedTime * 0.42) * 0.32;
  const spin = reducedMotion ? 0 : (1 - formProgress) * (Math.PI / 2);
  _sway.makeRotationY(sway + spin);
  _spin.makeRotationX(reducedMotion ? 0 : Math.sin(elapsedTime * 0.3) * 0.06);
  return out
    .copy(_translate)
    .multiply(FACE_CAMERA)
    .multiply(_scale)
    .multiply(_sway)
    .multiply(_spin)
    .multiply(ISO_ROTATION)
    .multiply(_recentre);
}

// The face plates are built once, merged into a single geometry, and
// shared by all three cubes.
function buildCubeGeometry(): THREE.BufferGeometry {
  const plateSize = CUBE_EDGE - PLATE_INSET * 2;
  const half = CUBE_EDGE / 2 - PLATE_THICKNESS / 2;
  const faces: [THREE.Vector3, THREE.Euler][] = [
    [new THREE.Vector3(0, half, 0), new THREE.Euler(Math.PI / 2, 0, 0)],
    [new THREE.Vector3(0, -half, 0), new THREE.Euler(Math.PI / 2, 0, 0)],
    [new THREE.Vector3(half, 0, 0), new THREE.Euler(0, Math.PI / 2, 0)],
    [new THREE.Vector3(-half, 0, 0), new THREE.Euler(0, Math.PI / 2, 0)],
    [new THREE.Vector3(0, 0, half), new THREE.Euler(0, 0, 0)],
    [new THREE.Vector3(0, 0, -half), new THREE.Euler(0, 0, 0)],
  ];
  const parts = faces.map(([pos, rot]) => {
    const plate = new RoundedBoxGeometry(plateSize, plateSize, PLATE_THICKNESS, 3, 0.06);
    plate.applyMatrix4(new THREE.Matrix4().compose(pos, new THREE.Quaternion().setFromEuler(rot), new THREE.Vector3(1, 1, 1)));
    return plate;
  });
  const geometry = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());

  // Gradient by position, then a light per-face tint so the top reads
  // brightest, as it does in the logo.
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const colors = new Float32Array(position.count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    n.fromBufferAttribute(normal, i);
    const g = THREE.MathUtils.clamp(0.5 + p.dot(GRADIENT_DIR) / (CUBE_EDGE * 0.95), 0, 1);
    c.copy(LOGO_GREEN).lerp(LOGO_LIME, g);
    const shade = 0.86 + 0.14 * Math.max(n.y, 0) - 0.05 * Math.max(n.x, 0);
    c.multiplyScalar(shade);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function Cube({ index, geometry, reducedMotion }: { index: number; geometry: THREE.BufferGeometry; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const plateMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const coreMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const offset = CUBE_OFFSETS[index];

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || !plateMaterial.current || !coreMaterial.current) return;
    const morph = getMorphState(state.clock.elapsedTime, reducedMotion);
    const v = shapeVisibility('logo', index * CUBE_STAGGER, CUBE_BUILD_DURATION, morph);
    // Settles in from slightly above and smaller — the same move, played
    // backwards, carries it out again on disperse.
    group.position.set(offset.x, offset.y + (1 - v) * 0.45, offset.z);
    group.scale.setScalar(0.55 + 0.45 * v);
    group.visible = v > 0.001;
    plateMaterial.current.opacity = v;
    plateMaterial.current.transparent = v < 0.999;
    coreMaterial.current.opacity = v;
    coreMaterial.current.transparent = v < 0.999;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={plateMaterial} vertexColors toneMapped={false} transparent opacity={0} />
      </mesh>
      {/* The dark core is what shows through the gaps between plates — the logo's seams. */}
      <mesh>
        <boxGeometry args={[CUBE_EDGE - PLATE_THICKNESS * 2.2, CUBE_EDGE - PLATE_THICKNESS * 2.2, CUBE_EDGE - PLATE_THICKNESS * 2.2]} />
        <meshBasicMaterial ref={coreMaterial} color={SEAM_COLOR} transparent opacity={0} />
      </mesh>
    </group>
  );
}

function CubeTrio({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(buildCubeGeometry, []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    logoMarkMatrix(t, getMorphState(t, reducedMotion).formProgress, reducedMotion, group.matrix);
    group.matrixWorldNeedsUpdate = true;
  });

  return (
    <group ref={groupRef} matrixAutoUpdate={false}>
      {CUBE_OFFSETS.map((_, i) => (
        <Cube key={i} index={i} geometry={geometry} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

const NEAR_PARTICLE_COLOR = new THREE.Color().setHSL(140 / 360, 0.75, 0.66);
const FAR_PARTICLE_COLOR = new THREE.Color().setHSL(148 / 360, 0.6, 0.42);
const ACCENT_LIGHT_COLOR = new THREE.Color().setHSL(152 / 360, 0.76, 0.5);

// Lighting for the shared central locus both LogoMark and MarketMotif
// occupy (mounted once by HeroScene.tsx, not per-shape) — a real point/
// directional light nested inside each shape's own group would double up
// on whichever shape is currently visible, since lights aren't scoped to
// their sibling meshes in three.js's scene graph.
export function HeroLighting() {
  return (
    <group position={HERO_CENTER}>
      <ambientLight intensity={0.32} />
      <directionalLight position={[2.2, 2.4, 3.2]} intensity={1.5} color="#eaffef" />
      <directionalLight position={[-2.4, -1.2, 1.6]} intensity={0.45} color="#bfeede" />
      <pointLight position={[0, 0, 0.4]} intensity={2.2} distance={4.5} decay={2} color={ACCENT_LIGHT_COLOR} />
    </group>
  );
}

export default function LogoMark({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <CubeTrio reducedMotion={reducedMotion} />
      {!reducedMotion && (
        <group position={HERO_CENTER}>
          {/* Near layer: fewer, larger, brighter — reads as close dust in a light beam. */}
          <Sparkles count={70} scale={[3.6, 3.1, 2.4]} size={4} speed={0.22} opacity={0.5} color={NEAR_PARTICLE_COLOR} noise={0.5} />
          {/* Far layer: numerous, small, dim, mostly static — reads as distance. */}
          <Sparkles count={160} scale={[6.5, 5.4, 5.5]} size={1.1} speed={0.05} opacity={0.22} color={FAR_PARTICLE_COLOR} noise={0.3} />
        </group>
      )}
    </>
  );
}

/**
 * A point on the surface of one cube, in the trio's local space (apply
 * logoMarkMatrix to place it in the world). About a third land on the
 * plate edges so the dust traces the seams and the mark reads as cubes
 * before the plates themselves fade in.
 */
export function sampleLogoMarkPoint(cubeIndex: number): THREE.Vector3 {
  const half = CUBE_EDGE / 2;
  const axis = Math.floor(Math.random() * 3);
  const side = Math.random() < 0.5 ? -1 : 1;
  const onEdge = Math.random() < 0.35;
  let u = (Math.random() * 2 - 1) * (half - PLATE_INSET);
  let v = (Math.random() * 2 - 1) * (half - PLATE_INSET);
  if (onEdge) {
    if (Math.random() < 0.5) u = Math.sign(u || 1) * (half - PLATE_INSET);
    else v = Math.sign(v || 1) * (half - PLATE_INSET);
  }
  const p = new THREE.Vector3();
  p.setComponent(axis, side * half);
  p.setComponent((axis + 1) % 3, u);
  p.setComponent((axis + 2) % 3, v);
  return p.add(CUBE_OFFSETS[cubeIndex]);
}
