import { cn } from '@/lib/utils';

interface TextMarqueeProps {
  words: string[];
  className?: string;
  reverse?: boolean;
  separator?: string;
}

export default function TextMarquee({
  words,
  className,
  reverse = false,
  separator = '•',
}: TextMarqueeProps) {
  const content = words.map((w) => `${w} ${separator} `).join('');

  return (
    <div
      className={cn(
        'relative overflow-hidden select-none pointer-events-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

      <div
        className={cn(
          'flex whitespace-nowrap',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
      >
        <span className="font-display text-[clamp(2rem,5vw,4.5rem)] font-extrabold tracking-tight text-foreground/[0.04] uppercase">
          {content}
        </span>
        <span className="font-display text-[clamp(2rem,5vw,4.5rem)] font-extrabold tracking-tight text-foreground/[0.04] uppercase">
          {content}
        </span>
      </div>
    </div>
  );
}
