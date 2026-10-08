import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// The hero's subject: the Kivaro mark — three isometric cubes — built in
// real 3D and then redrawn by ScanlineDissolveEffect as scanlines that
// stream off into dashes. The mesh only has to be well lit; the look
// comes from the effect.
//
// The cubes sit at s·(0,1,0), s·(1,0,0) and s·(0,0,1), then the group is
// turned to the isometric view (looking down the (1,1,1) diagonal) and
// aimed at the camera — from there the three read exactly as the logo
// (one on top, two below). Everything about it moves continuously: a
// slow sway, a wave that runs through the three cubes in turn, and a turn
// that follows the page's scroll. There are no phases to start or stop.
//
// Each cube is six inset face plates around a dark core rather than one
// solid box: the gaps between plates are the logo's seams, and the
// per-vertex gradient (lime top-left to green bottom-right) is sampled
// straight from kivaro-logo.png.
// Shifted right so the graphic sits clear of the text column and the
// "AI Workflow Pipeline" card stacked beneath it — both live in the left
// ~45% of the hero. The camera aims at CAMERA_LOOK_TARGET, a fixed point
// *left* of this, so the mark sits right of frame centre.
export const HERO_CENTER: [number, number, number] = [2.05, 0.7, -0.2];
export const CAMERA_LOOK_TARGET: [number, number, number] = [0.85, 0.35, -0.2];
/** The camera's resting position (CameraRig in HeroScene drifts gently around it). */
export const CAMERA_BASE_POSITION: [number, number, number] = [0, 1.1, 4.4];

const LOGO_LIME = new THREE.Color('#cce788');
const LOGO_GREEN = new THREE.Color('#70f087');
const SEAM_COLOR = new THREE.Color('#050806');

const CUBE_EDGE = 0.92;
const CUBE_SPACING = 1.14;
const PLATE_INSET = 0.075;
const PLATE_THICKNESS = 0.05;
const LOGO_SCALE = 0.72;

const CUBE_OFFSETS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, CUBE_SPACING),
  new THREE.Vector3(CUBE_SPACING, 0, 0),
  new THREE.Vector3(0, CUBE_SPACING, 0),
];
// Recentres the trio on its own centroid, which lies on the view axis.
const CENTROID = new THREE.Vector3(1, 1, 1).multiplyScalar(CUBE_SPACING / 3);
const OUTWARD = CUBE_OFFSETS.map((o) => o.clone().sub(CENTROID).normalize());

// Screen "up-left" expressed in the cube's own (pre-rotation) axes — the
// direction the logo's gradient runs along.
const GRADIENT_DIR = new THREE.Vector3(-0.79, 0.58, 0.21).normalize();

const ISO_EULER = new THREE.Euler(Math.atan(1 / Math.SQRT2), -Math.PI / 4, 0, 'XYZ');
const FACE_CAMERA = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().lookAt(new THREE.Vector3(...CAMERA_BASE_POSITION), new THREE.Vector3(...HERO_CENTER), new THREE.Vector3(0, 1, 0)),
);

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

  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    const g = THREE.MathUtils.clamp(0.5 + p.dot(GRADIENT_DIR) / (CUBE_EDGE * 0.95), 0, 1);
    c.copy(LOGO_GREEN).lerp(LOGO_LIME, g);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** Page scroll as 0..1 across the first screen — shared by the mark and the effect. */
export function heroScrollProgress(): number {
  return THREE.MathUtils.clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
}

export default function LogoMark({ reducedMotion }: { reducedMotion: boolean }) {
  const swayRef = useRef<THREE.Group>(null);
  const cubeRefs = useRef<(THREE.Group | null)[]>([]);
  const geometry = useMemo(buildCubeGeometry, []);
  const scroll = useRef(0);

  useFrame((state, delta) => {
    const sway = swayRef.current;
    if (!sway) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);
    scroll.current = THREE.MathUtils.damp(scroll.current, reducedMotion ? 0 : heroScrollProgress(), 4, dt);

    if (!reducedMotion) {
      // Two slow, unrelated sines — the sway never quite repeats, so it
      // reads as drifting rather than as a metronome.
      sway.rotation.y = Math.sin(t * 0.23) * 0.42 + Math.sin(t * 0.097 + 1.3) * 0.18 + scroll.current * 0.9;
      sway.rotation.x = Math.sin(t * 0.17 + 0.6) * 0.08 - scroll.current * 0.25;
      sway.position.y = Math.sin(t * 0.31) * 0.05;
    }

    // A wave that runs through the cubes one after another: each eases a
    // little away from the centre and back, a third of a cycle apart.
    cubeRefs.current.forEach((cube, i) => {
      if (!cube) return;
      const lift = reducedMotion ? 0 : (Math.sin(t * 0.9 - i * ((Math.PI * 2) / 3)) * 0.5 + 0.5) * 0.09;
      cube.position.copy(CUBE_OFFSETS[i]).addScaledVector(OUTWARD[i], lift);
    });
  });

  return (
    <group position={HERO_CENTER} quaternion={FACE_CAMERA} scale={LOGO_SCALE}>
      <group ref={swayRef}>
        <group rotation={ISO_EULER}>
          <group position={[-CENTROID.x, -CENTROID.y, -CENTROID.z]}>
            {CUBE_OFFSETS.map((offset, i) => (
              <group
                key={i}
                ref={(el) => {
                  cubeRefs.current[i] = el;
                }}
                position={offset}
              >
                <mesh geometry={geometry}>
                  <meshStandardMaterial vertexColors roughness={0.5} metalness={0.05} toneMapped={false} />
                </mesh>
                {/* The dark core is what shows through the gaps between plates — the logo's seams. */}
                <mesh>
                  <boxGeometry args={[CUBE_EDGE - PLATE_THICKNESS * 2.2, CUBE_EDGE - PLATE_THICKNESS * 2.2, CUBE_EDGE - PLATE_THICKNESS * 2.2]} />
                  <meshBasicMaterial color={SEAM_COLOR} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

// Lighting tuned for the scanline pass: line thickness follows brightness,
// so the three visible faces of each cube need clearly different values
// (top brightest, left middle, right darkest) for the cubes to read as
// solid through the lines.
export function HeroLighting() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[-1, 8, 2]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-6, 0.5, 3]} intensity={2.0} color="#eaffef" />
      <directionalLight position={[4, -1, 4]} intensity={0.45} color="#d8ffe6" />
    </>
  );
}
