import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, MapPin, Calendar, Shield, Eye, Target, Users, ChevronDown } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import aboutHero from '@/assets/about-hero.jpg';
import founderHeadshot from '@/assets/founder-headshot.jpeg';
import { REGIONS } from '@/constants/config';
import { PROCESS_STEPS } from '@/constants/mockData';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import FAQSection from '@/components/features/FAQSection';
import MarketBars from '@/components/features/MarketBars';
import MagneticButton from '@/components/features/MagneticButton';
import TextMarquee from '@/components/features/TextMarquee';
import SplitTextReveal from '@/components/features/SplitTextReveal';
import CursorSpotlight from '@/components/features/CursorSpotlight';
import { cn } from '@/lib/utils';

function MethodologyCards() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {PROCESS_STEPS.slice(0, 4).map((step, i) => {
        const isExpanded = expandedId === step.id;
        return (
          <SectionReveal key={step.id} delay={i * 100} direction="scale">
            <GlowCard
              className={cn(
                'cursor-pointer transition-all duration-500',
                isExpanded && 'border-primary/30 shadow-[0_0_30px_hsla(152,76%,46%,0.08)]'
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : step.id)}
                className="w-full text-left p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center justify-center size-8 rounded-lg bg-primary/10 border border-primary/15 font-display text-xs font-bold text-primary tabular-nums">
                    {String(step.id).padStart(2, '0')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground/50 transition-transform duration-300',
                      isExpanded && 'rotate-180 text-primary'
                    )}
                  />
                </div>
                <h4 className="font-display text-sm font-bold text-foreground mb-1.5">
                  {step.title}
                </h4>
                <AnimatePresence mode="wait">
                  {isExpanded ? (
                    <motion.p
                      key="full"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      {step.description}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </AnimatePresence>
                {!isExpanded && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary/50 font-medium">
                    Tap to expand
                    <ArrowRight className="size-2.5" />
                  </span>
                )}
              </button>
            </GlowCard>
          </SectionReveal>
        );
      })}
    </div>
  );
}

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

export default function About() {
  usePageMeta({
    title: 'About Kivaro AI — Founded by Andrew Thomas | AI for Institutional Investment Firms',
    description: 'Kivaro AI was founded in 2025 by Andrew Thomas in Louisiana to bring structured AI execution into professional investment environments. We serve hedge funds, investment banks, private equity firms, and venture capital firms across Texas, Louisiana, Georgia, Mississippi, and Florida with a seven-phase deployment methodology emphasizing disciplined execution, institutional-grade security, and measurable operational gains.',
    canonicalPath: '/about',
  });

  return (
    <>
      {/* Hero */}
      <section className="relative z-base pt-16 pb-16 lg:pt-24 lg:pb-24 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <SectionReveal className="lg:col-span-6" direction="left">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-5">
                <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
                <span className="text-xs font-medium text-primary/80 tracking-wide uppercase font-display">
                  About Kivaro AI
                </span>
              </span>
              <SplitTextReveal
                text="Structured AI for Investment Excellence"
                as="h1"
                className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1]"
                delay={2}
                gradientFrom={3}
              />
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-pretty">
                Kivaro AI was established to bring structured AI execution into professional investment environments. We serve hedge funds, investment banks, private equity firms, and venture capital firms that require more than experimentation — they require dependable systems, disciplined workflows, and measurable operational gains.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 rounded-lg bg-kv-surface/60 border border-border/40 px-3 py-1.5"
                >
                  <Calendar className="size-3.5 text-primary/60" />
                  <span>Founded 2025</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 rounded-lg bg-kv-surface/60 border border-border/40 px-3 py-1.5"
                >
                  <MapPin className="size-3.5 text-primary/60" />
                  <span>Louisiana, USA</span>
                </motion.div>
              </div>
            </SectionReveal>

            <SectionReveal className="lg:col-span-6" delay={150} direction="right">
              <div className="relative rounded-2xl overflow-hidden group">
                <img
                  src={aboutHero}
                  alt="Abstract representation of AI-driven financial intelligence"
                  className="w-full h-[240px] sm:h-[320px] lg:h-[420px] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/20 rounded-2xl" />
                <div className="absolute inset-0 border border-primary/10 rounded-2xl transition-all duration-500 group-hover:border-primary/25" />
                {/* HUD corners */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-md" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-md" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-md" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-md" />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Founder */}
      <TextMarquee
        words={['Discipline', 'Precision', 'Intelligence', 'Execution', 'Systems', 'Automation', 'Advantage']}
        className="py-4"
      />
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="scale">
            <GlowCard className="overflow-hidden">
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
                    "We work with hedge funds, investment banks, private equity firms, venture capital firms, and other institutional investors that want artificial intelligence implemented with structure, discipline, and measurable impact — not experimentation for its own sake. The objective is operational leverage through intelligent systems. That is the standard we build to."
                  </blockquote>
                  <p className="mt-5 text-sm text-muted-foreground leading-relaxed text-pretty">
                    Andrew founded Kivaro AI to close the execution gap between advanced AI capabilities and practical deployment inside institutional investment environments. His approach emphasizes methodical systems building over experimental prototyping.
                  </p>
                </div>
              </div>
            </GlowCard>
          </SectionReveal>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="blur">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Operating Principles
              </h2>
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
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {v.title}
                        </h3>
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

      {/* Methodology Quick View */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="up">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                  Our Methodology
                </h2>
                <p className="mt-3 text-muted-foreground max-w-lg text-pretty">
                  Audit first, design precisely, implement in phases, optimize continuously.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/process"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-kv-mint transition-colors duration-300 shrink-0 group"
                >
                  View Full Methodology
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </SectionReveal>

          <MethodologyCards />
        </div>
      </section>

      {/* Regional Footprint */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="up">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Service Footprint
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
                Serving hedge funds, investment banks, private equity, and venture capital firms across the Southern United States with hybrid-remote delivery and on-site advisory.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal direction="scale">
            <div className="flex flex-wrap justify-center gap-4">
              {REGIONS.map((r, i) => (
                <motion.div
                  key={r.abbr}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 rounded-xl bg-kv-surface/50 border border-border/40 px-6 py-4 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_16px_hsla(152,76%,46%,0.06)]"
                >
                  <div className="size-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <span className="font-display text-sm font-bold text-primary">{r.abbr}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground/80">{r.state}</span>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <SectionReveal className="lg:col-span-4" direction="left">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-muted-foreground text-pretty">
                Common questions about our engagements, security, and methodology.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-kv-mint transition-colors duration-300 group"
              >
                Ask a Question
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </SectionReveal>

            <SectionReveal className="lg:col-span-8" direction="right" delay={100}>
              <FAQSection />
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  );
}
