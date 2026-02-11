import { useState } from 'react';
import { FAQS } from '@/constants/mockData';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className={cn(
            'rounded-xl border transition-all duration-300',
            openIndex === i
              ? 'border-primary/25 bg-kv-surface/60 shadow-[0_0_20px_hsla(152,76%,46%,0.06)]'
              : 'border-border/40 bg-kv-surface/30 hover:border-border/60 hover:bg-kv-surface/40'
          )}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left group"
          >
            <div className="flex items-center gap-3 pr-4">
              <MessageSquare className={cn(
                'size-4 shrink-0 transition-colors duration-300',
                openIndex === i ? 'text-primary' : 'text-muted-foreground/40'
              )} />
              <span className="font-display text-sm lg:text-base font-semibold text-foreground">
                {faq.question}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground shrink-0 transition-all duration-300',
                openIndex === i && 'rotate-180 text-primary'
              )}
            />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 pl-[3.25rem]">
                  <div className="w-8 h-px bg-gradient-to-r from-primary/30 to-transparent mb-3" />
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
