import type { SVGProps } from 'react';

// Fine-line / etched glyph set for the 7 deployment phases — replaces the
// generic Lucide ICON_MAP glyphs at the two real call sites (Process.tsx,
// ProcessTimeline.tsx), both keyed off the same PROCESS_STEPS[i].icon
// string. Same key names as the Lucide map they replace, so callers swap
// the import with no other change. All strokes use currentColor so they
// inherit the exact same color treatment (text-primary etc.) as the
// Lucide icons they replace.

type GlyphProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

// Phase 1 — Discovery & Systems Audit: a scanning aperture
function Scan(props: GlyphProps) {
  return (
    <Base {...props}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
      <line x1="5" y1="12" x2="19" y2="12" strokeOpacity="0.55" />
      <circle cx="12" cy="12" r="2.4" strokeOpacity="0.7" />
    </Base>
  );
}

// Phase 2 — Use-Case Prioritization: concentric ranked rings
function Target(props: GlyphProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8" strokeOpacity="0.4" />
      <circle cx="12" cy="12" r="4.8" strokeOpacity="0.7" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Base>
  );
}

// Phase 3 — Architecture Design: a drafting blueprint nib
function PenTool(props: GlyphProps) {
  return (
    <Base {...props}>
      <path d="M4 20 L10 14" strokeOpacity="0.55" />
      <path d="M10 14 L15 5 L19 9 L10 18 Z" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </Base>
  );
}

// Phase 4 — Controlled Implementation: staged launch vector
function Rocket(props: GlyphProps) {
  return (
    <Base {...props}>
      <path d="M12 3 C15 6 16 10 15 15 L9 15 C8 10 9 6 12 3 Z" />
      <path d="M9 15 L6.5 18 M15 15 L17.5 18" strokeOpacity="0.55" />
      <circle cx="12" cy="9" r="1.4" strokeOpacity="0.7" />
    </Base>
  );
}

// Phase 5 — Integration Layering: stacked connective plates
function Layers(props: GlyphProps) {
  return (
    <Base {...props}>
      <path d="M12 3 L20 8 L12 13 L4 8 Z" />
      <path d="M4 13 L12 18 L20 13" strokeOpacity="0.55" />
      <path d="M4 17.5 L12 22.5 L20 17.5" strokeOpacity="0.3" />
    </Base>
  );
}

// Phase 6 — Training & Adoption: knowledge-transfer cap
function GraduationCap(props: GlyphProps) {
  return (
    <Base {...props}>
      <path d="M2 9 L12 4 L22 9 L12 14 Z" />
      <path d="M6 11.5 V17 C6 18.5 9 20 12 20 C15 20 18 18.5 18 17 V11.5" strokeOpacity="0.55" />
      <path d="M22 9 V15" strokeOpacity="0.4" />
    </Base>
  );
}

// Phase 7 — Optimization & Oversight: ascending trend nodes
function TrendingUp(props: GlyphProps) {
  return (
    <Base {...props}>
      <path d="M3 17 L9.5 10.5 L13.5 14.5 L21 6" strokeOpacity="0.7" />
      <path d="M15 6 H21 V12" strokeOpacity="0.4" />
      <circle cx="9.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export const PROCESS_GLYPHS: Record<string, React.ElementType<GlyphProps>> = {
  Scan,
  Target,
  PenTool,
  Rocket,
  Layers,
  GraduationCap,
  TrendingUp,
};
