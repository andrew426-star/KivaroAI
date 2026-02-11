import { useInView } from '@/hooks/useInView';
import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  value: string;
  suffix?: string;
  label: string;
}

export default function StatCounter({ value, suffix = '', label }: StatCounterProps) {
  const [ref, inView] = useInView(0.3);
  const [display, setDisplay] = useState('0');
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

    const duration = 1800;
    const steps = 50;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += numericValue / steps;
      if (current >= numericValue) {
        setDisplay(String(numericValue));
        setDone(true);
        clearInterval(timer);
      } else {
        setDisplay(String(Math.floor(current)));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center group">
      <div
        className={`font-display text-4xl lg:text-5xl font-extrabold tabular-nums transition-all duration-500 ${
          done ? 'text-gradient-animated' : 'text-gradient-green'
        }`}
      >
        {display}
        <span>{suffix}</span>
      </div>
      <div className="mt-3 mx-auto w-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-all duration-700 group-hover:w-16" />
      <p className="mt-2 text-sm text-muted-foreground leading-snug max-w-[200px] mx-auto">
        {label}
      </p>
    </div>
  );
}
