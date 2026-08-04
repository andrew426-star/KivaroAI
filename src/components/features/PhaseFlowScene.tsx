import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PHASE_FLOWS, type FlowNode, type FlowEdge } from '@/constants/processFlows';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const WIDTH = 6.4;
const HEIGHT = 3.6;

// Real depth per node type — source pulled back, output pulled forward —
// so switching from the flat 2D canvas to 3D adds genuine depth rather
// than a shader wrapped around the same flat layout.
const TYPE_DEPTH: Record<FlowNode['type'], number> = {
  source: -0.7,
  process: 0,
  gate: 0.25,
  output: 0.7,
  feedback: -0.35,
};

const TYPE_COLOR: Record<FlowNode['type'], string> = {
  source: '#1cce7b',
  process: '#28b96a',
  gate: '#e0b23c',
  output: '#a5e830',
  feedback: '#3ac0e0',
};

function toWorld(node: FlowNode): [number, number, number] {
  return [(node.x / 100 - 0.5) * WIDTH, (0.5 - node.y / 100) * HEIGHT, TYPE_DEPTH[node.type]];
}

// Same cubic-bezier math as the original 2D canvas diagram, evaluated
// against 3D control points instead of 2D ones.
function bezierPoint(t: number, p0: THREE.Vector3, cp1: THREE.Vector3, cp2: THREE.Vector3, p3: THREE.Vector3, out: THREE.Vector3) {
  const mt = 1 - t;
  out.x = mt * mt * mt * p0.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * p3.x;
  out.y = mt * mt * mt * p0.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * p3.y;
  out.z = mt * mt * mt * p0.z + 3 * mt * mt * t * cp1.z + 3 * mt * t * t * cp2.z + t * t * t * p3.z;
  return out;
}

function NodeMesh({ node, reducedMotion, index }: { node: FlowNode; reducedMotion: boolean; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const [x, y, z] = toWorld(node);
  const color = TYPE_COLOR[node.type];

  useFrame((state) => {
    if (!ref.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    ref.current.scale.setScalar(Math.sin(t * 1.8 + index * 1.1) * 0.08 + 0.92);
  });

  return (
    <group position={[x, y, z]}>
      <mesh ref={ref}>
        {node.type === 'gate' ? (
          <octahedronGeometry args={[0.16, 0]} />
        ) : node.type === 'output' ? (
          <boxGeometry args={[0.24, 0.17, 0.1]} />
        ) : (
          <sphereGeometry args={[0.13, 16, 16]} />
        )}
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.85} />
      </mesh>
      <Text position={[0, -0.24, 0]} fontSize={0.085} color="#e3f5ea" anchorX="center" anchorY="top" maxWidth={1.5} textAlign="center">
        {node.label}
      </Text>
      {node.sublabel && (
        <Text position={[0, -0.4, 0]} fontSize={0.058} color="#8fae9c" anchorX="center" anchorY="top" maxWidth={1.5} textAlign="center">
          {node.sublabel}
        </Text>
      )}
    </group>
  );
}

function EdgeLine({
  edge,
  nodeMap,
  index,
  reducedMotion,
}: {
  edge: FlowEdge;
  nodeMap: Map<string, FlowNode>;
  index: number;
  reducedMotion: boolean;
}) {
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);
  const particleRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (!from || !to) return null;
    const p0 = new THREE.Vector3(...toWorld(from));
    const p3 = new THREE.Vector3(...toWorld(to));
    const cp1 = new THREE.Vector3(p0.x + (p3.x - p0.x) * 0.45, p0.y, (p0.z + p3.z) / 2);
    const cp2 = new THREE.Vector3(p0.x + (p3.x - p0.x) * 0.55, p3.y, (p0.z + p3.z) / 2);
    const points: THREE.Vector3[] = [];
    const tmp = new THREE.Vector3();
    for (let i = 0; i <= 24; i++) points.push(bezierPoint(i / 24, p0, cp1, cp2, p3, tmp).clone());
    const mid = bezierPoint(0.5, p0, cp1, cp2, p3, tmp).clone();
    return { p0, cp1, cp2, p3, points, mid };
  }, [from, to]);

  useFrame((state) => {
    if (!particleRef.current || !geometry || reducedMotion) return;
    const t = state.clock.elapsedTime;
    const speed = 0.35 + index * 0.05;
    const pt = (t * speed + index * 0.4) % 1;
    const pos = bezierPoint(pt, geometry.p0, geometry.cp1, geometry.cp2, geometry.p3, new THREE.Vector3());
    particleRef.current.position.copy(pos);
  });

  if (!geometry) return null;

  return (
    <>
      <Line
        points={geometry.points}
        color="#3adfad"
        transparent
        opacity={edge.style === 'dashed' ? 0.15 : 0.32}
        lineWidth={1}
        dashed={edge.style === 'dashed'}
        dashSize={0.08}
        gapSize={0.06}
      />
      {!reducedMotion && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#8ef0c4" toneMapped={false} />
        </mesh>
      )}
      {edge.label && (
        <Text position={geometry.mid.toArray()} fontSize={0.055} color="#5fd99a" anchorX="center" anchorY="bottom">
          {edge.label}
        </Text>
      )}
    </>
  );
}

function Scene({ phaseId, reducedMotion }: { phaseId: number; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const flow = PHASE_FLOWS[phaseId] || PHASE_FLOWS[1];
  const nodeMap = useMemo(() => new Map(flow.nodes.map((n) => [n.id, n])), [flow]);

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {flow.edges.map((edge, i) => (
        <EdgeLine key={`${edge.from}-${edge.to}-${i}`} edge={edge} nodeMap={nodeMap} index={i} reducedMotion={reducedMotion} />
      ))}
      {flow.nodes.map((node, i) => (
        <NodeMesh key={node.id} node={node} reducedMotion={reducedMotion} index={i} />
      ))}
    </group>
  );
}

export default function PhaseFlowScene({ phaseId }: { phaseId: number }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="w-full h-[200px] lg:h-[260px]">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <Scene phaseId={phaseId} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
