import { NAV_LINKS, SECTION_IDS } from '@/constants/config';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { cn } from '@/lib/utils';

// Persistent "follow the scroll" position indicator — the header nav's
// text-color-only active state doesn't give continuous feedback at a
// glance on a single long page. Reuses useScrollSpy(SECTION_IDS) directly,
// the same hook already driving Header.tsx's own active-link state, so
// this never falls out of sync with it. Desktop-only — mobile already has
// the hamburger nav for section navigation, and 5 more fixed dots would
// clutter a 390px viewport.
export default function SectionRail() {
  const activeId = useScrollSpy(SECTION_IDS);

  return (
    <nav
      aria-label="Section progress"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-nav flex-col items-center gap-3"
    >
      {NAV_LINKS.map((link) => {
        const id = link.href.slice(1);
        const active = id === activeId;
        return (
          <a
            key={id}
            href={link.href}
            aria-label={link.label}
            aria-current={active ? 'true' : undefined}
            className="group relative flex items-center justify-center p-1.5"
          >
            <span
              className={cn(
                'block rounded-full transition-all duration-300',
                active ? 'size-2.5 bg-primary shadow-[0_0_10px_hsla(152,76%,46%,0.6)]' : 'size-1.5 bg-foreground/25 group-hover:bg-foreground/50',
              )}
            />
            <span
              className={cn(
                'pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border border-border/50 bg-background/90 px-2 py-1 text-[10px] font-display uppercase tracking-wider text-foreground/80 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100',
              )}
            >
              {link.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
