interface AboutMotifProps {
  className?: string;
}

// Fine-line institutional/ledger motif — a stylized column with ruled
// ledger lines, echoing the "institutional-grade" framing already in the
// page's copy. Additive accent, placed via HudFrame; real photography on
// this page is untouched.
export default function AboutMotif({ className }: AboutMotifProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 40 L12 14 M36 40 L36 14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      <path d="M8 14 L24 6 L40 14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 40 L42 40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" strokeLinecap="round" />
      <path d="M17 20 H31 M17 25 H31 M17 30 H27" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" strokeLinecap="round" />
      <circle cx="24" cy="6" r="1.3" fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}
