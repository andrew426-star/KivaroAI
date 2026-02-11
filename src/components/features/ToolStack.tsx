import { TOOLS } from '@/constants/mockData';
import GlowCard from './GlowCard';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TOOL_ICONS: Record<string, string> = {
  StackAI: '⬡',
  ChatGPT: '◈',
  Voiceflow: '◉',
  'Make.com': '⟐',
  Airtable: '⊞',
  'Custom APIs': '⟁',
};

export default function ToolStack() {
  const [ref, inView] = useInView(0.15);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {TOOLS.map((tool, i) => (
        <motion.div
          key={tool.name}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
        >
          <GlowCard className="text-center h-full">
            <div className="p-4 lg:p-5 flex flex-col items-center">
              <div className="size-10 mx-auto rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110 group-hover:shadow-[0_0_12px_hsla(152,76%,46%,0.15)]">
                <span className="font-display text-base font-bold text-primary">
                  {TOOL_ICONS[tool.name] || tool.name.charAt(0)}
                </span>
              </div>
              <h4 className="font-display text-sm font-semibold text-foreground">
                {tool.name}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">
                {tool.description}
              </p>
              <span className="mt-2 text-[10px] font-display uppercase tracking-widest text-primary/40">
                {tool.category}
              </span>
            </div>
          </GlowCard>
        </motion.div>
      ))}
    </div>
  );
}
