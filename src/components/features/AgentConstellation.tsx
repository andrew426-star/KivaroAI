import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DIVISIONS } from './AgentTeamSection';
import PointerCameraRig from './PointerCameraRig';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface AgentNode {
  id: string;
  name: string;
  role: string;
  color: string;
  position: [number, number, number];
  divisionIndex: number;
  divisionId: string;
}

interface DivisionLink {
  color: string;
  points: [THREE.Vector3, THREE.Vector3];
}

const RING_RADIUS = 2.15;
const CLUSTER_JITTER = 0.4;
// A full 360deg ring compresses badly when viewed from one fixed front
// camera — divisions positioned along the depth axis collapse toward the
// screen center. A shallow arc facing the camera keeps all 5 clusters
// spread left-to-right instead (verified empirically via real screenshots,
// not assumed).
const ARC_SPAN = (128 * Math.PI) / 180;
const BOOT_DURATION = 1.1;
const BOOT_STAGGER = 0.5;

function useConstellationLayout() {
  return useMemo(() => {
    const nodes: AgentNode[] = [];
    const links: DivisionLink[] = [];
    const divisionCount = DIVISIONS.length;

    DIVISIONS.forEach((division, di) => {
      const angle = -ARC_SPAN / 2 + (di / (divisionCount - 1)) * ARC_SPAN;
      const centroid = new THREE.Vector3(
        Math.sin(angle) * RING_RADIUS,
        Math.cos(di * 1.7) * 0.35,
        -Math.cos(angle) * RING_RADIUS * 0.55,
      );

      division.agents.forEach((agent, ai) => {
        const localAngle = (ai / division.agents.length) * Math.PI * 2 + di;
        const localRadius = CLUSTER_JITTER * (0.6 + 0.4 * Math.sin(ai * 2.1));
        const pos: [number, number, number] = [
          centroid.x + Math.cos(localAngle) * localRadius,
          centroid.y + Math.sin(ai * 1.3) * 0.35,
          centroid.z + Math.sin(localAngle) * localRadius,
        ];
        nodes.push({ id: agent.id, name: agent.name, role: agent.role, color: division.color, position: pos, divisionIndex: di, divisionId: division.id });
        links.push({
          color: division.color,
          points: [centroid.clone(), new THREE.Vector3(...pos)],
        });
      });
    });

    return { nodes, links };
  }, []);
}

// Clicking a node scrolls to the matching real 2D AgentCard (id="agent-{id}",
// added there for exactly this) rather than duplicating the agent's real
// data a second time in a 3D tooltip beyond name/role. On the single-page
// scrollytelling layout, that card only exists in the DOM when its division
// tab is active — callers pass onSelectAgent to switch tabs first.
function scrollToAgentCard(id: string) {
  document.getElementById(`agent-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function ConstellationNodes({
  nodes,
  reducedMotion,
  hoveredIndex,
  onHover,
  onSelectAgent,
}: {
  nodes: AgentNode[];
  reducedMotion: boolean;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  onSelectAgent?: (agentId: string, divisionId: string) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const delays = useMemo(() => nodes.map(() => Math.random() * BOOT_STAGGER), [nodes]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new THREE.Color();
    nodes.forEach((node, i) => {
      color.set(node.color);
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodes]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    nodes.forEach((node, i) => {
      const bootT = reducedMotion ? 1 : THREE.MathUtils.clamp((t - delays[i]) / BOOT_DURATION, 0, 1);
      const eased = 1 - Math.pow(1 - bootT, 3);
      const bob = reducedMotion ? 0 : Math.sin(t * 0.8 + i * 1.3) * 0.06;
      const hoverScale = i === hoveredIndex ? 1.5 : 1;
      dummy.position.set(node.position[0], node.position[1] + bob, node.position[2]);
      dummy.scale.setScalar(eased * hoverScale);
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
    if (e.instanceId === undefined) return;
    const node = nodes[e.instanceId];
    if (onSelectAgent) onSelectAgent(node.id, node.divisionId);
    else scrollToAgentCard(node.id);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function ConstellationLinks({ links }: { links: DivisionLink[] }) {
  return (
    <>
      {links.map((link, i) => (
        <Line
          key={i}
          points={link.points}
          color={link.color}
          transparent
          opacity={0.4}
          lineWidth={1.2}
        />
      ))}
    </>
  );
}

function HoverTooltip({ node }: { node: AgentNode }) {
  return (
    <Html position={node.position} center style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
      <div className="whitespace-nowrap rounded-lg border border-primary/25 bg-background/90 backdrop-blur-sm px-3 py-1.5 -translate-y-8 text-center shadow-[0_0_20px_hsla(152,76%,46%,0.12)]">
        <div className="font-display text-xs font-bold text-foreground">{node.name}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{node.role}</div>
      </div>
    </Html>
  );
}

function Scene({ reducedMotion, onSelectAgent }: { reducedMotion: boolean; onSelectAgent?: (agentId: string, divisionId: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, links } = useConstellationLayout();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.06;
  });

  return (
    <>
      {!reducedMotion && <PointerCameraRig strength={0.3} />}
      <group ref={groupRef}>
        <ConstellationLinks links={links} />
        <ConstellationNodes nodes={nodes} reducedMotion={reducedMotion} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} onSelectAgent={onSelectAgent} />
        {hoveredIndex !== null && <HoverTooltip node={nodes[hoveredIndex]} />}
      </group>
    </>
  );
}

interface AgentConstellationProps {
  onSelectAgent?: (agentId: string, divisionId: string) => void;
}

export default function AgentConstellation({ onSelectAgent }: AgentConstellationProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.85, 5.2], fov: 48, near: 0.1, far: 20 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <fog attach="fog" args={['#080c0a', 5, 11]} />
        <Scene reducedMotion={reducedMotion} onSelectAgent={onSelectAgent} />
      </Canvas>
    </div>
  );
}
