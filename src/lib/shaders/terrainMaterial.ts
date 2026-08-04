import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Live data-terrain shader: an undulating wireframe surface (volatility-surface /
 * market-depth motif) driven entirely on the GPU via layered sine waves.
 *
 * Shared between HeroScene.tsx (Home) and AboutAtmosphere.tsx (About) — extracted
 * so both scenes render from one GLSL source instead of two forks that could drift.
 */
export const TerrainMaterial = shaderMaterial(
  { uTime: 0, uIntro: 0, uAmplitudeScale: 1, uColorMid: new THREE.Color('#1cce7b'), uColorHigh: new THREE.Color('#a5e830') },
  /* vertex */ `
    uniform float uTime;
    uniform float uIntro;
    uniform float uAmplitudeScale;
    varying float vElevation;
    varying vec2 vUv;

    float wave(vec2 p, float freq, float speed, float amp, float t) {
      return sin(p.x * freq + t * speed) * cos(p.y * freq * 0.8 - t * speed * 0.7) * amp;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float elevation = 0.0;
      elevation += wave(pos.xy, 0.16, 0.55, 1.0, uTime);
      elevation += wave(pos.xy, 0.37, 0.85, 0.4, uTime * 1.25);
      elevation += wave(pos.xy * 1.7, 0.52, 0.35, 0.16, uTime * 0.6);
      pos.z += elevation * 0.55 * uIntro * uAmplitudeScale;
      vElevation = elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* fragment */ `
    uniform vec3 uColorMid;
    uniform vec3 uColorHigh;
    uniform float uIntro;
    varying float vElevation;
    varying vec2 vUv;

    void main() {
      float t = clamp(vElevation * 0.6 + 0.5, 0.0, 1.0);
      vec3 color = mix(uColorMid, uColorHigh, t);

      float d = distance(vUv, vec2(0.5, 0.62));
      float fade = smoothstep(0.78, 0.1, d);

      gl_FragColor = vec4(color, fade * 0.5 * uIntro);
    }
  `
);

declare module '@react-three/fiber' {
  interface ThreeElements {
    terrainMaterial: Record<string, unknown>;
  }
}
