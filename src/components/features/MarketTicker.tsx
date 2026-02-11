import { useEffect, useRef, useState } from 'react';

interface TickerItem {
  symbol: string;
  value: string;
  change: number;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: 'AI WORKFLOW', value: '94.7%', change: 12.3 },
  { symbol: 'RESEARCH EFF', value: '73.2%', change: 8.1 },
  { symbol: 'OPS VELOCITY', value: '4.2x', change: 15.6 },
  { symbol: 'DATA PROC', value: '340ms', change: -22.4 },
  { symbol: 'COMPLIANCE', value: '99.8%', change: 0.3 },
  { symbol: 'ROI INDEX', value: '287%', change: 34.2 },
  { symbol: 'DEPLOY TIME', value: '6.2w', change: -18.5 },
  { symbol: 'AUTOMATION', value: '40+', change: 5.7 },
];

export default function MarketTicker() {
  const [items, setItems] = useState(TICKER_DATA);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        change: item.change + (Math.random() - 0.5) * 2,
      })));
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-primary/10 bg-background/60 backdrop-blur-sm py-3">
      <div className="animate-ticker flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="inline-flex items-center gap-3 px-6 border-r border-border/30 last:border-0"
          >
            <span className="text-xs font-display font-semibold text-muted-foreground/70 tracking-wider">
              {item.symbol}
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {item.value}
            </span>
            <span
              className={`text-xs font-medium tabular-nums ${
                item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
