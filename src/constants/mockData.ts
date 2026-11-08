import type { Service, ProcessStep, ToolItem, FAQ } from '@/types';

export const SERVICES: Service[] = [
  {
    id: 'due-diligence',
    title: 'AI-Assisted Due Diligence',
    description: 'A private equity analyst opens the CIM, the financials and the contracts, copies the numbers into Excel, checks them against each other, then writes the memo: 40 to 80 hours per deal. We turn that into a cited diligence draft in under an hour, for the analyst to verify.',
    icon: 'ShieldCheck',
    features: [
      'Extraction from CIMs, financials and contracts in the data room',
      'Numbers cross-checked across documents, with breaks flagged',
      'Draft diligence memo with every figure cited to its page',
      'Add-on closes mapped to your KPI template',
    ],
    category: 'research',
  },
  {
    id: 'research-automation',
    title: 'Research & Deal Flow Automation',
    description: 'A venture associate reads and logs hundreds of decks a month; a hedge fund analyst combs filings and transcripts before the open. We automate the reading: deck triage for venture teams and a cited pre-market brief for hedge funds.',
    icon: 'Search',
    features: [
      'Pitch deck triage and logging against your thesis',
      'Pre-market brief from filings and earnings call transcripts',
      '10-K risk factors checked against later 8-Ks, every flag cited',
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
    id: 'operations-automation',
    title: 'Fund Operations Automation',
    description: 'Eliminate manual bottlenecks across fund administration, deal and portfolio reconciliation, NAV calculations, and operational reporting through intelligent automation.',
    icon: 'Cog',
    features: [
      'Fund record reconciliation with breaks flagged for review',
      'Invoice audits that flag overcharges, cited to the page',
      'Automated NAV calculation verification',
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
    description: 'Every workflow runs on the firm\'s own data, inside systems it controls, with no deal data leaving for a public chatbot.',
    icon: 'Shield',
    features: [
      'Runs on your data, inside systems you control',
      'Least-privilege access and a full audit log',
      'Every output cited back to its source page',
      'An analyst signs off before anything is relied on',
    ],
    category: 'architecture',
  },
];

// Built in-house and demoed on sample fund data and public SEC filings —
// not client results. Every pilot starts from one of these, rebuilt on the
// firm's own data.
export const WORKFLOW_LIBRARY = {
  count: 6,
  flagships: [
    { segment: 'Private Equity', title: 'Cited Diligence Draft', detail: 'CIM, financials and contracts read, cross-checked and drafted into a memo, every figure cited.' },
    { segment: 'Venture Capital', title: 'Deck Triage', detail: 'Hundreds of decks a month read, logged and ranked against your thesis.' },
    { segment: 'Hedge Funds', title: 'Pre-Market Brief', detail: 'Filings and transcripts combed before the open into one sourced brief.' },
  ],
  demos: [
    'Found 9 breaks in 26 fund records',
    'Checked 10-K risk factors against a later 8-K, every flag cited',
  ],
} as const;

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
    answer: 'Investment firms without in-house AI engineers: hedge fund partners and portfolio managers, research and analytics teams, operations and compliance units, investor relations and reporting teams, quant and hybrid discretionary funds, venture capital managers and private equity firms. We are based in Louisiana and focus on the Southern United States.',
  },
  {
    question: 'When does Kivaro AI launch?',
    answer: 'Kivaro AI launches publicly on January 12, 2027. Before then we are running a pilot program with three firms, and you can join the launch waitlist through the form below.',
  },
  {
    question: 'What does a pilot look like?',
    answer: 'Four weeks on one workflow. Week one, baseline: we log hours on recent deals and your analysts build an answer key. Week two, build: one workflow inside your systems. Week three, side by side: live deals run both ways and an analyst checks every citation. Week four, score: hours saved, accuracy against the answer key, and a go or no-go on a pass mark agreed up front.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Pricing follows the proof: $2,500 for the pilot, $15,000 to implement the workflow if it passes, then $3,000 a month to run, monitor and maintain it.',
  },
  {
    question: 'Are your time savings real?',
    answer: 'Reading one deal by hand takes 40 to 80 hours. Our workflows produce a draft in about 50 minutes, which an analyst still verifies. We project a deal team gets back about 15 hours a week, but that is a projection until a pilot measures it on your deals, which is what week four is for.',
  },
  {
    question: 'How do you handle data security and compliance?',
    answer: 'Each workflow runs on your own data, inside systems you control, with least-privilege access and an audit log. Every output is cited back to the page it came from, and an analyst signs off before anything is relied on. Where a firm has its own compliance requirements or approved vendors, we build within them.',
  },
  {
    question: 'Who does the work?',
    answer: 'Andrew Thomas, our founder, designs and builds every system himself, supported by a part-time contract engineer and our in-house AI agent team.',
  },
  {
    question: 'Do you replace existing fund systems?',
    answer: 'No. We integrate with and augment your existing infrastructure, connecting to current tools, data sources, and reporting systems rather than replacing them.',
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
