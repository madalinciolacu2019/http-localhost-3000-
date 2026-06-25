'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, Clock, Thermometer, Flame, Zap, HelpCircle } from 'lucide-react';

type TrackTelemetry = {
  id: string;
  name: string;
  country: string;
  equivalent: string;
  style: string;
  temp: number;
  pressure: number;
  time: number;
  grind: number;
  desc: string;
  pressurePoints: string;
  yieldPoints: string;
  color: string;
  accentColor: string;
  stats: { label: string; value: string }[];
};

const TRACKS_DATA: TrackTelemetry[] = [
  {
    id: 'monza',
    name: 'Monza',
    country: 'Italy',
    equivalent: 'Temple of Speed Espresso',
    style: 'Short High-Intensity Shot',
    temp: 94.5,
    pressure: 9.8,
    time: 22,
    grind: 3.8,
    color: '#E10600',
    accentColor: 'rgba(225, 6, 0, 0.2)',
    desc: 'High flow rate and high extraction pressure. Modeled after Monza\'s straightaways, this extraction ramps up to 9.8 Bar almost instantly to pull out intense caramel notes with minimal acidity.',
    pressurePoints: 'M 0 80 Q 10 10 30 10 L 80 15 L 100 80',
    yieldPoints: 'M 0 80 L 10 70 Q 35 25 70 20 L 100 20',
    stats: [
      { label: 'Flow Rate', value: '3.2 ml/s' },
      { label: 'Pre-infusion', value: '1.5 seconds' },
      { label: 'TDS Target', value: '10.8%' },
      { label: 'Body Density', value: 'High' }
    ]
  },
  {
    id: 'monaco',
    name: 'Monaco',
    country: 'Monaco',
    equivalent: 'Monte Carlo Ristretto',
    style: 'Slow Extraction Ristretto',
    temp: 91.5,
    pressure: 8.2,
    time: 34,
    grind: 2.2,
    color: '#fbbf24',
    accentColor: 'rgba(251, 191, 36, 0.2)',
    desc: 'Slow, tight, and highly complex. Monaco requires a low-pressure profile starting with a long pre-infusion to tackle the ultra-fine grind. Delivers rich chocolate body and deep aromatic complexity.',
    pressurePoints: 'M 0 80 L 25 75 Q 35 30 45 30 L 75 35 L 100 80',
    yieldPoints: 'M 0 80 L 25 78 Q 60 55 80 35 L 100 30',
    stats: [
      { label: 'Flow Rate', value: '1.4 ml/s' },
      { label: 'Pre-infusion', value: '8.0 seconds' },
      { label: 'TDS Target', value: '12.4%' },
      { label: 'Body Density', value: 'Ultra-Dense' }
    ]
  },
  {
    id: 'spa',
    name: 'Spa-Francorchamps',
    country: 'Belgium',
    equivalent: 'Eau Rouge Brew',
    style: 'Progressive Temperature Pour-Over',
    temp: 93.0,
    pressure: 6.0,
    time: 150,
    grind: 6.5,
    color: '#3b82f6',
    accentColor: 'rgba(59, 130, 246, 0.2)',
    desc: 'Dynamic elevation, progressive pressure curve. Reflecting Spa\'s sweeping corners and elevation changes, this brew utilizes a fluctuating pressure profile with medium grind size to highlight bright fruity notes.',
    pressurePoints: 'M 0 80 Q 20 40 40 50 Q 60 20 80 40 L 100 80',
    yieldPoints: 'M 0 80 Q 30 65 60 45 L 90 35 L 100 35',
    stats: [
      { label: 'Flow Rate', value: '2.1 ml/s' },
      { label: 'Pre-infusion', value: '4.0 seconds' },
      { label: 'TDS Target', value: '1.45%' },
      { label: 'Body Density', value: 'Delicate / Silky' }
    ]
  }
];

