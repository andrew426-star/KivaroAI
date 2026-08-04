import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HudFrameProps {
  children: ReactNode;
  className?: string;
  cornerClassName?: string;
}

// The 4 corner-tick decorative divs, extracted from About.tsx's hero image
// treatment so the same HUD-corner motif is reusable for illustration
// framing elsewhere without re-hardcoding the 4 divs each time.
export default function HudFrame({ children, className, cornerClassName }: HudFrameProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <div className={cn('absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-md', cornerClassName)} />
      <div className={cn('absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-md', cornerClassName)} />
      <div className={cn('absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-md', cornerClassName)} />
      <div className={cn('absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-md', cornerClassName)} />
    </div>
  );
}
