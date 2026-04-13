import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SplitTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  /** Words (by index) that should use the gradient style */
  gradientFrom?: number;
}

const wordVariants = {
  hidden: {
    y: '100%',
    opacity: 0,
    rotateX: -60,
    filter: 'blur(4px)',
  },
  visible: (i: number) => ({
    y: '0%',
    opacity: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.06,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function SplitTextReveal({
  text,
  className,
  delay = 0,
  as: Tag = 'h1',
  gradientFrom,
}: SplitTextRevealProps) {
  const words = text.split(' ');

  return (
    <Tag className={cn('overflow-hidden', className)} style={{ perspective: '800px' }}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            className={cn('inline-block', gradientFrom !== undefined && i >= gradientFrom && 'text-gradient-animated')}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            custom={i + (delay / 60)}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
