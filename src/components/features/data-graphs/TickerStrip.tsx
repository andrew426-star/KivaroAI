import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TickerStripProps {
  count?: number;
  className?: string;
  reverse?: boolean;
}

// A thin, always-moving row of bars for section dividers/footers — reuses
// the exact .animate-marquee/-reverse keyframes TextMarquee.tsx already
// established (including its reduced-motion pause, added alongside this),
// so it's one proven scrolling technique for both text and bars, not two.
export default function TickerStrip({ count = 48, className, reverse = false }: TickerStripProps) {
  const heights = useMemo(() => Array.from({ length: count }, () => 12 + Math.random() * 76), [count]);

  const content = (
    <div className="flex items-end gap-1 px-1 shrink-0">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-t-sm shrink-0"
          style={{ height: `${h}%`, background: h > 55 ? 'hsla(152,76%,46%,0.5)' : 'hsla(152,76%,46%,0.2)' }}
        />
      ))}
    </div>
  );

  return (
    <div className={cn('relative overflow-hidden h-10', className)} aria-hidden="true">
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent" />
      <div className={cn('flex h-full items-end w-max', reverse ? 'animate-marquee-reverse' : 'animate-marquee')}>
        {content}
        {content}
      </div>
    </div>
  );
}
