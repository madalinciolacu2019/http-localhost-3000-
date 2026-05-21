'use client';

import React from 'react';

/**
 * A ultra-reliable, CSS-only loading screen.
 * Does not depend on React hydration or JS execution to dismiss.
 * Dismissal is handled by the 'fadeOutLoader' animation in globals.css.
 */
const LoadingScreen = () => {
  return (
    <div className="apex-loader-main fixed inset-0 z-[9999] bg-[#15151E] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(225,6,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(225,6,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none" />

      {/* APEX Logo */}
      <div className="relative mb-12">
        <div className="bg-[#E10600] px-8 py-3 skew-x-[-15deg] shadow-[0_0_50px_rgba(225,6,0,0.3)]">
          <span className="font-orbitron font-black text-5xl md:text-6xl text-white skew-x-[15deg] tracking-tighter block">APEX</span>
        </div>
        <div className="absolute -bottom-4 right-0 font-orbitron text-[9px] font-bold text-white/40 tracking-[0.5em] uppercase">Telemetry Link Established</div>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-ping" />
                <span className="font-orbitron text-[10px] font-black text-[#E10600] tracking-[0.3em] uppercase">Warmup Sequence</span>
              </div>
              <div className="font-orbitron text-[8px] text-white/30 uppercase tracking-[0.4em]">Synchronizing Paddock Data</div>
            </div>
            <div className="font-orbitron text-4xl font-black text-white italic tracking-tighter">
              100<span className="text-[#E10600]">%</span>
            </div>
          </div>
          
          <div className="w-full h-[3px] bg-white/5 relative overflow-hidden rounded-full">
            <div className="apex-loading-bar-css absolute top-0 left-0 h-full bg-[#E10600] shadow-[0_0_20px_#E10600] rounded-full" />
          </div>
        </div>

        <div className="font-mono text-[8px] text-white/20 uppercase tracking-widest flex justify-between gap-2">
          <span className="animate-pulse">{'>>'} INJECTING CAFFEINE PROTOCOLS...</span>
          <span className="text-[#E10600]">LATENCY: 14MS</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
