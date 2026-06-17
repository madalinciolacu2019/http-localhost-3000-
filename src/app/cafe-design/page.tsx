'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import { useSound } from '@/frontend/context/SoundContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Layers, AlignLeft, Box, Hexagon, DollarSign, Activity, ToggleLeft, ToggleRight, Wind, Zap, Thermometer, Users, Sun, Moon } from 'lucide-react';
import { useBooking } from '@/frontend/context/BookingContext';
import BookingModal from '@/frontend/components/BookingModal';
import TerminalModal from '@/frontend/components/TerminalModal';
import { Lock, Unlock, Key, Volume2 } from 'lucide-react';

type ZoneID = 'lounge' | 'bar' | 'kitchen' | 'fast_track' | 'simulators' | 'paddock_suite';

interface ArchitectureZone {
  id: ZoneID;
  title: string;
  sqm: number;
  material: string;
}

const zoneData: Record<ZoneID, ArchitectureZone> = {
  lounge: { id: 'lounge', title: 'GRANDSTAND LOUNGE', sqm: 120, material: 'Low-E Glass & Resin' },
  bar: { id: 'bar', title: 'PIT WALL BAR', sqm: 80, material: 'Brushed Steel & Carbon' },
  kitchen: { id: 'kitchen', title: 'GARAGE KITCHEN', sqm: 60, material: 'Commercial Steel' },
  fast_track: { id: 'fast_track', title: 'DRS FAST TRACK', sqm: 40, material: 'Aluminum & Neon' },
  simulators: { id: 'simulators', title: 'ENGINEERING BAY', sqm: 100, material: 'Acoustic Neoprene' },
  paddock_suite: { id: 'paddock_suite', title: 'PADDOCK SUITE', sqm: 50, material: 'Titanium & Leather' }
};

