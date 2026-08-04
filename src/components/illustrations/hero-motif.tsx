interface HeroMotifProps {
  className?: string;
}

// Fine-line etched contour motif echoing HeroScene.tsx's own "volatility
// surface" language (layered undulating bands) — a hand-rolled inline SVG,
// referencing the palette via currentColor so it always tracks --kv-* /
// --primary exactly, never a hardcoded export color.
export default function HeroMotif({ className }: HeroMotifProps) {
  return (
    <svg
      viewBox="0 0 160 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 70 Q 20 55, 40 68 T 80 62 T 120 70 T 160 58"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.35"
      />
      <path
        d="M0 78 Q 20 65, 40 76 T 80 72 T 120 78 T 160 68"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.22"
      />
      <path
        d="M0 86 Q 20 76, 40 84 T 80 82 T 120 86 T 160 78"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.12"
      />
      <circle cx="118" cy="34" r="1.4" fill="currentColor" fillOpacity="0.5" />
      <circle cx="118" cy="34" r="5" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      <circle cx="118" cy="34" r="10" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
      <path d="M118 24 L118 8" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
      <path d="M128 34 L144 34" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
    </svg>
  );
}
