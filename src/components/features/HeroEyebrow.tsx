import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroEyebrowProps {
  label: string;
  className?: string;
}

// Structurally identical hero pill markup that was duplicated across all 6
// pages (only the label text differed) — consolidated here specifically so
// layoutId="hero-eyebrow" can morph it between pages during the now-
// overlapping route transition (AnimatedOutlet.tsx), the same shared-layout
// technique already proven internally by Header.tsx's "nav-indicator".
export default function HeroEyebrow({ label, className }: HeroEyebrowProps) {
  return (
    <motion.div
      layoutId="hero-eyebrow"
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
      <span className="text-xs font-medium text-primary/80 tracking-wide uppercase font-display">
        {label}
      </span>
    </motion.div>
  );
}
