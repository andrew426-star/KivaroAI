import type { SVGProps } from 'react';

// Fine-line emblem per agent division, one subject tied to each division's
// real function — replaces the plain colored-letter monogram in
// AgentTeamSection.tsx's division header. Strokes use currentColor so the
// existing per-division style={{ color: div.color }} wrapper still drives
// the color, unchanged.

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

// RNI — Research & Intelligence: a sweeping radar lens
function RNI(props: GlyphProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8" strokeOpacity="0.4" />
      <path d="M12 12 L12 4.5 A7.5 7.5 0 0 1 18 9.5 Z" fill="currentColor" fillOpacity="0.18" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </Base>
  );
}

// ADW — Automation & Dev Workshop: an engaged build gear
function ADW(props: GlyphProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 4.5v2.2M12 17.3v2.2M19.5 12h-2.2M6.7 12H4.5M17.5 6.5l-1.5 1.5M7.9 16.1l-1.5 1.5M17.5 17.5l-1.5-1.5M7.9 7.9 6.4 6.4" strokeOpacity="0.6" />
    </Base>
  );
}

// FPA — Finance & Portfolio Analytics: a candlestick ledger bar
function FPA(props: GlyphProps) {
  return (
    <Base {...props}>
      <line x1="6" y1="18" x2="6" y2="6" strokeOpacity="0.3" />
      <rect x="4.3" y="10" width="3.4" height="6" rx="0.6" />
      <line x1="12" y1="16" x2="12" y2="4" strokeOpacity="0.3" />
      <rect x="10.3" y="7" width="3.4" height="7" rx="0.6" />
      <line x1="18" y1="19" x2="18" y2="8" strokeOpacity="0.3" />
      <rect x="16.3" y="11" width="3.4" height="5" rx="0.6" />
    </Base>
  );
}

// CBM — Content & Brand Management: outward broadcast signal
function CBM(props: GlyphProps) {
  return (
    <Base {...props}>
      <path d="M4 14 L11 10 V18 L4 14 Z" />
      <path d="M11 10 L20 6 V20 L11 18" strokeOpacity="0.7" />
      <path d="M15 3.5 C17 5 17.5 8 16 10.5" strokeOpacity="0.4" />
    </Base>
  );
}

// BPT — Business Processes & Taxonomy: a document hierarchy node
function BPT(props: GlyphProps) {
  return (
    <Base {...props}>
      <rect x="9.5" y="3.5" width="5" height="4" rx="0.8" />
      <path d="M12 7.5 V11 M12 11 H6 M12 11 H18 M6 11 V13.5 M18 11 V13.5" strokeOpacity="0.55" />
      <rect x="3.5" y="13.5" width="5" height="4" rx="0.8" />
      <rect x="15.5" y="13.5" width="5" height="4" rx="0.8" />
    </Base>
  );
}

export const DIVISION_EMBLEMS: Record<string, React.ElementType<GlyphProps>> = {
  RNI,
  ADW,
  FPA,
  CBM,
  BPT,
};
