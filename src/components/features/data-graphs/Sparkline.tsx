import { useAmbientBars } from '@/hooks/useAmbientBars';
import { cn } from '@/lib/utils';

interface SparklineProps {
  count?: number;
  className?: string;
  heightClassName?: string;
  label?: string;
}

// SparkBars plus a thin glowing line tracing each bar's peak — the
// percentage-based bar heights map directly onto an SVG viewBox="0 0 100
// 100" with preserveAspectRatio="none", so the line stays pixel-accurate
// to the bars at any container width without a resize observer.
export default function Sparkline({ count = 16, className, heightClassName = 'h-12', label }: SparklineProps) {
  const { ref, inView, heights, reducedMotion } = useAmbientBars(count, 25, 75);
  const points = heights.map((h, i) => `${(i / (count - 1)) * 100},${100 - h}`).join(' ');

  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)}>
      <div className={cn('relative', heightClassName)}>
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {heights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${inView ? h : 0}%`,
                background: 'hsla(152,76%,46%,0.14)',
                transition: reducedMotion ? 'none' : `height 900ms ease-out ${i * 32}ms`,
              }}
            />
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
          <polyline
            points={inView ? points : points.replace(/,-?\d+(\.\d+)?/g, ',100')}
            fill="none"
            stroke="hsla(152,76%,58%,0.75)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={{ transition: reducedMotion ? 'none' : 'all 900ms ease-out' }}
          />
        </svg>
      </div>
      {label && (
        <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground/40">
          {label}
        </span>
      )}
    </div>
  );
}
