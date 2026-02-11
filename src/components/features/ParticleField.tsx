import { useRef } from 'react';
import { useParticles } from '@/hooks/useParticles';

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}
