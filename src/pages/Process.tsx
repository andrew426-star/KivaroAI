import { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { PROCESS_STEPS } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import MarketBars from '@/components/features/MarketBars';
import MagneticButton from '@/components/features/MagneticButton';
import SplitTextReveal from '@/components/features/SplitTextReveal';
import { PROCESS_GLYPHS } from '@/components/illustrations/process-glyphs';
import HeroEyebrow from '@/components/features/HeroEyebrow';

const PhaseFlowScene = lazy(() => import('@/components/features/PhaseFlowScene'));

const ICON_MAP = PROCESS_GLYPHS;

// Extended descriptions for each phase
const PHASE_DETAILS: Record<number, { overview: string; deliverables: string[]; duration: string; keyActivities: string[] }> = {
  1: {
    overview: 'We begin every engagement with a comprehensive operational audit. Our team maps your firm\'s existing research workflows, reporting pipelines, data infrastructure, and team communication patterns. This deep-dive assessment surfaces the friction points, manual bottlenecks, and data silos that represent your highest-impact automation opportunities.',
    deliverables: ['Current-state workflow documentation', 'Technology stack assessment', 'Data flow mapping report', 'Automation opportunity matrix'],
    duration: '1–2 weeks',
    keyActivities: ['Stakeholder interviews with key team members', 'Existing system and tool inventory', 'Data source and flow mapping', 'Manual process identification and time analysis'],
  },
  2: {
    overview: 'Not every automation opportunity delivers equal value. We rank identified opportunities using a proprietary scoring framework that weighs impact on firm operations, technical feasibility, implementation risk, and time-to-value. This disciplined prioritization ensures we target the workflows that will generate the fastest and most measurable operational gains.',
    deliverables: ['Prioritized use-case roadmap', 'Impact vs. feasibility scoring matrix', 'Risk assessment per use case', 'Recommended implementation sequence'],
    duration: '3–5 days',
    keyActivities: ['Scoring each opportunity on impact, feasibility, and risk', 'Stakeholder alignment workshops', 'ROI projection modeling per use case', 'Final prioritization and sequencing'],
  },
  3: {
    overview: 'With priorities set, we design the technical architecture for each AI workflow. Using secure orchestration platforms like StackAI and integrated no-code tools, we create detailed system blueprints that specify data flows, processing logic, security layers, and integration touchpoints — all aligned with institutional-grade compliance and performance requirements.',
    deliverables: ['System architecture blueprint', 'Data flow and security design document', 'Integration specification sheets', 'Technology selection rationale'],
    duration: '1–2 weeks',
    keyActivities: ['AI workflow and agent architecture design', 'Security and compliance requirement mapping', 'Integration point specification', 'Performance benchmark definition'],
  },
  4: {
    overview: 'Implementation proceeds in controlled phases with validation checkpoints at every stage. Each workflow component is built, tested, and verified against performance benchmarks before moving to the next phase. This disciplined approach minimizes disruption to active firm operations while ensuring each deployed system meets institutional reliability standards.',
    deliverables: ['Deployed workflow components', 'Test reports and benchmark results', 'Phase validation sign-off documents', 'Rollback procedures for each phase'],
    duration: '2–4 weeks per phase',
    keyActivities: ['Phased component buildout', 'Unit and integration testing at each checkpoint', 'Performance benchmarking against targets', 'Stakeholder review and approval gates'],
  },
  5: {
    overview: 'New AI systems are layered into your existing firm infrastructure through carefully orchestrated integration. We connect to your current tools, data sources, CRM, portfolio management, and reporting systems with minimal disruption. Every integration is tested in isolation and then validated end-to-end before going live.',
    deliverables: ['Integration configuration documentation', 'End-to-end test results', 'Fallback and error-handling protocols', 'Monitoring dashboard setup'],
    duration: '1–2 weeks',
    keyActivities: ['API and data connector configuration', 'Isolated integration testing', 'End-to-end validation across systems', 'Error handling and alerting setup'],
  },
  6: {
    overview: 'Technology is only valuable when teams can use it effectively. We provide structured enablement sessions covering system operation, troubleshooting, and optimization. Comprehensive documentation ensures your team can maintain and evolve the deployed systems independently, building lasting internal capability.',
    deliverables: ['Team training session recordings', 'Operational playbooks and runbooks', 'System documentation and architecture guides', 'FAQ and troubleshooting reference'],
    duration: '3–5 days',
    keyActivities: ['Hands-on training workshops for operators', 'Admin and configuration training', 'Documentation walkthroughs', 'Knowledge transfer and Q&A sessions'],
  },
  7: {
    overview: 'Post-deployment, we provide ongoing monitoring, performance analysis, and iterative optimization. As your firm\'s needs evolve, we refine existing workflows, expand AI capabilities, and ensure your systems continue to deliver measurable operational advantage. This phase transforms the initial deployment into a continuously improving intelligence layer.',
    deliverables: ['Monthly performance reports', 'Optimization recommendations', 'Capability expansion roadmap', 'Ongoing monitoring and alert configuration'],
    duration: 'Ongoing',
    keyActivities: ['Performance data review and analysis', 'Workflow optimization iterations', 'New feature and capability scoping', 'Quarterly strategic review sessions'],
  },
};

export default function Process() {
  usePageMeta({
    title: 'Seven-Phase AI Deployment Methodology — Kivaro AI',
    description: 'Kivaro AI\'s seven-phase deployment model for hedge funds, investment banks, private equity firms, and venture capital firms: Discovery & Systems Audit, Use-Case Prioritization, Architecture Design, Controlled Implementation, Integration Layering, Training & Adoption, and Optimization & Oversight. Each phase includes validation checkpoints, deliverables, and performance benchmarks for institutional-grade AI deployment.',
    canonicalPath: '/process',
  });

  const [activePhase, setActivePhase] = useState(0);
  const step = PROCESS_STEPS[activePhase];
  const details = PHASE_DETAILS[step.id];
  const Icon = ICON_MAP[step.icon] || ICON_MAP.Scan;

  return (
    <>
      {/* Hero */}
      <section className="relative z-base pt-16 pb-10 lg:pt-24 lg:pb-16 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.03] pointer-events-none h-16">
          <MarketBars barCount={60} />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative">
          <SectionReveal direction="blur">
            <div className="max-w-3xl">
              <HeroEyebrow label="Methodology" className="mb-5" />
              <SplitTextReveal
                text="Seven-Phase Deployment Model"
                as="h1"
                className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1]"
                delay={2}
                gradientFrom={1}
              />
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-pretty">
                Our structured, institutional methodology is designed for controlled implementation with validation at every stage. Each phase builds on the last, ensuring quality, security, and measurable results.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Phase Navigator */}
      <section className="relative z-base pb-8">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="up">
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {PROCESS_STEPS.map((s, i) => {
                const StepIcon = ICON_MAP[s.icon] || ICON_MAP.Scan;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActivePhase(i)}
                    className={cn(
                      'relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 overflow-hidden',
                      i === activePhase
                        ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_20px_hsla(152,76%,46%,0.12)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent active:scale-95'
                    )}
                  >
                    {i === activePhase && (
                      <motion.div
                        layoutId="phase-active"
                        className="absolute inset-0 bg-primary/8 rounded-lg"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                      <StepIcon className="size-3.5 sm:size-4" />
                      <span className="hidden md:inline">{s.title}</span>
                      <span className="md:hidden font-display">P{s.id}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Phase Detail */}
      <section className="relative z-base pb-20 lg:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left: Main content */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  {/* Phase header */}
                  <GlowCard>
                    <div className="p-6 lg:p-8">
                      <div className="flex items-start gap-4 mb-5">
                        <motion.div
                          initial={{ scale: 0.8, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                          className="flex items-center justify-center size-14 rounded-xl bg-primary/10 border border-primary/20 shrink-0"
                        >
                          <Icon className="size-7 text-primary" />
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center size-6 rounded-md bg-primary/15 font-display text-xs font-bold text-primary tabular-nums">
                              {String(step.id).padStart(2, '0')}
                            </span>
                            <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Phase {step.id} of 7</span>
                          </div>
                          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed text-pretty text-base">
                        {details.overview}
                      </p>

                      {/* Duration badge */}
                      <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-1.5">
                        <span className="size-1.5 rounded-full bg-primary/50" />
                        <span className="text-xs font-medium text-primary/80 font-display">
                          Typical Duration: {details.duration}
                        </span>
                      </div>
                    </div>
                  </GlowCard>

                  {/* Workflow Diagram */}
                  <GlowCard>
                    <div className="p-5 lg:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1.5">
                          <span className="size-2 rounded-full bg-primary/40 animate-glow-pulse" />
                          <span className="size-2 rounded-full bg-kv-mint/30" style={{ animationDelay: '0.5s' }} />
                          <span className="size-2 rounded-full bg-kv-lime/30" style={{ animationDelay: '1s' }} />
                        </div>
                        <span className="text-[10px] font-display font-medium text-muted-foreground/60 uppercase tracking-widest ml-1">
                          Phase {step.id} Workflow — Live
                        </span>
                        <span className="ml-auto size-2 rounded-full bg-emerald-400/60 animate-pulse" />
                      </div>
                      <Suspense fallback={<div className="w-full h-[200px] lg:h-[260px]" />}>
                        <PhaseFlowScene phaseId={step.id} />
                      </Suspense>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/40 font-display uppercase tracking-widest">
                        <span>Input</span>
                        <span>Processing</span>
                        <span>Output</span>
                      </div>
                      <div className="mt-2 opacity-40">
                        <MarketBars barCount={24} />
                      </div>
                    </div>
                  </GlowCard>

                  {/* Key Activities */}
                  <GlowCard>
                    <div className="p-6 lg:p-8">
                      <h3 className="font-display text-base font-bold text-foreground mb-4">
                        Key Activities
                      </h3>
                      <div className="space-y-3">
                        {details.keyActivities.map((activity, i) => (
                          <motion.div
                            key={activity}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                            className="flex items-start gap-3 group"
                          >
                            <span className="mt-1.5 flex items-center justify-center size-5 rounded-md bg-primary/10 border border-primary/15 shrink-0 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                              <ChevronRight className="size-3 text-primary/70" />
                            </span>
                            <span className="text-sm text-foreground/80 leading-relaxed">{activity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </GlowCard>
                </div>

                {/* Right: Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  {/* Deliverables */}
                  <GlowCard>
                    <div className="p-6">
                      <h3 className="font-display text-base font-bold text-foreground mb-4">
                        Phase Deliverables
                      </h3>
                      <div className="space-y-2.5">
                        {details.deliverables.map((d, i) => (
                          <motion.div
                            key={d}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 + 0.15, duration: 0.3 }}
                            whileHover={{ x: 4 }}
                            className="flex items-start gap-2.5 py-2 border-b border-border/20 last:border-0"
                          >
                            <span className="mt-1 size-1.5 rounded-full bg-primary/50 shrink-0" />
                            <span className="text-sm text-foreground/80">{d}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </GlowCard>

                  {/* Phase Progress */}
                  <GlowCard>
                    <div className="p-6">
                      <h3 className="font-display text-base font-bold text-foreground mb-4">
                        Deployment Progress
                      </h3>
                      <div className="space-y-3">
                        {PROCESS_STEPS.map((s, i) => {
                          const StepIcon = ICON_MAP[s.icon] || ICON_MAP.Scan;
                          const isActive = i === activePhase;
                          const isPast = i < activePhase;
                          return (
                            <button
                              key={s.id}
                              onClick={() => setActivePhase(i)}
                              className={cn(
                                'w-full flex items-center gap-3 py-2 px-3 rounded-lg text-left transition-all duration-300',
                                isActive && 'bg-primary/10 border border-primary/20',
                                !isActive && 'hover:bg-secondary/40 border border-transparent'
                              )}
                            >
                              <div className={cn(
                                'size-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-300',
                                isActive ? 'bg-primary/20 text-primary' : isPast ? 'bg-primary/8 text-primary/50' : 'bg-border/30 text-muted-foreground/40'
                              )}>
                                <StepIcon className="size-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-xs font-medium truncate transition-colors',
                                  isActive ? 'text-primary' : isPast ? 'text-foreground/70' : 'text-muted-foreground/60'
                                )}>
                                  {s.title}
                                </p>
                              </div>
                              {isActive && (
                                <motion.div
                                  layoutId="progress-indicator"
                                  className="size-2 rounded-full bg-primary"
                                  transition={{ type: 'spring', stiffness: 300 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-5 flex items-center gap-1.5">
                        {PROCESS_STEPS.map((_, i) => (
                          <div
                            key={i}
                            className="h-1 rounded-full flex-1 transition-all duration-500"
                            style={{
                              background: i === activePhase
                                ? 'hsl(152 76% 46%)'
                                : i < activePhase
                                ? 'hsl(152 76% 46% / 0.3)'
                                : 'hsl(150 12% 14%)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </GlowCard>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                      disabled={activePhase === 0}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-secondary/40 py-3 text-sm font-medium text-foreground hover:border-primary/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                      <ArrowLeft className="size-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => setActivePhase(Math.min(PROCESS_STEPS.length - 1, activePhase + 1))}
                      disabled={activePhase === PROCESS_STEPS.length - 1}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-secondary/40 py-3 text-sm font-medium text-foreground hover:border-primary/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                      Next
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-base py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <MarketBars barCount={80} />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative z-10">
          <SectionReveal direction="scale">
            <div className="text-center">
              <h2 className="font-display text-3xl lg:text-4xl font-extrabold text-foreground text-balance">
                Ready to start your{' '}
                <span className="text-gradient-animated">deployment journey?</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-pretty">
                Schedule a discovery call to begin Phase 1 and map your firm's highest-impact automation opportunities.
              </p>
              <div className="mt-8">
                <Link to="/contact">
                  <MagneticButton
                    as="div"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_40px_hsla(152,76%,46%,0.35)] active:scale-[0.97]"
                    strength={0.12}
                  >
                    Begin Discovery
                    <ArrowUpRight className="size-5" />
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
