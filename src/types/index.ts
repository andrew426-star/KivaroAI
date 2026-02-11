export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  category: 'research' | 'operations' | 'intelligence' | 'architecture';
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface Stat {
  label: string;
  value: string;
  suffix?: string;
}

export interface ToolItem {
  name: string;
  description: string;
  category: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

export interface RegionInfo {
  state: string;
  abbr: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}
