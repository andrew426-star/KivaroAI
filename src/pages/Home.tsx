import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Zap, Lock, TrendingUp, BarChart3, Network } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { SERVICES, STATS } from '@/constants/mockData';
import { REGIONS } from '@/constants/config';
import GlowCard from '@/components/features/GlowCard';
import SectionLabel from '@/components/features/SectionLabel';
import SectionReveal from '@/components/features/SectionReveal';
import StatCounter from '@/components/features/StatCounter';
import WorkflowDiagram from '@/components/features/WorkflowDiagram';
import ProcessTimeline from '@/components/features/ProcessTimeline';
import MarketBars from '@/components/features/MarketBars';
import MagneticButton from '@/components/features/MagneticButton';
import TextMarquee from '@/components/features/TextMarquee';
import SplitTextReveal from '@/components/features/SplitTextReveal';
import CursorSpotlight from '@/components/features/CursorSpotlight';
import ToolStack from '@/components/features/ToolStack';
import HeroMotif from '@/components/illustrations/hero-motif';
import ScrollParallax from '@/components/features/ScrollParallax';
import HeroEyebrow from '@/components/features/HeroEyebrow';

const HeroScene = lazy(() => import('@/components/features/HeroScene'));

const HERO_FEATURES = [
  { icon: Zap, label: 'Workflow Automation' },
  { icon: Lock, label: 'Secure Architecture' },
  { icon: TrendingUp, label: 'Decision Intelligence' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const MARQUEE_WORDS_1 = ['AI Automation', 'Institutional Finance', 'Workflow Intelligence', 'Due Diligence', 'Data Pipelines', 'Fund Operations', 'Secure Architecture'];
const MARQUEE_WORDS_2 = ['Research Automation', 'Portfolio Analytics', 'Custom AI Agents', 'Knowledge Systems', 'Strategy Dashboards', 'Reporting Automation', 'Compliance Systems'];

export default function Home() {
  usePageMeta({
    title: 'Kivaro AI — AI Automation & Intelligence for Institutional Investment Firms',
    description: 'Kivaro AI converts artificial intelligence into disciplined operational advantage for hedge funds, investment banks, private equity firms, and venture capital firms. We automate research workflows, streamline firm operations, and build secure AI systems across the Southern U.S. — reducing research processing time by 73% and automating 40+ operational tasks.',
    canonicalPath: '/',
  });

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <CursorSpotlight size={800} intensity={0.08}>
        <section className="relative min-h-[calc(100dvh-104px)] lg:min-h-screen flex items-center overflow-hidden">
          {/* Live 3D Data-Terrain Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
            <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/75 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/90" />
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-base mx-auto max-w-[1400px] w-full px-6 lg:px-10 pt-16 pb-20 lg:pt-8 lg:pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              {/* Left: Text */}
              <ScrollParallax className="lg:col-span-7 xl:col-span-6" distance={24}>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {/* Tag */}
                  <motion.div variants={item}>
                    <HeroEyebrow label="AI Automation for Investment Firms" className="mb-6" />
                  </motion.div>

                  <SplitTextReveal
                    text="Intelligent Systems. Disciplined Execution."
                    as="h1"
                    className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight"
                    delay={2}
                    gradientFrom={2}
                  />

                  <motion.p
                    variants={item}
                    className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty"
                  >
                    Kivaro AI converts artificial intelligence into disciplined operational advantage for hedge funds, investment banks, private equity, and venture capital firms — from due diligence automation to investment data pipelines and internal knowledge systems.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div variants={item} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link to="/contact">
                      <MagneticButton
                        as="div"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_30px_hsla(152,76%,46%,0.35),_0_0_60px_hsla(152,76%,46%,0.1)] active:scale-[0.97]"
                        strength={0.15}
                      >
                        Schedule Discovery Call
                        <ArrowUpRight className="size-4" />
                      </MagneticButton>
                    </Link>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-secondary transition-all duration-300 active:scale-[0.97]"
                    >
                      Explore Services
                      <ArrowRight className="size-4" />
                    </Link>
                  </motion.div>

                  {/* Feature Pills */}
                  <motion.div variants={item} className="mt-6 sm:mt-10 flex flex-wrap gap-2 sm:gap-3">
                    {HERO_FEATURES.map(({ icon: Ic, label }) => (
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
              </ScrollParallax>

              {/* Right: Workflow Diagram */}
              <motion.div
                initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 xl:col-span-6"
              >
                <div className="relative rounded-2xl overflow-hidden bg-kv-surface/30 hairline-border backdrop-blur-sm p-4 lg:p-6 group hover:border-primary/20 transition-all duration-500">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <HeroMotif className="pointer-events-none absolute -top-2 right-2 h-16 w-28 text-primary opacity-40" />
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
      </CursorSpotlight>

      {/* ===== MARQUEE DIVIDER ===== */}
      <TextMarquee words={MARQUEE_WORDS_1} className="py-6 lg:py-8" />

      {/* ===== STATS SECTION ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="scale">
            <div className="relative rounded-2xl hairline-border bg-kv-surface/30 backdrop-blur-sm p-10 lg:p-14 overflow-hidden">
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
                <SectionLabel index="01" label="Capabilities" icon={Network} className="mb-3" />
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground text-balance">
                  Institutional-Grade AI Systems
                </h2>
                <p className="mt-3 text-muted-foreground max-w-lg text-pretty">
                  Purpose-built automation and intelligence solutions designed for the operational rigor and security requirements of institutional investment environments.
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

      {/* ===== MARQUEE DIVIDER 2 (reverse) ===== */}
      <TextMarquee words={MARQUEE_WORDS_2} className="py-6 lg:py-8" reverse />

      {/* ===== TECH STACK ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="blur">
            <div className="text-center mb-12">
              <SectionLabel index="02" label="Built In-House" icon={Network} className="mb-3 justify-center" />
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                The Stack Behind Every Deployment
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
                Every Kivaro AI system is built on production-grade infrastructure — no off-the-shelf wrappers, no visual no-code tools. Custom pipelines, sovereign agents, and institutional-grade architecture from the ground up.
              </p>
            </div>
          </SectionReveal>
          <ToolStack />
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="blur">
            <div className="text-center mb-12">
              <SectionLabel index="03" label="Methodology" icon={BarChart3} className="mb-3 justify-center" />
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


      {/* ===== REGIONS ===== */}
      <section className="relative z-base py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="scale">
            <div className="rounded-2xl hairline-border bg-kv-surface/20 backdrop-blur-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-5 p-10 lg:p-14 flex flex-col justify-center">
                  <SectionLabel index="04" label="Regional Presence" className="mb-3" />
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
      <CursorSpotlight size={700} intensity={0.05}>
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
                  Convert AI capability into institutional-grade operational systems. Schedule a discovery call to map your highest-impact automation opportunities.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link to="/contact">
                    <MagneticButton
                      as="div"
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_40px_hsla(152,76%,46%,0.35),_0_0_80px_hsla(152,76%,46%,0.1)] active:scale-[0.97]"
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
      </CursorSpotlight>
    </>
  );
}
