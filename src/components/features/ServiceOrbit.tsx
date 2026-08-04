import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SERVICES } from '@/constants/mockData';
import PointerCameraRig from './PointerCameraRig';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Same first-stop hues as ServiceCard.tsx's own CATEGORY_COLORS gradients
// (emerald/green/teal/lime) — not new colors invented for this scene.
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  research: { label: 'Research', color: '#10b981' },
  operations: { label: 'Operations', color: '#22c55e' },
  intelligence: { label: 'Intelligence', color: '#14b8a6' },
  architecture: { label: 'Architecture', color: '#84cc16' },
};
const CATEGORY_ORDER = ['research', 'operations', 'intelligence', 'architecture'];
const DIM_COLOR = new THREE.Color('#1a2620');

const RING_RADIUS = 2.0;
const CLUSTER_JITTER = 0.42;
const ARC_SPAN = (110 * Math.PI) / 180;
const BOOT_DURATION = 1.0;
const BOOT_STAGGER = 0.45;

interface ServiceNode {
  id: string;
  title: string;
  category: string;
  color: string;
  position: [number, number, number];
}

function useOrbitLayout() {
  return useMemo(() => {
    const nodes: ServiceNode[] = [];
    const links: { color: string; points: [THREE.Vector3, THREE.Vector3] }[] = [];

    CATEGORY_ORDER.forEach((categoryId, ci) => {
      const meta = CATEGORY_META[categoryId];
      const angle = -ARC_SPAN / 2 + (ci / (CATEGORY_ORDER.length - 1)) * ARC_SPAN;
      const centroid = new THREE.Vector3(
        Math.sin(angle) * RING_RADIUS,
        Math.cos(ci * 1.9) * 0.3,
        -Math.cos(angle) * RING_RADIUS * 0.5,
      );

      const services = SERVICES.filter((s) => s.category === categoryId);
      services.forEach((service, si) => {
        const localAngle = (si / services.length) * Math.PI * 2 + ci;
        const localRadius = CLUSTER_JITTER * (0.55 + 0.45 * Math.sin(si * 2.3));
        const pos: [number, number, number] = [
          centroid.x + Math.cos(localAngle) * localRadius,
          centroid.y + Math.sin(si * 1.4) * 0.3,
          centroid.z + Math.sin(localAngle) * localRadius,
        ];
        nodes.push({ id: service.id, title: service.title, category: categoryId, color: meta.color, position: pos });
        links.push({ color: meta.color, points: [centroid.clone(), new THREE.Vector3(...pos)] });
      });
    });

    return { nodes, links };
  }, []);
}

function scrollToServiceCard(id: string) {
  document.getElementById(`service-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function OrbitNodes({
  nodes,
  reducedMotion,
  highlightCategory,
  hoveredIndex,
  onHover,
}: {
  nodes: ServiceNode[];
  reducedMotion: boolean;
  highlightCategory: string | null;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const delays = useMemo(() => nodes.map(() => Math.random() * BOOT_STAGGER), [nodes]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new THREE.Color();
    nodes.forEach((node, i) => {
      const dimmed = highlightCategory !== null && node.category !== highlightCategory;
      color.set(dimmed ? DIM_COLOR : node.color);
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodes, highlightCategory]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    nodes.forEach((node, i) => {
      const bootT = reducedMotion ? 1 : THREE.MathUtils.clamp((t - delays[i]) / BOOT_DURATION, 0, 1);
      const eased = 1 - Math.pow(1 - bootT, 3);
      const dimmed = highlightCategory !== null && node.category !== highlightCategory;
      const hoverBoost = i === hoveredIndex ? 1.4 : 1;
      const highlightScale = (dimmed ? 0.65 : 1) * hoverBoost;
      const bob = reducedMotion ? 0 : Math.sin(t * 0.9 + i * 1.2) * 0.05;
      dummy.position.set(node.position[0], node.position[1] + bob, node.position[2]);
      dummy.scale.setScalar(eased * highlightScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) onHover(e.instanceId);
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = () => {
    onHover(null);
    document.body.style.cursor = 'auto';
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) scrollToServiceCard(nodes[e.instanceId].id);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function OrbitLinks({
  links,
  highlightCategory,
}: {
  links: { color: string; points: [THREE.Vector3, THREE.Vector3] }[];
  highlightCategory: string | null;
}) {
  return (
    <>
      {links.map((link, i) => (
        <Line
          key={i}
          points={link.points}
          color={link.color}
          transparent
          opacity={highlightCategory === null ? 0.38 : 0.15}
          lineWidth={1}
        />
      ))}
    </>
  );
}

function HoverTooltip({ node }: { node: ServiceNode }) {
  return (
    <Html position={node.position} center style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
      <div className="max-w-[160px] whitespace-normal text-center rounded-lg border border-primary/25 bg-background/90 backdrop-blur-sm px-3 py-1.5 -translate-y-8 shadow-[0_0_20px_hsla(152,76%,46%,0.12)]">
        <div className="font-display text-[11px] font-bold leading-snug text-foreground">{node.title}</div>
      </div>
    </Html>
  );
}

function Scene({ reducedMotion, highlightCategory }: { reducedMotion: boolean; highlightCategory: string | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, links } = useOrbitLayout();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <>
      {!reducedMotion && <PointerCameraRig strength={0.25} />}
      <group ref={groupRef}>
        <OrbitLinks links={links} highlightCategory={highlightCategory} />
        <OrbitNodes
          nodes={nodes}
          reducedMotion={reducedMotion}
          highlightCategory={highlightCategory}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredIndex}
        />
        {hoveredIndex !== null && <HoverTooltip node={nodes[hoveredIndex]} />}
      </group>
    </>
  );
}

interface ServiceOrbitProps {
  activeCategory: string;
}

export default function ServiceOrbit({ activeCategory }: ServiceOrbitProps) {
  const reducedMotion = usePrefersReducedMotion();
  const highlightCategory = activeCategory === 'all' ? null : activeCategory;

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.6, 4.6], fov: 46, near: 0.1, far: 20 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <fog attach="fog" args={['#080c0a', 5, 10]} />
        <Scene reducedMotion={reducedMotion} highlightCategory={highlightCategory} />
      </Canvas>
    </div>
  );
}
