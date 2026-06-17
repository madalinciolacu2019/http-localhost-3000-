'use client';

import React from 'react';
import { useGlobalEvent } from '@/frontend/context/GlobalEventContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export function GlobalEffects() {
  const { isOverheat } = useGlobalEvent();

  return (
    <AnimatePresence>
      {isOverheat && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center"
        >
          {/* Pulsing Red Overlay */}
          <motion.div 
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-racing-red mix-blend-color-burn"
          />
          
          {/* Warning Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(225,6,0,0.8)]" />

          {/* Persistent Warning Banner at the top */}
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="absolute top-0 left-0 right-0 bg-racing-red text-white py-1 flex justify-center items-center gap-4 border-b-2 border-white/50"
          >
            <AlertTriangle size={16} className="animate-pulse" />
            <span className="font-orbitron text-[10px] font-black uppercase tracking-[0.3em]">
              CEO OVERRIDE: OVERHEAT MODE ENGAGED
            </span>
            <AlertTriangle size={16} className="animate-pulse" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
