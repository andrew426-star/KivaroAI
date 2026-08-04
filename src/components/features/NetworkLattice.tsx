import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftParticleTexture } from '@/lib/three/softParticleTexture';

// Shared "where does the hero's particle morph condense" region — both
// this file's own bold hub nodes and HeroScene.tsx's fine dissolving-data
// dust target this same volumetric cluster via sampleLatticePoint(), so
// the two particle layers condense into one coherent shape (fine texture
// surrounding a bold connected lattice) instead of two independent clouds
// — the actual "graphic related to Kivaro AI" this hero now resolves into:
// an intelligence/agent network materializing out of raw data, echoed for
// real in Section 02's Agent Constellation right below.
export const LATTICE_CENTER: [number, number, number] = [0.25, 0.55, 0.75];
export const LATTICE_RADII: [number, number, number] = [1.7, 1.25, 1.1];

export function sampleLatticePoint(radiusScale = 1): THREE.Vector3 {
  const r = Math.cbrt(Math.random()) * radiusScale;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    LATTICE_CENTER[0] + r * Math.sin(phi) * Math.cos(theta) * LATTICE_RADII[0],
    LATTICE_CENTER[1] + r * Math.sin(phi) * Math.sin(theta) * LATTICE_RADII[1],
    LATTICE_CENTER[2] + r * Math.cos(phi) * LATTICE_RADII[2],
  );
}

const HUB_COUNT = 65;
const HUB_BOOT_START = 0.9; // fires after the fine dust (HeroScene's AssemblyField) is already well underway
const HUB_BOOT_DURATION = 1.5;
const HUB_STAGGER = 0.7;
const HUB_MAX_LINK_DIST = 0.7;
const HUB_LINK_FADE_START = 0.85; // fraction of boot progress before edges start appearing
const HUB_COLOR_A = '#3adfad';
const HUB_COLOR_B = '#c8f26a';

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useHubLayout() {
  return useMemo(() => {
    const scatter: THREE.Vector3[] = [];
    const target: THREE.Vector3[] = [];
    const delays: number[] = [];
    for (let i = 0; i < HUB_COUNT; i++) {
      const t = sampleLatticePoint(1);
      target.push(t);
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 3;
      scatter.push(new THREE.Vector3(
        t.x + Math.cos(angle) * radius,
        t.y + Math.sin(angle) * radius * 0.7,
        t.z + (Math.random() - 0.5) * radius,
      ));
      delays.push(HUB_BOOT_START + Math.random() * HUB_STAGGER);
    }

    // Nearest-neighbor mesh, computed once off the deterministic target
    // positions — real geometric structure (each hub linked to its 3
    // nearest neighbors within a max distance), not a fake hub-and-spoke
    // pattern radiating from a single point.
    const links: [number, number][] = [];
    target.forEach((p, i) => {
      const distances = target
        .map((q, qi) => ({ qi, d: qi === i ? Infinity : p.distanceTo(q) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      distances.forEach(({ qi, d }) => {
        if (d >= HUB_MAX_LINK_DIST) return;
        const key: [number, number] = i < qi ? [i, qi] : [qi, i];
        if (!links.some(([a, b]) => a === key[0] && b === key[1])) links.push(key);
      });
    });

    return { scatter, target, delays, links };
  }, []);
}

export default function NetworkLattice({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const { scatter, target, delays, links } = useHubLayout();

  const current = useMemo(() => {
    const arr = new Float32Array(HUB_COUNT * 3);
    scatter.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return arr;
  }, [scatter]);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(HUB_COUNT * 3);
    const cA = new THREE.Color(HUB_COLOR_A);
    const cB = new THREE.Color(HUB_COLOR_B);
    for (let i = 0; i < HUB_COUNT; i++) {
      const c = cA.clone().lerp(cB, Math.random() * 0.6);
      arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, []);

  const lineGeometryArray = useMemo(() => new Float32Array(links.length * 6), [links.length]);

  useFrame((state) => {
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const t = state.clock.elapsedTime;
    const posArr = geo.attributes.position.array as Float32Array;
    let minProgress = 1;
    for (let i = 0; i < HUB_COUNT; i++) {
      const localT = reducedMotion ? 1 : THREE.MathUtils.clamp((t - delays[i]) / HUB_BOOT_DURATION, 0, 1);
      minProgress = Math.min(minProgress, localT);
      const eased = easeOutCubic(localT);
      posArr[i * 3] = THREE.MathUtils.lerp(scatter[i].x, target[i].x, eased);
      posArr[i * 3 + 1] = THREE.MathUtils.lerp(scatter[i].y, target[i].y, eased);
      posArr[i * 3 + 2] = THREE.MathUtils.lerp(scatter[i].z, target[i].z, eased);
    }
    geo.attributes.position.needsUpdate = true;

    if (pointsMaterialRef.current) {
      const fadeIn = reducedMotion ? 1 : THREE.MathUtils.clamp(t / 0.5, 0, 1);
      pointsMaterialRef.current.opacity = 0.95 * fadeIn;
    }

    const lineGeo = lineRef.current?.geometry;
    if (lineGeo && lineMaterialRef.current) {
      const lineArr = lineGeo.attributes.position.array as Float32Array;
      links.forEach(([a, b], i) => {
        lineArr[i * 6] = posArr[a * 3]; lineArr[i * 6 + 1] = posArr[a * 3 + 1]; lineArr[i * 6 + 2] = posArr[a * 3 + 2];
        lineArr[i * 6 + 3] = posArr[b * 3]; lineArr[i * 6 + 4] = posArr[b * 3 + 1]; lineArr[i * 6 + 5] = posArr[b * 3 + 2];
      });
      lineGeo.attributes.position.needsUpdate = true;
      const edgeProgress = reducedMotion ? 1 : THREE.MathUtils.clamp((minProgress - HUB_LINK_FADE_START) / (1 - HUB_LINK_FADE_START), 0, 1);
      lineMaterialRef.current.opacity = 0.35 * edgeProgress;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[current, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMaterialRef}
          size={0.14}
          map={getSoftParticleTexture()}
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      {links.length > 0 && (
        <lineSegments ref={lineRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[lineGeometryArray, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={lineMaterialRef} color={HUB_COLOR_A} transparent opacity={0} depthWrite={false} />
        </lineSegments>
      )}
    </>
  );
}
