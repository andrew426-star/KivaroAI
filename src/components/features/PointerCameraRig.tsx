import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface PointerCameraRigProps {
  strength?: number;
  lookAt?: [number, number, number];
}

// Shared pointer-parallax camera drift, extracted from the pattern already
// proven in HeroScene.tsx's own CameraRig — extended here to the other 3D
// scenes so every page's 3D layer has a consistent "subtly reacts to your
// cursor" feel, reusing a technique already shipped and tuned rather than
// inventing a new one per scene.
export default function PointerCameraRig({ strength = 0.4, lookAt = [0, 0, 0] }: PointerCameraRigProps) {
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
    camera.lookAt(...lookAt);
  });

  return null;
}
