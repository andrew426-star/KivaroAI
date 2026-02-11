import { useRef, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  as?: 'button' | 'div';
  strength?: number;
  onClick?: () => void;
}

export default function MagneticButton({
  children,
  className,
  as: Tag = 'button',
  strength = 0.3,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;

    const pctX = ((e.clientX - rect.left) / rect.width * 100).toFixed(0);
    const pctY = ((e.clientY - rect.top) / rect.height * 100).toFixed(0);
    el.style.setProperty('--mouse-x', `${pctX}%`);
    el.style.setProperty('--mouse-y', `${pctY}%`);
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={cn('btn-magnetic transition-transform duration-300 ease-out', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
