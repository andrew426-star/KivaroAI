import { useState, useEffect } from 'react';
import { NAV_LINKS, SITE_CONFIG, SECTION_IDS } from '@/constants/config';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import kivaroLogo from '@/assets/kivaro-logo.png';
import { EASE_OUT } from '@/lib/motion';

export default function Header() {
  const activeId = useScrollSpy(SECTION_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-nav bg-background h-16 transition-shadow duration-300',
        scrolled && 'border-b border-border shadow-[0_4px_20px_hsla(0,0%,0%,0.3)]'
      )}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-10 h-full">
        {/* Logo */}
        <a href="#the-brain" className="flex items-center gap-2.5 group" aria-label="Kivaro AI Home">
          <motion.img
            src={kivaroLogo}
            alt="Kivaro AI Logo"
            className="size-9 object-contain drop-shadow-[0_0_8px_hsla(152,76%,46%,0.35)]"
            whileHover={{ scale: 1.12, rotate: 6, filter: 'drop-shadow(0 0 12px hsla(152,76%,46%,0.5))' }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          />
          <span className="font-display text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
            {SITE_CONFIG.name}
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md',
                activeId === link.href.slice(1)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
              {activeId === link.href.slice(1) && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-px bg-primary shadow-[0_0_8px_hsla(152,76%,46%,0.4)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#deploy"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_30px_hsla(152,76%,46%,0.4),_0_0_60px_hsla(152,76%,46%,0.1)] hover:scale-[1.04] active:scale-[0.96] btn-magnetic overflow-hidden relative"
        >
          <span className="relative z-10">Start Consultation</span>
        </a>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden relative size-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-all duration-200 active:scale-90"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="size-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="size-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 block active:scale-[0.98]',
                      activeId === link.href.slice(1)
                        ? 'text-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <a
                  href="#deploy"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground active:scale-[0.97] transition-transform"
                >
                  Start Consultation
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
