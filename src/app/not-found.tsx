'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Home, Flag } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

export default function NotFound() {
  const { playSound } = useSound();

  return (
    <main className="h-screen w-full flex items-center justify-center bg-carbon-black p-6 overflow-hidden">
      {/* Background Warning Symbol */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <AlertTriangle size={800} className="text-racing-red" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-[3rem] border-racing-red/20"
        >
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-racing-red/10 rounded-full border border-racing-red/30 animate-pulse">
              <AlertTriangle size={60} className="text-racing-red" />
            </div>
          </div>

          <h1 className="font-orbitron text-7xl md:text-9xl font-black mb-2 italic text-white drop-shadow-[0_0_30px_rgba(225,6,0,0.5)]">404</h1>
          <h2 className="font-orbitron text-2xl font-black mb-6 tracking-[0.2em] uppercase">OFF TRACK / DNF</h2>
          
          <div className="w-full h-[2px] bg-white/5 mb-8 overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-1/2 h-full bg-racing-red"
            />
          </div>

          <p className="text-white/40 text-sm mb-12 leading-relaxed font-light italic">
            "Bono, my page is gone!" <br />
            It looks like you've exceeded track limits or suffered a mechanical failure.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/"
              onClick={() => playSound('engine-rev')}
              className="btn-racing flex items-center justify-center gap-3"
            >
              <Home size={18} />
              <span>BACK TO START</span>
            </Link>
            
            <button 
              onClick={() => {
                playSound('gear-shift');
                window.location.reload();
              }}
              className="glass px-8 py-3 rounded-full flex items-center justify-center gap-3 font-orbitron font-bold text-[10px] tracking-widest hover:bg-white/5 transition-all uppercase"
            >
              <RotateCcw size={16} />
              <span>RETRY SESSION</span>
            </button>
          </div>
        </motion.div>

        {/* Status Code Grid */}
        <div className="mt-12 grid grid-cols-3 gap-8 opacity-20">
          {[
            { label: 'OIL PRESSURE', val: '0.0 BAR' },
            { label: 'BRAKE TEMP', val: 'OVERHEAT' },
            { label: 'PADDOCK CONN', val: 'LOSS' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-[8px] font-black uppercase text-white/50 mb-1">{item.label}</p>
              <p className="font-orbitron text-xs font-bold">{item.val}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
