import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import ParticleField from '@/components/features/ParticleField';
import GridBackground from '@/components/features/GridBackground';
import { trackPageView } from '@/lib/analytics';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return (
    <div className="noise-overlay relative min-h-screen flex flex-col">
      <GridBackground />
      <ParticleField />
      <Header />
      {/* Spacer for fixed header (64px) */}
      <div className="h-16 shrink-0" aria-hidden="true" />
      <main className="relative z-base flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
