import { type ReactNode, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export default function GlowCard({ children, className, glowOnHover = true }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el || !glowOnHover) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    el.style.setProperty('--glow-x', `${x}%`);
    el.style.setProperty('--glow-y', `${y}%`);
  }, [glowOnHover]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative rounded-xl overflow-hidden',
        'bg-kv-surface/60 backdrop-blur-sm',
        'border border-border/50',
        'transition-all duration-500 ease-out',
        glowOnHover && [
          'hover:border-primary/30',
          'hover:shadow-[0_0_40px_hsla(152,76%,46%,0.08),_0_4px_20px_hsla(0,0%,0%,0.2)]',
          'hover:translate-y-[-2px]',
        ],
        className
      )}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {/* Mouse-follow glow */}
      {glowOnHover && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), hsla(152, 76%, 46%, 0.06), transparent 60%)',
          }}
        />
      )}
      {children}
    </div>
  );
}
