'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

export default function DemoWarningBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    const isCommercial = process.env.NEXT_PUBLIC_COMMERCIAL_MODE === 'true';
    if (isCommercial) {
      return;
    }

    // Check if the user has already acknowledged the warning
    const hasSeenWarning = localStorage.getItem('apex_demo_warning_seen');
    if (!hasSeenWarning) {
      // Small delay so it pops up nicely after the loading screen
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    playSound('click');
    localStorage.setItem('apex_demo_warning_seen', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass p-8 rounded-3xl border-racing-red/50 shadow-[0_0_50px_rgba(225,6,0,0.2)] overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-racing-red blur-[100px] opacity-20" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-racing-red/10 border border-racing-red/20 flex items-center justify-center mb-6 text-racing-red">
                <AlertTriangle size={32} />
              </div>
              
              <h2 className="font-orbitron font-black text-2xl mb-4 tracking-widest text-racing-red uppercase">
                Demo Mode Active
              </h2>
              
              <p className="text-white/70 mb-8 leading-relaxed">
                Welcome to APEX BREWS! This application is currently running in <strong>Demo Mode</strong>. 
                Please note that this is a portfolio project and <strong className="text-white">not a real store</strong>. 
                <br /><br />
                Do not enter any real credit card details, personal addresses, or sensitive information during checkout.
              </p>
              
              <button
                onClick={handleDismiss}
                className="w-full btn-racing py-4 font-orbitron font-bold tracking-widest text-sm"
              >
                I UNDERSTAND — ENTER APEX BREWS
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
