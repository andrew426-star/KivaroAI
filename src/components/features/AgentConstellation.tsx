import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getSoftParticleTexture } from '@/lib/three/softParticleTexture';
import { DIVISIONS } from './AgentTeamSection';
import PointerCameraRig from './PointerCameraRig';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useElementInViewport } from '@/hooks/useElementInViewport';

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
  color: THREE.Color;
  aIndex: number;
  bIndex: number;
}

interface ClusterCentroid {
  position: THREE.Vector3;
  color: string;
  size: number;
}

// Cursor-anchored, plain-DOM tooltip data — deliberately not drei's <Html>
// (a 3D-anchored portal). Html's per-frame position writes raced with
// R3F's own canvas resize/render cycle here and intermittently blanked
// the whole scene for as long as a node stayed hovered (confirmed via
// repeated real-browser diagnostics — a DOM/React-only div positioned
// from the pointer event's own clientX/clientY sidesteps that path
// entirely, at the cost of following the cursor rather than the node).
interface HoverTooltipData {
  name: string;
  role: string;
  x: number;
  y: number;
}

const RING_RADIUS = 2.15;
const CLUSTER_JITTER = 0.4;
const DEPTH_JITTER = 0.85; // real per-agent z-depth spread — "positioned at different depths... not flat on one plane"
// A full 360deg ring compresses badly when viewed from one fixed front
// camera — divisions positioned along the depth axis collapse toward the
// screen center. A shallow arc facing the camera keeps all 5 clusters
// spread left-to-right instead (verified empirically via real screenshots,
// not assumed).
const ARC_SPAN = (128 * Math.PI) / 180;
const BOOT_DURATION = 1.1;
const BOOT_STAGGER = 0.5;

// Ambient, non-interactive starfield points — purely decorative texture
// that fills out the scene without inventing any claim about real
// relationships. Deliberately NOT connected by edges to each other or to
// real nodes: an earlier pass linked nearby points via nearest-neighbor,
// which produced sparse, arbitrary-looking triangles spanning empty space
// — reading as random "connect the dots" noise rather than an intentional
// network. Real structure lives entirely in ConstellationLinks below,
// which only connects agents who are actually real teammates.
const FILLER_COUNT = 50;
const FILLER_COLOR = '#3adfad';

