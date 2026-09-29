import type { Service, ProcessStep, ToolItem, FAQ } from '@/types';

export const SERVICES: Service[] = [
  {
    id: 'research-automation',
    title: 'AI Research Workflow Automation',
    description: 'Accelerate investment research with AI-powered pipelines that process filings, earnings calls, market data, and proprietary datasets into structured, actionable intelligence.',
    icon: 'Search',
    features: [
      'Automated SEC filing extraction and summarization',
      'Earnings call transcript analysis and sentiment scoring',
      'Market signal aggregation from multi-source data feeds',
      'Proprietary research template generation',
    ],
    category: 'research',
  },
  {
    id: 'data-pipelines',
    title: 'Investment Data Processing Pipelines',
    description: 'Build robust data ingestion and transformation pipelines that normalize heterogeneous market data into consistent, analysis-ready formats.',
    icon: 'Database',
    features: [
      'Multi-source market data normalization',
      'Real-time and batch processing architecture',
      'Custom data validation and quality gates',
      'Automated anomaly detection and alerting',
    ],
    category: 'intelligence',
  },
  {
    id: 'due-diligence',
    title: 'AI-Assisted Due Diligence Systems',
    description: 'Systematize due diligence workflows with AI agents that extract, cross-reference, and flag critical information across documents and data rooms.',
    icon: 'ShieldCheck',
    features: [
      'Document intelligence extraction from data rooms',
      'Automated risk factor identification and scoring',
      'Cross-reference verification across multiple sources',
      'Compliance checkpoint automation',
    ],
    category: 'research',
  },
  {
    id: 'operations-automation',
    title: 'Fund Operations Automation',
    description: 'Eliminate manual bottlenecks across fund administration, deal and portfolio reconciliation, NAV calculations, and operational reporting through intelligent automation.',
    icon: 'Cog',
    features: [
      'Trade reconciliation and exception handling',
      'Automated NAV calculation verification',
      'Operational report generation and distribution',
      'Workflow orchestration across fund admin systems',
    ],
    category: 'operations',
  },
  {
    id: 'custom-agents',
    title: 'Custom AI Agent Development',
    description: 'Purpose-built AI agents designed for specific fund workflows — from portfolio monitoring to counterparty analysis to investor query handling.',
    icon: 'Bot',
    features: [
      'Conversational AI for investor relations queries',
      'Portfolio monitoring and alert agents',
      'Counterparty risk assessment automation',
      'Custom agent orchestration and chaining',
    ],
    category: 'intelligence',
  },
  {
    id: 'knowledge-systems',
    title: 'Internal Knowledge Systems',
    description: 'Build secure, searchable AI knowledge bases that centralize fund expertise, research history, and institutional memory for rapid retrieval.',
    icon: 'Library',
    features: [
      'Secure vector-based knowledge retrieval',
      'Research history indexing and search',
      'Institutional knowledge capture workflows',
      'Role-based access control and audit trails',
    ],
    category: 'intelligence',
  },
  {
    id: 'reporting-automation',
    title: 'Reporting & Investor Communications',
    description: 'Automate the generation and distribution of investor reports, performance summaries, and compliance documentation with consistent formatting and data accuracy.',
    icon: 'FileText',
    features: [
      'Automated monthly and quarterly report generation',
      'Performance attribution narrative automation',
      'Investor portal content management',
      'Regulatory filing preparation assistance',
    ],
    category: 'operations',
  },
  {
    id: 'strategy-dashboards',
    title: 'Strategy Intelligence Dashboards',
    description: 'Real-time intelligence surfaces that aggregate portfolio analytics, market signals, and AI-generated insights into unified decision-support interfaces.',
    icon: 'LayoutDashboard',
    features: [
      'Portfolio analytics visualization',
      'AI-generated market signal feeds',
      'Customizable alert and threshold systems',
      'Cross-strategy performance comparison views',
    ],
    category: 'architecture',
  },
  {
    id: 'ai-architecture',
    title: 'Secure AI Stack Architecture',
    description: 'Design and implement AI infrastructure on vetted enterprise platforms, with security, compliance, and performance at the core.',
    icon: 'Shield',
    features: [
      'Secure workflow deployment on vetted enterprise AI platforms',
      'Data isolation and encryption architecture',
      'Compliance-aware system design',
      'Performance monitoring and optimization',
    ],
    category: 'architecture',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    title: 'Discovery & Systems Audit',
    description: 'Operational mapping of firm research, reporting, and data workflows to understand existing infrastructure and identify automation surfaces.',
    icon: 'Scan',
  },
  {
    id: 2,
    title: 'Use-Case Prioritization',
    description: 'Identification of high-leverage automation and AI intelligence opportunities ranked by impact, feasibility, and risk profile.',
    icon: 'Target',
  },
  {
    id: 3,
    title: 'Architecture Design',
    description: 'Secure AI workflow and agent architecture on vetted platforms and integrated tools, designed for institutional-grade security and compliance requirements.',
    icon: 'PenTool',
  },
  {
    id: 4,
    title: 'Controlled Implementation',
    description: 'Phased deployment with validation checkpoints and performance benchmarks. Each phase is tested and approved before proceeding.',
    icon: 'Rocket',
  },
  {
    id: 5,
    title: 'Integration Layering',
    description: 'Connection to existing firm tools, data sources, and reporting systems with minimal disruption to active operations.',
    icon: 'Layers',
  },
  {
    id: 6,
    title: 'Training & Adoption',
    description: 'Team enablement sessions and comprehensive operational documentation ensuring sustainable internal capability.',
    icon: 'GraduationCap',
  },
  {
    id: 7,
    title: 'Optimization & Oversight',
    description: 'Ongoing refinement, monitoring, and expansion of AI capabilities based on performance data and evolving firm requirements.',
    icon: 'TrendingUp',
  },
];


