import { motion } from 'framer-motion';

export default function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-particles" aria-hidden="true">
      <div className="absolute inset-0 grid-pattern opacity-30 grid-flow" />
      {/* Radial fade at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, hsl(150 20% 4%) 75%)',
        }}
      />
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
        style={{
          background: 'radial-gradient(ellipse, hsla(152, 76%, 46%, 0.04) 0%, transparent 70%)',
        }}
      />
      {/* Ambient moving glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsla(152, 76%, 46%, 0.015) 0%, transparent 70%)',
        }}
        animate={{
          x: ['-10%', '60%', '20%', '-10%'],
          y: ['10%', '30%', '60%', '10%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