export default function CafeDesignPage() {
  const { playSound } = useSound();
  const { bookings } = useBooking();
  const [activeTab, setActiveTab] = useState<'floorplan' | 'elevation' | 'isometric' | 'specs' | 'bom'>('floorplan');
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // VIP Suite State
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isVipUnlocked, setIsVipUnlocked] = useState(false);
  const [vipCode, setVipCode] = useState('');
  const [vipError, setVipError] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Telemetry Noise State
  const [tableNoise, setTableNoise] = useState<Record<string, number>>({
    T1: 45, T2: 50, T3: 40, T4: 55, T5: 60, T6: 45, T7: 80, T8: 65, T9: 50
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTableNoise(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          // Generate realistic jitter (drift up or down slightly, bounded 40-90)
          const drift = (Math.random() - 0.5) * 15;
          let val = next[key] + drift;
          if (val > 90) val = 90;
          if (val < 40) val = 40;
          next[key] = Math.round(val);
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vipCode === '1950') {
      playSound('success');
      setIsVipUnlocked(true);
      setIsVipModalOpen(false);
    } else {
      playSound('error');
      setVipError(true);
      setTimeout(() => setVipError(false), 2000);
    }
  };

  const handleTableClick = (tableId: string) => {
    playSound('click');
    setSelectedTable(tableId);
    setIsBookingModalOpen(true);
  };
  
  const today = new Date().toISOString().split('T')[0];
  const isBookedToday = (tableId: string) => bookings.some(b => b.tableId === tableId && b.date === today);
  
  // CAD Layer States
  const [layers, setLayers] = useState({
    furniture: true,
    hvac: false,
    electrical: false,
    heatmap: false,
    traffic: false
  });

  const [hoveredZone, setHoveredZone] = useState<ZoneID | null>(null);

  // Lighting Simulator State (0.0 to 24.0)
  const [timeOfDay, setTimeOfDay] = useState<number>(12);

  const toggleLayer = (layer: keyof typeof layers) => {
    playSound('click');
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleTabClick = (tab: 'floorplan' | 'elevation' | 'isometric' | 'specs' | 'bom') => {
    playSound('click');
    setActiveTab(tab);
  };

  // Lighting Logic
  const isDay = timeOfDay >= 6 && timeOfDay <= 18;
  const sunPeak = Math.sin(((timeOfDay - 6) / 12) * Math.PI); // 0 at 6am, 1 at 12pm, 0 at 6pm
  const sunlightOpacity = isDay ? sunPeak * 0.8 : 0;
  const neonOpacity = isDay ? 0.3 + ((1 - sunPeak) * 0.2) : 1;
  const shadowX = isDay ? (12 - timeOfDay) * 4 : 0; // Shadows move left to right
  const shadowY = isDay ? 15 - (sunPeak * 10) : 0; // Shadows shorten at noon
  const ambientBg = isDay ? `rgba(255,255,255,${sunPeak * 0.05})` : `rgba(0,0,0,0)`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-carbon-black pt-28 pb-20 px-4 md:px-8 relative overflow-hidden transition-colors duration-1000" style={{ backgroundColor: isDay ? '#1a1a1a' : '#0a0a0a' }}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-racing-red/5 skew-x-[-15deg] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="border-b border-white/10 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Compass size={14} className="text-racing-red animate-pulse" />
                  <span className="font-orbitron text-[10px] font-black tracking-[0.4em] text-racing-red uppercase">Architectural Concept Document</span>
                </div>
                <h1 className="font-orbitron text-4xl sm:text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">
                  PROJECT <span className="text-racing-red">APEX</span>
                </h1>
              </div>

              {/* Day/Night Lighting Simulator Slider */}
              <div className="hidden md:block glass rounded-2xl border border-white/10 p-4 bg-black/60 min-w-[300px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-orbitron text-xs font-bold text-white tracking-widest flex items-center gap-2">
                    <Sun size={14} className={isDay ? "text-yellow-400" : "text-white/30"} />
                    TIME OF DAY
                    <Moon size={14} className={!isDay ? "text-[#00d8ff]" : "text-white/30"} />
                  </span>
                  <span className="font-mono text-sm text-racing-red font-bold">
                    {Math.floor(timeOfDay).toString().padStart(2, '0')}:{(Math.floor((timeOfDay % 1) * 60)).toString().padStart(2, '0')}
                  </span>
                </div>
                <input 
                  type="range" min="0" max="24" step="0.5" 
                  value={timeOfDay} onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                  className="w-full accent-racing-red cursor-ew-resize"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
            {[
              { id: 'floorplan', label: '1. Floor Plan', icon: <Layers size={14}/> },
              { id: 'elevation', label: '2. Elevation', icon: <AlignLeft size={14}/> },
              { id: 'isometric', label: '3. 3D Isometric', icon: <Hexagon size={14}/> },
              { id: 'specs', label: '4. Specs', icon: <Box size={14}/> },
              { id: 'bom', label: '5. Build Cost', icon: <DollarSign size={14}/> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 font-orbitron text-[10px] sm:text-xs font-bold uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? 'bg-racing-red border-racing-red text-white shadow-[0_0_15px_rgba(225,6,0,0.4)]' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[700px]">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: INTERACTIVE FLOOR PLAN */}
              {activeTab === 'floorplan' && (
                <motion.div key="floorplan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* CAD Controls Sidebar */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="glass rounded-3xl border border-white/10 p-6 bg-black/60">
                      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                        <h3 className="font-orbitron text-sm font-black text-white uppercase tracking-widest">CAD Overlays</h3>
                        <Activity size={16} className="text-racing-red animate-pulse" />
                      </div>
                      
                      <div className="space-y-4">
                        <button onClick={() => toggleLayer('furniture')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                          <div className="flex items-center gap-3">
                            <Layers size={16} className={layers.furniture ? "text-white" : "text-white/30"} />
                            <span className="font-orbitron text-xs font-bold text-white tracking-widest">FURNITURE</span>
                          </div>
                          {layers.furniture ? <ToggleRight className="text-racing-red" /> : <ToggleLeft className="text-white/30" />}
                        </button>

                        <button onClick={() => toggleLayer('hvac')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                          <div className="flex items-center gap-3">
                            <Wind size={16} className={layers.hvac ? "text-[#00d8ff]" : "text-white/30"} />
                            <span className="font-orbitron text-xs font-bold text-white tracking-widest">HVAC ROUTING</span>
                          </div>
                          {layers.hvac ? <ToggleRight className="text-[#00d8ff]" /> : <ToggleLeft className="text-white/30" />}
                        </button>

                        <button onClick={() => toggleLayer('electrical')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                          <div className="flex items-center gap-3">
                            <Zap size={16} className={layers.electrical ? "text-[#facc15]" : "text-white/30"} />
                            <span className="font-orbitron text-xs font-bold text-white tracking-widest">ELECTRICAL GRID</span>
                          </div>
                          {layers.electrical ? <ToggleRight className="text-[#facc15]" /> : <ToggleLeft className="text-white/30" />}
                        </button>

                        <button onClick={() => toggleLayer('heatmap')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                          <div className="flex items-center gap-3">
                            <Thermometer size={16} className={layers.heatmap ? "text-[#ef4444]" : "text-white/30"} />
                            <span className="font-orbitron text-xs font-bold text-white tracking-widest">ACOUSTIC HEATMAP</span>
                          </div>
                          {layers.heatmap ? <ToggleRight className="text-[#ef4444]" /> : <ToggleLeft className="text-white/30" />}
                        </button>

                        <button onClick={() => toggleLayer('traffic')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                          <div className="flex items-center gap-3">
                            <Users size={16} className={layers.traffic ? "text-[#22c55e]" : "text-white/30"} />
                            <span className="font-orbitron text-xs font-bold text-white tracking-widest">LIVE FOOT TRAFFIC</span>
                          </div>
                          {layers.traffic ? <ToggleRight className="text-[#22c55e]" /> : <ToggleLeft className="text-white/30" />}
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Tooltip Panel */}
                    <AnimatePresence mode="wait">
                      {hoveredZone ? (
                        <motion.div
                          key="tooltip"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="glass rounded-3xl border border-racing-red/50 p-6 bg-racing-red/10 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-racing-red/20 blur-2xl rounded-full" />
                          <h4 className="font-orbitron text-lg font-black text-white uppercase tracking-widest mb-4">
                            {zoneData[hoveredZone].title}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                              <span className="text-xs text-white/50 font-mono">AREA</span>
                              <span className="text-sm text-white font-bold">{zoneData[hoveredZone].sqm} SQM</span>
                            </div>
                            <div className="flex justify-between pt-2">
                              <span className="text-xs text-white/50 font-mono">MATERIAL</span>
                              <span className="text-sm text-racing-red font-bold">{zoneData[hoveredZone].material}</span>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="glass rounded-3xl border border-white/5 p-6 flex items-center justify-center min-h-[150px]"
                        >
                          <span className="font-orbitron text-xs text-white/30 uppercase tracking-widest text-center">Hover over a zone<br/>to view specs</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Telemetry HUD Panel */}
                    <div className="glass rounded-3xl border border-white/10 p-6 bg-black/60 mt-6">
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Volume2 size={16} className="text-white/50" />
                          <h3 className="font-orbitron text-xs font-black text-white uppercase tracking-widest">LIVE ACOUSTICS</h3>
                        </div>
                        <span className="text-[9px] font-mono text-green-400 animate-pulse">STREAMING</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(tableNoise).map(([id, db]) => (
                          <div key={id} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                            <span className="font-mono text-[10px] text-white/50">{id}</span>
                            <span className={`font-mono text-[10px] font-bold ${db > 75 ? 'text-[#ef4444]' : db > 60 ? 'text-[#facc15]' : 'text-[#3b82f6]'}`}>
                              {db}dB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* SVG Blueprint Canvas */}
                  <div className="lg:col-span-8 glass rounded-3xl border border-white/10 p-8 bg-black/60 flex justify-center relative overflow-hidden min-h-[700px] transition-colors duration-1000" style={{ backgroundColor: ambientBg }}>
                    <div className="absolute top-4 left-6 z-10 flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-racing-red animate-ping" />
                      <span className="font-mono text-[10px] text-white/50">SIMULATOR ACTIVE</span>
                    </div>

                    <div className="w-full max-w-[440px] aspect-[3/4] relative group">
                      <svg viewBox="-20 -20 440 640" className="w-full h-full text-white font-orbitron select-none overflow-visible filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-500">
                        
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                          </pattern>
                          <pattern id="grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                          </pattern>
                          <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                          </pattern>
                          <pattern id="booth-hatch" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          </pattern>

                          {/* Heatmap Gradients */}
                          <radialGradient id="heat-loud" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(239,68,68,0.5)" />
                            <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                          </radialGradient>
                          <radialGradient id="heat-quiet" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                          </radialGradient>

                          {/* Dynamic Sun/Moon Drop Shadow */}
                          <filter id="sun-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx={shadowX} dy={shadowY} stdDeviation="4" floodColor="rgba(0,0,0,0.8)" floodOpacity={sunlightOpacity} />
                          </filter>
                        </defs>
                        
                        <rect x="-20" y="-20" width="440" height="640" fill="url(#grid)" />
                        <rect x="-20" y="-20" width="440" height="640" fill="url(#grid-major)" />

                        {/* Sunlight Ray Overlay */}
                        {isDay && (
                          <path d="M -20 -20 L 420 620 L 420 -20 Z" fill="rgba(255,255,255,1)" opacity={sunlightOpacity * 0.05} style={{ mixBlendMode: 'overlay' }} />
                        )}

                        {/* Dimensions (Background) */}
                        <g className="opacity-20">
                          <line x1="20" y1="-10" x2="380" y2="-10" stroke="#fff" strokeWidth="1" />
                          <line x1="20" y1="-15" x2="20" y2="-5" stroke="#fff" strokeWidth="1" />
                          <line x1="380" y1="-15" x2="380" y2="-5" stroke="#fff" strokeWidth="1" />
                          <text x="200" y="-15" fill="#fff" fontSize="8" textAnchor="middle" className="font-mono">15.0m</text>
                          <line x1="-10" y1="20" x2="-10" y2="580" stroke="#fff" strokeWidth="1" />
                          <line x1="-15" y1="20" x2="-5" y2="20" stroke="#fff" strokeWidth="1" />
                          <line x1="-15" y1="580" x2="-5" y2="580" stroke="#fff" strokeWidth="1" />
                          <text x="-15" y="300" fill="#fff" fontSize="8" textAnchor="middle" className="font-mono" transform="rotate(-90 -15 300)">22.5m</text>
                        </g>
                        
                        {/* Heatmap Layer */}
                        {layers.heatmap && (
                          <g className="transition-all duration-1000">
                            {[
                              { id: 'T1', cx: 100, cy: 120 },
                              { id: 'T2', cx: 175, cy: 120 },
                              { id: 'T3', cx: 250, cy: 120 },
                              { id: 'T4', cx: 325, cy: 120 },
                              { id: 'T5', cx: 100, cy: 170 },
                              { id: 'T6', cx: 175, cy: 170 },
                              { id: 'T7', cx: 250, cy: 170 },
                              { id: 'T8', cx: 325, cy: 170 },
                              { id: 'T9', cx: 212, cy: 145 },
                            ].map(t => {
                              const db = tableNoise[t.id] || 40;
                              // Scale radius from 40 to 140 based on db (40-90)
                              const r = Math.max(40, (db - 40) * 2 + 40);
                              const isLoud = db > 65;
                              const fillUrl = isLoud ? 'url(#heat-loud)' : 'url(#heat-quiet)';
                              const opacity = Math.min(1, (db - 40) / 50 + 0.2);
                              return (
                                <circle 
                                  key={`heat-${t.id}`}
                                  cx={t.cx} 
                                  cy={t.cy} 
                                  r={r} 
                                  fill={fillUrl} 
                                  opacity={opacity}
                                  className="transition-all duration-1000"
                                />
                              );
                            })}
                          </g>
                        )}

                        {/* Outer Structural Walls (Casts Sunlight Shadows) */}
                        <path d="M 20 20 L 380 20 L 380 580 L 20 580 Z" fill="rgba(0,0,0,0.5)" stroke="url(#hatch)" strokeWidth="8" filter="url(#sun-shadow)" />
                        <g fill="#E10600" stroke="#fff" strokeWidth="0.5">
                          <circle cx="100" cy="100" r="4" /><circle cx="300" cy="100" r="4" />
                          <circle cx="100" cy="250" r="4" /><circle cx="300" cy="250" r="4" />
                          <rect x="96" y="446" width="8" height="8" /><rect x="296" y="446" width="8" height="8" />
                        </g>

                        {/* Interactive Zones (Hoverable Backgrounds) */}
                        <g onMouseEnter={() => setHoveredZone('lounge')} onMouseLeave={() => setHoveredZone(null)}>
                          <path d="M 28 28 Q 200 80 372 28 L 372 200 L 28 200 Z" fill={hoveredZone === 'lounge' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'} stroke={hoveredZone === 'lounge' ? '#fff' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" className="transition-all duration-300" filter="url(#sun-shadow)" />
                          <path d="M 28 28 Q 200 80 372 28" fill="none" stroke="#00d8ff" strokeWidth="2" opacity={neonOpacity * 0.5} />
                          <text x="200" y="100" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" className="tracking-widest drop-shadow-md opacity-30 pointer-events-none">GRANDSTAND LOUNGE</text>
                        </g>

                        <g onMouseEnter={() => setHoveredZone('bar')} onMouseLeave={() => setHoveredZone(null)}>
                          <rect x="130" y="210" width="240" height="110" fill={hoveredZone === 'bar' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'} stroke={hoveredZone === 'bar' ? '#fff' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" className="transition-all duration-300" filter="url(#sun-shadow)" />
                          <text x="250" y="265" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" className="tracking-widest drop-shadow-md opacity-30 pointer-events-none">PIT WALL BAR</text>
                        </g>

                        <g onMouseEnter={() => setHoveredZone('fast_track')} onMouseLeave={() => setHoveredZone(null)}>
                          <rect x="28" y="200" width="100" height="250" fill={hoveredZone === 'fast_track' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'} stroke={hoveredZone === 'fast_track' ? '#fff' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" className="transition-all duration-300" filter="url(#sun-shadow)" />
                          <line x1="128" y1="200" x2="128" y2="450" stroke="url(#hatch)" strokeWidth="4" />
                          <text x="75" y="325" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="tracking-widest drop-shadow-md opacity-30 pointer-events-none" transform="rotate(-90 75 325)">DRS FAST TRACK</text>
                        </g>

                        <g onMouseEnter={() => setHoveredZone('kitchen')} onMouseLeave={() => setHoveredZone(null)}>
                          <rect x="130" y="320" width="242" height="130" fill={hoveredZone === 'kitchen' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'} stroke={hoveredZone === 'kitchen' ? '#fff' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" className="transition-all duration-300" />
                          <text x="250" y="385" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" className="tracking-widest drop-shadow-md opacity-30 pointer-events-none">GARAGE KITCHEN</text>
                        </g>

                        <g onMouseEnter={() => setHoveredZone('simulators')} onMouseLeave={() => setHoveredZone(null)}>
                          <rect x="28" y="510" width="344" height="68" fill={hoveredZone === 'simulators' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'} stroke={hoveredZone === 'simulators' ? '#fff' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" className="transition-all duration-300" filter="url(#sun-shadow)" />
                          <text x="200" y="545" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" className="tracking-widest drop-shadow-md opacity-30 pointer-events-none">ENGINEERING BAY</text>
                        </g>

                        <g 
                          onMouseEnter={() => setHoveredZone('paddock_suite')} 
                          onMouseLeave={() => setHoveredZone(null)}
                          onClick={() => !isVipUnlocked ? setIsVipModalOpen(true) : null}
                          className={!isVipUnlocked ? "cursor-not-allowed" : "cursor-pointer"}
                        >
                          <rect x="28" y="450" width="102" height="60" fill={hoveredZone === 'paddock_suite' ? (isVipUnlocked ? 'rgba(255,215,0,0.1)' : 'rgba(225,6,0,0.1)') : 'rgba(255,255,255,0.03)'} stroke={isVipUnlocked ? '#ffd700' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" className="transition-all duration-300" />
                          <text x="79" y="475" textAnchor="middle" fill={isVipUnlocked ? "#ffd700" : "#fff"} fontSize="10" fontWeight="bold" className="tracking-widest drop-shadow-md opacity-50 pointer-events-none">PADDOCK</text>
                          <text x="79" y="488" textAnchor="middle" fill={isVipUnlocked ? "#ffd700" : "#fff"} fontSize="10" fontWeight="bold" className="tracking-widest drop-shadow-md opacity-50 pointer-events-none">SUITE</text>
                          {!isVipUnlocked && (
                            <path d="M 74 495 L 84 495 L 84 503 L 74 503 Z M 76 495 L 76 492 A 3 3 0 0 1 82 492 L 82 495" fill="none" stroke="#fff" strokeWidth="1" className="opacity-50 pointer-events-none" />
                          )}
                        </g>

                        {/* HVAC Layer */}
                        {layers.hvac && (
                          <g className="pointer-events-none">
                            <path d="M 250 400 L 250 480 L 360 480 L 360 570" fill="none" stroke="#00d8ff" strokeWidth="8" opacity="0.4" />
                            <path d="M 170 340 L 170 280 L 110 280 L 110 210" fill="none" stroke="#00d8ff" strokeWidth="6" opacity="0.4" />
                            <path d="M 130 550 L 50 550 L 50 600" fill="none" stroke="#00d8ff" strokeWidth="10" opacity="0.4" />
                            <rect x="340" y="560" width="40" height="15" fill="rgba(0,216,255,0.8)" />
                            <rect x="90" y="205" width="40" height="10" fill="rgba(0,216,255,0.8)" />
                            <rect x="30" y="590" width="40" height="15" fill="rgba(0,216,255,0.8)" />
                          </g>
                        )}

                        {/* Electrical Layer (Neon intensity responds to Day/Night) */}
                        {layers.electrical && (
                          <g className="pointer-events-none" style={{ opacity: neonOpacity }}>
                            <rect x="350" y="30" width="20" height="30" fill="#facc15" stroke="#fff" />
                            <path d="M 360 60 L 360 220 L 320 220" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4,4" className="animate-[dash_10s_linear_infinite]" />
                            <path d="M 360 150 L 150 150" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4,4" className="animate-[dash_10s_linear_infinite]" />
                            <path d="M 360 220 L 360 530 L 290 530" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="6,4" className="animate-[dash_10s_linear_infinite]" />
                            <circle cx="150" cy="150" r="4" fill="#facc15" /><circle cx="320" cy="220" r="4" fill="#facc15" /><circle cx="290" cy="530" r="4" fill="#facc15" />
                          </g>
                        )}

                        {/* Furniture Layer */}
                        {layers.furniture && (
                          <g className="transition-all duration-300" filter="url(#sun-shadow)">
                            <path d="M 50 150 L 50 180 L 100 180 L 100 165 L 65 165 L 65 150 Z" fill="url(#booth-hatch)" stroke="rgba(255,255,255,0.3)" />
                            <path d="M 350 150 L 350 180 L 300 180 L 300 165 L 335 165 L 335 150 Z" fill="url(#booth-hatch)" stroke="rgba(255,255,255,0.3)" />
                            
                            <g>
                              {[
                                { id: 'T1', cx: 100, cy: 120 },
                                { id: 'T2', cx: 175, cy: 120 },
                                { id: 'T3', cx: 250, cy: 120 },
                                { id: 'T4', cx: 325, cy: 120 },
                                { id: 'T5', cx: 100, cy: 170 },
                                { id: 'T6', cx: 175, cy: 170 },
                                { id: 'T7', cx: 250, cy: 170 },
                                { id: 'T8', cx: 325, cy: 170 },
                                { id: 'T9', cx: 212, cy: 145 },
                              ].map(t => (
                                <g 
                                  key={t.id} 
                                  onClick={() => handleTableClick(t.id)}
                                  className="cursor-pointer transition-all duration-300 hover:opacity-100 opacity-80"
                                >
                                  <circle cx={t.cx} cy={t.cy} r="12" fill={isBookedToday(t.id) ? 'rgba(225,6,0,0.5)' : 'rgba(34,197,94,0.3)'} stroke={isBookedToday(t.id) ? '#E10600' : '#22c55e'} strokeWidth="2" />
                                  <text x={t.cx} y={t.cy + 3} textAnchor="middle" fill="#fff" fontSize="8" className="font-mono pointer-events-none">{t.id}</text>
                                  <circle cx={t.cx} cy={t.cy-15} r="3" fill="none" stroke="rgba(255,255,255,0.5)" />
                                  <circle cx={t.cx} cy={t.cy+15} r="3" fill="none" stroke="rgba(255,255,255,0.5)" />
                                  <circle cx={t.cx-15} cy={t.cy} r="3" fill="none" stroke="rgba(255,255,255,0.5)" />
                                  <circle cx={t.cx+15} cy={t.cy} r="3" fill="none" stroke="rgba(255,255,255,0.5)" />
                                </g>
                              ))}

                              {/* VIP Table inside Paddock Suite */}
                              {isVipUnlocked && (
                                <g 
                                  onClick={() => { playSound('engine-start'); setIsTerminalOpen(true); }}
                                  className="cursor-pointer transition-all duration-300 hover:opacity-100 opacity-80"
                                >
                                  <circle cx="79" cy="480" r="14" fill={isBookedToday('VIP1') ? 'rgba(225,6,0,0.5)' : 'rgba(255,215,0,0.3)'} stroke={isBookedToday('VIP1') ? '#E10600' : '#ffd700'} strokeWidth="2" />
                                  <text x="79" y="483" textAnchor="middle" fill="#ffd700" fontSize="8" className="font-mono pointer-events-none font-bold">VIP</text>
                                </g>
                              )}
                            </g>

                            <rect x="140" y="220" width="220" height="15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                            <rect x="160" y="225" width="30" height="8" fill="rgba(255,255,255,0.2)" />
                            <rect x="230" y="225" width="30" height="8" fill="rgba(255,255,255,0.2)" />
                            <rect x="300" y="225" width="30" height="8" fill="rgba(255,255,255,0.2)" />
                            <rect x="195" y="225" width="10" height="5" fill="#E10600" opacity="0.8" />
                            <rect x="265" y="225" width="10" height="5" fill="#E10600" opacity="0.8" />
                            
                            <g fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1">
                              {[150,170,190,210,230,250,270,290,310,330,350].map(cx => <circle key={cx} cx={cx} cy="210" r="3" />)}
                            </g>
                            <path d="M 140 227.5 L 360 227.5" fill="none" stroke="#E10600" strokeWidth="1" strokeDasharray="4,2" opacity="0.5" />

                            <rect x="110" y="220" width="10" height="80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                            <rect x="160" y="340" width="60" height="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                            <rect x="280" y="340" width="60" height="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                            <circle cx="310" cy="355" r="6" fill="none" stroke="rgba(255,255,255,0.2)" />
                            <rect x="140" y="400" width="70" height="40" fill="url(#booth-hatch)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                            <circle cx="340" cy="420" r="15" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

                            <g opacity="0.6">
                              <rect x="28" y="450" width="100" height="60" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.2)" />
                              <line x1="78" y1="450" x2="78" y2="510" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                            </g>

                            {[80, 150, 220, 290].map((x, i) => (
                              <g key={i} transform={`translate(${x}, 525)`}>
                                <rect x="0" y="0" width="30" height="40" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                                <path d="M 5 10 L 25 10 Q 30 10 30 15 L 20 25 L 10 25 L 0 15 Q 0 10 5 10 Z" fill="#E10600" opacity="0.3" />
                                <path d="M -5 5 C -5 -5, 35 -5, 35 5" fill="none" stroke="#00d8ff" strokeWidth="2" opacity="0.8" />
                                <circle cx="15" cy="15" r="3" fill="none" stroke="#fff" />
                              </g>
                            ))}
                          </g>
                        )}

                        {/* Traffic Layer */}
                        {layers.traffic && (
                          <g className="pointer-events-none">
                            <path id="fast-track-path" d="M 180 30 C 180 150, 60 150, 60 250 L 60 400" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="10" strokeLinecap="round" />
                            <path d="M 180 30 C 180 150, 60 150, 60 250 L 60 400" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="8,20" className="animate-[dash_2s_linear_infinite]" />
                            <path d="M 220 30 C 220 100, 250 150, 250 200 L 250 230" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="8,20" className="animate-[dash_3s_linear_infinite]" />
                          </g>
                        )}

                        {/* Structural Doors (Always On Top) */}
                        <g fill="none" stroke="#00d8ff" strokeWidth="1" opacity={neonOpacity * 0.8} className="pointer-events-none transition-opacity duration-1000">
                          <path d="M 180 28 A 20 20 0 0 1 200 8" /><line x1="180" y1="28" x2="200" y2="8" stroke="rgba(0,216,255,0.3)" />
                          <path d="M 220 28 A 20 20 0 0 0 200 8" /><line x1="220" y1="28" x2="200" y2="8" stroke="rgba(0,216,255,0.3)" />
                          <path d="M 28 250 A 20 20 0 0 1 8 270" /><line x1="28" y1="250" x2="8" y2="270" stroke="rgba(0,216,255,0.3)" />
                          <path d="M 130 350 A 15 15 0 0 0 115 365" stroke="#E10600" /><line x1="130" y1="350" x2="115" y2="365" stroke="rgba(225,6,0,0.3)" />
                        </g>

                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ELEVATION */}
              {activeTab === 'elevation' && (
                <motion.div key="elevation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <div className="glass rounded-3xl border border-white/10 p-8 bg-black/60 overflow-hidden relative" style={{ backgroundColor: ambientBg }}>
                    <h3 className="font-orbitron text-xs font-black text-white uppercase tracking-widest absolute top-8 left-8 z-20">SIDE ELEVATION SECTION</h3>
                    
                    {/* Time of Day Sun Indicator in Elevation */}
                    {isDay && (
                      <div className="absolute top-10 right-20 w-16 h-16 rounded-full bg-yellow-100 blur-2xl opacity-50" style={{ transform: `translateY(${Math.abs(12 - timeOfDay) * 10}px)` }} />
                    )}

                    <div className="w-full mt-10">
                      <svg viewBox="0 0 1000 300" className="w-full h-full text-white font-orbitron select-none transition-all duration-1000">
                        <defs>
                          <pattern id="grid-elv" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/></pattern>
                          <filter id="sun-shadow-elv" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx={shadowX * 2} dy={shadowY} stdDeviation="10" floodColor="rgba(0,0,0,0.8)" floodOpacity={sunlightOpacity} />
                          </filter>
                        </defs>
                        <rect width="1000" height="300" fill="url(#grid-elv)" />
                        <line x1="0" y1="250" x2="1000" y2="250" stroke="#fff" strokeWidth="4" />
                        <rect x="0" y="250" width="1000" height="50" fill="rgba(255,255,255,0.05)" />
                        
                        <path d="M 100 250 L 150 150 C 200 100, 300 80, 500 80 L 800 120 L 900 250 Z" fill="rgba(255,255,255,0.02)" stroke="#fff" strokeWidth="3" filter="url(#sun-shadow-elv)" />
                        <path d="M 80 150 C 200 80, 300 60, 500 60 L 820 100 L 950 250" fill="none" stroke="#E10600" strokeWidth="6" strokeLinecap="round" />
                        
                        {/* Glass Reflections depend on Sun */}
                        {isDay && (
                          <path d="M 160 150 L 200 100" fill="none" stroke="#fff" strokeWidth="20" opacity={sunlightOpacity * 0.1} />
                        )}

                        <rect x="250" y="80" width="10" height="170" fill="none" stroke="rgba(0,216,255,0.3)" strokeWidth="2" />
                        <rect x="400" y="70" width="10" height="180" fill="none" stroke="rgba(0,216,255,0.3)" strokeWidth="2" />
                        <rect x="550" y="80" width="10" height="170" fill="none" stroke="rgba(0,216,255,0.3)" strokeWidth="2" />
                        <rect x="700" y="100" width="10" height="150" fill="none" stroke="rgba(0,216,255,0.3)" strokeWidth="2" />
                        <rect x="420" y="210" width="60" height="40" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                        <circle cx="450" cy="180" r="10" fill="rgba(225,6,0,0.5)" opacity={neonOpacity} />
                        <line x1="450" y1="80" x2="450" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4,4" />
                        <line x1="50" y1="250" x2="50" y2="60" stroke="#fff" strokeWidth="1" strokeDasharray="4,4" />
                        <line x1="40" y1="60" x2="60" y2="60" stroke="#fff" strokeWidth="1" />
                        <text x="35" y="155" fill="#fff" fontSize="12" textAnchor="end" className="font-mono">8.0m</text>
                        <line x1="100" y1="270" x2="900" y2="270" stroke="#fff" strokeWidth="1" strokeDasharray="4,4" />
                        <line x1="100" y1="260" x2="100" y2="280" stroke="#fff" strokeWidth="1" />
                        <line x1="900" y1="260" x2="900" y2="280" stroke="#fff" strokeWidth="1" />
                        <text x="500" y="290" fill="#fff" fontSize="12" textAnchor="middle" className="font-mono">40.0m</text>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: ISOMETRIC 3D */}
              {activeTab === 'isometric' && (
                <motion.div key="isometric" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <div className="glass rounded-3xl border border-white/10 p-8 bg-black/60 overflow-hidden relative min-h-[600px] flex items-center justify-center">
                    <h3 className="font-orbitron text-xs font-black text-white uppercase tracking-widest absolute top-8 left-8 z-20">ISOMETRIC WIREFRAME (45°)</h3>
                    
                    <div className="w-full max-w-[800px]">
                      <svg viewBox="0 0 1000 800" className="w-full h-full text-white font-orbitron select-none filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        {/* Scale Y by 0.5 and rotate 45 to fake isometric */}
                        <g transform="translate(500, 100) scale(1, 0.5) rotate(45)">
                          
                          {/* Floor Grid (Isometric Base) */}
                          <defs>
                            <pattern id="iso-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect x="0" y="0" width="400" height="600" fill="url(#iso-grid)" />
                          <rect x="0" y="0" width="400" height="600" fill="rgba(255,255,255,0.02)" stroke="#fff" strokeWidth="4" />

                          {/* Foundation Thickness (Drawn manually under the grid) */}
                          {/* Since we are inside the transformed group, Z-axis (height) is tricky. 
                              Usually, in this transform, to go "UP" in 3D space, we have to subtract X and subtract Y equally.
                              Wait, let's just draw the 2D floorplan in this transform, then draw vertical lines from it, then draw a roof on top using a separate transform. */}
                          
                          <path d="M 0 0 Q 200 60 400 0 L 400 200 L 0 200 Z" fill="rgba(0,216,255,0.05)" stroke="#00d8ff" strokeWidth="2" />
                          <rect x="130" y="210" width="240" height="110" fill="rgba(225,6,0,0.05)" stroke="#E10600" strokeWidth="2" />
                          <rect x="130" y="330" width="240" height="130" fill="rgba(255,255,255,0.05)" stroke="#fff" strokeWidth="2" />
                          <rect x="30" y="500" width="340" height="80" fill="rgba(255,255,255,0.05)" stroke="#fff" strokeWidth="2" />

                        </g>

                        {/* We use standard drawing for 3D vertical elements, mapped to the isometric grid.
                            (500, 100) is the top corner (0,0).
                            Moving +X in the grid goes Down-Right in screen space.
                            Moving +Y in the grid goes Down-Left in screen space.
                        */}
                        {/* Just a stylized floating roof that matches the shape */}
                        <g transform="translate(500, -50) scale(1, 0.5) rotate(45)">
                          <path d="M 0 0 Q 200 60 400 0 L 400 600 L 0 600 Z" fill="rgba(255,255,255,0.05)" stroke="#fff" strokeWidth="2" opacity="0.5" />
                          {/* Highlight */}
                          <path d="M -10 -10 Q 190 50 390 -10 L 390 590 L -10 590 Z" fill="none" stroke="#E10600" strokeWidth="4" opacity="0.8" />
                        </g>

                        {/* Vertical connecting columns (Fake 3D) */}
                        <g stroke="rgba(0,216,255,0.4)" strokeWidth="2">
                          {/* Corner 0,0 */}
                          <line x1="500" y1="100" x2="500" y2="-50" />
                          {/* Corner 400,0 */}
                          <line x1="783" y1="241" x2="783" y2="91" />
                          {/* Corner 0,600 */}
                          <line x1="75" y1="312" x2="75" y2="162" />
                          {/* Corner 400,600 */}
                          <line x1="358" y1="453" x2="358" y2="303" />
                        </g>
                        
                        <text x="500" y="700" textAnchor="middle" fill="#fff" fontSize="14" className="tracking-widest opacity-50">ISOMETRIC PROJECTION</text>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SPECS */}
              {activeTab === 'specs' && (
                <motion.div key="specs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="glass rounded-3xl border border-white/10 p-8 bg-black/60">
                      <h3 className="font-orbitron text-xl font-black text-white uppercase mb-4 border-b border-white/10 pb-4">Structural Framework</h3>
                      <ul className="space-y-3 text-white/70 font-light text-sm">
                        <li className="flex gap-2"><span className="text-racing-red">▸</span> <strong>Foundation:</strong> Reinforced concrete slab.</li>
                        <li className="flex gap-2"><span className="text-racing-red">▸</span> <strong>Superstructure:</strong> Exposed matte-black I-beam steel framing.</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: BOM (Financials) */}
              {activeTab === 'bom' && (
                <motion.div key="bom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <div className="glass rounded-3xl border border-white/10 p-8 bg-black/60">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-white/10 pb-6">
                      <div>
                        <h3 className="font-orbitron text-2xl font-black text-white uppercase">Build Cost Breakdown</h3>
                        <p className="text-white/50 text-sm mt-2">Estimated Bill of Materials & Construction Costs</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <div className="text-[10px] text-white/50 font-mono tracking-widest uppercase mb-1">Total Estimated Cost</div>
                        <div className="font-orbitron text-4xl font-black text-[#22c55e]">$3,245,000</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-xs font-orbitron tracking-widest text-white/50 uppercase">
                            <th className="p-4 font-normal">Category</th>
                            <th className="p-4 font-normal">Description</th>
                            <th className="p-4 font-normal">Qty</th>
                            <th className="p-4 font-normal text-right">Cost (USD)</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white">Structural</td>
                            <td className="p-4 text-white/70">Concrete Foundation & Steel Framing</td>
                            <td className="p-4 text-white/50">1</td>
                            <td className="p-4 text-right font-mono text-white">$850,000</td>
                          </tr>
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white">Facade</td>
                            <td className="p-4 text-white/70">Curved Low-E Insulated Glass Panels</td>
                            <td className="p-4 text-white/50">40</td>
                            <td className="p-4 text-right font-mono text-white">$420,000</td>
                          </tr>
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-[#00d8ff]">Mechanical</td>
                            <td className="p-4 text-white/70">HVAC System & Acoustic Dampening</td>
                            <td className="p-4 text-white/50">1</td>
                            <td className="p-4 text-right font-mono text-white">$275,000</td>
                          </tr>
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-[#facc15]">Interior</td>
                            <td className="p-4 text-white/70">Carbon Fiber Espresso Bar & Custom Seating</td>
                            <td className="p-4 text-white/50">1</td>
                            <td className="p-4 text-right font-mono text-white">$650,000</td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-racing-red">Technology</td>
                            <td className="p-4 text-white/70">Quad-Hydraulic Motion Racing Simulators</td>
                            <td className="p-4 text-white/50">4</td>
                            <td className="p-4 text-right font-mono text-white">$1,050,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>
      
      {/* VIP Access Modal */}
      <AnimatePresence>
        {isVipModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsVipModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass rounded-3xl border border-white/10 p-8 bg-black/90 shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-4">
                  <Lock size={24} className="text-yellow-500" />
                </div>
                <h2 className="font-orbitron text-2xl font-black text-white uppercase mb-2">Paddock Suite</h2>
                <p className="text-white/60 text-sm mb-8 font-mono">Enter your 4-digit VIP access code.</p>

                <form onSubmit={handleVipSubmit} className="w-full space-y-4">
                  <div className="relative">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      value={vipCode}
                      onChange={(e) => setVipCode(e.target.value)}
                      maxLength={4}
                      className={`w-full bg-white/5 border ${vipError ? 'border-racing-red text-racing-red' : 'border-white/10 text-white'} rounded-xl py-3 pl-12 pr-4 font-mono tracking-[0.5em] text-center text-xl focus:outline-none focus:border-yellow-500 transition-colors`}
                      placeholder="****"
                    />
                  </div>
                  
                  {vipError && <p className="text-racing-red text-xs font-mono uppercase">Access Denied</p>}

                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-orbitron font-bold uppercase tracking-widest py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                  >
                    Authenticate
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        tableId={selectedTable} 
      />
      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </>
  );
}
