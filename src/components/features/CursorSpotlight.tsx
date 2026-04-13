import { useRef, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CursorSpotlightProps {
  children: ReactNode;
  className?: string;
  size?: number;
  intensity?: number;
}

export default function CursorSpotlight({
  children,
  className,
  size = 600,
  intensity = 0.06,
}: CursorSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--spot-x', `${x}px`);
      el.style.setProperty('--spot-y', `${y}px`);
    },
    []
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Spotlight layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 hover-parent-glow transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(${size}px circle at var(--spot-x, 50%) var(--spot-y, 50%), hsla(152, 76%, 46%, ${intensity}), transparent 70%)`,
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
