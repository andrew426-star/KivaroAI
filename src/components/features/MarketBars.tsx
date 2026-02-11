import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';

interface Bar {
  height: number;
  targetHeight: number;
  color: string;
}

export default function MarketBars({ barCount = 24 }: { barCount?: number }) {
  const [ref, inView] = useInView(0.2);
  const [bars, setBars] = useState<Bar[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const initial: Bar[] = Array.from({ length: barCount }, () => {
      const h = Math.random() * 60 + 20;
      return {
        height: 0,
        targetHeight: h,
        color: h > 50 ? 'hsla(152, 76%, 46%, 0.6)' : 'hsla(152, 76%, 46%, 0.25)',
      };
    });
    setBars(initial);
  }, [barCount]);

  useEffect(() => {
    if (!inView) return;

    // Animate in
    setBars(prev => prev.map(b => ({ ...b, height: b.targetHeight })));

    // Fluctuate
    intervalRef.current = setInterval(() => {
      setBars(prev => prev.map(b => {
        const newH = Math.max(10, Math.min(90, b.targetHeight + (Math.random() - 0.5) * 20));
        return {
          ...b,
          targetHeight: newH,
          height: newH,
          color: newH > 50 ? 'hsla(152, 76%, 46%, 0.6)' : 'hsla(152, 76%, 46%, 0.25)',
        };
      }));
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, [inView]);

  return (
    <div ref={ref} className="flex items-end gap-[2px] h-16 opacity-40">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-1000 ease-out"
          style={{
            height: `${bar.height}%`,
            background: bar.color,
            transitionDelay: `${i * 30}ms`,
          }}
        />
      ))}
    </div>
  );
}
