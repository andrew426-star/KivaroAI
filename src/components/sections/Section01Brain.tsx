import { lazy, Suspense } from 'react';
import { ArrowUpRight, ArrowRight, Zap, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import MagneticButton from '@/components/features/MagneticButton';
import WorkflowDiagram from '@/components/features/WorkflowDiagram';
import MarketBars from '@/components/features/MarketBars';
import SplitTextReveal from '@/components/features/SplitTextReveal';
import CursorSpotlight from '@/components/features/CursorSpotlight';
import HeroMotif from '@/components/illustrations/hero-motif';
import ScrollParallax from '@/components/features/ScrollParallax';
import HeroEyebrow from '@/components/features/HeroEyebrow';
import ScrollCue from '@/components/features/ScrollCue';
import { LAUNCH } from '@/constants/config';

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

export default function Section01Brain() {
  return (
    <CursorSpotlight size={800} intensity={0.08}>
      <section id="the-brain" className="relative min-h-[calc(100dvh-64px)] lg:min-h-screen flex items-center overflow-hidden scroll-mt-16">
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
          {/* Softened from the original /45-/75-opaque + opaque-transparent-/90
              stops — that combination left the WebGL scene (rings, then the
              market motif, then the particles that assemble into both)
              almost entirely invisible on the real composited page, even
              though the canvas itself rendered correctly in isolation.
              Confirmed via direct canvas-vs-full-page screenshot comparison.
              Left edge stays strongly dark for H1 legibility; right edge
              (where the scene's content actually sits) no longer fades back
              toward opaque, since the "AI Workflow Pipeline" card already
              carries its own contrast. */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/20 to-background/60" />
          {/* Targeted rather than a smooth full-width fade: strong opacity
              held across the text column (0-40%), fading out by 60% so the
              pipeline card / scene content to the right stays clear —
              a smooth center-to-transparent fade left the text unreadably
              busy once the scene was bright enough to actually see. */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 from-0% via-background/85 via-40% to-transparent to-60%" />
        </motion.div>

        {/* Hero Content — a single left-aligned column, not a two-column
            grid. The prior two-column layout put the "AI Workflow
            Pipeline" card in its own right-side slot, directly over the
            WebGL graphic's core visual mass; shrinking that card to avoid
            covering the graphic just made the card itself look condensed
            and unappealing. Stacking the card into the SAME column as the
            text — below the CTAs/pills — solves both problems at once:
            the card gets its full natural size back (no more forced
            shrinking), and the entire right/center of the hero is left
            completely open for the graphic, since nothing else is
            positioned there anymore. This column also sits inside the
            same dark-gradient "text protection zone" already established
            for H1 legibility, so the card reads clearly against it the
            same way the text does. */}
        <div className="relative z-base mx-auto max-w-[1400px] w-full px-6 lg:px-10 pt-24 pb-20 lg:pt-8 lg:pb-0">
          <ScrollParallax className="max-w-2xl" distance={24}>
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item}>
                <HeroEyebrow label={`Launching ${LAUNCH.label} · ${LAUNCH.pilotSeats} pilot seats open`} className="mb-6" />
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
                Kivaro AI converts artificial intelligence into disciplined operational advantage for hedge funds, private equity and venture capital firms, and quant funds — from due diligence automation to investment data pipelines, investor reporting, and internal knowledge systems.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={item} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <a href="#deploy">
                  <MagneticButton
                    as="div"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_30px_hsla(152,76%,46%,0.35),_0_0_60px_hsla(152,76%,46%,0.1)] active:scale-[0.97]"
                    strength={0.15}
                  >
                    Apply for a Pilot
                    <ArrowUpRight className="size-4" />
                  </MagneticButton>
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-secondary transition-all duration-300 active:scale-[0.97]"
                >
                  Explore Services
                  <ArrowRight className="size-4" />
                </a>
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

              {/* Workflow Diagram — restored to its full original size/
                  styling now that it's stacked in-flow below the CTAs
                  rather than fighting for space beside the graphic. */}
              <motion.div variants={item} className="mt-8 sm:mt-10">
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
                  <div className="mt-3 opacity-50">
                    <MarketBars barCount={30} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </ScrollParallax>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <ScrollCue />
      </section>
    </CursorSpotlight>
  );
}
