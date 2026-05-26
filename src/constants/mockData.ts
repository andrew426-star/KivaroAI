import type { Service, ProcessStep, Stat, ToolItem, FAQ } from '@/types';

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
    description: 'Eliminate manual bottlenecks across fund administration, NAV calculations, reconciliation, and operational reporting through intelligent automation.',
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
    description: 'Design and implement enterprise-grade AI infrastructure using StackAI and integrated platforms with security, compliance, and performance at the core.',
    icon: 'Shield',
    features: [
      'StackAI-based secure workflow deployment',
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
    description: 'Operational mapping of fund research, reporting, and data workflows to understand existing infrastructure and identify automation surfaces.',
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
    description: 'Secure AI workflow and agent architecture using StackAI and integrated tools, designed for fund-grade security and compliance requirements.',
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
    description: 'Connection to existing fund tools, data sources, and reporting systems with minimal disruption to active operations.',
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
    description: 'Ongoing refinement, monitoring, and expansion of AI capabilities based on performance data and evolving fund requirements.',
    icon: 'TrendingUp',
  },
];

export const STATS: Stat[] = [
  { label: 'Reduction in Research Processing Time', value: '73', suffix: '%' },
  { label: 'Operational Tasks Automatable', value: '40', suffix: '+' },
  { label: 'Average Deployment Timeline', value: '6', suffix: ' weeks' },
  { label: 'Cost Reduction in Reporting Workflows', value: '58', suffix: '%' },
];

export const TOOLS: ToolItem[] = [
  { name: 'Claude AI',   description: 'Primary LLM for all agent intelligence layers',  category: 'AI' },
  { name: 'ElevenLabs',  description: 'Voice synthesis for conversational AI systems',   category: 'AI' },
  { name: 'Next.js',     description: 'Production-grade React framework',                category: 'Frontend' },
  { name: 'TypeScript',  description: 'Type-safe development across all codebases',      category: 'Frontend' },
  { name: 'Python',      description: 'Backend AI pipelines and data processing',        category: 'Backend' },
  { name: 'Node.js',     description: 'Event-driven API and integration services',       category: 'Backend' },
  { name: 'Supabase',    description: 'Postgres database, auth, and realtime layer',     category: 'Data' },
  { name: 'MongoDB',     description: 'Document storage for unstructured AI data',       category: 'Data' },
  { name: 'Docker',      description: 'Containerised, reproducible deployments',         category: 'Infrastructure' },
  { name: 'Railway',     description: 'Server infrastructure and service hosting',       category: 'Infrastructure' },
  { name: 'Vercel',      description: 'Edge deployment and frontend delivery',           category: 'Infrastructure' },
  { name: 'React',       description: 'Component-driven UI architecture',                category: 'Frontend' },
];

export const FAQS: FAQ[] = [
  {
    question: 'What types of hedge funds does Kivaro AI work with?',
    answer: 'We work with quantitative funds, hybrid discretionary funds, multi-strategy firms, and alternative investment organizations across the Southern United States. Our systems are adaptable to various fund sizes and strategies.',
  },
  {
    question: 'How do you handle data security and compliance?',
    answer: 'Security is foundational to our architecture. We use StackAI for secure workflow deployment, implement data isolation and encryption, and design all systems with compliance awareness built in from day one.',
  },
  {
    question: 'What is the typical engagement timeline?',
    answer: 'Initial pilot deployments typically span 4-8 weeks from discovery to live operation. Complex multi-workflow implementations may extend to 12-16 weeks with phased rollout milestones.',
  },
  {
    question: 'Do you replace existing fund systems?',
    answer: 'No. We integrate with and augment your existing infrastructure. Our approach connects to current tools, data sources, and reporting systems through integration layering rather than system replacement.',
  },
  {
    question: 'What does a proof-of-value engagement look like?',
    answer: 'We identify one high-impact workflow, deploy an AI-automated solution within 4-6 weeks, and measure specific performance metrics against the manual baseline. This validates the approach before broader implementation.',
  },
  {
    question: 'Is on-site work available?',
    answer: 'Yes. On-site advisory and system mapping sessions are available for qualified engagements within our regional footprint across Texas, Louisiana, Georgia, Mississippi, and Florida.',
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
