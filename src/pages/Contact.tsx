import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { SITE_CONFIG, REGIONS } from '@/constants/config';
import ContactForm from '@/components/features/ContactForm';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import MarketBars from '@/components/features/MarketBars';

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: 'Email',
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: SITE_CONFIG.phone,
    href: `tel:${SITE_CONFIG.phone.replace(/[^+\d]/g, '')}`,
  },
  {
    icon: MapPin,
    label: 'Location',
    value: SITE_CONFIG.location,
    href: null,
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 1 business day',
    href: null,
  },
];

export default function Contact() {
  usePageMeta({
    title: 'Contact Kivaro AI — Schedule a Discovery Call',
    description: 'Contact Kivaro AI to schedule a discovery call and map your hedge fund\'s highest-impact automation opportunities. Email andrew.thomas@kivaroai.com or call (985)-205-7688. We respond to qualified inquiries within one business day. On-site advisory available across Texas, Louisiana, Georgia, Mississippi, and Florida.',
  });

  return (
    <>
      {/* Hero */}
      <section className="relative z-base pt-16 pb-10 lg:pt-24 lg:pb-16 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.03] pointer-events-none h-16">
          <MarketBars barCount={60} />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative">
          <SectionReveal direction="blur">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-5">
                <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
                <span className="text-xs font-medium text-primary/80 tracking-wide uppercase font-display">
                  Get In Touch
                </span>
              </span>
              <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] text-balance">
                Start Your{' '}
                <span className="text-gradient-animated">Discovery</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-pretty">
                Schedule a discovery call to map your highest-impact automation opportunities. We respond to qualified inquiries within one business day.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-base pb-20 lg:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form */}
            <SectionReveal className="lg:col-span-7 xl:col-span-8" direction="left">
              <GlowCard>
                <div className="p-6 lg:p-10">
                  <h2 className="font-display text-xl font-bold text-foreground mb-6">
                    Submit an Inquiry
                  </h2>
                  <ContactForm />
                </div>
              </GlowCard>
            </SectionReveal>

            {/* Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <SectionReveal delay={100} direction="right">
                <GlowCard>
                  <div className="p-6">
                    <h3 className="font-display text-base font-bold text-foreground mb-5">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      {CONTACT_DETAILS.map((detail, di) => (
                        <motion.div
                          key={detail.label}
                          initial={{ opacity: 0, x: 12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: di * 0.08, duration: 0.4 }}
                          className="flex items-start gap-3 group"
                        >
                          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/8 border border-primary/15 shrink-0 mt-0.5 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-105">
                            <detail.icon className="size-4 text-primary/70" />
                          </div>
                          <div>
                            <span className="text-xs font-display font-medium text-muted-foreground uppercase tracking-wider">
                              {detail.label}
                            </span>
                            {detail.href ? (
                              <a
                                href={detail.href}
                                className="block text-sm text-foreground hover:text-primary transition-colors duration-300 mt-0.5"
                              >
                                {detail.value}
                              </a>
                            ) : (
                              <p className="text-sm text-foreground mt-0.5">{detail.value}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </SectionReveal>

              <SectionReveal delay={200} direction="right">
                <GlowCard>
                  <div className="p-6">
                    <h3 className="font-display text-base font-bold text-foreground mb-3">
                      Engagement Options
                    </h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Discovery Call', desc: 'Initial assessment and opportunity mapping' },
                        { title: 'Pilot Engagement', desc: 'Single workflow proof-of-value deployment' },
                        { title: 'Workflow Audit', desc: 'Comprehensive operational systems review' },
                      ].map((opt, oi) => (
                        <motion.div
                          key={opt.title}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0 cursor-default"
                        >
                          <span className="mt-1 size-1.5 rounded-full bg-primary/50 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{opt.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </SectionReveal>

              <SectionReveal delay={300} direction="right">
                <GlowCard>
                  <div className="p-6">
                    <h3 className="font-display text-base font-bold text-foreground mb-3">
                      Service Regions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {REGIONS.map((r) => (
                        <motion.span
                          key={r.abbr}
                          whileHover={{ scale: 1.08 }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground/70 cursor-default transition-colors duration-300 hover:border-primary/25 hover:text-foreground"
                        >
                          <span className="size-1 rounded-full bg-primary/40" />
                          {r.state}
                        </motion.span>
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
    </>
  );
}
