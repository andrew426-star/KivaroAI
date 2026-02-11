import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-modal">
      <div className="flex flex-col items-center gap-6">
        {/* Animated rings */}
        <div className="relative size-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
          <div className="absolute inset-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="flex items-center gap-1">
          {'LOADING'.split('').map((char, i) => (
            <motion.span
              key={i}
              className="font-display text-sm text-muted-foreground tracking-widest"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
