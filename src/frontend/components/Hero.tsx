'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, Gauge, Hexagon, Crosshair } from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';
import Link from 'next/link';

// Dynamically import the fully isolated WebGL/Three.js module bypassing all SSR compile boundaries
const Hero3DWrapper = dynamic(() => import('./Hero3DWrapper'), { ssr: false });

export default function Hero() {
  const { playSound } = useSound();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0.3, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <section ref={containerRef} className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#050508]">
      
      {/* Dynamic Background Noise / Gradient Mesh */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.1),transparent_50%)] pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,215,0,0.05),transparent_40%)] pointer-events-none mix-blend-screen" />

      {/* 2D Fallback Layer */}
      <motion.div 
        style={{ y: backgroundY, opacity }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <img 
          src="/f1-car-fallback.png" 
          alt="Apex Brews F1 Car" 
          className="absolute inset-0 w-full h-full object-cover saturate-0 brightness-50 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508] opacity-80" />
      </motion.div>

      {/* Pure Client-Side Three.js Module Wrapper */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-auto">
        <Hero3DWrapper />
      </div>

      {/* Premium Typography & HUD Overlay */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col justify-end pointer-events-none pb-24 md:pb-32">
        <motion.div style={{ y: textY }} className="w-full pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          
          {/* Main Title Area */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="w-12 h-[1px] bg-gradient-to-r from-racing-red to-transparent" />
                <span className="font-orbitron text-racing-red font-bold tracking-[0.4em] text-[10px] md:text-xs uppercase flex items-center gap-2">
                  <Hexagon size={10} className="animate-pulse" /> APEX BREWS TELEMETRY
                </span>
              </div>
              
              <h1 className="font-orbitron text-5xl sm:text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.9]">
                ENGINEERED <br />
                <span className="text-gradient-red text-glow-red">PERFECTION</span>
              </h1>
              
              <p className="text-white/50 text-xs md:text-sm max-w-lg font-light tracking-wide leading-relaxed pt-4 border-l-2 border-white/10 pl-6">
                Championship-grade coffee calibrated precisely for peak human performance. Crafted using aerodynamic roasting curves and high-pressure telemetry extraction.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="flex items-center gap-6 pt-4"
            >
              <Link href="/menu">
                <button 
                  className="btn-racing group"
                  onClick={() => playSound('engine-rev')}
                >
                  <span className="font-orbitron text-xs md:text-sm font-black flex items-center gap-3 relative z-10">
                    CALIBRATE BLEND <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>



        </motion.div>
      </div>

      <style jsx global>{`
        .text-glow-red {
          text-shadow: 0 0 40px rgba(225, 6, 0, 0.5);
        }
      `}</style>
    </section>
  );
}
