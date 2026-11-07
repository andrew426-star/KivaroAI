import type { NavLink } from '@/types';

export const SITE_CONFIG = {
  name: 'Kivaro AI',
  tagline: 'AI Automation & Intelligence for Institutional Investment Firms',
  description: 'Kivaro AI builds secure AI workflows for private investment firms: private equity first, then venture capital, hedge funds and family offices. Each workflow runs on the firm\'s own data, inside systems it controls, and every output is cited back to its source.',
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
  date: 'January 12, 2027',
  pilotSeats: 3,
  pilotWeeks: 4,
} as const;

// Pricing follows the proof, as presented in the Top Dog final round
// (Nov 2026): a paid pilot, an implementation fee only if the pilot passes
// its agreed pass mark, then a monthly retainer.
export const PRICING = [
  { id: 'pilot', price: '$2,500', unit: 'one-time', label: 'Pilot', detail: 'Four weeks, one workflow, scored against an answer key your analysts build.' },
  { id: 'implement', price: '$15,000', unit: 'if it passes', label: 'Implementation', detail: 'The workflow rebuilt for production inside your systems, only after the pilot clears the pass mark agreed up front.' },
  { id: 'retainer', price: '$3,000', unit: 'per month', label: 'Retainer', detail: 'Monitoring, maintenance and tuning as your deals, templates and data change.' },
] as const;

// The four pilot weeks, in order. Every pilot starts from one of the
// in-house workflows in WORKFLOW_LIBRARY, rebuilt on the firm's own data.
export const PILOT_WEEKS = [
  { week: 1, title: 'Baseline', detail: 'We log the hours your team spends on recent deals, and your analysts build an answer key.' },
  { week: 2, title: 'Build', detail: 'One workflow, built inside your systems, with least-privilege access and an audit log.' },
  { week: 3, title: 'Side by Side', detail: 'Live deals run both ways, and an analyst checks every citation.' },
  { week: 4, title: 'Score', detail: 'Hours saved, accuracy against the answer key, and a go or no-go on the pass mark agreed up front.' },
] as const;

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
