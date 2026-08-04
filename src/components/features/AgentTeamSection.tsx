/**
 * AgentTeamSection — Kivaro AI Sovereign Agent Team
 * 15 agents across 5 divisions, displayed as an interactive roster.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionReveal from './SectionReveal';
import SectionLabel from './SectionLabel';
import { DIVISION_EMBLEMS } from '@/components/illustrations/division-emblems';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  division: string;
}

interface Division {
  id: string;
  label: string;
  color: string;
  glow: string;
  agents: Agent[];
}

const DIVISIONS: Division[] = [
  {
    id: 'RNI',
    label: 'Research & Intelligence',
    color: 'hsl(199,89%,60%)',
    glow: 'rgba(56,189,248,0.15)',
    agents: [
      { id: 'atlas',    name: 'Atlas',    role: 'AI Landscape Monitor',     division: 'RNI', description: 'Tracks emerging AI tools, models, and competitor moves to surface opportunities for Kivaro\'s roadmap and clients.' },
      { id: 'meridian', name: 'Meridian', role: 'Fintech & Alts Analyst',   division: 'RNI', description: 'Delivers institutional-grade analysis on hedge funds, investment banks, private equity, venture capital, family offices, and alternative asset classes.' },
      { id: 'oracle',   name: 'Oracle',   role: 'Markets & Crypto Intel',   division: 'RNI', description: 'Monitors price action, on-chain data, macro signals, and crypto narrative cycles across equities and digital assets.' },
      { id: 'cipher',   name: 'Cipher',   role: 'Central Banking & Macro',  division: 'RNI', description: 'Decodes Fed policy, yield curves, inflation regimes, and monetary flows with second-order analysis for fund clients.' },
    ],
  },
  {
    id: 'ADW',
    label: 'Automation & Dev Workshop',
    color: 'hsl(152,76%,46%)',
    glow: 'rgba(28,185,100,0.15)',
    agents: [
      { id: 'forge',     name: 'Forge',     role: 'AI Integration Engineer', division: 'ADW', description: 'Architects and builds AI-powered integrations, automations, and pipelines across Python, Node.js, and custom APIs.' },
      { id: 'blueprint', name: 'Blueprint', role: 'Demo Build Planner',      division: 'ADW', description: 'Designs compelling AI demos for prospect meetings — translating client pain points into live, credible showcases.' },
      { id: 'pipeline',  name: 'Pipeline',  role: 'Lead Engine Manager',     division: 'ADW', description: 'Oversees the Autonomous Lead Engine — monitoring lead quality, enrichment results, and pipeline velocity.' },
      { id: 'pulse',     name: 'Pulse',     role: 'Social Media Automation', division: 'ADW', description: 'Manages content scheduling, engagement tracking, and growth strategies across LinkedIn and X.' },
    ],
  },
  {
    id: 'FPA',
    label: 'Finance & Portfolio Analytics',
    color: 'hsl(45,90%,55%)',
    glow: 'rgba(234,179,8,0.12)',
    agents: [
      { id: 'ledger', name: 'Ledger', role: 'Company Finance Tracker',    division: 'FPA', description: 'Monitors P&L, cash flow, revenue, expenses, and runway — providing CFO-level clarity for a founder-led operation.' },
      { id: 'ticker', name: 'Ticker', role: 'Investment & Price Action',  division: 'FPA', description: 'Tracks the investment portfolio across equities, crypto, and alternatives with entry/exit analysis and position sizing.' },
    ],
  },
  {
    id: 'CBM',
    label: 'Content & Brand Management',
    color: 'hsl(262,72%,65%)',
    glow: 'rgba(139,92,246,0.12)',
    agents: [
      { id: 'broadcast', name: 'Broadcast', role: 'Brand & Advertising',       division: 'CBM', description: 'Manages Kivaro AI\'s brand presence, ad campaigns, and marketing positioning with a bold, technical voice.' },
      { id: 'canvas',    name: 'Canvas',    role: 'Personal Brand Manager',    division: 'CBM', description: 'Builds thought leadership for Andrew Thomas — positioning him as a leading AI founder across LinkedIn and beyond.' },
    ],
  },
  {
    id: 'BPT',
    label: 'Business Processes & Taxonomy',
    color: 'hsl(170,70%,48%)',
    glow: 'rgba(20,184,166,0.12)',
    agents: [
      { id: 'nexus',     name: 'Nexus',     role: 'Document Organization',   division: 'BPT', description: 'Manages the company knowledge base, file taxonomy, and document workflows — nothing gets lost, everything is findable.' },
      { id: 'accord',    name: 'Accord',    role: 'Contract Management',     division: 'BPT', description: 'Tracks contracts, SOWs, and NDAs — flagging renewals, missing signatures, and key terms before they become risks.' },
      { id: 'chronicle', name: 'Chronicle', role: 'Scheduling & Reporting',  division: 'BPT', description: 'Manages calendar, meeting prep, and weekly reporting — eliminating scheduling friction and accountability gaps.' },
    ],
  },
];

function AgentCard({ agent, color, glow, index }: { agent: Agent; color: string; glow: string; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl border bg-background/40 backdrop-blur-sm p-4 cursor-default transition-all duration-300"
      style={{
        borderColor: hovered ? `${color}40` : 'hsla(0,0%,100%,0.06)',
        boxShadow: hovered ? `0 0 20px ${glow}` : 'none',
      }}
    >
      {/* Top accent line on hover */}
      <div
        className="absolute top-0 left-4 right-4 h-px rounded-full transition-opacity duration-300"
        style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)`, opacity: hovered ? 1 : 0 }}
      />

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="size-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            background: `${color}12`,
            border: `1px solid ${color}25`,
            boxShadow: hovered ? `0 0 10px ${color}30` : 'none',
          }}
        >
          <span className="font-display text-sm font-bold" style={{ color }}>
            {agent.name.charAt(0)}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm font-bold text-foreground">{agent.name}</span>
            <span
              className="text-[10px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color, background: `${color}12`, border: `1px solid ${color}20` }}
            >
              {agent.role}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            {agent.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AgentTeamSection() {
  const [activeDiv, setActiveDiv] = useState<string | null>(null);

  const displayed = activeDiv
    ? DIVISIONS.filter(d => d.id === activeDiv)
    : DIVISIONS;

  return (
    <section className="relative z-base py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">

        {/* Header */}
        <SectionReveal direction="blur">
          <div className="text-center mb-12">
            <SectionLabel index="05" label="Sovereign Agent Team" dot className="mb-3 justify-center" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              15 Agents. 5 Divisions. Always On.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              Every Kivaro AI engagement is powered by a coordinated team of sovereign AI agents —
              each with a defined role, live data access, and a direct line to execution.
              No templates. No no-code wrappers. Built in-house and deployed on your infrastructure.
            </p>
          </div>
        </SectionReveal>

        {/* Division filter tabs */}
        <SectionReveal direction="up">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveDiv(null)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all duration-200',
                activeDiv === null
                  ? 'bg-primary/15 border border-primary/30 text-primary'
                  : 'bg-background/40 border border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              All Divisions
            </button>
            {DIVISIONS.map(div => (
              <button
                key={div.id}
                onClick={() => setActiveDiv(activeDiv === div.id ? null : div.id)}
                className="px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all duration-200 border"
                style={{
                  color: activeDiv === div.id ? div.color : undefined,
                  background: activeDiv === div.id ? `${div.color}12` : undefined,
                  borderColor: activeDiv === div.id ? `${div.color}30` : 'hsla(0,0%,100%,0.08)',
                }}
              >
                {div.id}
                <span className="ml-1.5 opacity-60">·{div.agents.length}</span>
              </button>
            ))}
          </div>
        </SectionReveal>

        {/* Divisions */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-10">
            {displayed.map((div) => (
              <motion.div
                key={div.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Division header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${div.color}12`, border: `1px solid ${div.color}25`, color: div.color }}
                  >
                    {(() => {
                      const Emblem = DIVISION_EMBLEMS[div.id];
                      return Emblem ? <Emblem className="size-4" /> : <span className="font-display text-xs font-bold">{div.id}</span>;
                    })()}
                  </div>
                  <div>
                    <span className="font-display text-sm font-bold text-foreground">{div.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground/60">{div.agents.length} agents</span>
                  </div>
                  <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(to right, ${div.color}20, transparent)` }} />
                </div>

                {/* Agent cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {div.agents.map((agent, i) => (
                    <AgentCard key={agent.id} agent={agent} color={div.color} glow={div.glow} index={i} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Bottom stat bar */}
        <SectionReveal direction="up" delay={200}>
          <div className="mt-12 rounded-xl hairline-border bg-kv-surface/20 p-6 flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: '15', label: 'Sovereign Agents' },
              { value: '5',  label: 'Operating Divisions' },
              { value: '24/7', label: 'Autonomous Operation' },
              { value: '100%', label: 'Built In-House' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-display uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
