'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Activity, Terminal } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

export default function SplitHero() {
  const { playSound } = useSound();
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    playSound('engine-rev');
  };

  const handleTouchStart = () => {
    isDragging.current = true;
    playSound('engine-rev');
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-[80vh] md:h-[85vh] bg-[#0b0b0e] overflow-hidden select-none border-b border-white/5 neon-grid"
    >
      {/* Background scanline overlay */}
      <div className="absolute inset-0 scanlines z-20 opacity-30 pointer-events-none" />

      {/* Layer 1: Bottom Image (F1 Engine Blueprint Telemetry) */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/engine_split.png" 
          alt="Formula 1 Engine Blueprints"
          className="w-full h-full object-cover opacity-60 filter grayscale brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/80" />
      </div>

      {/* Layer 2: Top Crop Image (Apex Glowing Coffee Cup) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-75"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="absolute inset-0 w-[100vw] h-full">
          <img 
            src="/coffee_split.png" 
            alt="Glowing Apex Coffee Cup"
            className="w-full h-full object-cover opacity-90"
            style={{ width: containerRef.current?.getBoundingClientRect().width || '100vw' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/80" />
        </div>
      </div>

      {/* Static Immersive Telemetry Text overlays */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 md:px-20 max-w-5xl pointer-events-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-racing-red px-3 py-1 skew-x-[-15deg]">
            <span className="font-orbitron font-black text-[9px] text-white tracking-widest skew-x-[15deg]">PIT LANE SPECTRA</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-white/30 tracking-widest font-mono">
            <Terminal size={10} className="text-racing-red" />
            <span>SESSION_ID // APEX_BREWS_SYSTEMS</span>
          </div>
        </div>

        {/* Kinetic Header */}
        <h1 className="font-orbitron font-black text-4xl sm:text-6xl md:text-8xl italic tracking-tighter leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          REDEFINING <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-red to-orange-600">LIMITS</span>
          <br />
          <span className="text-[28px] sm:text-[45px] md:text-[60px] font-light text-white/80 block mt-2">ON AND OFF TRACK</span>
        </h1>

        <p className="text-xs sm:text-sm text-white/50 max-w-md font-orbitron uppercase tracking-widest mt-6 leading-relaxed">
          High-performance coffee extraction calibrated with precision engineering telemetry. Fuel your race day.
        </p>

        {/* Telemetry Stats Dial */}
        <div className="mt-8 flex gap-8 font-mono text-[9px] text-white/30 uppercase tracking-widest">
          <div>
            <span className="block text-white font-bold text-base font-orbitron text-racing-red">9.0 BAR</span>
            <span>Caffeine Injection</span>
          </div>
          <div className="border-l border-white/10 pl-8">
            <span className="block text-white font-bold text-base font-orbitron text-yellow-400">92.4 °C</span>
            <span>Brew Temp Calib</span>
          </div>
          <div className="border-l border-white/10 pl-8">
            <span className="block text-white font-bold text-base font-orbitron text-blue-400">1.6 SEC</span>
            <span>Overcut Pitstop Time</span>
          </div>
        </div>
      </div>

      {/* Divider slider line */}
      <div 
        className="absolute top-0 bottom-0 z-30 w-[2px] bg-gradient-to-b from-racing-red via-red-500 to-racing-red/10 cursor-ew-resize transition-all duration-75"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Glowing handle knob */}
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black/90 border border-racing-red flex items-center justify-center shadow-[0_0_20px_#E10600] cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
        >
          <ArrowLeftRight size={14} className="text-racing-red animate-pulse" />
        </div>
      </div>
    </div>
  );
}
