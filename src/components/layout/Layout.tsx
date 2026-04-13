import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import ParticleField from '@/components/features/ParticleField';
import GridBackground from '@/components/features/GridBackground';
import MarketTicker from '@/components/features/MarketTicker';
import AnimatedOutlet from '@/components/layout/AnimatedOutlet';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="noise-overlay relative min-h-screen flex flex-col">
      <GridBackground />
      <ParticleField />
      <Header />
      {/* Market ticker below header — flush with fixed 64px header */}
      <div className="fixed top-16 left-0 right-0 z-[40]">
        <MarketTicker />
      </div>
      {/* Spacer for fixed header (64px) + ticker (40px) */}
      <div className="h-[104px] shrink-0" aria-hidden="true" />
      <main className="relative z-base flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  );
}
