/**
 * The AI team that runs Kivaro AI's own operations — Atlas, Pipeline, Pulse
 * and Chronicle. Shown on the site as proof that Kivaro builds and operates
 * agent systems daily, not as the product a client buys (that's the
 * Services grid). Mirrors kiv-console's src/lib/agents/roster.ts; the
 * division ids key the emblems in illustrations/division-emblems.tsx.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT, STAGGER } from '@/lib/motion';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  division: string;
}

export interface Division {
  id: string;
  label: string;
  color: string;
  glow: string;
  agents: Agent[];
}

export const DIVISIONS: Division[] = [
  {
    id: 'RNI',
    label: 'Market Intelligence',
    color: 'hsl(199,89%,60%)',
    glow: 'rgba(56,189,248,0.15)',
    agents: [
      { id: 'atlas', name: 'Atlas', role: 'Market Scout', division: 'RNI', description: "Tracks developments across hedge funds, private equity, venture capital and fund operations, and surfaces the conversations and publicity openings worth Kivaro's time." },
    ],
  },
  {
    id: 'ADW',
    label: 'Sales & Outreach',
    color: 'hsl(152,76%,46%)',
    glow: 'rgba(28,185,100,0.15)',
    agents: [
      { id: 'pipeline', name: 'Pipeline', role: 'Outreach Lead', division: 'ADW', description: 'Runs the Autonomous Lead Engine: researches firms, drafts tailored outreach for review, and keeps follow-ups on schedule.' },
    ],
  },
  {
    id: 'CBM',
    label: 'Content & Brand',
    color: 'hsl(262,72%,65%)',
    glow: 'rgba(139,92,246,0.12)',
    agents: [
      { id: 'pulse', name: 'Pulse', role: 'Content Strategist', division: 'CBM', description: "Plans and drafts Kivaro's LinkedIn, X and Instagram content for a fund-industry audience, for a human to edit and publish." },
    ],
  },
  {
    id: 'BPT',
    label: 'Operations',
    color: 'hsl(170,70%,48%)',
    glow: 'rgba(20,184,166,0.12)',
    agents: [
      { id: 'chronicle', name: 'Chronicle', role: 'Chief of Staff', division: 'BPT', description: 'Keeps the plan on schedule: weekly reviews, pace against targets, deadlines, and calendar pressure points.' },
    ],
  },
];

export function AgentCard({ agent, color, glow, index, example }: { agent: Agent; color: string; glow: string; index: number; example?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      id={`agent-${agent.id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * STAGGER, duration: 0.5, ease: EASE_OUT }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl border bg-background/40 backdrop-blur-sm p-4 cursor-default transition-all duration-300 scroll-mt-24"
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
          {example && (
            <div className="mt-2.5 pt-2.5 border-t border-border/30">
              <span className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/50">
                Illustrative example
              </span>
              <p className="mt-1 text-xs text-foreground/70 leading-relaxed italic">
                {example}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
