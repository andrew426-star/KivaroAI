import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

export function Toaster() {
  const { toasts, toast: _ } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 w-[360px] max-w-[90vw]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className={cn(
              'rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm',
              t.variant === 'destructive'
                ? 'bg-destructive/90 border-destructive text-destructive-foreground'
                : 'bg-kv-surface/90 border-primary/20 text-foreground glow-green'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-sm font-semibold font-display">{t.title}</p>
                )}
                {t.description && (
                  <p className="text-xs text-foreground/70 mt-0.5">{t.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
