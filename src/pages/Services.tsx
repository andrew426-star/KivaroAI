import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Filter, ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { SERVICES } from '@/constants/mockData';
import ServiceCard from '@/components/features/ServiceCard';
import SectionReveal from '@/components/features/SectionReveal';
import MarketBars from '@/components/features/MarketBars';
import MagneticButton from '@/components/features/MagneticButton';
import TextMarquee from '@/components/features/TextMarquee';
import SplitTextReveal from '@/components/features/SplitTextReveal';
import CursorSpotlight from '@/components/features/CursorSpotlight';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'research', label: 'Research' },
  { id: 'operations', label: 'Operations' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'architecture', label: 'Architecture' },
];

export default function Services() {
  usePageMeta({
    title: 'AI Services for Institutional Investment Firms — Kivaro AI',
    description: 'Kivaro AI offers nine specialized AI service lines for hedge funds, investment banks, private equity firms, and venture capital firms: research workflow automation, investment data pipelines, AI-assisted due diligence, fund operations automation, custom AI agents, internal knowledge systems, reporting automation, strategy dashboards, and secure AI stack architecture. All built for institutional-grade security and compliance.',
    canonicalPath: '/services',
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <CursorSpotlight size={700} intensity={0.06}>
        <section className="relative z-base pt-16 pb-16 lg:pt-24 lg:pb-20 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 opacity-[0.04] pointer-events-none h-20">
            <MarketBars barCount={60} />
          </div>
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative">
            <SectionReveal direction="blur">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-5">
                  <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
                  <span className="text-xs font-medium text-primary/80 tracking-wide uppercase font-display">
                    Capabilities
                  </span>
                </span>
                <SplitTextReveal
                  text="AI Systems for Institutional Investment Operations"
                  as="h1"
                  className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1]"
                  delay={2}
                  gradientFrom={3}
                />
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl text-pretty">
                  Nine specialized service lines spanning research automation, operational intelligence, custom AI agents, and secure infrastructure architecture. Each designed for institutional-grade deployment.
                </p>
              </div>
            </SectionReveal>
          </div>
        </section>
      </CursorSpotlight>

      {/* Category Filter + Service List */}
      <section className="relative z-base pb-20 lg:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          {/* Filter Bar */}
          <SectionReveal direction="left">
            <div className="flex flex-wrap items-center gap-2 mb-10">
              <Filter className="size-4 text-muted-foreground mr-1" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedId(null);
                  }}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 active:scale-95',
                    activeCategory === cat.id
                      ? 'bg-primary/10 text-primary border border-primary/25 shadow-[0_0_12px_hsla(152,76%,46%,0.08)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </SectionReveal>

          {/* Service Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {filtered.map((service, i) => (
              <SectionReveal key={service.id} delay={i * 60} direction={i % 3 === 0 ? 'left' : i % 3 === 1 ? 'up' : 'right'}>
                <ServiceCard
                  service={service}
                  index={SERVICES.indexOf(service)}
                  expanded={expandedId === service.id}
                  onToggle={() =>
                    setExpandedId(expandedId === service.id ? null : service.id)
                  }
                />
              </SectionReveal>
            ))}
          </motion.div>

        </div>
      </section>

      <section className="relative z-base pb-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          {/* Bottom CTA */}
          <TextMarquee
            words={['Research', 'Operations', 'Intelligence', 'Architecture', 'Automation', 'Security', 'Compliance']}
            className="py-8"
            reverse
          />
          <SectionReveal direction="scale">
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">
                Need a custom engagement scope?
              </p>
              <Link to="/contact">
                <MagneticButton
                  as="div"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_30px_hsla(152,76%,46%,0.35)] active:scale-[0.97]"
                  strength={0.12}
                >
                  Discuss Your Requirements
                  <ArrowUpRight className="size-4" />
                </MagneticButton>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
