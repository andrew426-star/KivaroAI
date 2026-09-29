import type { NavLink } from '@/types';

export const SITE_CONFIG = {
  name: 'Kivaro AI',
  tagline: 'AI Automation & Intelligence for Institutional Investment Firms',
  description: 'Kivaro AI designs secure AI workflows that accelerate research, streamline operations, and strengthen reporting for hedge funds, private equity and venture capital firms, quant funds, and their research and investor-relations teams.',
  founded: 2025,
  founder: 'Andrew Thomas',
  location: 'Louisiana, United States',
  email: 'andrew.thomas@kivaroai.com',
  phone: '(985)-205-7688',
} as const;

// Public launch and the pilot program that precedes it. Facts, not
// projections — shown in place of outcome statistics until pilots have
// produced real ones.
export const LAUNCH = {
  label: 'January 2027',
  pilotSeats: 3,
  pilotWeeks: 4,
} as const;

export const PILOT_FACTS = [
  { value: String(LAUNCH.pilotSeats), label: 'Pilot Seats' },
  { value: String(LAUNCH.pilotWeeks), label: 'Weeks per Pilot' },
  { value: '1', label: 'Workflow per Pilot' },
  { value: 'Jan 2027', label: 'Public Launch' },
] as const;

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#the-brain' },
  { label: 'Services', href: '#services' },
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
