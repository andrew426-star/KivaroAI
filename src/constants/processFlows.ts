// Per-phase workflow graph data, lifted out of Process.tsx so both the 2D
// canvas history and the 3D PhaseFlowScene read from one source of truth.
export interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'source' | 'process' | 'gate' | 'output' | 'feedback';
  sublabel?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  style?: 'solid' | 'dashed';
  label?: string;
}

export interface PhaseFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export const PHASE_FLOWS: Record<number, PhaseFlow> = {
  1: {
    nodes: [
      { id: 'kickoff', label: 'Kickoff', sublabel: 'Stakeholder Interviews', x: 6, y: 50, type: 'source' },
      { id: 'workflow', label: 'Workflow Mapping', sublabel: 'Research · Reporting · Ops', x: 28, y: 25, type: 'process' },
      { id: 'techstack', label: 'Tech Inventory', sublabel: 'Tools · APIs · Data', x: 28, y: 75, type: 'process' },
      { id: 'gaps', label: 'Gap Analysis', sublabel: 'Friction · Bottlenecks', x: 54, y: 50, type: 'gate' },
      { id: 'matrix', label: 'Opportunity Matrix', sublabel: 'Ranked Automation Targets', x: 78, y: 35, type: 'output' },
      { id: 'report', label: 'Audit Report', sublabel: 'Findings & Recommendations', x: 78, y: 68, type: 'output' },
    ],
    edges: [
      { from: 'kickoff', to: 'workflow' },
      { from: 'kickoff', to: 'techstack' },
      { from: 'workflow', to: 'gaps' },
      { from: 'techstack', to: 'gaps' },
      { from: 'gaps', to: 'matrix', label: 'High Impact' },
      { from: 'gaps', to: 'report', label: 'Full Scope' },
    ],
  },
  2: {
    nodes: [
      { id: 'opps', label: 'Opportunities', sublabel: 'From Phase 1 Audit', x: 6, y: 50, type: 'source' },
      { id: 'impact', label: 'Impact Scoring', sublabel: 'ROI · Time Savings', x: 28, y: 25, type: 'process' },
      { id: 'feasibility', label: 'Feasibility Check', sublabel: 'Tech · Data · Team', x: 28, y: 75, type: 'process' },
      { id: 'risk', label: 'Risk Assessment', sublabel: 'Compliance · Disruption', x: 52, y: 50, type: 'gate' },
      { id: 'align', label: 'Stakeholder Align', sublabel: 'Approval Gate', x: 72, y: 50, type: 'gate' },
      { id: 'roadmap', label: 'Prioritized Roadmap', sublabel: 'Sequenced Use Cases', x: 92, y: 50, type: 'output' },
    ],
    edges: [
      { from: 'opps', to: 'impact' },
      { from: 'opps', to: 'feasibility' },
      { from: 'impact', to: 'risk' },
      { from: 'feasibility', to: 'risk' },
      { from: 'risk', to: 'align', label: 'Viable' },
      { from: 'align', to: 'roadmap', label: 'Approved' },
    ],
  },
  3: {
    nodes: [
      { id: 'reqs', label: 'Requirements', sublabel: 'From Roadmap', x: 6, y: 50, type: 'source' },
      { id: 'aidesign', label: 'AI Flow Design', sublabel: 'StackAI · Claude · Agents', x: 26, y: 25, type: 'process' },
      { id: 'security', label: 'Security Design', sublabel: 'Encryption · Isolation', x: 26, y: 75, type: 'process' },
      { id: 'integration', label: 'Integration Map', sublabel: 'APIs · Data Connectors', x: 50, y: 50, type: 'process' },
      { id: 'review', label: 'Architecture Review', sublabel: 'Compliance Validation', x: 72, y: 50, type: 'gate' },
      { id: 'blueprint', label: 'Blueprint', sublabel: 'System Architecture', x: 92, y: 30, type: 'output' },
      { id: 'specs', label: 'Spec Docs', sublabel: 'Integration Specs', x: 92, y: 70, type: 'output' },
    ],
    edges: [
      { from: 'reqs', to: 'aidesign' },
      { from: 'reqs', to: 'security' },
      { from: 'aidesign', to: 'integration' },
      { from: 'security', to: 'integration' },
      { from: 'integration', to: 'review' },
      { from: 'review', to: 'blueprint', label: 'Approved' },
      { from: 'review', to: 'specs' },
    ],
  },
  4: {
    nodes: [
      { id: 'blueprint', label: 'Blueprint', sublabel: 'From Phase 3', x: 6, y: 50, type: 'source' },
      { id: 'build', label: 'Build Sprint', sublabel: 'Component Development', x: 24, y: 30, type: 'process' },
      { id: 'test', label: 'Testing', sublabel: 'Unit · Integration', x: 24, y: 70, type: 'process' },
      { id: 'gate', label: 'Quality Gate', sublabel: 'Pass / Fail', x: 46, y: 50, type: 'gate' },
      { id: 'benchmark', label: 'Benchmark', sublabel: 'vs. Performance Targets', x: 66, y: 35, type: 'process' },
      { id: 'rollback', label: 'Rollback Plan', sublabel: 'Safety Net', x: 66, y: 70, type: 'process' },
      { id: 'deploy', label: 'Deploy Phase', sublabel: 'Controlled Release', x: 90, y: 50, type: 'output' },
    ],
    edges: [
      { from: 'blueprint', to: 'build' },
      { from: 'build', to: 'test' },
      { from: 'test', to: 'gate' },
      { from: 'gate', to: 'benchmark', label: 'Pass' },
      { from: 'gate', to: 'rollback', label: 'Fail', style: 'dashed' },
      { from: 'benchmark', to: 'deploy' },
      { from: 'rollback', to: 'build', style: 'dashed' },
    ],
  },
  5: {
    nodes: [
      { id: 'deployed', label: 'Deployed System', sublabel: 'From Phase 4', x: 6, y: 50, type: 'source' },
      { id: 'api', label: 'API Connectors', sublabel: 'CRM · PMS · Data', x: 26, y: 25, type: 'process' },
      { id: 'datasync', label: 'Data Sync', sublabel: 'ETL · Validation', x: 26, y: 75, type: 'process' },
      { id: 'isolated', label: 'Isolated Test', sublabel: 'Per Integration', x: 50, y: 50, type: 'gate' },
      { id: 'e2e', label: 'E2E Validation', sublabel: 'Full Pipeline Test', x: 72, y: 50, type: 'gate' },
      { id: 'live', label: 'Go Live', sublabel: 'Production Release', x: 92, y: 50, type: 'output' },
    ],
    edges: [
      { from: 'deployed', to: 'api' },
      { from: 'deployed', to: 'datasync' },
      { from: 'api', to: 'isolated' },
      { from: 'datasync', to: 'isolated' },
      { from: 'isolated', to: 'e2e', label: 'Verified' },
      { from: 'e2e', to: 'live', label: 'All Clear' },
    ],
  },
  6: {
    nodes: [
      { id: 'livesystem', label: 'Live System', sublabel: 'Operational', x: 6, y: 50, type: 'source' },
      { id: 'workshops', label: 'Workshops', sublabel: 'Hands-on Training', x: 26, y: 25, type: 'process' },
      { id: 'docs', label: 'Documentation', sublabel: 'Playbooks · Runbooks', x: 26, y: 75, type: 'process' },
      { id: 'admin', label: 'Admin Training', sublabel: 'Config · Maintenance', x: 50, y: 35, type: 'process' },
      { id: 'knowledge', label: 'Knowledge Transfer', sublabel: 'Q&A · Handoff', x: 50, y: 70, type: 'process' },
      { id: 'competency', label: 'Competency Check', sublabel: 'Team Validation', x: 74, y: 50, type: 'gate' },
      { id: 'ready', label: 'Team Autonomous', sublabel: 'Self-sufficient Ops', x: 92, y: 50, type: 'output' },
    ],
    edges: [
      { from: 'livesystem', to: 'workshops' },
      { from: 'livesystem', to: 'docs' },
      { from: 'workshops', to: 'admin' },
      { from: 'docs', to: 'knowledge' },
      { from: 'admin', to: 'competency' },
      { from: 'knowledge', to: 'competency' },
      { from: 'competency', to: 'ready', label: 'Certified' },
    ],
  },
  7: {
    nodes: [
      { id: 'production', label: 'Production', sublabel: 'Running Systems', x: 6, y: 50, type: 'source' },
      { id: 'monitor', label: 'Monitor', sublabel: 'Alerts · Dashboards', x: 24, y: 30, type: 'process' },
      { id: 'data', label: 'Perf Data', sublabel: 'Metrics Collection', x: 24, y: 70, type: 'process' },
      { id: 'analyze', label: 'Analysis', sublabel: 'Trends · Anomalies', x: 46, y: 50, type: 'process' },
      { id: 'optimize', label: 'Optimize', sublabel: 'Refine Workflows', x: 66, y: 30, type: 'process' },
      { id: 'expand', label: 'Expand', sublabel: 'New Capabilities', x: 66, y: 70, type: 'process' },
      { id: 'review', label: 'Quarterly Review', sublabel: 'Strategic Alignment', x: 90, y: 50, type: 'output' },
    ],
    edges: [
      { from: 'production', to: 'monitor' },
      { from: 'production', to: 'data' },
      { from: 'monitor', to: 'analyze' },
      { from: 'data', to: 'analyze' },
      { from: 'analyze', to: 'optimize' },
      { from: 'analyze', to: 'expand' },
      { from: 'optimize', to: 'review' },
      { from: 'expand', to: 'review' },
      { from: 'review', to: 'production', style: 'dashed' },
    ],
  },
};
