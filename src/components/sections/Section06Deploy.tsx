import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { SITE_CONFIG, REGIONS, PILOT_WEEKS, PRICING, LAUNCH } from '@/constants/config';
import { cn } from '@/lib/utils';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import SectionLabel from '@/components/features/SectionLabel';
import MarketBars from '@/components/features/MarketBars';
import FAQSection from '@/components/features/FAQSection';
import ContactForm from '@/components/features/ContactForm';

const CONTACT_DETAILS = [
  { icon: Mail, label: 'Email', value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
  { icon: Phone, label: 'Phone', value: SITE_CONFIG.phone, href: `tel:${SITE_CONFIG.phone.replace(/[^+\d]/g, '')}` },
  { icon: MapPin, label: 'Location', value: SITE_CONFIG.location, href: null },
  { icon: Clock, label: 'Response Time', value: 'Within 1 business day', href: null },
];

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
              A Pilot That Proves Itself in {LAUNCH.pilotWeeks} Weeks
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              One workflow, scored against an answer key your own analysts build, with a pass mark
              agreed before we start.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {PILOT_WEEKS.map((w, i) => (
            <SectionReveal key={w.week} delay={i * 90} direction="scale">
              <GlowCard className="h-full">
                <div className="p-6">
                  <span className="inline-flex items-center rounded-lg bg-primary/10 border border-primary/15 px-2.5 py-1 font-display text-xs font-bold text-primary tabular-nums mb-3">
                    Week {w.week}
                  </span>
                  <h4 className="font-display text-base font-bold text-foreground mb-1.5">{w.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.detail}</p>
                </div>
              </GlowCard>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal direction="up">
          <div className="text-center mb-5">
            <span className="label-eyebrow text-primary/70">Pricing follows the proof</span>
          </div>
        </SectionReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-20">
          {PRICING.map((tier, i) => (
            <SectionReveal key={tier.id} delay={i * 90} direction="up">
              <GlowCard className="h-full">
                <div className="p-6 text-center">
                  <p className="text-xs font-display uppercase tracking-widest text-muted-foreground/70">{tier.label}</p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-primary">{tier.price}</p>
                  <p className="text-xs text-muted-foreground">{tier.unit}</p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-pretty">{tier.detail}</p>
                </div>
              </GlowCard>
            </SectionReveal>
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
              Kivaro AI launches publicly on {LAUNCH.date}. Until then, {LAUNCH.pilotSeats} firms get a
              four-week pilot on one high-impact workflow. Apply for a seat, or join the launch waitlist.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <SectionReveal className="lg:col-span-7 xl:col-span-8" direction="left">
            <GlowCard>
              <div className="p-6 lg:p-10">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Apply for a Pilot or Join the Waitlist
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose &ldquo;Pilot Application&rdquo; and tell us the workflow that eats the most of your
                  team&apos;s week, &ldquo;Launch Waitlist&rdquo; to hear when we go live, or
                  &ldquo;Investor Inquiry&rdquo; if you&apos;d like to talk about our pre-seed round.
                </p>
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
