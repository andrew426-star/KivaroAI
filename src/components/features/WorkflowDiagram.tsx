import { useEffect, useRef, useState } from 'react';
import { WORKFLOW_NODES, WORKFLOW_CONNECTIONS } from '@/constants/mockData';
import { useInView } from '@/hooks/useInView';

export default function WorkflowDiagram() {
  const [containerRef, inView] = useInView(0.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inView) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const w = rect.width;
    const h = rect.height;

    let time = 0;

    const draw = () => {
      time += 0.015;
      ctx.clearRect(0, 0, w, h);

      const nodePositions = WORKFLOW_NODES.map((n) => ({
        ...n,
        px: (n.x / 100) * w,
        py: (n.y / 100) * h,
      }));

      // Draw connections
      WORKFLOW_CONNECTIONS.forEach((conn) => {
        const from = nodePositions.find((n) => n.id === conn.from);
        const to = nodePositions.find((n) => n.id === conn.to);
        if (!from || !to) return;

        const isActive = activeNode === conn.from || activeNode === conn.to;
        const alpha = isActive ? 0.5 : 0.15;

        ctx.beginPath();
        const cx1 = from.px + (to.px - from.px) * 0.5;
        const cy1 = from.py;
        const cx2 = from.px + (to.px - from.px) * 0.5;
        const cy2 = to.py;
        ctx.moveTo(from.px, from.py);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, to.px, to.py);
        ctx.strokeStyle = `hsla(152, 76%, 46%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated particle on line
        const t = (Math.sin(time * 0.8 + nodePositions.indexOf(from) * 0.5) + 1) / 2;
        const bx = Math.pow(1 - t, 3) * from.px + 3 * Math.pow(1 - t, 2) * t * cx1 + 3 * (1 - t) * Math.pow(t, 2) * cx2 + Math.pow(t, 3) * to.px;
        const by = Math.pow(1 - t, 3) * from.py + 3 * Math.pow(1 - t, 2) * t * cy1 + 3 * (1 - t) * Math.pow(t, 2) * cy2 + Math.pow(t, 3) * to.py;

        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(152, 76%, 56%, ${isActive ? 0.9 : 0.5})`;
        ctx.fill();
      });

      // Draw nodes
      nodePositions.forEach((node) => {
        const isActive = activeNode === node.id;
        const pulse = Math.sin(time * 2 + nodePositions.indexOf(node) * 0.7) * 0.15 + 0.85;
        const baseRadius = isActive ? 28 : 22;
        const r = baseRadius * pulse;

        // Glow
        const gradient = ctx.createRadialGradient(node.px, node.py, 0, node.px, node.py, r * 2);
        gradient.addColorStop(0, `hsla(152, 76%, 46%, ${isActive ? 0.15 : 0.05})`);
        gradient.addColorStop(1, 'hsla(152, 76%, 46%, 0)');
        ctx.beginPath();
        ctx.arc(node.px, node.py, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.px, node.py, r, 0, Math.PI * 2);

        const colorMap = {
          source: 'hsla(152, 76%, 46%, 0.25)',
          process: 'hsla(160, 80%, 42%, 0.2)',
          output: 'hsla(82, 80%, 55%, 0.2)',
        };
        ctx.fillStyle = colorMap[node.type] || colorMap.process;
        ctx.fill();

        ctx.strokeStyle = `hsla(152, 76%, 46%, ${isActive ? 0.7 : 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = '500 10px Outfit, sans-serif';
        ctx.fillStyle = `hsla(140, 20%, 92%, ${isActive ? 1 : 0.65})`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.px, node.py + r + 16);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [inView, activeNode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    let closest: string | null = null;
    let minDist = 40;

    WORKFLOW_NODES.forEach((n) => {
      const px = (n.x / 100) * w;
      const py = (n.y / 100) * h;
      const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = n.id;
      }
    });

    setActiveNode(closest);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveNode(null)}
        className="w-full h-[220px] lg:h-[280px] cursor-crosshair"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
}
