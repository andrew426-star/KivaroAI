import type { NavLink } from '@/types';

export const SITE_CONFIG = {
  name: 'Kivaro AI',
  tagline: 'AI Automation & Intelligence for Hedge Funds',
  description: 'Kivaro AI designs secure, high-performance AI workflows that accelerate research, streamline operations, and strengthen decision infrastructure for hedge funds.',
  founded: 2025,
  founder: 'Andrew Thomas',
  location: 'Louisiana, United States',
  email: 'andrew.thomas@kivaroai.com',
  phone: '(985)-205-7688',
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Process', href: '/process' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const REGIONS = [
  { state: 'Texas', abbr: 'TX' },
  { state: 'Louisiana', abbr: 'LA' },
  { state: 'Georgia', abbr: 'GA' },
  { state: 'Mississippi', abbr: 'MS' },
  { state: 'Florida', abbr: 'FL' },
];
