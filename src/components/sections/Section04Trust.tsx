import { Shield, Eye, Target, Users, Lock, Cog, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { SERVICES } from '@/constants/mockData';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import SectionLabel from '@/components/features/SectionLabel';
import MarketBars from '@/components/features/MarketBars';
import founderHeadshot from '@/assets/founder-headshot.jpeg';
import HudFrame from '@/components/features/HudFrame';
import AboutMotif from '@/components/illustrations/about-motif';
import SparkBars from '@/components/features/data-graphs/SparkBars';
import Sparkline from '@/components/features/data-graphs/Sparkline';
import RadialGauge from '@/components/features/data-graphs/RadialGauge';

const architecture = SERVICES.find((s) => s.id === 'ai-architecture')!;

const ARCHITECTURE_ICONS = [ShieldCheck, Lock, Cog, Activity];

const STAT_STRIP = [
  { value: '15', label: 'Sovereign Agents', graph: 'bars' as const },
  { value: '5', label: 'Operating Divisions', graph: 'bars' as const },
  { value: '24/7', label: 'Autonomous Operation', graph: 'sparkline' as const },
  { value: '100%', label: 'Built In-House', graph: 'gauge' as const },
];

const VALUES = [
  {
    icon: Shield,
    title: 'Disciplined Execution',
    description: 'We follow methodical, phased deployment. Every system is audited, designed, validated, and optimized before going live.',
  },
  {
    icon: Eye,
    title: 'Precision Over Hype',
    description: 'We measure success by workflow impact — not theoretical innovation. Every solution must deliver measurable operational gains.',
  },
  {
    icon: Target,
    title: 'Institutional-Grade Standards',
    description: 'Security, compliance, and institutional reliability are built into every architecture decision — not bolted on after the fact.',
  },
  {
    icon: Users,
    title: 'Systems Partner',
    description: 'We operate as an embedded extension of investment teams, not a software vendor. Long-term partnership over transactional delivery.',
  },
];

export default function Section04Trust() {
  return (
    <section id="trust" className="relative z-base py-20 lg:py-28 scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionReveal direction="blur">
          <div className="text-center mb-12">
            <SectionLabel index="04" label="Trust" className="mb-3 justify-center" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              Institutional-Grade by Design
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              Security, architecture, and operating principles built for the standards investment
              firms already answer to.
            </p>
          </div>
        </SectionReveal>

        {/* Stat strip */}
        <SectionReveal direction="scale">
          <div className="rounded-xl hairline-border bg-kv-surface/20 p-6 flex flex-wrap justify-center gap-8 text-center mb-14">
            {STAT_STRIP.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <div className="font-display text-2xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-display uppercase tracking-wider mt-0.5">{stat.label}</div>
                <div className="mt-3">
                  {stat.graph === 'gauge' && <RadialGauge value={100} size={40} />}
                  {stat.graph === 'sparkline' && <Sparkline count={8} heightClassName="h-6" className="w-16" />}
                  {stat.graph === 'bars' && <SparkBars count={8} barsClassName="h-6" className="w-16" />}
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Secure AI Stack Architecture — real ai-architecture features */}
        <SectionReveal direction="up">
          <div className="mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">{architecture.title}</h3>
            <p className="mt-2 text-muted-foreground max-w-2xl text-pretty">{architecture.description}</p>
          </div>
        </SectionReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {architecture.features.map((feature, i) => {
            const Icon = ARCHITECTURE_ICONS[i] ?? ShieldCheck;
            return (
              <SectionReveal key={feature} delay={i * 80} direction="up">
                <GlowCard>
                  <div className="p-5">
                    <span className="flex items-center justify-center size-10 rounded-lg bg-primary/8 border border-primary/15 mb-3">
                      <Icon className="size-5 text-primary" />
                    </span>
                    <p className="text-sm text-foreground/80 leading-relaxed">{feature}</p>
                  </div>
                </GlowCard>
              </SectionReveal>
            );
          })}
        </div>

        {/* Founder */}
        <SectionReveal direction="scale">
          <GlowCard className="overflow-hidden mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-4 p-8 lg:p-10 flex flex-col items-center lg:items-start justify-center border-b lg:border-b-0 lg:border-r border-border/40">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                  className="size-28 rounded-2xl overflow-hidden border-2 border-primary/20 mb-5 shadow-[0_0_40px_hsla(152,76%,46%,0.12)]"
                >
                  <img
                    src={founderHeadshot}
                    alt="Andrew Thomas — Founder & Principal, Kivaro AI"
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>
                <h3 className="font-display text-xl font-bold text-foreground">Andrew Thomas</h3>
                <p className="text-sm text-primary/70 font-medium mt-1">Founder & Principal</p>
                <div className="mt-4 opacity-40">
                  <MarketBars barCount={16} />
                </div>
              </div>
              <div className="lg:col-span-8 p-8 lg:p-10 flex flex-col justify-center">
                <blockquote className="text-foreground/85 leading-relaxed text-pretty text-base sm:text-lg italic">
                  "We work with hedge funds, investment banks, private equity firms, venture capital
                  firms, and other institutional investors that want artificial intelligence
                  implemented with structure, discipline, and measurable impact — not experimentation
                  for its own sake. The objective is operational leverage through intelligent systems.
                  That is the standard we build to."
                </blockquote>
                <p className="mt-5 text-sm text-muted-foreground leading-relaxed text-pretty">
                  Andrew founded Kivaro AI to close the execution gap between advanced AI capabilities
                  and practical deployment inside institutional investment environments. His approach
                  emphasizes methodical systems building over experimental prototyping.
                </p>
              </div>
            </div>
          </GlowCard>
        </SectionReveal>

        {/* Values */}
        <SectionReveal direction="blur">
          <div className="text-center mb-10">
            <HudFrame className="mx-auto mb-4 size-16 flex items-center justify-center" cornerClassName="w-3 h-3 border-primary/20">
              <AboutMotif className="size-8 text-primary/60" />
            </HudFrame>
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Operating Principles
            </h3>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-pretty">
              The standards that define every engagement and architecture decision.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VALUES.map((v, i) => (
            <SectionReveal key={v.title} delay={i * 80} direction={i % 2 === 0 ? 'left' : 'right'}>
              <GlowCard>
                <div className="p-7">
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className="flex items-center justify-center size-11 rounded-xl bg-primary/8 border border-primary/15 shrink-0"
                    >
                      <v.icon className="size-5 text-primary" />
                    </motion.div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-foreground">{v.title}</h4>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
                        {v.description}
                      </p>
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
