import { usePageMeta } from '@/hooks/usePageMeta';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import Section01Brain from '@/components/sections/Section01Brain';
import Section02Agents from '@/components/sections/Section02Agents';
import Section03Workflow from '@/components/sections/Section03Workflow';
import Section04Trust from '@/components/sections/Section04Trust';
import Section05Marquee from '@/components/sections/Section05Marquee';
import Section06Deploy from '@/components/sections/Section06Deploy';

export default function Home() {
  usePageMeta({
    title: 'Kivaro AI — AI Automation & Intelligence for Institutional Investment Firms',
    description: 'Kivaro AI converts artificial intelligence into disciplined operational advantage for hedge funds, investment banks, private equity firms, and venture capital firms. We automate research workflows, streamline firm operations, and build secure AI systems across the Southern U.S. — reducing research processing time by 73% and automating 40+ operational tasks.',
    canonicalPath: '/',
  });

  useScrollToHash();

  return (
    <>
      <Section01Brain />
      <Section02Agents />
      <Section03Workflow />
      <Section04Trust />
      <Section05Marquee />
      <Section06Deploy />
    </>
  );
}
