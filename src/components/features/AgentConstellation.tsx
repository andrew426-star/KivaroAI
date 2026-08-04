import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getSoftParticleTexture } from '@/lib/three/softParticleTexture';
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

interface AgentLink {
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

// Ambient, non-interactive lattice-fill points — purely decorative texture
// that makes the scene read as a dense network rather than a handful of
// isolated clusters, the way Meuze's own node graph mixes bold hub nodes
// with a much denser field of small connector points. These carry no
// meaning of their own — never labeled, never clickable — so adding them
// doesn't invent any claim about real relationships.
const FILLER_COUNT = 50;
const FILLER_MAX_LINK_DIST = 0.85;
const FILLER_COLOR = '#3adfad';

function useConstellationLayout() {
  return useMemo(() => {
    const nodes: AgentNode[] = [];
    const links: AgentLink[] = [];
    const divisionCount = DIVISIONS.length;

    DIVISIONS.forEach((division, di) => {
      const angle = -ARC_SPAN / 2 + (di / (divisionCount - 1)) * ARC_SPAN;
      const centroid = new THREE.Vector3(
        Math.sin(angle) * RING_RADIUS,
        Math.cos(di * 1.7) * 0.35,
        -Math.cos(angle) * RING_RADIUS * 0.55,
      );

      const divisionNodes: AgentNode[] = [];
      division.agents.forEach((agent, ai) => {
        const localAngle = (ai / division.agents.length) * Math.PI * 2 + di;
        const localRadius = CLUSTER_JITTER * (0.6 + 0.4 * Math.sin(ai * 2.1));
        const pos: [number, number, number] = [
          centroid.x + Math.cos(localAngle) * localRadius,
          centroid.y + Math.sin(ai * 1.3) * 0.35,
          centroid.z + Math.sin(localAngle) * localRadius,
        ];
        divisionNodes.push({ id: agent.id, name: agent.name, role: agent.role, color: division.color, position: pos, divisionIndex: di, divisionId: division.id });
      });
      nodes.push(...divisionNodes);

      // Real, honest edges: every pair of agents within the same real
      // division — an actual full mesh, not a hub-and-spoke star to an
      // invisible centroid. No inter-division edges — different divisions
      // have no real data relationship to depict.
      for (let a = 0; a < divisionNodes.length; a++) {
        for (let b = a + 1; b < divisionNodes.length; b++) {
          links.push({
            color: division.color,
            points: [new THREE.Vector3(...divisionNodes[a].position), new THREE.Vector3(...divisionNodes[b].position)],
          });
        }
      }
    });

    // Bounding volume of the real layout, padded slightly, used to scatter
    // the ambient filler field around (not through) the real clusters.
    const bounds = nodes.reduce(
      (acc, n) => ({
        minX: Math.min(acc.minX, n.position[0]), maxX: Math.max(acc.maxX, n.position[0]),
        minY: Math.min(acc.minY, n.position[1]), maxY: Math.max(acc.maxY, n.position[1]),
        minZ: Math.min(acc.minZ, n.position[2]), maxZ: Math.max(acc.maxZ, n.position[2]),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity },
    );
    const pad = 0.5;
    const fillerPositions: THREE.Vector3[] = [];
    for (let i = 0; i < FILLER_COUNT; i++) {
      fillerPositions.push(new THREE.Vector3(
        THREE.MathUtils.randFloat(bounds.minX - pad, bounds.maxX + pad),
        THREE.MathUtils.randFloat(bounds.minY - pad * 1.4, bounds.maxY + pad * 1.4),
        THREE.MathUtils.randFloat(bounds.minZ - pad, bounds.maxZ + pad),
      ));
    }

    // Nearest-neighbor mesh among {real nodes + filler points} restricted
    // to a max distance, so filler edges stay local/organic instead of
    // drawing long lines across the whole scene.
    const anchorPositions = [...nodes.map((n) => new THREE.Vector3(...n.position)), ...fillerPositions];
    const fillerLinks: [THREE.Vector3, THREE.Vector3][] = [];
    fillerPositions.forEach((p, fi) => {
      const distances = anchorPositions
        .map((q, qi) => ({ qi, d: qi === nodes.length + fi ? Infinity : p.distanceTo(q) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      distances.forEach(({ qi, d }) => {
        if (d < FILLER_MAX_LINK_DIST) fillerLinks.push([p, anchorPositions[qi]]);
      });
    });

    return { nodes, links, fillerPositions, fillerLinks };
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

const CORE_RADIUS = 0.075;
const HALO_SCALE = 2.2;
const HALO_OPACITY = 0.18;
// The visible core shrank (0.13 -> 0.075) to fix the "blob" look, but a
// smaller sphere makes for a smaller, harder-to-hit raycast target too.
// A separate, larger, fully invisible hit-area mesh decouples "how big it
// looks" from "how big it's easy to click" — same technique a real button
// uses when its visible icon is smaller than its actual tap target.
const HIT_AREA_SCALE = 3.2;

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
  const coreRef = useRef<THREE.InstancedMesh>(null);
  const haloRef = useRef<THREE.InstancedMesh>(null);
  const hitAreaRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const delays = useMemo(() => nodes.map(() => Math.random() * BOOT_STAGGER), [nodes]);

  useLayoutEffect(() => {
    const color = new THREE.Color();
    [coreRef.current, haloRef.current].forEach((mesh) => {
      if (!mesh) return;
      nodes.forEach((node, i) => {
        color.set(node.color);
        mesh.setColorAt(i, color);
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [nodes]);

  useFrame((state) => {
    const core = coreRef.current;
    const halo = haloRef.current;
    const hitArea = hitAreaRef.current;
    if (!core || !halo || !hitArea) return;
    const t = state.clock.elapsedTime;
    nodes.forEach((node, i) => {
      const bootT = reducedMotion ? 1 : THREE.MathUtils.clamp((t - delays[i]) / BOOT_DURATION, 0, 1);
      const eased = 1 - Math.pow(1 - bootT, 3);
      const bob = reducedMotion ? 0 : Math.sin(t * 0.8 + i * 1.3) * 0.06;
      const hoverScale = i === hoveredIndex ? 1.5 : 1;
      dummy.position.set(node.position[0], node.position[1] + bob, node.position[2]);

      dummy.scale.setScalar(eased * hoverScale);
      dummy.updateMatrix();
      core.setMatrixAt(i, dummy.matrix);

      dummy.scale.setScalar(eased * hoverScale * HALO_SCALE);
      dummy.updateMatrix();
      halo.setMatrixAt(i, dummy.matrix);

      dummy.scale.setScalar(eased * hoverScale * HIT_AREA_SCALE);
      dummy.updateMatrix();
      hitArea.setMatrixAt(i, dummy.matrix);
    });
    core.instanceMatrix.needsUpdate = true;
    halo.instanceMatrix.needsUpdate = true;
    hitArea.instanceMatrix.needsUpdate = true;
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
    <>
      {/* Soft glow halo — purely visual, never intercepts pointer events */}
      <instancedMesh ref={haloRef} args={[undefined, undefined, nodes.length]} raycast={() => null}>
        <sphereGeometry args={[CORE_RADIUS, 12, 12]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={HALO_OPACITY} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      {/* Sharp core — purely visual, never intercepts pointer events */}
      <instancedMesh ref={coreRef} args={[undefined, undefined, nodes.length]} raycast={() => null}>
        <sphereGeometry args={[CORE_RADIUS, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* Invisible, generously-sized hit area — the real raycastable/
          hoverable/clickable target, decoupled from how small the node
          looks so shrinking the visible core doesn't shrink the tap target */}
      <instancedMesh
        ref={hitAreaRef}
        args={[undefined, undefined, nodes.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[CORE_RADIUS, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

function ConstellationLinks({ links }: { links: AgentLink[] }) {
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

function FillerField({ positions, links, reducedMotion }: { positions: THREE.Vector3[]; links: [THREE.Vector3, THREE.Vector3][]; reducedMotion: boolean }) {
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const positionArray = useMemo(() => {
    const arr = new Float32Array(positions.length * 3);
    positions.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return arr;
  }, [positions]);
  const linePositionArray = useMemo(() => {
    const arr = new Float32Array(links.length * 6);
    links.forEach(([a, b], i) => {
      arr[i * 6] = a.x; arr[i * 6 + 1] = a.y; arr[i * 6 + 2] = a.z;
      arr[i * 6 + 3] = b.x; arr[i * 6 + 4] = b.y; arr[i * 6 + 5] = b.z;
    });
    return arr;
  }, [links]);

  useFrame((state) => {
    const targetPointOpacity = 0.55;
    const targetLineOpacity = 0.12;
    if (reducedMotion) {
      if (pointsMaterialRef.current) pointsMaterialRef.current.opacity = targetPointOpacity;
      if (lineMaterialRef.current) lineMaterialRef.current.opacity = targetLineOpacity;
      return;
    }
    const fadeIn = THREE.MathUtils.clamp(state.clock.elapsedTime / 1.6, 0, 1);
    if (pointsMaterialRef.current) pointsMaterialRef.current.opacity = targetPointOpacity * fadeIn;
    if (lineMaterialRef.current) lineMaterialRef.current.opacity = targetLineOpacity * fadeIn;
  });

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positionArray, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMaterialRef}
          size={0.05}
          map={getSoftParticleTexture()}
          color={FILLER_COLOR}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositionArray, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMaterialRef} color={FILLER_COLOR} transparent opacity={0} depthWrite={false} />
      </lineSegments>
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
  const { nodes, links, fillerPositions, fillerLinks } = useConstellationLayout();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.06;
  });

  return (
    <>
      {!reducedMotion && <PointerCameraRig strength={0.3} />}
      <group ref={groupRef}>
        <FillerField positions={fillerPositions} links={fillerLinks} reducedMotion={reducedMotion} />
        <ConstellationLinks links={links} />
        <ConstellationNodes nodes={nodes} reducedMotion={reducedMotion} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} onSelectAgent={onSelectAgent} />
        {hoveredIndex !== null && <HoverTooltip node={nodes[hoveredIndex]} />}
      </group>
      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={0.9} radius={0.5} mipmapBlur />
      </EffectComposer>
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
