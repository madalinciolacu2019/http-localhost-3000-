'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const COOKIE_KEY = 'apex-brews-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[80] bg-[#0d0d14] border border-white/10 rounded-2xl p-5 shadow-2xl"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-racing-red to-transparent rounded-t-2xl" />

          <div className="flex gap-4">
            <div className="p-2.5 bg-racing-red/10 rounded-xl flex-shrink-0 h-fit">
              <Cookie size={18} className="text-racing-red" />
            </div>
            <div className="flex-1">
              <p className="font-orbitron text-[10px] font-black text-white tracking-[0.2em] uppercase mb-1">Cookie Policy</p>
              <p className="text-[10px] text-white/40 leading-relaxed mb-4">
                We use cookies to improve your race experience and analyze performance data. 
                By accepting, you agree to our{' '}
                <Link href="/privacy" className="text-racing-red/70 hover:text-racing-red transition-colors">Privacy Policy</Link>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={accept}
                  className="flex items-center gap-2 bg-racing-red px-4 py-2 rounded-lg font-orbitron text-[9px] font-black text-white uppercase tracking-widest hover:bg-racing-red/80 transition-colors"
                >
                  <CheckCircle size={12} />
                  ACCEPT
                </button>
                <button
                  onClick={decline}
                  className="px-4 py-2 rounded-lg font-orbitron text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors glass border-white/5"
                >
                  DECLINE
                </button>
              </div>
            </div>
            <button onClick={decline} className="text-white/20 hover:text-white transition-colors self-start">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
