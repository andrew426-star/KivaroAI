import { Link } from 'react-router-dom';
import { SITE_CONFIG, NAV_LINKS, REGIONS } from '@/constants/config';
import { MapPin, Mail, Phone, ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import kivaroLogo from '@/assets/kivaro-logo.png';
import MagneticButton from '@/components/features/MagneticButton';
import TextMarquee from '@/components/features/TextMarquee';

export default function Footer() {
  return (
    <footer className="relative z-base border-t border-border bg-background/80">
      {/* Scrolling brand marquee */}
      <TextMarquee
        words={['Kivaro AI', 'Hedge Fund Intelligence', 'AI Automation', 'Disciplined Execution', 'Fund-Grade Systems']}
        className="py-5 border-b border-border/30"
      />

      {/* Top CTA Band */}
      <div className="border-b border-border overflow-hidden relative">
        {/* Ambient gradient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, hsla(152, 76%, 46%, 0.05), transparent 60%)',
          }}
        />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative">
          <div>
            <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground text-balance">
              Ready to automate your fund operations?
            </h3>
            <p className="mt-2 text-muted-foreground max-w-lg">
              Schedule a discovery call to map your highest-impact automation opportunities.
            </p>
          </div>
          <Link to="/contact">
            <MagneticButton
              as="div"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_30px_hsla(152,76%,46%,0.35)] active:scale-[0.97] shrink-0"
              strength={0.12}
            >
              Schedule Discovery Call
              <ArrowUpRight className="size-4" />
            </MagneticButton>
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={kivaroLogo}
                alt="Kivaro AI Logo"
                className="size-8 object-contain drop-shadow-[0_0_6px_hsla(152,76%,46%,0.3)] transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-display text-base font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Specialized AI automation and intelligence partner for hedge funds across the Southern United States.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-3.5 text-primary/60" />
                {SITE_CONFIG.location}
              </div>
              <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 group">
                <Mail className="size-3.5 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
                {SITE_CONFIG.email}
              </a>
              <a href={`tel:${SITE_CONFIG.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 group">
                <Phone className="size-3.5 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
                {SITE_CONFIG.phone}
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="size-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Quick Links */}
          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Capabilities
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                'Research Automation',
                'Data Pipelines',
                'Due Diligence',
                'Operations Automation',
                'Custom AI Agents',
                'Knowledge Systems',
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/services"
                    className="text-sm text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    {item}
                    <ArrowRight className="size-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Service Regions
            </h4>
            <ul className="flex flex-col gap-2.5">
              {REGIONS.map((r) => (
                <li key={r.abbr} className="text-sm text-foreground/70 flex items-center gap-2 group cursor-default">
                  <span className="inline-block size-1.5 rounded-full bg-primary/40 transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_6px_hsla(152,76%,46%,0.4)]" />
                  <span className="transition-colors duration-300 group-hover:text-foreground">{r.state}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Precision over hype. Measurable workflow advantage.
          </p>
        </div>
      </div>
    </footer>
  );
}
