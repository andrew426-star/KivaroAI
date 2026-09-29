import { usePageMeta } from '@/hooks/usePageMeta';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import Section01Brain from '@/components/sections/Section01Brain';
import Section02Services from '@/components/sections/Section02Services';
import Section03Workflow from '@/components/sections/Section03Workflow';
import Section04Trust from '@/components/sections/Section04Trust';
import Section05Marquee from '@/components/sections/Section05Marquee';
import Section06Deploy from '@/components/sections/Section06Deploy';

export default function Home() {
  usePageMeta({
    title: 'Kivaro AI — AI Automation & Intelligence for Institutional Investment Firms',
    description: 'Kivaro AI converts artificial intelligence into disciplined operational advantage for hedge funds, private equity and venture capital firms, and quant funds: research automation, fund operations, investor reporting, and secure AI systems across the Southern U.S. Launching January 2027, with pilot seats open now.',
    canonicalPath: '/',
  });

  useScrollToHash();

  return (
    <>
      <Section01Brain />
      <Section02Services />
      <Section03Workflow />
      <Section04Trust />
      <Section05Marquee />
      <Section06Deploy />
    </>
  );
}
