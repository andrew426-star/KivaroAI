import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { PROCESS_STEPS } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import GlowCard from '@/components/features/GlowCard';
import SectionReveal from '@/components/features/SectionReveal';
import MarketBars from '@/components/features/MarketBars';
import MagneticButton from '@/components/features/MagneticButton';
import SplitTextReveal from '@/components/features/SplitTextReveal';
import { PROCESS_GLYPHS } from '@/components/illustrations/process-glyphs';

const ICON_MAP = PROCESS_GLYPHS;

// Extended descriptions for each phase
const PHASE_DETAILS: Record<number, { overview: string; deliverables: string[]; duration: string; keyActivities: string[] }> = {
  1: {
    overview: 'We begin every engagement with a comprehensive operational audit. Our team maps your firm\'s existing research workflows, reporting pipelines, data infrastructure, and team communication patterns. This deep-dive assessment surfaces the friction points, manual bottlenecks, and data silos that represent your highest-impact automation opportunities.',
    deliverables: ['Current-state workflow documentation', 'Technology stack assessment', 'Data flow mapping report', 'Automation opportunity matrix'],
    duration: '1–2 weeks',
    keyActivities: ['Stakeholder interviews with key team members', 'Existing system and tool inventory', 'Data source and flow mapping', 'Manual process identification and time analysis'],
  },
  2: {
    overview: 'Not every automation opportunity delivers equal value. We rank identified opportunities using a proprietary scoring framework that weighs impact on firm operations, technical feasibility, implementation risk, and time-to-value. This disciplined prioritization ensures we target the workflows that will generate the fastest and most measurable operational gains.',
    deliverables: ['Prioritized use-case roadmap', 'Impact vs. feasibility scoring matrix', 'Risk assessment per use case', 'Recommended implementation sequence'],
    duration: '3–5 days',
    keyActivities: ['Scoring each opportunity on impact, feasibility, and risk', 'Stakeholder alignment workshops', 'ROI projection modeling per use case', 'Final prioritization and sequencing'],
  },
  3: {
    overview: 'With priorities set, we design the technical architecture for each AI workflow. Using secure orchestration platforms like StackAI and integrated no-code tools, we create detailed system blueprints that specify data flows, processing logic, security layers, and integration touchpoints — all aligned with institutional-grade compliance and performance requirements.',
    deliverables: ['System architecture blueprint', 'Data flow and security design document', 'Integration specification sheets', 'Technology selection rationale'],
    duration: '1–2 weeks',
    keyActivities: ['AI workflow and agent architecture design', 'Security and compliance requirement mapping', 'Integration point specification', 'Performance benchmark definition'],
  },
  4: {
    overview: 'Implementation proceeds in controlled phases with validation checkpoints at every stage. Each workflow component is built, tested, and verified against performance benchmarks before moving to the next phase. This disciplined approach minimizes disruption to active firm operations while ensuring each deployed system meets institutional reliability standards.',
    deliverables: ['Deployed workflow components', 'Test reports and benchmark results', 'Phase validation sign-off documents', 'Rollback procedures for each phase'],
    duration: '2–4 weeks per phase',
    keyActivities: ['Phased component buildout', 'Unit and integration testing at each checkpoint', 'Performance benchmarking against targets', 'Stakeholder review and approval gates'],
  },
  5: {
    overview: 'New AI systems are layered into your existing firm infrastructure through carefully orchestrated integration. We connect to your current tools, data sources, CRM, portfolio management, and reporting systems with minimal disruption. Every integration is tested in isolation and then validated end-to-end before going live.',
    deliverables: ['Integration configuration documentation', 'End-to-end test results', 'Fallback and error-handling protocols', 'Monitoring dashboard setup'],
    duration: '1–2 weeks',
    keyActivities: ['API and data connector configuration', 'Isolated integration testing', 'End-to-end validation across systems', 'Error handling and alerting setup'],
  },
  6: {
    overview: 'Technology is only valuable when teams can use it effectively. We provide structured enablement sessions covering system operation, troubleshooting, and optimization. Comprehensive documentation ensures your team can maintain and evolve the deployed systems independently, building lasting internal capability.',
    deliverables: ['Team training session recordings', 'Operational playbooks and runbooks', 'System documentation and architecture guides', 'FAQ and troubleshooting reference'],
    duration: '3–5 days',
    keyActivities: ['Hands-on training workshops for operators', 'Admin and configuration training', 'Documentation walkthroughs', 'Knowledge transfer and Q&A sessions'],
  },
  7: {
    overview: 'Post-deployment, we provide ongoing monitoring, performance analysis, and iterative optimization. As your firm\'s needs evolve, we refine existing workflows, expand AI capabilities, and ensure your systems continue to deliver measurable operational advantage. This phase transforms the initial deployment into a continuously improving intelligence layer.',
    deliverables: ['Monthly performance reports', 'Optimization recommendations', 'Capability expansion roadmap', 'Ongoing monitoring and alert configuration'],
    duration: 'Ongoing',
    keyActivities: ['Performance data review and analysis', 'Workflow optimization iterations', 'New feature and capability scoping', 'Quarterly strategic review sessions'],
  },
};

