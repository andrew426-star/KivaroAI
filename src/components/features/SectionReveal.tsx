import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
}

const DIRECTION_CLASSES: Record<RevealDirection, { hidden: string; visible: string }> = {
  up: { hidden: 'opacity-0 translate-y-10', visible: 'opacity-100 translate-y-0' },
  down: { hidden: 'opacity-0 -translate-y-10', visible: 'opacity-100 translate-y-0' },
  left: { hidden: 'opacity-0 translate-x-10', visible: 'opacity-100 translate-x-0' },
  right: { hidden: 'opacity-0 -translate-x-10', visible: 'opacity-100 translate-x-0' },
  scale: { hidden: 'opacity-0 scale-95', visible: 'opacity-100 scale-100' },
  blur: { hidden: 'opacity-0 blur-sm', visible: 'opacity-100 blur-0' },
};

export default function SectionReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: SectionRevealProps) {
  const [ref, inView] = useInView(0.1);
  const { hidden, visible } = DIRECTION_CLASSES[direction];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        inView ? visible : hidden,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
