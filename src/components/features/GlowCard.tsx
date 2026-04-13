import { type ReactNode, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
  tilt?: boolean;
}

export default function GlowCard({ children, className, glowOnHover = true, tilt = true }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (glowOnHover) {
      el.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
    }

    if (tilt) {
      const tiltX = (y - 0.5) * -8;
      const tiltY = (x - 0.5) * 8;
      el.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    }
  }, [glowOnHover, tilt]);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    if (tilt) {
      el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  }, [tilt]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative rounded-xl overflow-hidden',
        'bg-kv-surface/60 backdrop-blur-sm',
        'border border-border/50',
        'transition-all duration-500 ease-[cubic-bezier(0.03,0.98,0.52,0.99)]',
        'will-change-transform',
        glowOnHover && [
          'hover:border-primary/30',
          'hover:shadow-[0_0_50px_hsla(152,76%,46%,0.1),_0_8px_32px_hsla(0,0%,0%,0.25)]',
        ],
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {/* Mouse-follow glow */}
      {glowOnHover && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(500px circle at var(--glow-x, 50%) var(--glow-y, 50%), hsla(152, 76%, 46%, 0.08), transparent 60%)',
          }}
        />
      )}
      {/* Inner content with subtle z-lift for 3D depth */}
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
}
