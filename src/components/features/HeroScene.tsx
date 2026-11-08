import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Hero scene: "reading the deal." A wide terrain of data points (the
// documents, numbers and filings a deal team reads by hand) undulates
// slowly; a scan beam sweeps across it, lighting each point it passes and
// leaving a fading trail, and citation markers rise and pulse as the beam
// reaches them — every figure traced back to its source.
//
// Everything that moves per point runs in the vertex shader off a single
// time uniform, so the CPU only touches ~16 markers a frame. That is what
// lets the point count go up ~100x over the previous ring/candlestick
// scene (which animated its dust on the CPU and dropped to ~4fps) while
// dropping the depth-of-field pass that made it read soft.

const GRID_X = 240;
const GRID_Z = 100;
const SPAN_X = 22;
const SPAN_Z = 11;
const Z_OFFSET = -3.2;
// The beam sweeps only the part of the terrain not under the hero copy.
const SCAN_PERIOD = 7; // seconds per sweep
const SCAN_FROM = -2.5;
const SCAN_TO = 12.5;
const DUST_COUNT = 420;
// Reduced motion renders one still frame, with the beam parked mid-sweep.
const STILL_TIME = 4.1;

// Shared by the GLSL and the CPU marker placement: keep the two in step.
const HEIGHT_GLSL = /* glsl */ `
  float terrainHeight(vec2 p, float t) {
    float rise = 0.55 + 0.45 * smoothstep(-6.0, 7.0, p.x);
    float h = 0.62 * sin(p.x * 0.52 + t * 0.32) * cos(p.y * 0.68 - t * 0.22);
    h += 0.34 * sin(p.x * 1.25 - p.y * 0.9 + t * 0.45);
    h += 0.12 * sin(p.x * 2.6 + p.y * 2.2 - t * 0.7);
    return h * rise;
  }
  float scanX(float t) {
    return ${SCAN_FROM.toFixed(1)} + mod(t, ${SCAN_PERIOD.toFixed(1)}) / ${SCAN_PERIOD.toFixed(1)} * ${(SCAN_TO - SCAN_FROM).toFixed(1)};
  }
`;

function terrainHeight(x: number, z: number, t: number) {
  const rise = 0.55 + 0.45 * THREE.MathUtils.smoothstep(x, -6, 7);
  let h = 0.62 * Math.sin(x * 0.52 + t * 0.32) * Math.cos(z * 0.68 - t * 0.22);
  h += 0.34 * Math.sin(x * 1.25 - z * 0.9 + t * 0.45);
  h += 0.12 * Math.sin(x * 2.6 + z * 2.2 - t * 0.7);
  return h * rise;
}

function scanX(t: number) {
  return SCAN_FROM + ((t % SCAN_PERIOD) / SCAN_PERIOD) * (SCAN_TO - SCAN_FROM);
}

const POINT_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, vAlpha * core * core);
  }