export default function TrackComparisonGrid() {
  const [selectedTrack, setSelectedTrack] = useState<string>('monza');
  
  const currentTrack = TRACKS_DATA.find(t => t.id === selectedTrack) || TRACKS_DATA[0];

  return (
    <div className="space-y-12">
      {/* Tab Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TRACKS_DATA.map((track) => {
          const isSelected = track.id === selectedTrack;
          return (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`p-6 rounded-2xl text-left transition-all border select-none cursor-pointer relative overflow-hidden ${
                isSelected 
                  ? 'bg-gradient-to-br from-carbon-black to-black border-white/20 shadow-2xl' 
                  : 'bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/3'
              }`}
              style={{
                boxShadow: isSelected ? `0 10px 30px -10px ${track.accentColor}` : 'none'
              }}
            >
              {/* Highlight line */}
              {isSelected && (
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[4px] transition-all"
                  style={{ backgroundColor: track.color }}
                />
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest block">
                    {track.country}
                  </span>
                  <h3 className="font-orbitron text-xl font-black text-white tracking-wide uppercase italic">
                    {track.name}
                  </h3>
                </div>
                <div 
                  className="px-2 py-0.5 rounded text-[8px] font-orbitron font-black uppercase tracking-widest border"
                  style={{ 
                    color: track.color, 
                    borderColor: `${track.color}40`,
                    backgroundColor: `${track.color}10`
                  }}
                >
                  {track.id === 'monza' ? 'HIGH PRESSURE' : track.id === 'monaco' ? 'SLOW EXTRACTION' : 'FLOW CONTROL'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-white/60 font-mono italic">
                  "{track.equivalent}"
                </div>
                <div className="text-[9px] text-white/40 font-mono">
                  {track.style}
                </div>
              </div>

              {/* Stat quick-peaks */}
              <div className="flex gap-4 mt-6 pt-4 border-t border-white/5 text-[9px] font-mono text-white/40">
                <span className="flex items-center gap-1">
                  <Flame size={10} className="text-white/30" /> {track.temp}°C
                </span>
                <span className="flex items-center gap-1">
                  <Gauge size={10} className="text-white/30" /> {track.pressure} Bar
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} className="text-white/30" /> {track.time}s
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Focus Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Specs Left Card */}
        <div className="lg:col-span-5 glass border-white/5 rounded-3xl p-8 bg-carbon-black/60 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-[2px]" style={{ backgroundColor: currentTrack.color }} />
              <span className="font-orbitron text-[9px] font-bold uppercase tracking-widest text-white/60">
                EXTRACTION COEFFICIENTS
              </span>
            </div>

            <h3 className="font-orbitron text-2xl font-black text-white uppercase italic tracking-tight">
              {currentTrack.name} Calibration
            </h3>
            
            <p className="text-xs text-white/50 leading-relaxed font-light font-mono">
              {currentTrack.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentTrack.stats.map((stat, i) => (
              <div key={i} className="bg-white/2 border border-white/5 rounded-xl p-4 font-mono">
                <div className="text-[8px] text-white/30 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-sm font-black text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-center gap-3 font-mono text-[9px] text-white/50 leading-normal">
            <Zap size={14} className="shrink-0 text-pit-yellow" />
            <span>
              This profile simulates racing physics. Adjusting your home espresso grinder to <strong className="text-white">#{currentTrack.grind}</strong> yields similar results.
            </span>
          </div>
        </div>

        {/* Graph Right Card */}
        <div className="lg:col-span-7 glass border-white/5 rounded-3xl p-8 bg-carbon-black/60 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <span className="font-orbitron text-[9.5px] font-black text-white/70 tracking-widest uppercase">
              LIVE COFFEE EXTRACTION TELEMETRY GRAPH
            </span>
            <div className="flex gap-4 text-[9px] font-mono">
              <span className="flex items-center gap-1.5 text-white/80">
                <span className="w-2 h-0.5" style={{ backgroundColor: currentTrack.color }} />
                PRESSURE (BAR)
              </span>
              <span className="flex items-center gap-1.5 text-white/80">
                <span className="w-2 h-0.5 bg-green-400" />
                YIELD (TDS %)
              </span>
            </div>
          </div>

          {/* SVG Extraction Plots */}
          <div className="relative h-64 w-full bg-black/40 rounded-2xl border border-white/5 p-4 flex items-center justify-center">
            {/* Grid background lines */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 p-4 pointer-events-none opacity-[0.03]">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border-t border-l border-white" />
              ))}
            </div>

            {/* Custom Interactive SVG Graph */}
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {/* Pressure Curve */}
              <motion.path
                key={`pressure-${currentTrack.id}`}
                d={currentTrack.pressurePoints}
                fill="none"
                stroke={currentTrack.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />

              {/* Yield Curve */}
              <motion.path
                key={`yield-${currentTrack.id}`}
                d={currentTrack.yieldPoints}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Interactive Graph Y-Axis Annotations */}
            <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-between text-[7px] font-mono text-white/20 select-none">
              <span>10 BAR / 15% TDS</span>
              <span>7.5 BAR / 11% TDS</span>
              <span>5.0 BAR / 7.5% TDS</span>
              <span>2.5 BAR / 3.8% TDS</span>
              <span>0.0 BAR / 0.0% TDS</span>
            </div>

            {/* Interactive Graph X-Axis Annotations */}
            <div className="absolute bottom-2 left-6 right-2 flex justify-between text-[7px] font-mono text-white/20 select-none">
              <span>0s (Pre-infusion)</span>
              <span>8s</span>
              <span>16s</span>
              <span>24s</span>
              <span>32s+</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[8.5px] font-mono text-white/30 uppercase tracking-wider">
            <span>CHASSIS TELEMETRY SYSTEM: ESPRESSO-V2</span>
            <span>GRID PRECISION: HIGH</span>
          </div>

        </div>

      </div>
    </div>
  );
}
