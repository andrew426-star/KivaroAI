import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import LogoMark, { HeroLighting, CAMERA_LOOK_TARGET, CAMERA_BASE_POSITION } from './LogoMark';
import { ScanlineDissolveEffect } from '@/lib/three/ScanlineDissolveEffect';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// The hero is a single continuously-moving subject — the Kivaro cube mark
// (LogoMark) — redrawn by ScanlineDissolveEffect as scanlines that peel
// off into a stream of dashes. There is no assemble/hold/disperse cycle:
// the mark drifts, the dashes flow, the line gaps travel across its
// surface, and scrolling pushes all of it faster, so the scene is never
// at rest and never cuts.
const REVEAL_DELAY = 0.25;
const REVEAL_DURATION = 1.8;
// Scanline spacing in CSS pixels.
const SCANLINE_PERIOD = 3.5;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function ScanlinePass({ reducedMotion }: { reducedMotion: boolean }) {
  const { viewport } = useThree();
  const effect = useMemo(() => new ScanlineDissolveEffect({ period: SCANLINE_PERIOD }), []);
  const flow = useRef(0);
  const lastScroll = useRef(0);
  const scrollBoost = useRef(0);

  useEffect(() => {
    effect.set('uPixelRatio', viewport.dpr);
  }, [effect, viewport.dpr]);

  useEffect(() => () => effect.dispose(), [effect]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    if (reducedMotion) {
      effect.set('uReveal', 1);
      effect.set('uStream', 0.6);
      return;
    }
    // The stream's clock runs faster while the page is scrolling and eases
    // back after — scrolling visibly stirs the hero instead of the graphic
    // ignoring it.
    const y = window.scrollY;
    const velocity = Math.abs(y - lastScroll.current) / Math.max(dt, 1e-3);
    lastScroll.current = y;
    scrollBoost.current = THREE.MathUtils.damp(scrollBoost.current, Math.min(velocity / 600, 2.5), 3, dt);
    flow.current += dt * (1 + scrollBoost.current);

    effect.set('uFlow', flow.current);
    effect.set('uReveal', easeOutCubic(THREE.MathUtils.clamp((t - REVEAL_DELAY) / REVEAL_DURATION, 0, 1)));
    effect.set('uStream', 0.85 + 0.15 * Math.sin(t * 0.4) + Math.min(scrollBoost.current, 1) * 0.3);
  });

  return <primitive object={effect} dispose={null} />;
}

// Idle drift + pointer-parallax + a gentle scroll-linked drift, so the
// camera reads as alive even before the user moves the mouse. Scroll is
// read directly off window.scrollY inside the frame loop and clamped to a
// small range so it never fights the page's own scroll feel. Damped by
// real elapsed time rather than a fixed per-frame fraction, so the glide
// feels the same on 60Hz and 120Hz screens.
function CameraRig() {
  const { camera } = useThree();
  const pointerTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      pointerTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useFrame((state, delta) => {
    const scrollDrift = THREE.MathUtils.clamp(window.scrollY / 900, 0, 1);
    const idle = Math.sin(state.clock.elapsedTime * 0.06) * 0.15;
    const dt = Math.min(delta, 0.1);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, CAMERA_BASE_POSITION[0] + pointerTarget.current.x * 0.5 + idle - scrollDrift * 0.35, 1.3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, CAMERA_BASE_POSITION[1] - pointerTarget.current.y * 0.25 - scrollDrift * 0.3, 1.3, dt);
    camera.lookAt(CAMERA_LOOK_TARGET[0], CAMERA_LOOK_TARGET[1], CAMERA_LOOK_TARGET[2]);
  });

  return null;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((state) => {
    if (reducedMotion) state.invalidate();
  });

  return (
    <>
      <HeroLighting />
      <LogoMark reducedMotion={reducedMotion} />
      {!reducedMotion && <CameraRig />}
      <EffectComposer multisampling={0}>
        <ScanlinePass reducedMotion={reducedMotion} />
        <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.6} intensity={0.7} radius={0.5} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  // Always-on frameloop for the hero: an earlier viewport-based switch to
  // 'demand' froze its clock-driven animation (nothing calls invalidate()),
  // so only reduced motion drops to 'demand'.
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        // The scanline and bloom passes are full-screen, so their cost
        // scales with pixel count; DPR stays capped below 2.
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: CAMERA_BASE_POSITION, fov: 55, near: 0.1, far: 24 }}
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
