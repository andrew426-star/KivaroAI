import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface PointerCameraRigProps {
  strength?: number;
  lookAt?: [number, number, number];
  /** Optional second pull target (e.g. a hovered node) blended into the
   * same per-frame position update, converging at `hoverPull` per frame.
   * Kept in this same useFrame rather than a separate sibling component —
   * two independent hooks each mutating camera.position and calling
   * camera.lookAt in the same frame produced a real, intermittent bug in
   * AgentConstellation (confirmed via repeated real-browser diagnostics:
   * the whole scene would render blank while a node stayed hovered) —
   * folding both into one atomic update removes the race instead of
   * patching around it. */
  hoverTarget?: [number, number, number] | null;
  hoverPull?: number;
  /** Caps how far camera.position.x/y can drift from its starting base
   * position, regardless of how long a hover keeps pulling toward a
   * far-off node. Without this, resting the cursor on a node near the
   * edge of a wide scene for several seconds keeps accumulating the
   * hoverPull nudge with nothing pulling back, panning the camera far
   * enough to push opposite-side content outside the visible frame.
   * Undefined = no cap (existing behavior, unchanged for callers that
   * don't pass it). */
  maxOffset?: number;
}

// Shared pointer-parallax camera drift, extracted from the pattern already
// proven in HeroScene.tsx's own CameraRig — extended here to the other 3D
// scenes so every page's 3D layer has a consistent "subtly reacts to your
// cursor" feel, reusing a technique already shipped and tuned rather than
// inventing a new one per scene.
export default function PointerCameraRig({
  strength = 0.4,
  lookAt = [0, 0, 0],
  hoverTarget = null,
  hoverPull = 0,
  maxOffset,
}: PointerCameraRigProps) {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0 });
  const basePosition = useRef(camera.position.clone());

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useFrame(() => {
    const base = basePosition.current;
    camera.position.x += (base.x + target.current.x * strength - camera.position.x) * 0.02;
    camera.position.y += (base.y - target.current.y * strength * 0.5 - camera.position.y) * 0.02;
    if (hoverTarget && hoverPull > 0) {
      camera.position.x += (hoverTarget[0] - camera.position.x) * hoverPull;
      camera.position.y += (hoverTarget[1] - camera.position.y) * hoverPull;
    }
    if (maxOffset !== undefined) {
      camera.position.x = Math.min(Math.max(camera.position.x, base.x - maxOffset), base.x + maxOffset);
      camera.position.y = Math.min(Math.max(camera.position.y, base.y - maxOffset), base.y + maxOffset);
    }
    camera.lookAt(...lookAt);
  });

  return null;
}