function useConstellationLayout() {
  return useMemo(() => {
    const nodes: AgentNode[] = [];
    const links: AgentLink[] = [];
    const clusters: ClusterCentroid[] = [];
    const divisionCount = DIVISIONS.length;

    DIVISIONS.forEach((division, di) => {
      const angle = -ARC_SPAN / 2 + (di / (divisionCount - 1)) * ARC_SPAN;
      const centroid = new THREE.Vector3(
        Math.sin(angle) * RING_RADIUS,
        Math.cos(di * 1.7) * 0.35,
        -Math.cos(angle) * RING_RADIUS * 0.55,
      );
      clusters.push({ position: centroid, color: division.color, size: division.agents.length });

      const startIndex = nodes.length;
      division.agents.forEach((agent, ai) => {
        const localAngle = (ai / division.agents.length) * Math.PI * 2 + di;
        const localRadius = CLUSTER_JITTER * (0.6 + 0.4 * Math.sin(ai * 2.1));
        const pos: [number, number, number] = [
          centroid.x + Math.cos(localAngle) * localRadius,
          centroid.y + Math.sin(ai * 1.3) * 0.35,
          centroid.z + Math.sin(localAngle) * localRadius + (Math.sin(ai * 3.7 + di) * DEPTH_JITTER),
        ];
        nodes.push({ id: agent.id, name: agent.name, role: agent.role, color: division.color, position: pos, divisionIndex: di, divisionId: division.id });
      });

      // Real, honest edges: every pair of agents within the same real
      // division — an actual full mesh, not a hub-and-spoke star to an
      // invisible centroid. No inter-division edges — different divisions
      // have no real data relationship to depict.
      const color = new THREE.Color(division.color);
      for (let a = startIndex; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          links.push({ color, aIndex: a, bIndex: b });
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

    return { nodes, links, clusters, fillerPositions };
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
  onHover: (index: number | null, clientX?: number, clientY?: number) => void;
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
    if (e.instanceId !== undefined) onHover(e.instanceId, e.clientX, e.clientY);
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

const PULSE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const PULSE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uBrightness;
  varying vec2 vUv;
  void main() {
    float pulse = pow(max(0.0, 1.0 - abs(fract(vUv.y - uTime * 0.35) - 0.5) * 2.0), 3.0);
    float alpha = (0.12 + pulse * 0.85) * uBrightness;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// A real tapered tube (cone-like cylinder, thin at one end / thicker at
// the other) between two real teammates, with a brightness-modulated
// traveling pulse of light — "data physically moving between agents,"
// not a flat static line.
function PulseBeam({ start, end, color, active }: { start: THREE.Vector3; end: THREE.Vector3; color: THREE.Color; active: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { midpoint, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { midpoint: mid, quaternion: quat, length: len };
  }, [start, end]);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    const target = active ? 2.2 : 1;
    mat.uniforms.uBrightness.value = THREE.MathUtils.lerp(mat.uniforms.uBrightness.value, target, 0.08);
  });

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: color }, uBrightness: { value: 1 } }), [color]);

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.005, 0.012, length, 6, 1, true]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={PULSE_VERTEX}
        fragmentShader={PULSE_FRAGMENT}
        toneMapped={false}
      />
    </mesh>
  );
}

function ConstellationLinks({ links, nodes, hoveredIndex }: { links: AgentLink[]; nodes: AgentNode[]; hoveredIndex: number | null }) {
  return (
    <>
      {links.map((link, i) => (
        <PulseBeam
          key={i}
          start={new THREE.Vector3(...nodes[link.aIndex].position)}
          end={new THREE.Vector3(...nodes[link.bIndex].position)}
          color={link.color}
          active={hoveredIndex === link.aIndex || hoveredIndex === link.bIndex}
        />
      ))}
    </>
  );
}

let nebulaTexture: THREE.CanvasTexture | null = null;

// getSoftParticleTexture()'s gradient is tuned for small bright particle
// dots (a hard-ish core, steep falloff) — reused at nebula scale, Bloom
// picks up that brighter core and blooms it into a visibly hard-edged
// circle instead of a diffuse haze. A much gentler, core-less gradient
// (dim even at center) reads as atmosphere instead.
function getNebulaTexture(): THREE.CanvasTexture {
  if (nebulaTexture) return nebulaTexture;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.45)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.06)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  nebulaTexture = new THREE.CanvasTexture(canvas);
  return nebulaTexture;
}

