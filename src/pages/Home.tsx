import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Zap, Lock, TrendingUp, BarChart3, Network, Brain } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import heroBg from '@/assets/hero-bg.jpg';
import workflowVisual from '@/assets/workflow-visual.jpg';
import { SERVICES, STATS } from '@/constants/mockData';
import { REGIONS } from '@/constants/config';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import StatCounter from '@/components/features/StatCounter';
import WorkflowDiagram from '@/components/features/WorkflowDiagram';
import ProcessTimeline from '@/components/features/ProcessTimeline';
import ToolStack from '@/components/features/ToolStack';
import MarketBars from '@/components/features/MarketBars';
import MagneticButton from '@/components/features/MagneticButton';

const HERO_FEATURES = [
  { icon: Zap, label: 'Workflow Automation' },
  { icon: Lock, label: 'Secure Architecture' },
  { icon: TrendingUp, label: 'Decision Intelligence' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Home() {
  usePageMeta({
    title: 'Kivaro AI — AI Automation & Intelligence for Hedge Funds',
    description: 'Kivaro AI converts artificial intelligence into disciplined operational advantage for hedge funds. We automate research workflows, streamline fund operations, and build secure AI systems across the Southern U.S. — reducing research processing time by 73% and automating 40+ operational tasks.',
    canonicalPath: '/',
  });

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[calc(100dvh-104px)] lg:min-h-screen flex items-center overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/90" />
        </div>

        {/* Ambient market bars background accent */}
        <div className="absolute bottom-24 left-10 right-10 opacity-[0.06] pointer-events-none">
          <MarketBars barCount={80} />
        </div>

        {/* Hero Content */}
        <div className="relative z-base mx-auto max-w-[1400px] w-full px-6 lg:px-10 pt-16 pb-20 lg:pt-8 lg:pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left: Text */}
            <div className="lg:col-span-7 xl:col-span-6">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
              >
                {/* Tag */}
                <motion.div variants={item}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
                    <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
                    <span className="text-xs font-medium text-primary/80 tracking-wide uppercase font-display">
                      AI Automation for Hedge Funds
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  variants={item}
                  className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight text-balance"
                >
                  Intelligent Systems.{' '}
                  <span className="text-gradient-animated">Disciplined</span>{' '}
                  Execution.
                </motion.h1>

                <motion.p
                  variants={item}
                  className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty"
                >
                  Kivaro AI converts artificial intelligence into disciplined operational advantage for modern fund teams — from due diligence automation to investment data pipelines and internal knowledge systems.
                </motion.p>

                {/* CTAs */}
                <motion.div variants={item} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link to="/contact">
                    <MagneticButton
                      as="div"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_30px_hsla(152,76%,46%,0.35),_0_0_60px_hsla(152,76%,46%,0.1)] active:scale-[0.97]"
                      strength={0.15}
                    >
                      Schedule Discovery Call
                      <ArrowUpRight className="size-4" />
                    </MagneticButton>
                  </Link>
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-secondary transition-all duration-300 active:scale-[0.97]"
                  >
                    Explore Services
                    <ArrowRight className="size-4" />
                  </Link>
                </motion.div>

                {/* Feature Pills */}
                <motion.div variants={item} className="mt-6 sm:mt-10 flex flex-wrap gap-2 sm:gap-3">
                  {HERO_FEATURES.map(({ icon: Ic, label }, fi) => (
                    <motion.div
                      key={label}
                      whileHover={{ scale: 1.05, borderColor: 'hsla(152, 76%, 46%, 0.3)' }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 rounded-lg bg-kv-surface/60 border border-border/40 px-4 py-2 cursor-default"
                    >
                      <Ic className="size-3.5 text-primary/70" />
                      <span className="text-xs text-foreground/70 font-medium">{label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Right: Workflow Diagram */}
            <motion.div
              initial={{ opacity: 0, x: 40, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
              className="lg:col-span-5 xl:col-span-6"
            >
              <div className="relative rounded-2xl overflow-hidden bg-kv-surface/30 border border-border/40 backdrop-blur-sm p-4 lg:p-6 group hover:border-primary/20 transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-primary/40 animate-glow-pulse" />
                    <span className="size-2.5 rounded-full bg-kv-mint/30" style={{ animationDelay: '0.5s' }} />
                    <span className="size-2.5 rounded-full bg-kv-lime/30" style={{ animationDelay: '1s' }} />
                  </div>
                  <span className="text-[10px] font-display font-medium text-muted-foreground/60 uppercase tracking-widest ml-2">
                    AI Workflow Pipeline — Live
                  </span>
                  <span className="ml-auto size-2 rounded-full bg-emerald-400/60 animate-pulse" />
                </div>
                <WorkflowDiagram />
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/40 font-display uppercase tracking-widest">
                  <span>Data Ingestion</span>
                  <span>Processing</span>
                  <span>Output</span>
                </div>
                {/* Bottom market bars accent */}
                <div className="mt-3 opacity-50">
                  <MarketBars barCount={30} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="scale">
            <div className="relative rounded-2xl border border-border/40 bg-kv-surface/30 backdrop-blur-sm p-10 lg:p-14 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px shimmer-border" />
              <div className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none h-12">
                <MarketBars barCount={50} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
                {STATS.map((stat) => (
                  <StatCounter
                    key={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                  />
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ===== SERVICES OVERVIEW ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="left">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-12">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-display font-semibold text-primary/70 uppercase tracking-widest mb-3">
                  <Network className="size-3.5" />
                  Capabilities
                </span>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground text-balance">
                  Fund-Grade AI Systems
                </h2>
                <p className="mt-3 text-muted-foreground max-w-lg text-pretty">
                  Purpose-built automation and intelligence solutions designed for the operational rigor and security requirements of hedge fund environments.
                </p>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-kv-mint transition-colors duration-300 group shrink-0"
              >
                View All Services
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.slice(0, 6).map((service, i) => (
              <SectionReveal key={service.id} delay={i * 80} direction={i % 2 === 0 ? 'up' : 'scale'}>
                <GlowCard>
                  <Link to="/services" className="block p-6 group">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center size-9 rounded-lg bg-primary/8 border border-primary/15 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
                        <span className="text-xs font-bold text-primary font-display">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </span>
                      <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground/60">
                        {service.category}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary/50 group-hover:text-primary/80 transition-colors duration-300">
                      <span>Learn more</span>
                      <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </Link>
                </GlowCard>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW VISUALIZATION ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <SectionReveal className="lg:col-span-5" direction="left">
              <span className="inline-flex items-center gap-2 text-xs font-display font-semibold text-primary/70 uppercase tracking-widest mb-3">
                <Brain className="size-3.5" />
                No-Code Intelligence
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground text-balance">
                Visual Workflow Architecture
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
                We design AI workflows using visual, no-code orchestration platforms. Each pipeline is mapped, validated, and optimized before deployment — giving your team full visibility into how data flows through intelligent systems.
              </p>
              <div className="mt-6 space-y-3">
                {['Drag-and-drop pipeline design', 'Real-time monitoring dashboards', 'Version-controlled workflow history'].map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </motion.div>
                ))}
              </div>
            </SectionReveal>

            <SectionReveal className="lg:col-span-7" delay={150} direction="right">
              <div className="relative rounded-2xl overflow-hidden group">
                <img
                  src={workflowVisual}
                  alt="AI workflow visualization showing connected automation nodes"
                  className="w-full h-auto rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent rounded-2xl" />
                <div className="absolute inset-0 border border-primary/10 rounded-2xl transition-all duration-500 group-hover:border-primary/25" />
                {/* HUD overlay corners */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-md" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-md" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-md" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-md" />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="blur">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-xs font-display font-semibold text-primary/70 uppercase tracking-widest mb-3">
                <BarChart3 className="size-3.5" />
                Methodology
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Seven-Phase Deployment Model
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
                Structured, institutional methodology designed for controlled implementation with validation at every stage.
              </p>
              <Link
                to="/process"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-kv-mint transition-colors duration-300 group"
              >
                View Full Methodology
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </SectionReveal>

          <ProcessTimeline />
        </div>
      </section>

      {/* ===== TOOL STACK ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="up">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                Platform & Tooling
              </h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                Proven platforms integrated into secure, fund-grade architectures.
              </p>
            </div>
          </SectionReveal>
          <ToolStack />
        </div>
      </section>

      {/* ===== REGIONS ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="scale">
            <div className="rounded-2xl border border-border/40 bg-kv-surface/20 backdrop-blur-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-5 p-10 lg:p-14 flex flex-col justify-center">
                  <span className="text-xs font-display font-semibold text-primary/70 uppercase tracking-widest mb-3">
                    Regional Presence
                  </span>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                    Southern U.S. Coverage
                  </h2>
                  <p className="mt-3 text-muted-foreground text-pretty">
                    Hybrid-remote delivery with on-site advisory available for qualified engagements across five states.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-kv-mint transition-colors duration-300 group"
                  >
                    Check Availability
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-border/40 p-10 lg:p-14">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {REGIONS.map((r, i) => (
                      <motion.div
                        key={r.abbr}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3 cursor-default"
                      >
                        <div className="size-10 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center transition-all duration-300 hover:bg-primary/15 hover:shadow-[0_0_12px_hsla(152,76%,46%,0.12)]">
                          <span className="font-display text-sm font-bold text-primary">{r.abbr}</span>
                        </div>
                        <span className="text-sm text-foreground/80 font-medium">{r.state}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative z-base py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <MarketBars barCount={100} />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative z-10">
          <SectionReveal direction="blur">
            <div className="text-center">
              <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-foreground text-balance">
                Precision over hype.{' '}
                <span className="text-gradient-animated">Measurable advantage.</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Convert AI capability into fund-grade operational systems. Schedule a discovery call to map your highest-impact automation opportunities.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/contact">
                  <MagneticButton
                    as="div"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_40px_hsla(152,76%,46%,0.35),_0_0_80px_hsla(152,76%,46%,0.1)] active:scale-[0.97]"
                    strength={0.12}
                  >
                    Start Consultation
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
