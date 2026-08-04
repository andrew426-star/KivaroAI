import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import MarketBars from '@/components/features/MarketBars';
import MagneticButton from '@/components/features/MagneticButton';
import CursorSpotlight from '@/components/features/CursorSpotlight';
import SplitTextReveal from '@/components/features/SplitTextReveal';
import AgentTeamSection from '@/components/features/AgentTeamSection';
import HeroEyebrow from '@/components/features/HeroEyebrow';

const AgentConstellation = lazy(() => import('@/components/features/AgentConstellation'));

export default function Agents() {
  usePageMeta({
    title: 'AI Agent Team — Kivaro AI',
    description: 'Meet the 15 sovereign AI agents powering Kivaro AI operations across 5 divisions: Research & Intelligence, Automation & Dev Workshop, Finance & Portfolio Analytics, Content & Brand Management, and Business Processes & Taxonomy.',
    canonicalPath: '/agents',
  });

  return (
    <>
      {/* ===== HERO ===== */}
      <CursorSpotlight size={700} intensity={0.07}>
        <section className="relative min-h-[40vh] flex items-center overflow-hidden pt-16 pb-10">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <MarketBars barCount={80} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

          <div className="relative z-base mx-auto max-w-[1400px] w-full px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <HeroEyebrow label="Sovereign Agent Team" className="mb-6" />
            </motion.div>

            <SplitTextReveal
              text="15 Agents. Always On."
              as="h1"
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight"
              delay={2}
              gradientFrom={2}
            />

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl text-pretty"
            >
              Every Kivaro AI engagement is backed by a coordinated team of sovereign AI agents —
              each with a defined role, live data access, and a direct line to execution.
              Five divisions. No templates. No no-code wrappers. Built and deployed in-house.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
              className="mt-6 flex flex-wrap items-center gap-4"
            >
              <Link to="/contact">
                <MagneticButton
                  as="div"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_30px_hsla(152,76%,46%,0.35)] active:scale-[0.97]"
                  strength={0.15}
                >
                  Deploy a Team for Your Firm
                  <ArrowRight className="size-4" />
                </MagneticButton>
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                View All Services
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </CursorSpotlight>

      {/* ===== CONSTELLATION ===== */}
      <section className="relative z-base h-[420px] lg:h-[560px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Suspense fallback={null}>
            <AgentConstellation />
          </Suspense>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background pointer-events-none" />
      </section>

      {/* ===== AGENT TEAM ===== */}
      <AgentTeamSection />

      {/* ===== BOTTOM CTA ===== */}
      <CursorSpotlight size={600} intensity={0.05}>
        <section className="relative z-base py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <MarketBars barCount={60} />
          </div>
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative z-10 text-center">
            <h2 className="font-display text-2xl lg:text-4xl font-extrabold text-foreground text-balance">
              Ready to deploy your{' '}
              <span className="text-gradient-animated">agent team?</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty">
              We scope, build, and deploy a custom division structure tailored to your firm's
              workflows — research, operations, finance, and beyond.
            </p>
            <div className="mt-8">
              <Link to="/contact">
                <MagneticButton
                  as="div"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_40px_hsla(152,76%,46%,0.35)] active:scale-[0.97]"
                  strength={0.12}
                >
                  Start the Conversation
                  <ArrowRight className="size-5" />
                </MagneticButton>
              </Link>
            </div>
          </div>
        </section>
      </CursorSpotlight>
    </>
  );
}
