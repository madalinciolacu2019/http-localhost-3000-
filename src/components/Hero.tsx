'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Gauge, Trophy } from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import Link from 'next/link';

// Dynamically import the fully isolated WebGL/Three.js module bypassing all SSR compile boundaries
const Hero3DWrapper = dynamic(() => import('./Hero3DWrapper'), { ssr: false });

export default function Hero() {
  const { playSound } = useSound();

  return (
    <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#0A0A0F]">
      {/* 2D High-Res Fallback Base Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/alfa-romeo.png" 
          alt="Alfa Romeo F1 Car" 
          className="absolute inset-0 w-full h-full object-cover opacity-15 grayscale transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent opacity-60" />
      </div>

      {/* Pure Client-Side Three.js Dynamic Module Wrapper */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-auto">
        <Hero3DWrapper />
      </div>

      {/* Responsive Telemetry Typography Container */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center items-center md:justify-end md:items-end pointer-events-none pb-24 md:pb-20">
        <div className="max-w-xl pointer-events-auto text-center md:text-right space-y-6 md:space-y-8 animate-fade-in">
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                <span className="w-8 h-[1px] bg-[#990000]" />
                <h1 className="font-orbitron text-[#990000] font-black tracking-[0.3em] text-[8px] md:text-[10px] uppercase drop-shadow-[0_0_10px_rgba(153,0,0,0.5)]">
                  ALFA ROMEO RACING | APEX BREWS
                </h1>
              </div>
              <motion.h2 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="font-orbitron text-3xl sm:text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-tight text-glow-red"
              >
                PRECISION <span className="text-[#990000]">IN EVERY DROP</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-white/40 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]"
              >
                The Paddock Experience | Engineered for Speed
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap justify-center md:justify-end gap-4"
            >
              <Link href="/menu">
                <button 
                  className="btn-racing group !px-6 md:!px-8 !py-2.5 md:!py-3 !bg-[#990000] hover:!bg-white hover:!text-[#990000]"
                  onClick={() => playSound('engine-rev')}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-orbitron text-[9px] md:text-[10px] font-black">FUEL YOUR ENGINE</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Telemetry HUD Readouts */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 border-t border-white/5 pt-6 md:pt-8"
          >
            {[
              { label: 'Top Speed', value: '351 KM/H', icon: Gauge, color: 'text-[#990000]' },
              { label: 'Brew Pressure', value: '9.2 BAR', icon: Zap, color: 'text-pit-yellow' },
              { label: 'Grid Position', value: 'P1', icon: Trophy, color: 'text-white' },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-right min-w-[80px]">
                <div className="flex items-center justify-center md:justify-end gap-2 mb-1">
                  <stat.icon size={10} className={stat.color} />
                  <span className="text-[7px] md:text-[8px] text-white/30 font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="font-orbitron text-xs md:text-sm font-black italic text-white/80">{stat.value}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .text-glow-red {
          text-shadow: 0 0 20px rgba(153, 0, 0, 0.4);
        }
      `}</style>
    </section>
  );
}
