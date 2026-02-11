import { useState } from 'react';
import { PROCESS_STEPS } from '@/constants/mockData';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan, Target, PenTool, Rocket, Layers, GraduationCap, TrendingUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Scan, Target, PenTool, Rocket, Layers, GraduationCap, TrendingUp,
};

export default function ProcessTimeline() {
  const [ref, inView] = useInView(0.1);
  const [activeStep, setActiveStep] = useState(0);
  const step = PROCESS_STEPS[activeStep];
  const Icon = ICON_MAP[step.icon] || Scan;

  return (
    <div ref={ref} className={cn(
      'transition-all duration-700',
      inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    )}>
      {/* Step selector */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 lg:mb-10">
        {PROCESS_STEPS.map((s, i) => {
          const StepIcon = ICON_MAP[s.icon] || Scan;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(i)}
              className={cn(
                'relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 overflow-hidden',
                i === activeStep
                  ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_20px_hsla(152,76%,46%,0.12)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent active:scale-95'
              )}
            >
              {i === activeStep && (
                <motion.div
                  layoutId="process-active-bg"
                  className="absolute inset-0 bg-primary/8 rounded-lg"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <StepIcon className="size-3.5 sm:size-4 relative z-10" />
              <span className="hidden md:inline relative z-10">{s.title}</span>
              <span className="md:hidden relative z-10">P{s.id}</span>
            </button>
          );
        })}
      </div>

      {/* Active step detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative rounded-xl bg-kv-surface/40 border border-border/50 p-8 lg:p-10 backdrop-blur-sm scan-line overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex items-center justify-center size-14 rounded-xl bg-primary/10 border border-primary/20 shrink-0"
            >
              <Icon className="size-7 text-primary" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center size-7 rounded-md bg-primary/15 font-display text-xs font-bold text-primary tabular-nums">
                  {String(step.id).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {step.title}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-2xl text-pretty">
                {step.description}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1.5 mt-8">
            {PROCESS_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: i === activeStep ? '2rem' : '0.5rem',
                  background: i === activeStep
                    ? 'hsl(152 76% 46%)'
                    : i < activeStep
                    ? 'hsl(152 76% 46% / 0.3)'
                    : 'hsl(150 12% 14%)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
