import type { NavLink } from '@/types';

export const SITE_CONFIG = {
  name: 'Kivaro AI',
  tagline: 'AI Automation & Intelligence for Institutional Investment Firms',
  description: 'Kivaro AI designs secure, high-performance AI workflows that accelerate research, streamline operations, and strengthen decision infrastructure for hedge funds, investment banks, private equity firms, and venture capital firms.',
  founded: 2025,
  founder: 'Andrew Thomas',
  location: 'Louisiana, United States',
  email: 'andrew.thomas@kivaroai.com',
  phone: '(985)-205-7688',
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#the-brain' },
  { label: 'Agents', href: '#agents' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Trust', href: '#trust' },
  { label: 'Deploy', href: '#deploy' },
];

export const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1));

export const REGIONS = [
  { state: 'Texas', abbr: 'TX' },
  { state: 'Louisiana', abbr: 'LA' },
  { state: 'Georgia', abbr: 'GA' },
  { state: 'Mississippi', abbr: 'MS' },
  { state: 'Florida', abbr: 'FL' },
];