// Phase-specific workflow data with explicit connections
interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'source' | 'process' | 'gate' | 'output' | 'feedback';
  sublabel?: string;
}
interface FlowEdge {
  from: string;
  to: string;
  style?: 'solid' | 'dashed';
  label?: string;
}
interface PhaseFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const PHASE_FLOWS: Record<number, PhaseFlow> = {
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

function PhaseFlowDiagram({ phaseId }: { phaseId: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    const w = rect.width;
    const h = rect.height;

    const flow = PHASE_FLOWS[phaseId] || PHASE_FLOWS[1];
    const nodeMap = new Map(flow.nodes.map((n) => [n.id, { ...n, px: (n.x / 100) * w, py: (n.y / 100) * h }]));
    let time = 0;

    const typeColors: Record<string, { fill: string; stroke: string; glow: number }> = {
      source: { fill: 'hsla(152, 76%, 46%, 0.22)', stroke: 'hsla(152, 76%, 46%, 0.5)', glow: 0.08 },
      process: { fill: 'hsla(160, 70%, 40%, 0.15)', stroke: 'hsla(152, 76%, 46%, 0.35)', glow: 0.05 },
      gate: { fill: 'hsla(42, 90%, 55%, 0.18)', stroke: 'hsla(42, 90%, 55%, 0.45)', glow: 0.07 },
      output: { fill: 'hsla(82, 80%, 52%, 0.2)', stroke: 'hsla(82, 80%, 55%, 0.5)', glow: 0.1 },
      feedback: { fill: 'hsla(200, 70%, 50%, 0.15)', stroke: 'hsla(200, 70%, 50%, 0.35)', glow: 0.05 },
    };

    function bezierPoint(t: number, p0: number, cp1: number, cp2: number, p3: number) {
      const mt = 1 - t;
      return mt * mt * mt * p0 + 3 * mt * mt * t * cp1 + 3 * mt * t * t * cp2 + t * t * t * p3;
    }

    function drawArrowhead(cx: CanvasRenderingContext2D, toX: number, toY: number, fromX: number, fromY: number, size: number, color: string) {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      cx.beginPath();
      cx.moveTo(toX, toY);
      cx.lineTo(toX - size * Math.cos(angle - Math.PI / 7), toY - size * Math.sin(angle - Math.PI / 7));
      cx.lineTo(toX - size * Math.cos(angle + Math.PI / 7), toY - size * Math.sin(angle + Math.PI / 7));
      cx.closePath();
      cx.fillStyle = color;
      cx.fill();
    }

    function drawNodeShape(cx: CanvasRenderingContext2D, x: number, y: number, r: number, type: string, colors: { fill: string; stroke: string }) {
      if (type === 'gate') {
        // Diamond shape for gates
        cx.beginPath();
        cx.moveTo(x, y - r);
        cx.lineTo(x + r, y);
        cx.lineTo(x, y + r);
        cx.lineTo(x - r, y);
        cx.closePath();
      } else if (type === 'output') {
        // Rounded rect for outputs
        const hw = r * 1.2;
        const hh = r * 0.85;
        const cr = 5;
        cx.beginPath();
        cx.moveTo(x - hw + cr, y - hh);
        cx.lineTo(x + hw - cr, y - hh);
        cx.quadraticCurveTo(x + hw, y - hh, x + hw, y - hh + cr);
        cx.lineTo(x + hw, y + hh - cr);
        cx.quadraticCurveTo(x + hw, y + hh, x + hw - cr, y + hh);
        cx.lineTo(x - hw + cr, y + hh);
        cx.quadraticCurveTo(x - hw, y + hh, x - hw, y + hh - cr);
        cx.lineTo(x - hw, y - hh + cr);
        cx.quadraticCurveTo(x - hw, y - hh, x - hw + cr, y - hh);
        cx.closePath();
      } else {
        // Circle for source / process
        cx.beginPath();
        cx.arc(x, y, r, 0, Math.PI * 2);
      }
      cx.fillStyle = colors.fill;
      cx.fill();
      cx.strokeStyle = colors.stroke;
      cx.lineWidth = 1.4;
      cx.stroke();
    }

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, w, h);

      // Draw edges
      flow.edges.forEach((edge, ei) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return;

        const fpx = from.px;
        const fpy = from.py;
        const tpx = to.px;
        const tpy = to.py;

        const cp1x = fpx + (tpx - fpx) * 0.45;
        const cp1y = fpy;
        const cp2x = fpx + (tpx - fpx) * 0.55;
        const cp2y = tpy;

        ctx.beginPath();
        ctx.moveTo(fpx, fpy);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tpx, tpy);
        if (edge.style === 'dashed') {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'hsla(152, 76%, 46%, 0.12)';
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = 'hsla(152, 76%, 46%, 0.2)';
        }
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead near target
        const arrowT = 0.88;
        const ax = bezierPoint(arrowT, fpx, cp1x, cp2x, tpx);
        const ay = bezierPoint(arrowT, fpy, cp1y, cp2y, tpy);
        const arrowColor = edge.style === 'dashed' ? 'hsla(152, 76%, 46%, 0.15)' : 'hsla(152, 76%, 46%, 0.3)';
        drawArrowhead(ctx, tpx, tpy, ax, ay, 6, arrowColor);

        // Animated particle along edge
        const speed = 0.6 + ei * 0.12;
        const pt = ((time * speed + ei * 0.7) % 1);
        const px = bezierPoint(pt, fpx, cp1x, cp2x, tpx);
        const py = bezierPoint(pt, fpy, cp1y, cp2y, tpy);
        const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, 6);
        particleGlow.addColorStop(0, 'hsla(152, 76%, 56%, 0.5)');
        particleGlow.addColorStop(1, 'hsla(152, 76%, 56%, 0)');
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = particleGlow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(152, 76%, 66%, 0.8)';
        ctx.fill();

