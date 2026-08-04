import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  index: string;
  label: string;
  icon?: LucideIcon;
  /** Pulsing status dot instead of an icon — matches the hero pill-tag's "live" indicator language. */
  dot?: boolean;
  className?: string;
}

export default function SectionLabel({ index, label, icon: Icon, dot, className }: SectionLabelProps) {
  return (
    <span className={cn('label-eyebrow inline-flex items-center gap-2 text-primary/70', className)}>
      <span className="text-primary/40">{index}</span>
      <span className="text-foreground/20" aria-hidden="true">—</span>
      {dot && <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />}
      {Icon && <Icon className="size-3.5" />}
      {label}
    </span>
  );
}
