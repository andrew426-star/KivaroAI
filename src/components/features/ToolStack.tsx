import { TOOLS } from '@/constants/mockData';
import GlowCard from './GlowCard';
import { useInView } from '@/hooks/useInView';
import { motion } from 'framer-motion';
import { EASE_OUT, STAGGER } from '@/lib/motion';

const TOOL_ICONS: Record<string, string> = {
  'Gemini':     '◈',
  'Groq':       '⚡',
  'Fish Audio': '♪',
  'Next.js':    '▲',
  'React':      '⚛',
  'TypeScript': 'TS',
  'Python':     'Py',
  'FastAPI':    'Fa',
  'Node.js':    '⬡',
  'Supabase':   '⊕',
  'Pinecone':   '◉',
  'Docker':     '⬢',
  'Render':     '▣',
  'Vercel':     '▲',
};

const CATEGORY_COLOR: Record<string, string> = {
  'AI':             'hsl(152,76%,46%)',
  'Frontend':       'hsl(199,89%,60%)',
  'Backend':        'hsl(262,72%,65%)',
  'Data':           'hsl(45,90%,55%)',
  'Infrastructure': 'hsl(152,60%,38%)',
};

export default function ToolStack() {
  const [ref, inView] = useInView(0.15);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {TOOLS.map((tool, i) => {
        const color = CATEGORY_COLOR[tool.category] ?? 'hsl(152,76%,46%)';
        return (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: i * STAGGER, duration: 0.5, ease: EASE_OUT }}
          >
            <GlowCard className="text-center h-full">
              <div className="p-4 lg:p-5 flex flex-col items-center">
                <div
                  className="size-10 mx-auto rounded-lg flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${color}14`,
                    border: `1px solid ${color}28`,
                    boxShadow: `0 0 0 0 ${color}`,
                  }}
                >
                  <span className="font-display text-base font-bold" style={{ color }}>
                    {TOOL_ICONS[tool.name] || tool.name.charAt(0)}
                  </span>
                </div>
                <h4 className="font-display text-sm font-semibold text-foreground">
                  {tool.name}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">
                  {tool.description}
                </p>
                <span
                  className="label-eyebrow mt-2"
                  style={{ color: `${color}80` }}
                >
                  {tool.category}
                </span>
              </div>
            </GlowCard>
          </motion.div>
        );
      })}
    </div>
  );
}
