import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIVISIONS, AgentCard } from '@/components/features/AgentTeamSection';
import SectionReveal from '@/components/features/SectionReveal';
import SectionLabel from '@/components/features/SectionLabel';
import { DIVISION_EMBLEMS } from '@/components/illustrations/division-emblems';
import { cn } from '@/lib/utils';

const AgentConstellation = lazy(() => import('@/components/features/AgentConstellation'));

// One short, conservatively-written illustrative line per agent, grounded
// in that agent's real description above — never a captured transcript,
// always visibly tagged as such in AgentCard.
const ILLUSTRATIVE_EXAMPLES: Record<string, string> = {
  atlas: 'Atlas flags a newly released frontier model worth evaluating for an upcoming client build.',
  meridian: 'Meridian surfaces a shift in private-equity dry powder relevant to a client engagement.',
  oracle: 'Oracle notes an unusual volatility spike worth flagging to the portfolio team.',
  cipher: "Cipher summarizes today's central bank statement and its likely yield-curve impact.",
  forge: "Forge ships a new integration connecting a client's data feed into their reporting pipeline.",
  blueprint: 'Blueprint assembles a live demo script ahead of an upcoming prospect meeting.',
  pipeline: 'Pipeline flags a batch of enriched leads ready for outreach review.',
  pulse: "Pulse schedules this week's posts and reports on early engagement trends.",
  ledger: 'Ledger reports current runway and flags an upcoming expense spike.',
  ticker: 'Ticker flags a tracked position approaching its exit threshold.',
  broadcast: 'Broadcast reports on campaign performance and proposes a targeting adjustment.',
  canvas: "Canvas drafts a post supporting the founder's thought-leadership presence.",
  nexus: 'Nexus reorganizes a client folder so nothing goes missing before a deadline.',
  accord: 'Accord flags a contract renewal coming due within the next two weeks.',
  chronicle: "Chronicle preps tomorrow's meeting brief and flags a scheduling conflict.",
};

export default function Section02Agents() {
  const [activeDivision, setActiveDivision] = useState(DIVISIONS[0].id);
  const pendingScrollId = useRef<string | null>(null);
  const division = DIVISIONS.find((d) => d.id === activeDivision) ?? DIVISIONS[0];

  const handleSelectAgent = (agentId: string, divisionId: string) => {
    if (divisionId !== activeDivision) {
      pendingScrollId.current = agentId;
      setActiveDivision(divisionId);
    } else {
      document.getElementById(`agent-${agentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (!pendingScrollId.current) return;
    const id = pendingScrollId.current;
    pendingScrollId.current = null;
    const t = setTimeout(() => {
      document.getElementById(`agent-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 320);
    return () => clearTimeout(t);
  }, [activeDivision]);

  return (
    <section id="agents" className="relative z-base py-20 lg:py-28 scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionReveal direction="blur">
          <div className="text-center mb-10">
            <SectionLabel index="02" label="Sovereign Agent Team" dot className="mb-3 justify-center" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              15 Agents. 5 Divisions. Always On.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              Every Kivaro AI engagement is powered by a coordinated team of sovereign AI agents — each
              with a defined role, live data access, and a direct line to execution. Built in-house,
              deployed on your infrastructure.
            </p>
          </div>
        </SectionReveal>

        {/* Division tabs */}
        <SectionReveal direction="up">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {DIVISIONS.map((div) => {
              const Emblem = DIVISION_EMBLEMS[div.id];
              const active = div.id === activeDivision;
              return (
                <button
                  key={div.id}
                  onClick={() => setActiveDivision(div.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-display font-semibold uppercase tracking-wider transition-all duration-300 border',
                  )}
                  style={{
                    color: active ? div.color : undefined,
                    background: active ? `${div.color}12` : undefined,
                    borderColor: active ? `${div.color}35` : 'hsla(0,0%,100%,0.08)',
                  }}
                >
                  {Emblem && <Emblem className="size-3.5" />}
                  {div.id}
                  <span className="opacity-60 normal-case tracking-normal">· {div.agents.length}</span>
                </button>
              );
            })}
          </div>
        </SectionReveal>

        {/* Constellation backdrop, ambient + interactive */}
        <div className="relative h-[320px] lg:h-[420px] rounded-2xl hairline-border bg-kv-surface/20 overflow-hidden mb-10">
          <Suspense fallback={null}>
            <AgentConstellation onSelectAgent={handleSelectAgent} />
          </Suspense>
          <span className="label-eyebrow absolute top-4 left-4 text-primary/60 pointer-events-none">
            Agent Constellation
          </span>
        </div>

        {/* Active division agent grid — opacity-only crossfade, no slide/bounce */}
        <AnimatePresence mode="wait">
          <motion.div
            key={division.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="size-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${division.color}12`, border: `1px solid ${division.color}25`, color: division.color }}
              >
                {(() => {
                  const Emblem = DIVISION_EMBLEMS[division.id];
                  return Emblem ? <Emblem className="size-4" /> : <span className="font-display text-xs font-bold">{division.id}</span>;
                })()}
              </div>
              <div>
                <span className="font-display text-sm font-bold text-foreground">{division.label}</span>
                <span className="ml-2 text-xs text-muted-foreground/60">{division.agents.length} agents</span>
              </div>
              <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(to right, ${division.color}20, transparent)` }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {division.agents.map((agent, i) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  color={division.color}
                  glow={division.glow}
                  index={i}
                  example={ILLUSTRATIVE_EXAMPLES[agent.id]}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