        // Edge label
        if (edge.label) {
          const lt = 0.5;
          const lx = bezierPoint(lt, fpx, cp1x, cp2x, tpx);
          const ly = bezierPoint(lt, fpy, cp1y, cp2y, tpy) - 8;
          ctx.font = '500 7.5px Outfit, sans-serif';
          ctx.fillStyle = 'hsla(152, 76%, 56%, 0.45)';
          ctx.textAlign = 'center';
          ctx.fillText(edge.label, lx, ly);
        }
      });

      // Draw nodes
      flow.nodes.forEach((node, idx) => {
        const n = nodeMap.get(node.id);
        if (!n) return;
        const pulse = Math.sin(time * 1.8 + idx * 1.1) * 0.1 + 0.9;
        const baseR = node.type === 'output' ? 18 : node.type === 'source' ? 17 : node.type === 'gate' ? 16 : 15;
        const r = baseR * pulse;
        const colors = typeColors[node.type] || typeColors.process;

        // Outer glow
        const glow = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, r * 3);
        glow.addColorStop(0, colors.stroke.replace(/[\d.]+\)$/, `${colors.glow})`) );
        glow.addColorStop(1, 'hsla(152, 76%, 46%, 0)');
        ctx.beginPath();
        ctx.arc(n.px, n.py, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        drawNodeShape(ctx, n.px, n.py, r, node.type, colors);

        // Node label
        ctx.font = 'bold 8.5px Outfit, sans-serif';
        ctx.fillStyle = 'hsla(140, 25%, 90%, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, n.px, n.py + r + 13);

        // Sublabel
        if (node.sublabel) {
          ctx.font = '400 7px Outfit, sans-serif';
          ctx.fillStyle = 'hsla(140, 15%, 70%, 0.5)';
          ctx.fillText(node.sublabel, n.px, n.py + r + 23);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [phaseId]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[200px] lg:h-[260px]"
      style={{ imageRendering: 'auto' }}
    />
  );
}

