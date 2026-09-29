import { Search, Cog, Rocket } from 'lucide-react';
import { SERVICES } from '@/constants/mockData';
import { LAUNCH } from '@/constants/config';
import SectionReveal from '@/components/features/SectionReveal';
import SectionLabel from '@/components/features/SectionLabel';
import StatCounter from '@/components/features/StatCounter';
import GlowCard from '@/components/features/GlowCard';
import Sparkline from '@/components/features/data-graphs/Sparkline';

const research = SERVICES.find((s) => s.id === 'research-automation')!;
const operations = SERVICES.find((s) => s.id === 'operations-automation')!;
const reporting = SERVICES.find((s) => s.id === 'reporting-automation')!;

// Pilot-program facts, not outcome percentages: until pilots have run,
// there are no client results to quote. Case-study numbers replace these
// once pilots finish.
const researchStat = { value: '1', suffix: '', label: 'Workflow per Pilot' };
const reportingStat = { value: String(LAUNCH.pilotWeeks), suffix: ' weeks', label: 'From Kickoff to Live' };
const deploymentStat = { value: String(LAUNCH.pilotSeats), suffix: '', label: `Pilot Seats Before ${LAUNCH.label}` };

const BEATS = [
  {
    icon: Search,
    title: research.title,
    description: research.description,
    stat: researchStat,
  },
  {
    icon: Cog,
    title: operations.title,
    description: `${operations.description} ${reporting.description}`,
    stat: reportingStat,
  },
  {
    icon: Rocket,
    title: 'Controlled Implementation',
    description: 'Phased deployment with validation checkpoints and performance benchmarks — each phase tested and approved before the next begins.',
    stat: deploymentStat,
  },
];

export default function Section03Workflow() {
  return (
    <section id="workflow" className="relative z-base py-20 lg:py-28 scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionReveal direction="blur">
          <div className="text-center mb-14">
            <SectionLabel index="03" label="Workflow" className="mb-3 justify-center" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              From Raw Data to Deployed Advantage
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              Three stages — research automation, operations and reporting automation, and
              controlled implementation — each measured against your team&apos;s current baseline.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {BEATS.map((beat, i) => (
            <SectionReveal key={beat.title} delay={i * 100} direction={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
              <GlowCard className="h-full">
                <div className="p-6 lg:p-8 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center size-10 rounded-lg bg-primary/8 border border-primary/15">
                      <beat.icon className="size-5 text-primary" />
                    </span>
                    <span className="text-xs font-display uppercase tracking-widest text-muted-foreground/60">
                      Stage {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{beat.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty flex-1">
                    {beat.description}
                  </p>
                  <div className="mt-6 pt-6 border-t border-border/30">
                    <StatCounter value={beat.stat.value} suffix={beat.stat.suffix} label={beat.stat.label} />
                    <div className="mt-4 flex justify-center">
                      <Sparkline count={10} heightClassName="h-8" className="w-24" />
                    </div>
                  </div>
                </div>
              </GlowCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
