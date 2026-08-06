import { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Billboard, Line, Sparkles, Text } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { forceSimulation, forceManyBody, forceLink, forceCollide, forceX, forceY, type SimulationNodeDatum } from 'd3-force';
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

const BOOT_DURATION = 1.1;
const BOOT_STAGGER = 0.5;

// Round 2: the hand-placed arc layout (sin/cos around a shared ring
// radius) kept re-collapsing into one compressed central cluster —
// nothing was actually pushing unrelated divisions apart, it just placed
// them at fixed angles that happened to project close together from the
// fixed front camera. Replaced with a real force-directed layout: mutual
// node repulsion (charge) + real link attraction (only between actual
// teammates) + collision (no overlap) + a per-division X/Y pull toward a
// spread-out home position — same technique the brief's own
// implementation note describes ("feed it force-simulated positions").
// The simulation runs synchronously to convergence once at layout time
// (not per-frame) — "let the simulation settle once on load," not a
// continuously-recomputed live simulation, which would read as chaotic
// float rather than an organized, settled constellation.
interface SimNode extends SimulationNodeDatum {
  divisionIndex: number;
}

const DIVISION_COUNT = DIVISIONS.length;
// Reduced from 7.4 (and the homing force below strengthened) — at the
// wider spread, mutual node repulsion pushed cluster averages ~0.5 units
// past their own target X, and individual nodes further still, putting
// the outermost cluster's nodes close enough to the edge to clip during
// hover/parallax. This keeps the "spread across the full width, not
// compressed" read from the previous pass while adding real margin.
const CLUSTER_SPREAD_X = 6.6;
// Hand-tuned per-division Y/Z offsets — not derived from division size or
// order. Y gives clusters a little vertical variety instead of sitting on
// one dead-level line; Z is the depth separation Round 2 explicitly asked
// for — one cluster sits forward, another recedes, rather than every
// division living on the same flat plane.
const CLUSTER_TARGET_Y = [0.35, -0.42, 0.55, -0.5, 0.3];
const CLUSTER_TARGET_Z = [1.05, -0.85, 0.5, -1.35, 0.8];
// Small per-node jitter on top of the cluster's own Z — organic texture,
// not the primary source of depth separation anymore (that's
// CLUSTER_TARGET_Z + the force layout itself), so this is deliberately
// smaller than the original hand-placed version's depth spread.
const NODE_DEPTH_JITTER = 0.4;
// Leader-line length from a node out to its label anchor — "annotated
// star chart" register, a short stub rather than a long pointer line.
const LABEL_LEADER_LENGTH = 0.26;

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
    interface AgentMeta {
      id: string;
      name: string;
      role: string;
      color: string;
      divisionIndex: number;
      divisionId: string;
    }
    const meta: AgentMeta[] = [];
    const simNodes: SimNode[] = [];
    const linkPairs: { aIndex: number; bIndex: number }[] = [];

    DIVISIONS.forEach((division, di) => {
      const startIndex = simNodes.length;
      division.agents.forEach((agent) => {
        simNodes.push({ divisionIndex: di });
        meta.push({ id: agent.id, name: agent.name, role: agent.role, color: division.color, divisionIndex: di, divisionId: division.id });
      });
      // Real, honest edges: every pair of agents within the same real
      // division — an actual full mesh, not a hub-and-spoke star to an
      // invisible centroid. No inter-division edges — different divisions
      // have no real data relationship to depict.
      for (let a = startIndex; a < simNodes.length; a++) {
        for (let b = a + 1; b < simNodes.length; b++) {
          linkPairs.push({ aIndex: a, bIndex: b });
        }
      }
    });

    const clusterTargetX = Array.from({ length: DIVISION_COUNT }, (_, i) =>
      -CLUSTER_SPREAD_X / 2 + (i / (DIVISION_COUNT - 1)) * CLUSTER_SPREAD_X,
    );

    // d3-force's defaults assume a "pixel-scale" coordinate system (typical
    // examples run charge strengths of -30 to -300 across node distances of
    // 50-100+). This scene works in single-digit world units, and a charge
    // anywhere near that pixel-scale range creates enormous inverse-square
    // repulsion at these tiny distances — confirmed via a standalone
    // simulation dry-run (charge -2.4 blew every cluster apart into a
    // chaotic ±12-unit scatter before the weak homing force could ever
    // catch up). These values were tuned by literally running the
    // simulation standalone and comparing each cluster's converged
    // position/spread against its target, not guessed.
    const simulation = forceSimulation(simNodes)
      .force('charge', forceManyBody().strength(-0.05))
      .force('link', forceLink(linkPairs.map((p) => ({ source: p.aIndex, target: p.bIndex }))).distance(0.7).strength(0.8))
      .force('collide', forceCollide(0.3))
      // Strengthened from 0.25 — at that value clusters settled ~0.5 units
      // past their own target X (confirmed via the same standalone dry-run
      // technique above), which is what let the outermost cluster's nodes
      // drift close enough to the frame edge to clip. A firmer home pull
      // keeps clusters closer to their intended spread positions.
      .force('x', forceX<SimNode>((d) => clusterTargetX[d.divisionIndex]).strength(0.6))
      .force('y', forceY<SimNode>((d) => CLUSTER_TARGET_Y[d.divisionIndex]).strength(0.6))
      .stop();
    for (let i = 0; i < 300; i++) simulation.tick();

    const nodes: AgentNode[] = simNodes.map((sn, i) => {
      const m = meta[i];
      const z = CLUSTER_TARGET_Z[m.divisionIndex] + Math.sin(i * 3.7 + m.divisionIndex) * NODE_DEPTH_JITTER;
      return {
        id: m.id,
        name: m.name,
        role: m.role,
        color: m.color,
        position: [sn.x ?? clusterTargetX[m.divisionIndex], sn.y ?? CLUSTER_TARGET_Y[m.divisionIndex], z],
        divisionIndex: m.divisionIndex,
        divisionId: m.divisionId,
      };
    });

    const links: AgentLink[] = linkPairs.map((p) => ({
      color: new THREE.Color(meta[p.aIndex].color),
      aIndex: p.aIndex,
      bIndex: p.bIndex,
    }));

    const clusters: ClusterCentroid[] = DIVISIONS.map((division, di) => {
      const divisionNodes = nodes.filter((n) => n.divisionIndex === di);
      const centroid = divisionNodes
        .reduce((acc, n) => acc.add(new THREE.Vector3(...n.position)), new THREE.Vector3())
        .divideScalar(divisionNodes.length || 1);
      return { position: centroid, color: division.color, size: division.agents.length };
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

// Deliberately dim, not a bright near-white — Bloom's luminance threshold
// (0.15, tuned for the scene's glowing nodes/beams) picked up full-bright
// label text and gave it a glow halo large enough to visually dwarf its
// actual geometry, confirmed via a real screenshot of a single close-up
// label reading many times larger than its neighbors despite the scale
// clamp below already capping its real size difference at 1.4x.
const LABEL_COLOR = '#9fc9b8';
// Without an explicit `font`, drei's <Text> (troika-three-text) falls back
// to a runtime font-resolution service (unicode-font-resolver) that chains
// several sequential fetches to a third-party CDN before any glyph can
// render — confirmed via real network-request logging. Self-hosting the
// one weight actually used here removes that dependency entirely.
// Deliberately WOFF (v1), not WOFF2: troika-three-text bundles its own
// woff2otf converter that explicitly only supports WOFF1 — a WOFF2 file
// throws "woff2 fonts not supported" and the font never syncs (confirmed
// via a real console error), regardless of how long you wait for it.
const LABEL_FONT = '/fonts/jetbrains-mono-400.woff';

// Round 2 explicitly asked for legible persistent labels back — "like an
// annotated star chart": a short leader line from the node out to a label
// anchor, with the name sitting in clear space beside it, rather than name
// text competing for the exact same pixels as the glowing node itself.
// Deliberately drei's <Text> (SDF, pure WebGL) + <Billboard>, not <Html> —
// <Html> is a real DOM portal, and its per-frame position writes are what
// caused the intermittent full-scene blank-out fixed earlier this session.
// <Billboard> keeps the text facing the camera even as the constellation's
// outer group slowly rotates; the leader line itself is a normal 3D line
// so it stays visually attached to its node through that rotation.
// World-space-sized Text at real, meaningfully-varied node depths (the
// depth separation Round 2 explicitly asked for) means a node that
// happens to sit unusually close to the camera — including one the
// camera is easing toward on hover — can render its label at an
// illegibly huge size from pure perspective, confirmed via a real
// screenshot of a hovered node's label dwarfing the rest of the scene.
// Countering perspective completely would look flat/wrong for a scene
// that's supposed to have real depth; clamping the correction instead
// keeps some "closer reads bigger" depth cue while capping how extreme
// it's allowed to get.
const LABEL_REFERENCE_DISTANCE = 5.5;
const LABEL_MIN_SCALE = 0.8;
const LABEL_MAX_SCALE = 1.15;

function NodeLabel({ node, clusterCentroid }: { node: AgentNode; clusterCentroid: THREE.Vector3 }) {
  // drei's <Text> (troika-three-text) renders a transient, wrongly-scaled
  // placeholder mesh for the first frame or two while its font is still
  // being parsed/laid out on a worker thread — confirmed via real
  // screenshots showing a couple of labels rendering briefly gigantic
  // before snapping to their correct size a few seconds in. onSync fires
  // once that first real layout is ready; staying invisible until then
  // avoids the flash entirely instead of just masking it with a fade.
  const [synced, setSynced] = useState(false);
  const scaleGroupRef = useRef<THREE.Group>(null);

  const { anchor, points } = useMemo(() => {
    const nodePos = new THREE.Vector3(...node.position);
    const away = nodePos.clone().sub(clusterCentroid);
    if (away.lengthSq() < 0.0001) away.set(0, 1, 0);
    away.normalize().multiplyScalar(LABEL_LEADER_LENGTH);
    const labelAnchor = nodePos.clone().add(away);
    return { anchor: labelAnchor, points: [nodePos, labelAnchor] as [THREE.Vector3, THREE.Vector3] };
  }, [node, clusterCentroid]);

  useFrame((state) => {
    const group = scaleGroupRef.current;
    if (!group) return;
    const distance = state.camera.position.distanceTo(anchor);
    const scale = THREE.MathUtils.clamp(LABEL_REFERENCE_DISTANCE / distance, LABEL_MIN_SCALE, LABEL_MAX_SCALE);
    group.scale.setScalar(scale);
  });

  return (
    <>
      <Line points={points} color={LABEL_COLOR} transparent opacity={synced ? 0.32 : 0} lineWidth={0.75} />
      <group ref={scaleGroupRef} position={anchor}>
        <Billboard visible={synced}>
          <Text
            font={LABEL_FONT}
            fontSize={0.1}
            color={LABEL_COLOR}
            fillOpacity={0.75}
            outlineWidth={0.004}
            outlineColor="#050a08"
            outlineOpacity={0.7}
            anchorX="left"
            anchorY="middle"
            position={[0.03, 0, 0]}
            onSync={() => setSynced(true)}
          >
            {node.name}
          </Text>
        </Billboard>
      </group>
    </>
  );
}

function NodeLabels({ nodes, clusters }: { nodes: AgentNode[]; clusters: ClusterCentroid[] }) {
  return (
    <>
      {nodes.map((node) => (
        <NodeLabel key={node.id} node={node} clusterCentroid={clusters[node.divisionIndex].position} />
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

  // A continuous, unbounded rotation (the old `+= delta * speed`) will
  // eventually swing the widest-spread clusters far enough around that
  // they exit the camera's frame — confirmed visually on the live site.
  // A bounded sway (sin, clamped amplitude) keeps the same "alive, slowly
  // turning" feel while guaranteeing every node's worst-case screen
  // position stays within the tested, safe composition.
  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.06) * 0.12;
  });

  return (
    <>
      {!reducedMotion && (
        <PointerCameraRig
          strength={0.18}
          hoverTarget={hoveredIndex !== null ? nodes[hoveredIndex].position : null}
          hoverPull={0.0025}
          maxOffset={0.6}
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
        {/* drei's <Text> suspends on its font promise — scoping Suspense to
            just the labels (rather than relying on the outer lazy-load
            boundary in Section02Agents.tsx) means a slow/uncached font
            fetch only ever delays the labels themselves, never the
            nodes/links/nebula sitting outside this boundary. */}
        <Suspense fallback={null}>
          <NodeLabels nodes={nodes} clusters={clusters} />
        </Suspense>
      </group>
      <EffectComposer>
        {/* focusDistance is normalized [0,1] across the camera's near..far
            range (0.1..20 here), not world units — 0.28 puts the focus
            plane on the cluster itself. Round 3: the depth-of-field blur
            and bloom spread were reading as soft/hazy rather than sharp —
            a much wider focalLength (bigger in-focus range) and lower
            bokehScale (less blur magnitude even outside it) keeps far-
            depth nodes readable instead of mushy, and a tighter bloom
            radius/intensity keeps glow from smearing edges. */}
        <DepthOfField focusDistance={0.28} focalLength={0.45} bokehScale={0.7} height={480} />
        <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.85} intensity={0.75} radius={0.4} mipmapBlur />
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
        camera={{ position: [0, 0.85, 5.7], fov: 48, near: 0.1, far: 20 }}
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