`;

const TERRAIN_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  ${HEIGHT_GLSL}
  void main() {
    vec3 p = position;
    p.y = terrainHeight(p.xz, uTime);

    float sx = scanX(uTime);
    float dx = p.x - sx;
    float beam = exp(-dx * dx / 0.22);
    float trail = dx < 0.0 ? exp(dx / 2.8) : 0.0;
    p.y += beam * 0.18;

    float peak = smoothstep(-0.45, 0.85, p.y);
    vec3 deep = vec3(0.05, 0.26, 0.19);
    vec3 crest = vec3(0.14, 0.78, 0.52);
    vec3 lit = vec3(0.72, 1.0, 0.88);
    vec3 col = mix(deep, crest, peak);
    col = mix(col, crest * 1.25, trail * 0.55);
    col = mix(col, lit, beam);
    // A few points per sweep catch and hold the light: the "facts" found.
    float spark = step(0.975, aSeed) * trail;
    col = mix(col, lit, spark);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depthFade = smoothstep(17.0, 4.0, -mv.z);
    float edgeFade = smoothstep(${(SPAN_X / 2).toFixed(1)}, ${(SPAN_X / 2 - 3).toFixed(1)}, abs(position.x - 1.0));
    vColor = col;
    vAlpha = (0.6 + 0.6 * peak + 0.9 * beam + 0.45 * trail + spark) * depthFade * edgeFade;
    gl_PointSize = (3.2 + 3.5 * beam + 3.0 * spark) * uPixelRatio * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSpeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(position.y + uTime * aSpeed, 4.5) - 0.6;
    p.x += sin(uTime * 0.2 + position.z) * 0.15;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float life = smoothstep(-0.6, 0.4, p.y) * smoothstep(3.9, 2.6, p.y);
    vColor = vec3(0.35, 0.9, 0.68);
    vAlpha = 0.45 * life * smoothstep(20.0, 5.0, -mv.z);
    gl_PointSize = 1.8 * uPixelRatio * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

function useTimeUniforms() {
  const { gl } = useThree();
  return useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: gl.getPixelRatio() } }),
    [gl],
  );
}

function sceneTime(elapsed: number, reducedMotion: boolean) {
  return reducedMotion ? STILL_TIME : elapsed;
}

function Terrain({ reducedMotion }: { reducedMotion: boolean }) {
  const uniforms = useTimeUniforms();
  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(GRID_X * GRID_Z * 3);
    const seed = new Float32Array(GRID_X * GRID_Z);
    let i = 0;
    for (let ix = 0; ix < GRID_X; ix++) {
      for (let iz = 0; iz < GRID_Z; iz++) {
        // Slight jitter so the grid reads as data, not graph paper.
        pos[i * 3] = (ix / (GRID_X - 1) - 0.5) * SPAN_X + 1 + (Math.random() - 0.5) * 0.04;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = (iz / (GRID_Z - 1) - 0.5) * SPAN_Z + Z_OFFSET + (Math.random() - 0.5) * 0.04;
        seed[i] = Math.random();
        i++;
      }
    }
    return [pos, seed];
  }, []);

  useFrame((state) => {
    uniforms.uTime.value = sceneTime(state.clock.elapsedTime, reducedMotion);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={TERRAIN_VERTEX}
        fragmentShader={POINT_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Dust({ reducedMotion }: { reducedMotion: boolean }) {
  const uniforms = useTimeUniforms();
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const spd = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.3) * 18;
      pos[i * 3 + 1] = Math.random() * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 + Z_OFFSET;
      spd[i] = 0.06 + Math.random() * 0.16;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    uniforms.uTime.value = sceneTime(state.clock.elapsedTime, reducedMotion);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={DUST_VERTEX}
        fragmentShader={POINT_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Citation markers: placed in the right two-thirds of the terrain (the
// hero copy covers the left), each rising a thin beam and pulsing when
// the scan reaches it, then fading back before the next sweep.
const MARKERS = [
  [0.4, -1.2], [1.8, 0.6], [2.6, -3.4], [3.5, -0.8], [4.4, -5.0], [5.1, 1.0],
  [5.9, -2.4], [6.8, -4.1], [7.3, -0.2], [8.2, -2.9], [9.0, -5.4], [9.6, 0.4],
  [2.9, -6.0], [6.2, -6.6], [4.0, 1.6], [7.9, 1.4],
] as const;

function CitationMarkers({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const n = MARKERS.length;
  const uniforms = useTimeUniforms();

  const { headPos, headColor, linePos, lineColor } = useMemo(
    () => ({
      headPos: new Float32Array(n * 3),
      headColor: new Float32Array(n * 3),
      linePos: new Float32Array(n * 6),
      lineColor: new Float32Array(n * 6),
    }),
    [n],
  );

  const headVertex = useMemo(
    () => /* glsl */ `
      uniform float uPixelRatio;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float strength = max(max(color.r, color.g), color.b);
        vColor = color;
        vAlpha = strength;
        gl_PointSize = (6.0 + 16.0 * strength) * uPixelRatio * (6.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    [],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const sx = scanX(t);
    for (let i = 0; i < n; i++) {
      const [x, z] = MARKERS[i];
      const ground = terrainHeight(x, z, t);
      const since = sx - x; // world units since the beam passed this marker
      const lit = since > 0 ? Math.exp(-since / 6) : 0;
      const pulse = since > 0 && since < 0.9 ? 1 - since / 0.9 : 0;
      const rise = 0.25 + 0.75 * THREE.MathUtils.smoothstep(since, 0, 0.8);
      const height = since > 0 ? 0.45 + 0.4 * ((i * 37) % 10) / 10 : 0;
      const top = ground + height * rise;
      const strength = Math.min(1, lit + pulse * 0.6);

      headPos.set([x, top, z], i * 3);
      headColor.set([0.6 * strength, 1.0 * strength, 0.82 * strength], i * 3);
      linePos.set([x, ground, z, x, top, z], i * 6);
      const base = 0.3 * strength;
      lineColor.set([base * 0.6, base, base * 0.8, 0.55 * strength, 0.9 * strength, 0.7 * strength], i * 6);
    }
    const pg = pointsRef.current?.geometry;
    const lg = linesRef.current?.geometry;
    if (pg) {
      pg.attributes.position.needsUpdate = true;
      pg.attributes.color.needsUpdate = true;
    }
    if (lg) {
      lg.attributes.position.needsUpdate = true;
      lg.attributes.color.needsUpdate = true;
    }
  });

  return (
    <>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColor, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[headPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[headColor, 3]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={headVertex}
          fragmentShader={POINT_FRAGMENT}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// Slow idle drift plus pointer parallax and a small scroll-linked dip.
// Scroll is read in the frame loop (no listener/state) and clamped so it
// never fights the page's own scroll.
const LOOK_AT = new THREE.Vector3(3.2, -0.4, -2.6);

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const handleMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [reducedMotion]);

  useFrame((state) => {
    if (reducedMotion) {
      camera.lookAt(LOOK_AT);
      return;
    }
    const scroll = THREE.MathUtils.clamp(window.scrollY / 900, 0, 1);
    const idle = Math.sin(state.clock.elapsedTime * 0.07) * 0.35;
    camera.position.x += (0.6 + pointer.current.x * 0.6 + idle - camera.position.x) * 0.025;
    camera.position.y += (3.1 - pointer.current.y * 0.3 + scroll * 0.6 - camera.position.y) * 0.025;
    camera.lookAt(LOOK_AT);
  });

  return null;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <Terrain reducedMotion={reducedMotion} />
      <CitationMarkers reducedMotion={reducedMotion} />
      {!reducedMotion && <Dust reducedMotion={reducedMotion} />}
      <CameraRig reducedMotion={reducedMotion} />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.6} intensity={1.25} radius={0.6} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  // Always-on frameloop for motion (a 'demand' gate froze the clock-driven
  // animation on scroll-back in an earlier version); reduced motion renders
  // a single still frame.
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0.6, 3.1, 4.8], fov: 50, near: 0.1, far: 30 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
