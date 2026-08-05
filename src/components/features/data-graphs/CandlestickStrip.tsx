import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

interface Candle {
  high: number;
  low: number;
  open: number;
  close: number;
}

function randomCandle(): Candle {
  const base = 25 + Math.random() * 50;
  const spread = 8 + Math.random() * 14;
  const open = base + (Math.random() - 0.5) * spread * 0.6;
  const close = base + (Math.random() - 0.5) * spread * 0.6;
  const high = Math.max(open, close) + Math.random() * spread * 0.4;
  const low = Math.min(open, close) - Math.random() * spread * 0.4;
  return { high: Math.min(96, high), low: Math.max(4, low), open, close };
}

const REFRESH_INTERVAL_MS = 2600;

interface CandlestickStripProps {
  count?: number;
  className?: string;
  heightClassName?: string;
  label?: string;
}

// Leans into the trading-chart heritage the brief calls out directly, but
// colored by a two-tone signal-green split rather than literal red/green
// so it reads as "market data" without breaking the palette — same
// discipline already applied everywhere else on the site.
export default function CandlestickStrip({ count = 18, className, heightClassName = 'h-14', label }: CandlestickStripProps) {
  const [ref, inView] = useInView(0.2);
  const reducedMotion = usePrefersReducedMotion();
  const [candles, setCandles] = useState<Candle[]>(() => Array.from({ length: count }, randomCandle));
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (reducedMotion || !inView) return;
    intervalRef.current = setInterval(() => {
      setCandles((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * next.length);
        next[i] = randomCandle();
        return next;
      });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [inView, reducedMotion]);

  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)}>
      <div className={cn('flex items-stretch gap-[3px]', heightClassName)}>
        {candles.map((c, i) => {
          const up = c.close >= c.open;
          const bodyTop = Math.max(c.open, c.close);
          const bodyBottom = Math.min(c.open, c.close);
          const color = up ? 'hsla(152,76%,50%,0.75)' : 'hsla(155,45%,32%,0.7)';
          const transition = reducedMotion ? 'none' : `all 700ms ease-out ${i * 24}ms`;
          return (
            <div key={i} className="relative flex-1">
              <div
                className="absolute left-1/2 w-px -translate-x-1/2"
                style={{
                  bottom: `${inView ? c.low : 45}%`,
                  height: `${inView ? c.high - c.low : 0}%`,
                  background: color,
                  transition,
                }}
              />
              <div
                className="absolute left-1/2 w-full -translate-x-1/2 rounded-[1px]"
                style={{
                  bottom: `${inView ? bodyBottom : 48}%`,
                  height: `${inView ? Math.max(2, bodyTop - bodyBottom) : 0}%`,
                  background: color,
                  transition,
                }}
              />
            </div>
          );
        })}
      </div>
      {label && (
        <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground/40">
          {label}
        </span>
      )}
    </div>
  );
}
