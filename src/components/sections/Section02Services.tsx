import { useState } from 'react';
import { SERVICES } from '@/constants/mockData';
import { DIVISIONS, AgentCard } from '@/components/features/AgentTeamSection';
import ServiceCard from '@/components/features/ServiceCard';
import SectionReveal from '@/components/features/SectionReveal';
import SectionLabel from '@/components/features/SectionLabel';
import { DIVISION_EMBLEMS } from '@/components/illustrations/division-emblems';

// Services first — what a firm actually engages Kivaro for — then the
// in-house agent team as proof of practice. The agents run Kivaro's own
// research, outreach, content and operations; they are not a product sold
// to clients, and the copy says so.
export default function Section02Services() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const agents = DIVISIONS.flatMap((d) => d.agents.map((a) => ({ agent: a, division: d })));

  return (
    <section id="services" className="relative z-base py-20 lg:py-28 scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionReveal direction="blur">
          <div className="text-center mb-10">
            <SectionLabel index="02" label="Services" dot className="mb-3 justify-center" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              AI Systems Built Around Your Workflows
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              From research and due diligence to fund operations and investor reporting — each
              engagement starts with one workflow, measured against how your team does it today.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {SERVICES.map((service, i) => (
            <SectionReveal key={service.id} delay={(i % 3) * 80} direction="up">
              <ServiceCard
                service={service}
                index={i}
                expanded={expanded === service.id}
                onToggle={() => setExpanded((cur) => (cur === service.id ? null : service.id))}
              />
            </SectionReveal>
          ))}
        </div>

        {/* How Kivaro runs itself */}
        <SectionReveal direction="up">
          <div className="mt-20 rounded-2xl hairline-border bg-kv-surface/20 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-6">
              <div>
                <span className="label-eyebrow text-primary/70">In Practice</span>
                <h3 className="mt-1 font-display text-xl lg:text-2xl font-bold text-foreground">
                  How we run Kivaro: four AI agents, every day
                </h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl text-pretty">
                We build agent systems for firms because we run on them ourselves. These four handle
                Kivaro&apos;s own research, outreach, content and operations, with a human reviewing
                anything that leaves the building.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {agents.map(({ agent, division }, i) => {
                const Emblem = DIVISION_EMBLEMS[division.id];
                return (
                  <div key={agent.id} className="flex flex-col gap-2">
                    <span
                      className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-widest"
                      style={{ color: division.color }}
                    >
                      {Emblem && <Emblem className="size-3" />}
                      {division.label}
                    </span>
                    <AgentCard agent={agent} color={division.color} glow={division.glow} index={i} />
                  </div>
                );
              })}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
