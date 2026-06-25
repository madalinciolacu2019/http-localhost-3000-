'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, skewX: -10 }}
      animate={{ opacity: 1, x: 0, skewX: 0 }}
      exit={{ opacity: 0, x: 50, skewX: 10 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