export const TOOLS: ToolItem[] = [
  { name: 'Gemini',      description: 'LLM behind the in-house agent team and research pipelines', category: 'AI' },
  { name: 'Groq',        description: 'Low-latency open-model inference for voice and assistants',  category: 'AI' },
  { name: 'Fish Audio',  description: 'Voice synthesis for conversational AI systems',              category: 'AI' },
  { name: 'Next.js',     description: 'Production-grade React framework',                           category: 'Frontend' },
  { name: 'React',       description: 'Component-driven UI architecture',                           category: 'Frontend' },
  { name: 'TypeScript',  description: 'Type-safe development across all codebases',                 category: 'Frontend' },
  { name: 'Python',      description: 'Backend AI pipelines and data processing',                   category: 'Backend' },
  { name: 'FastAPI',     description: 'Typed Python APIs for AI services',                          category: 'Backend' },
  { name: 'Node.js',     description: 'Event-driven API and integration services',                  category: 'Backend' },
  { name: 'Supabase',    description: 'Postgres database, auth, and realtime layer',                category: 'Data' },
  { name: 'Pinecone',    description: 'Vector search for knowledge retrieval and memory',           category: 'Data' },
  { name: 'Docker',      description: 'Containerised, reproducible deployments',                    category: 'Infrastructure' },
  { name: 'Render',      description: 'Server infrastructure and service hosting',                  category: 'Infrastructure' },
  { name: 'Vercel',      description: 'Edge deployment and frontend delivery',                      category: 'Infrastructure' },
];

export const FAQS: FAQ[] = [
  {
    question: 'What types of investment firms does Kivaro AI work with?',
    answer: 'Hedge funds and their portfolio managers, research and analytics teams, investor relations and reporting teams, quant and hybrid discretionary funds, venture capital managers, and private equity firms, with a focus on the Southern United States.',
  },
  {
    question: 'When does Kivaro AI launch?',
    answer: 'Kivaro AI launches publicly in January 2027. Before then we are running a small pilot program with a few firms, and you can join the launch waitlist through the form below.',
  },
  {
    question: 'What does a pilot look like?',
    answer: 'We pick one high-impact workflow together, build and deploy an AI-automated version over about four weeks, and measure it against your current manual baseline. You keep the results and the write-up either way. Pilot seats are limited to three firms.',
  },
  {
    question: 'How do you handle data security and compliance?',
    answer: 'Security is part of the design from the first conversation: least-privilege access, data isolation, and encryption. Where a firm has its own compliance requirements or approved vendors, we build within them.',
  },
  {
    question: 'Do you replace existing fund systems?',
    answer: 'No. We integrate with and augment your existing infrastructure, connecting to current tools, data sources, and reporting systems rather than replacing them.',
  },
  {
    question: 'Is on-site work available?',
    answer: 'Yes. On-site advisory and system mapping sessions are available across Texas, Louisiana, Georgia, Mississippi, and Florida.',
  },
];

export const WORKFLOW_NODES = [
  { id: 'input', label: 'Data Ingestion', x: 5, y: 30, type: 'source' as const },
  { id: 'process', label: 'AI Processing', x: 28, y: 15, type: 'process' as const },
  { id: 'validate', label: 'Validation Gate', x: 28, y: 50, type: 'process' as const },
  { id: 'enrich', label: 'Data Enrichment', x: 52, y: 30, type: 'process' as const },
  { id: 'analyze', label: 'Intelligence Layer', x: 75, y: 15, type: 'process' as const },
  { id: 'output', label: 'Decision Output', x: 75, y: 50, type: 'output' as const },
  { id: 'dashboard', label: 'Dashboard Feed', x: 92, y: 30, type: 'output' as const },
];

export const WORKFLOW_CONNECTIONS = [
  { from: 'input', to: 'process' },
  { from: 'input', to: 'validate' },
  { from: 'process', to: 'enrich' },
  { from: 'validate', to: 'enrich' },
  { from: 'enrich', to: 'analyze' },
  { from: 'enrich', to: 'output' },
  { from: 'analyze', to: 'dashboard' },
  { from: 'output', to: 'dashboard' },
];