// A soft-edged glow field behind each division cluster — "like a nebula
// cluster" tying the group together visually, sized by its real member
// count (a bigger real division reads as a bigger glow field, not an
// arbitrary size).
function ClusterNebula({ clusters }: { clusters: ClusterCentroid[] }) {
  const texture = useMemo(() => getNebulaTexture(), []);
  return (
    <>
      {clusters.map((c, i) => (
        <sprite key={i} position={c.position} scale={[1.8 + c.size * 0.45, 1.8 + c.size * 0.45, 1]}>
          <spriteMaterial map={texture} color={c.color} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
    </>
  );
}

function FillerField({ positions, reducedMotion }: { positions: THREE.Vector3[]; reducedMotion: boolean }) {
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  const positionArray = useMemo(() => {
    const arr = new Float32Array(positions.length * 3);
    positions.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return arr;
  }, [positions]);

  useFrame((state) => {
    const targetOpacity = 0.5;
    if (!pointsMaterialRef.current) return;
    if (reducedMotion) {
      pointsMaterialRef.current.opacity = targetOpacity;
      return;
    }
    const fadeIn = THREE.MathUtils.clamp(state.clock.elapsedTime / 1.6, 0, 1);
    pointsMaterialRef.current.opacity = targetOpacity * fadeIn;
  });

  return (
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
  );
}

function Scene({
  reducedMotion,
  onSelectAgent,
  onHoverChange,
}: {
  reducedMotion: boolean;
  onSelectAgent?: (agentId: string, divisionId: string) => void;
  onHoverChange: (tooltip: HoverTooltipData | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, links, clusters, fillerPositions } = useConstellationLayout();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleHover = (index: number | null, clientX?: number, clientY?: number) => {
    setHoveredIndex(index);
    if (index === null || clientX === undefined || clientY === undefined) {
      onHoverChange(null);
    } else {
      const node = nodes[index];
      onHoverChange({ name: node.name, role: node.role, x: clientX, y: clientY });
    }
  };

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.06;
  });

  return (
    <>
      {!reducedMotion && (
        <PointerCameraRig
          strength={0.3}
          hoverTarget={hoveredIndex !== null ? nodes[hoveredIndex].position : null}
          hoverPull={0.0025}
        />
      )}
      {!reducedMotion && (
        <Sparkles count={140} scale={[6, 4, 5]} size={1.6} speed={0.08} opacity={0.22} color={FILLER_COLOR} noise={0.6} />
      )}
      <group ref={groupRef}>
        <ClusterNebula clusters={clusters} />
        <FillerField positions={fillerPositions} reducedMotion={reducedMotion} />
        <ConstellationLinks links={links} nodes={nodes} hoveredIndex={hoveredIndex} />
        <ConstellationNodes nodes={nodes} reducedMotion={reducedMotion} hoveredIndex={hoveredIndex} onHover={handleHover} onSelectAgent={onSelectAgent} />
      </group>
      <EffectComposer>
        {/* Same class of bug as the hero instrument's first pass: focusDistance
            is normalized [0,1] across the camera's near..far range (0.1..20
            here), not world units. The real agent nodes sit roughly 5.5-6
            world units from the camera, so 0.045 (almost at the camera)
            blurred the whole cluster into mush. ~0.28 puts the focus plane
            on the cluster itself; a wider focalLength keeps most of the
            depth-jittered nodes readably sharp, only the furthest genuinely
            soften. */}
        <DepthOfField focusDistance={0.28} focalLength={0.25} bokehScale={1.6} height={480} />
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
  // See HeroScene.tsx's matching fix for why this matters here specifically
  // — with both this scene and the hero's Instrument running full Bloom+
  // DepthOfField every frame regardless of scroll position (every section
  // stays mounted on this single-page site), the combined GPU/main-thread
  // load was empirically heavy enough to starve other pages' rAF-driven
  // animations (StatCounter/RadialGauge stuck at their starting value even
  // after 8 real seconds in view). Pausing whichever scene is currently
  // off-screen fixes both the waste and the starvation.
  const [viewportRef, inViewport] = useElementInViewport<HTMLDivElement>();
  const [tooltip, setTooltip] = useState<HoverTooltipData | null>(null);

  return (
    <div ref={viewportRef} className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.85, 5.2], fov: 48, near: 0.1, far: 20 }}
        frameloop={reducedMotion || !inViewport ? 'demand' : 'always'}
      >
        <fog attach="fog" args={['#080c0a', 5, 11]} />
        <Scene reducedMotion={reducedMotion} onSelectAgent={onSelectAgent} onHoverChange={setTooltip} />
      </Canvas>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-lg border border-primary/25 bg-background/90 backdrop-blur-sm px-3 py-1.5 text-center shadow-[0_0_20px_hsla(152,76%,46%,0.12)]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-display text-xs font-bold text-foreground">{tooltip.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{tooltip.role}</div>
        </div>
      )}
    </div>
  );
}
