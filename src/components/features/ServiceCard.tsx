import type { Service } from '@/types';
import { cn } from '@/lib/utils';
import GlowCard from './GlowCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Database, ShieldCheck, Cog, Bot, Library, FileText, LayoutDashboard, Shield, ChevronDown,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Database, ShieldCheck, Cog, Bot, Library, FileText, LayoutDashboard, Shield,
};

const CATEGORY_COLORS: Record<string, string> = {
  research: 'from-emerald-500/20 to-teal-500/20',
  operations: 'from-green-500/20 to-lime-500/20',
  intelligence: 'from-teal-500/20 to-cyan-500/20',
  architecture: 'from-lime-500/20 to-emerald-500/20',
};

interface ServiceCardProps {
  service: Service;
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
}

export default function ServiceCard({ service, index, expanded, onToggle }: ServiceCardProps) {
  const Icon = ICON_MAP[service.icon] || Search;

  return (
    <GlowCard
      className={cn(
        'group cursor-pointer transition-all duration-500',
        expanded && 'border-primary/30 shadow-[0_0_40px_hsla(152,76%,46%,0.08)]'
      )}
    >
      <button onClick={onToggle} className="w-full text-left p-6 lg:p-7">
        <div className="flex items-start gap-4">
          <div className={cn(
            'flex items-center justify-center size-12 rounded-xl shrink-0 transition-all duration-300',
            'bg-gradient-to-br',
            CATEGORY_COLORS[service.category],
            'border border-primary/10',
            'group-hover:scale-110 group-hover:shadow-[0_0_16px_hsla(152,76%,46%,0.15)]'
          )}>
            <Icon className="size-5 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary/60 font-display uppercase tracking-wider">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{service.category}</span>
              <ChevronDown className={cn(
                'size-3.5 ml-auto text-muted-foreground/50 transition-transform duration-300',
                expanded && 'rotate-180 text-primary'
              )} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {service.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
              {service.description}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-border/50">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {service.features.map((f, fi) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fi * 0.08, duration: 0.3 }}
                      className="flex items-start gap-2 text-sm text-foreground/75"
                    >
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary/50 shrink-0" />
                      {f}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </GlowCard>
  );
}