export default function Process() {
  usePageMeta({
    title: 'Seven-Phase AI Deployment Methodology — Kivaro AI',
    description: 'Kivaro AI\'s seven-phase deployment model for hedge funds, investment banks, private equity firms, and venture capital firms: Discovery & Systems Audit, Use-Case Prioritization, Architecture Design, Controlled Implementation, Integration Layering, Training & Adoption, and Optimization & Oversight. Each phase includes validation checkpoints, deliverables, and performance benchmarks for institutional-grade AI deployment.',
    canonicalPath: '/process',
  });

  const [activePhase, setActivePhase] = useState(0);
  const step = PROCESS_STEPS[activePhase];
  const details = PHASE_DETAILS[step.id];
  const Icon = ICON_MAP[step.icon] || ICON_MAP.Scan;

  return (
    <>
      {/* Hero */}
      <section className="relative z-base pt-16 pb-10 lg:pt-24 lg:pb-16 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.03] pointer-events-none h-16">
          <MarketBars barCount={60} />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative">
          <SectionReveal direction="blur">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-5">
                <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
                <span className="text-xs font-medium text-primary/80 tracking-wide uppercase font-display">
                  Methodology
                </span>
              </span>
              <SplitTextReveal
                text="Seven-Phase Deployment Model"
                as="h1"
                className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1]"
                delay={2}
                gradientFrom={1}
              />
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-pretty">
                Our structured, institutional methodology is designed for controlled implementation with validation at every stage. Each phase builds on the last, ensuring quality, security, and measurable results.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Phase Navigator */}
      <section className="relative z-base pb-8">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionReveal direction="up">
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {PROCESS_STEPS.map((s, i) => {
                const StepIcon = ICON_MAP[s.icon] || ICON_MAP.Scan;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActivePhase(i)}
                    className={cn(
                      'relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 overflow-hidden',
                      i === activePhase
                        ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_20px_hsla(152,76%,46%,0.12)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent active:scale-95'
                    )}
                  >
                    {i === activePhase && (
                      <motion.div
                        layoutId="phase-active"
                        className="absolute inset-0 bg-primary/8 rounded-lg"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                      <StepIcon className="size-3.5 sm:size-4" />
                      <span className="hidden md:inline">{s.title}</span>
                      <span className="md:hidden font-display">P{s.id}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Phase Detail */}
      <section className="relative z-base pb-20 lg:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left: Main content */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  {/* Phase header */}
                  <GlowCard>
                    <div className="p-6 lg:p-8">
                      <div className="flex items-start gap-4 mb-5">
                        <motion.div
                          initial={{ scale: 0.8, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                          className="flex items-center justify-center size-14 rounded-xl bg-primary/10 border border-primary/20 shrink-0"
                        >
                          <Icon className="size-7 text-primary" />
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center size-6 rounded-md bg-primary/15 font-display text-xs font-bold text-primary tabular-nums">
                              {String(step.id).padStart(2, '0')}
                            </span>
                            <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Phase {step.id} of 7</span>
                          </div>
                          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed text-pretty text-base">
                        {details.overview}
                      </p>

                      {/* Duration badge */}
                      <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-1.5">
                        <span className="size-1.5 rounded-full bg-primary/50" />
                        <span className="text-xs font-medium text-primary/80 font-display">
                          Typical Duration: {details.duration}
                        </span>
                      </div>
                    </div>
                  </GlowCard>

                  {/* Workflow Diagram */}
                  <GlowCard>
                    <div className="p-5 lg:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1.5">
                          <span className="size-2 rounded-full bg-primary/40 animate-glow-pulse" />
                          <span className="size-2 rounded-full bg-kv-mint/30" style={{ animationDelay: '0.5s' }} />
                          <span className="size-2 rounded-full bg-kv-lime/30" style={{ animationDelay: '1s' }} />
                        </div>
                        <span className="text-[10px] font-display font-medium text-muted-foreground/60 uppercase tracking-widest ml-1">
                          Phase {step.id} Workflow — Live
                        </span>
                        <span className="ml-auto size-2 rounded-full bg-emerald-400/60 animate-pulse" />
                      </div>
                      <PhaseFlowDiagram phaseId={step.id} />
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/40 font-display uppercase tracking-widest">
                        <span>Input</span>
                        <span>Processing</span>
                        <span>Output</span>
                      </div>
                      <div className="mt-2 opacity-40">
                        <MarketBars barCount={24} />
                      </div>
                    </div>
                  </GlowCard>

                  {/* Key Activities */}
                  <GlowCard>
                    <div className="p-6 lg:p-8">
                      <h3 className="font-display text-base font-bold text-foreground mb-4">
                        Key Activities
                      </h3>
                      <div className="space-y-3">
                        {details.keyActivities.map((activity, i) => (
                          <motion.div
                            key={activity}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                            className="flex items-start gap-3 group"
                          >
                            <span className="mt-1.5 flex items-center justify-center size-5 rounded-md bg-primary/10 border border-primary/15 shrink-0 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                              <ChevronRight className="size-3 text-primary/70" />
                            </span>
                            <span className="text-sm text-foreground/80 leading-relaxed">{activity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </GlowCard>
                </div>

                {/* Right: Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  {/* Deliverables */}
                  <GlowCard>
                    <div className="p-6">
                      <h3 className="font-display text-base font-bold text-foreground mb-4">
                        Phase Deliverables
                      </h3>
                      <div className="space-y-2.5">
                        {details.deliverables.map((d, i) => (
                          <motion.div
                            key={d}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 + 0.15, duration: 0.3 }}
                            whileHover={{ x: 4 }}
                            className="flex items-start gap-2.5 py-2 border-b border-border/20 last:border-0"
                          >
                            <span className="mt-1 size-1.5 rounded-full bg-primary/50 shrink-0" />
                            <span className="text-sm text-foreground/80">{d}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </GlowCard>

                  {/* Phase Progress */}
                  <GlowCard>
                    <div className="p-6">
                      <h3 className="font-display text-base font-bold text-foreground mb-4">
                        Deployment Progress
                      </h3>
                      <div className="space-y-3">
                        {PROCESS_STEPS.map((s, i) => {
                          const StepIcon = ICON_MAP[s.icon] || ICON_MAP.Scan;
                          const isActive = i === activePhase;
                          const isPast = i < activePhase;
                          return (
                            <button
                              key={s.id}
                              onClick={() => setActivePhase(i)}
                              className={cn(
                                'w-full flex items-center gap-3 py-2 px-3 rounded-lg text-left transition-all duration-300',
                                isActive && 'bg-primary/10 border border-primary/20',
                                !isActive && 'hover:bg-secondary/40 border border-transparent'
                              )}
                            >
                              <div className={cn(
                                'size-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-300',
                                isActive ? 'bg-primary/20 text-primary' : isPast ? 'bg-primary/8 text-primary/50' : 'bg-border/30 text-muted-foreground/40'
                              )}>
                                <StepIcon className="size-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-xs font-medium truncate transition-colors',
                                  isActive ? 'text-primary' : isPast ? 'text-foreground/70' : 'text-muted-foreground/60'
                                )}>
                                  {s.title}
                                </p>
                              </div>
                              {isActive && (
                                <motion.div
                                  layoutId="progress-indicator"
                                  className="size-2 rounded-full bg-primary"
                                  transition={{ type: 'spring', stiffness: 300 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-5 flex items-center gap-1.5">
                        {PROCESS_STEPS.map((_, i) => (
                          <div
                            key={i}
                            className="h-1 rounded-full flex-1 transition-all duration-500"
                            style={{
                              background: i === activePhase
                                ? 'hsl(152 76% 46%)'
                                : i < activePhase
                                ? 'hsl(152 76% 46% / 0.3)'
                                : 'hsl(150 12% 14%)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </GlowCard>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                      disabled={activePhase === 0}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-secondary/40 py-3 text-sm font-medium text-foreground hover:border-primary/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                      <ArrowLeft className="size-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => setActivePhase(Math.min(PROCESS_STEPS.length - 1, activePhase + 1))}
                      disabled={activePhase === PROCESS_STEPS.length - 1}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-secondary/40 py-3 text-sm font-medium text-foreground hover:border-primary/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                      Next
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-base py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <MarketBars barCount={80} />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative z-10">
          <SectionReveal direction="scale">
            <div className="text-center">
              <h2 className="font-display text-3xl lg:text-4xl font-extrabold text-foreground text-balance">
                Ready to start your{' '}
                <span className="text-gradient-animated">deployment journey?</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-pretty">
                Schedule a discovery call to begin Phase 1 and map your firm's highest-impact automation opportunities.
              </p>
              <div className="mt-8">
                <Link to="/contact">
                  <MagneticButton
                    as="div"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-shadow duration-300 hover:shadow-[0_0_40px_hsla(152,76%,46%,0.35)] active:scale-[0.97]"
                    strength={0.12}
                  >
                    Begin Discovery
                    <ArrowUpRight className="size-5" />
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
