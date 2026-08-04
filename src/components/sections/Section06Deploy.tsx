import { useState } from 'react';
import { ChevronDown, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROCESS_STEPS } from '@/constants/mockData';
import { SITE_CONFIG, REGIONS } from '@/constants/config';
import { PROCESS_GLYPHS } from '@/components/illustrations/process-glyphs';
import { cn } from '@/lib/utils';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import SectionLabel from '@/components/features/SectionLabel';
import MarketBars from '@/components/features/MarketBars';
import FAQSection from '@/components/features/FAQSection';
import ContactForm from '@/components/features/ContactForm';

// 7 real PROCESS_STEPS compressed into 4 stages — the last stage carries
// only 1 underlying phase (7 doesn't split evenly into 4), never padded
// with an invented fifth phase to force symmetry.
const STAGES = [
  { title: 'Audit & Prioritize', stepIds: [1, 2] },
  { title: 'Design & Build', stepIds: [3, 4] },
  { title: 'Integrate & Train', stepIds: [5, 6] },
  { title: 'Optimize & Scale', stepIds: [7] },
];

const CONTACT_DETAILS = [
  { icon: Mail, label: 'Email', value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
  { icon: Phone, label: 'Phone', value: SITE_CONFIG.phone, href: `tel:${SITE_CONFIG.phone.replace(/[^+\d]/g, '')}` },
  { icon: MapPin, label: 'Location', value: SITE_CONFIG.location, href: null },
  { icon: Clock, label: 'Response Time', value: 'Within 1 business day', href: null },
];

function StageCard({ stage, index }: { stage: (typeof STAGES)[number]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const steps = PROCESS_STEPS.filter((s) => stage.stepIds.includes(s.id));

  return (
    <SectionReveal delay={index * 90} direction="scale">
      <GlowCard className={cn('transition-all duration-500', expanded && 'border-primary/30 shadow-[0_0_30px_hsla(152,76%,46%,0.08)]')}>
        <button onClick={() => setExpanded((e) => !e)} className="w-full text-left p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center justify-center size-8 rounded-lg bg-primary/10 border border-primary/15 font-display text-xs font-bold text-primary tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <ChevronDown className={cn('size-4 text-muted-foreground/50 transition-transform duration-300', expanded && 'rotate-180 text-primary')} />
          </div>
          <h4 className="font-display text-base font-bold text-foreground mb-1.5">{stage.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {steps.length} phase{steps.length > 1 ? 's' : ''}: {steps.map((s) => s.title).join(' · ')}
          </p>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                  {steps.map((step) => {
                    const Icon = PROCESS_GLYPHS[step.icon] ?? PROCESS_GLYPHS.Scan;
                    return (
                      <div key={step.id} className="flex items-start gap-3">
                        <span className="mt-0.5 flex items-center justify-center size-7 rounded-md bg-primary/8 border border-primary/15 shrink-0">
                          <Icon className="size-3.5 text-primary" />
                        </span>
                        <div>
                          <p className="text-xs font-display font-semibold text-foreground">{step.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </GlowCard>
    </SectionReveal>
  );
}

export default function Section06Deploy() {
  return (
    <section id="deploy" className="relative z-base py-20 lg:py-28 overflow-hidden scroll-mt-16">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <MarketBars barCount={100} />
      </div>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative z-10">
        <SectionReveal direction="blur">
          <div className="text-center mb-12">
            <SectionLabel index="06" label="Deploy" className="mb-3 justify-center" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              Seven Phases, Four Stages
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              A structured, institutional methodology for controlled implementation — validation at
              every checkpoint, nothing skipped.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-20">
          {STAGES.map((stage, i) => (
            <StageCard key={stage.title} stage={stage} index={i} />
          ))}
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-20">
          <SectionReveal className="lg:col-span-4" direction="left">
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h3>
            <p className="mt-3 text-muted-foreground text-pretty">
              Common questions about our engagements, security, and methodology.
            </p>
          </SectionReveal>
          <SectionReveal className="lg:col-span-8" direction="right" delay={100}>
            <FAQSection />
          </SectionReveal>
        </div>

        {/* CTA + Contact */}
        <SectionReveal direction="blur">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-foreground text-balance">
              Precision over hype. <span className="text-gradient-animated">Measurable advantage.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Convert AI capability into institutional-grade operational systems. Schedule a discovery
              call to map your highest-impact automation opportunities.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <SectionReveal className="lg:col-span-7 xl:col-span-8" direction="left">
            <GlowCard>
              <div className="p-6 lg:p-10">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">
                  Submit an Inquiry
                </h3>
                <ContactForm />
              </div>
            </GlowCard>
          </SectionReveal>

          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <SectionReveal delay={100} direction="right">
              <GlowCard>
                <div className="p-6">
                  <h3 className="font-display text-base font-bold text-foreground mb-5">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {CONTACT_DETAILS.map((detail) => (
                      <div key={detail.label} className="flex items-start gap-3 group">
                        <div className="flex items-center justify-center size-9 rounded-lg bg-primary/8 border border-primary/15 shrink-0 mt-0.5 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-105">
                          <detail.icon className="size-4 text-primary/70" />
                        </div>
                        <div>
                          <span className="text-xs font-display font-medium text-muted-foreground uppercase tracking-wider">
                            {detail.label}
                          </span>
                          {detail.href ? (
                            <a href={detail.href} className="block text-sm text-foreground hover:text-primary transition-colors duration-300 mt-0.5">
                              {detail.value}
                            </a>
                          ) : (
                            <p className="text-sm text-foreground mt-0.5">{detail.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </SectionReveal>

            <SectionReveal delay={200} direction="right">
              <GlowCard>
                <div className="p-6">
                  <h3 className="font-display text-base font-bold text-foreground mb-3">Service Regions</h3>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((r) => (
                      <span
                        key={r.abbr}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground/70"
                      >
                        <span className="size-1 rounded-full bg-primary/40" />
                        {r.state}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    On-site advisory available for qualified engagements.
                  </p>
                </div>
              </GlowCard>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
