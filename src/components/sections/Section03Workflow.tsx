import { Briefcase, Layers, LineChart, CheckCircle2 } from 'lucide-react';
import { WORKFLOW_LIBRARY } from '@/constants/mockData';
import SectionReveal from '@/components/features/SectionReveal';
import SectionLabel from '@/components/features/SectionLabel';
import StatCounter from '@/components/features/StatCounter';
import GlowCard from '@/components/features/GlowCard';
import Sparkline from '@/components/features/data-graphs/Sparkline';

// The three flagship workflows from the in-house library, one per segment,
// as presented in the Top Dog final round. The stats under them are the
// honest framing from the same pitch: hours by hand, time to a draft an
// analyst still verifies, and a labelled projection a pilot measures.
const ICONS = [Briefcase, Layers, LineChart];
const STATS = [
  { value: '40–80', suffix: ' hrs', label: 'One deal, read by hand' },
  { value: '~50', suffix: ' min', label: 'To a draft an analyst verifies' },
  { value: '15', suffix: ' hrs/wk', label: 'Projected back per deal team' },
];

export default function Section03Workflow() {
  return (
    <section id="workflow" className="relative z-base py-20 lg:py-28 scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionReveal direction="blur">
          <div className="text-center mb-14">
            <SectionLabel index="03" label="Workflow" className="mb-3 justify-center" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              One Workflow for Each Desk
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              We&apos;ve built {WORKFLOW_LIBRARY.count} workflows in-house, demoed on sample fund data and
              public SEC filings. Every pilot starts from one of them, rebuilt on your firm&apos;s own data.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {WORKFLOW_LIBRARY.flagships.map((wf, i) => {
            const Icon = ICONS[i] ?? Briefcase;
            const stat = STATS[i];
            return (
              <SectionReveal key={wf.title} delay={i * 100} direction={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
                <GlowCard className="h-full">
                  <div className="p-6 lg:p-8 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center justify-center size-10 rounded-lg bg-primary/8 border border-primary/15">
                        <Icon className="size-5 text-primary" />
                      </span>
                      <span className="text-xs font-display uppercase tracking-widest text-muted-foreground/60">
                        {wf.segment}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">{wf.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty flex-1">
                      {wf.detail}
                    </p>
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <StatCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
                      <div className="mt-4 flex justify-center">
                        <Sparkline count={10} heightClassName="h-8" className="w-24" />
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </SectionReveal>
            );
          })}
        </div>

        <SectionReveal direction="up">
          <div className="mt-8 rounded-xl hairline-border bg-kv-surface/20 p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
            <span className="label-eyebrow text-primary/70 shrink-0">From the library</span>
            <ul className="flex flex-col sm:flex-row gap-3 sm:gap-8">
              {WORKFLOW_LIBRARY.demos.map((demo) => (
                <li key={demo} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="size-4 text-primary/70 shrink-0 mt-0.5" />
                  {demo}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground lg:ml-auto lg:max-w-xs text-pretty">
              Demo results on sample data, not client results. The 15-hour figure is a projection
              until a pilot measures it.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
