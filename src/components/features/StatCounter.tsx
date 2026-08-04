import { useInView } from '@/hooks/useInView';
import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface StatCounterProps {
  value: string;
  suffix?: string;
  label: string;
  /** Counts down to a negative target and renders a leading minus. */
  signed?: boolean;
}

export default function StatCounter({ value, suffix = '', label, signed = false }: StatCounterProps) {
  const [ref, inView] = useInView(0.3);
  const [display, setDisplay] = useState(signed ? '-0' : '0');
  const [done, setDone] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      setDisplay(value);
      setDone(true);
      return;
    }

    const target = signed ? -Math.abs(numericValue) : numericValue;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(String(Math.round(v))),
      onComplete: () => {
        setDisplay(String(target));
        setDone(true);
      },
    });

    return () => controls.stop();
  }, [inView, value, signed]);

  return (
    <div ref={ref} className="text-center group">
      <div
        className={`font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tabular-nums transition-all duration-500 ${
          done ? 'text-gradient-animated' : 'text-gradient-green'
        } ${inView && !done ? 'counting-blur' : ''}`}
      >
        {display}
        <span>{suffix}</span>
      </div>
      <div className="mt-3 mx-auto h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-all duration-1000 ease-out w-0 group-hover:w-24" style={{ width: done ? '48px' : '0px' }} />
      <p className="mt-2 text-sm text-muted-foreground leading-snug max-w-[200px] mx-auto">
        {label}
      </p>
    </div>
  );
}
