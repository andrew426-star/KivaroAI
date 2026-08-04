import { useEffect, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { TerrainMaterial } from '@/lib/shaders/terrainMaterial';
import PointerCameraRig from './PointerCameraRig';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

extend({ TerrainMaterial });

const REVEAL_DURATION = 1.2;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// About's real content (founder quote, values, methodology, regions, FAQ) is
// narrative, not a dataset — this is deliberately just the calm terrain
// backdrop, restyled toward the --kv-mint/--kv-emerald-deep tokens, lower
// amplitude, slower time — no AssemblyField/DataParticles layer the way
// Home's "raw data becomes structure" hero moment uses. Colors read the
// real HSL tokens directly via setHSL, not an eyeballed hex approximation.
const COLOR_MID = new THREE.Color().setHSL(162 / 360, 0.5, 0.28);
const COLOR_HIGH = new THREE.Color().setHSL(155 / 360, 0.5, 0.15);

function Terrain({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (reducedMotion && ref.current) {
      ref.current.uniforms.uIntro.value = 1;
    }
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value += delta * 0.45;
    if (!reducedMotion) {
      const progress = THREE.MathUtils.clamp(state.clock.elapsedTime / REVEAL_DURATION, 0, 1);
      ref.current.uniforms.uIntro.value = easeOutCubic(progress);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -1.2, 1.5]}>
      <planeGeometry args={[14, 14, 48, 48]} />
      <terrainMaterial
        ref={ref}
        uAmplitudeScale={0.4}
        uColorMid={COLOR_MID}
        uColorHigh={COLOR_HIGH}
        transparent
        wireframe
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function AboutAtmosphere() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.8, 3.6], fov: 55, near: 0.1, far: 20 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        style={{ pointerEvents: 'none' }}
      >
        <fog attach="fog" args={['#080c0a', 4, 9]} />
        {!reducedMotion && <PointerCameraRig strength={0.12} lookAt={[0, 0, 0]} />}
        <Terrain reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
