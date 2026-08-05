import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

interface RadialGaugeProps {
  /** 0-100 — a real value, not a decorative random one (e.g. the real 100% Built In-House stat). */
  value: number;
  label?: string;
  size?: number;
  className?: string;
}

// For single-metric moments — unlike the other variants, this fills once
// toward a real supplied value and holds; no idle drift, since drifting a
// gauge that's paired with a real stat would misrepresent it.
export default function RadialGauge({ value, label, size = 64, className }: RadialGaugeProps) {
  const [ref, inView] = useInView(0.3);
  const reducedMotion = usePrefersReducedMotion();
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);

  // A CSS `transition` on `strokeDashoffset` reliably failed to ever paint
  // on this page (confirmed via direct DOM diagnostics — the target value
  // lands correctly in the style attribute but the rendered arc stays
  // stuck at 0% filled). Animating it imperatively via framer-motion's
  // animate(), writing straight to the DOM each tick, is the same
  // mechanism already proven to render correctly here (StatCounter).
  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    if (!inView) {
      el.style.strokeDashoffset = String(circumference);
      return;
    }
    if (reducedMotion) {
      el.style.strokeDashoffset = String(targetOffset);
      return;
    }
    const controls = animate(circumference, targetOffset, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => {
        el.style.strokeDashoffset = String(v);
      },
    });
    return () => controls.stop();
  }, [inView, reducedMotion, circumference, targetOffset]);

  return (
    <div ref={ref} className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsla(150,15%,30%,0.3)" strokeWidth="3" />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsla(152,76%,50%,0.9)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      {label && (
        <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground/40">
          {label}
        </span>
      )}
    </div>
  );
}
