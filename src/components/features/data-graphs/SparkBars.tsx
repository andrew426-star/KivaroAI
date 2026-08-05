import { useAmbientBars } from '@/hooks/useAmbientBars';
import { cn } from '@/lib/utils';

interface SparkBarsProps {
  count?: number;
  className?: string;
  barsClassName?: string;
  label?: string;
}

// The base of the ambient data-graph family — a thin vertical-bar cluster,
// semi-transparent fill with a soft glow at each tall bar's peak, staggered
// rise on scroll-into-view, subtle idle drift after. Generalizes
// MarketBars.tsx (which stays as the specific "AI Workflow Pipeline" hero
// instance) into a reusable primitive the other variants build on.
export default function SparkBars({ count = 24, className, barsClassName = 'h-16', label }: SparkBarsProps) {
  const { ref, inView, heights, reducedMotion } = useAmbientBars(count);

  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)}>
      <div className={cn('flex items-end gap-[2px]', barsClassName)}>
        {heights.map((h, i) => (
          <div key={i} className="relative flex-1">
            {h > 55 && (
              <div
                className="absolute left-0 right-0 h-1.5 rounded-full blur-[3px]"
                style={{
                  bottom: `${inView ? h : 0}%`,
                  background: 'hsla(152,76%,60%,0.55)',
                  transition: reducedMotion ? 'none' : `bottom 900ms ease-out ${i * 32}ms`,
                }}
              />
            )}
            <div
              className="rounded-t-sm"
              style={{
                height: `${inView ? h : 0}%`,
                background: h > 55 ? 'hsla(152,76%,46%,0.55)' : 'hsla(152,76%,46%,0.22)',
                transition: reducedMotion ? 'none' : `height 900ms ease-out ${i * 32}ms`,
              }}
            />
          </div>
        ))}
      </div>
      {label && (
        <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground/40">
          {label}
        </span>
      )}
    </div>
  );
}
