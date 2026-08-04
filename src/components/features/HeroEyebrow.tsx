import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroEyebrowProps {
  label: string;
  className?: string;
}

// Shared hero pill component. Its layoutId="hero-eyebrow" was originally
// added so the pill could morph between pages during route transitions on
// the old multi-page site; on the single-page layout there's only ever one
// instance mounted, so the layoutId is a harmless no-op — kept for the
// shared-layout technique's own sake (matches Header.tsx's "nav-indicator").
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
