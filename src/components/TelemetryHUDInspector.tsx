'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Cpu, Thermometer, ShieldAlert, Zap } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

interface InspectorProps {
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    stats: { intensity: string; heat: string };
    color: string;
  };
  onClose: () => void;
}

export default function TelemetryHUDInspector({ product, onClose }: InspectorProps) {
  const { playSound } = useSound();
  const [rpmCurve, setRpmCurve] = useState<number[]>([]);
  const [pressure, setPressure] = useState(8.5);
  const [temperature, setTemperature] = useState(90);

  // Generate dynamic wave logs for the graph
  useEffect(() => {
    playSound('scanner');
    const interval = setInterval(() => {
      setRpmCurve(prev => {
        const next = [...prev, Math.random() * 80 + 20];
        if (next.length > 25) next.shift();
        return next;
      });
      setPressure(prev => Math.max(7.5, Math.min(10.0, prev + (Math.random() - 0.5) * 0.4)));
      setTemperature(prev => Math.max(85, Math.min(96, prev + (Math.random() - 0.5) * 0.8)));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const svgPath = rpmCurve.map((val, idx) => `${idx * 15},${100 - val}`).join(' L ');

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      <div className="absolute inset-0 neon-grid opacity-10 pointer-events-none" />

      <div className="glass w-full max-w-4xl rounded-2xl border-white/10 overflow-hidden relative flex flex-col md:flex-row h-[90vh] md:h-[70vh]">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />

        {/* Left pane: Wireframe render */}
        <div className="flex-1 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-80 h-80 rounded-full border border-dashed border-racing-red animate-spin" style={{ animationDuration: '30s' }} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-racing-red">
              <Cpu size={14} className="animate-pulse" />
              <span className="font-orbitron text-[8px] font-black tracking-widest uppercase">DIAGNOSTIC SYSTEM INITIATED</span>
            </div>
            <h3 className="font-orbitron font-black text-2xl text-white">{product.name}</h3>
            <p className="text-[10px] text-white/30 font-orbitron uppercase tracking-widest mt-1">PRODUCT SPEC // CORE ID #{product.id}</p>
          </div>

          {/* Animated wireframe SVG mock */}
          <div className="w-full flex justify-center py-6">
            <svg width="200" height="200" viewBox="0 0 100 100" className="text-racing-red opacity-80">
              {/* Product wireframe shell based on category */}
              {product.category === 'Merchandise' ? (
                <>
                  <rect x="25" y="15" width="50" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" className="animate-pulse" />
                  <line x1="25" y1="35" x2="75" y2="35" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="25" y1="65" x2="75" y2="65" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </>
              ) : (
                <>
                  <rect x="30" y="20" width="40" height="60" rx="5" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M30 20 C35 15, 65 15, 70 20 L70 80 C65 85, 35 85, 30 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M70 35 C80 35, 80 65, 70 65" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <ellipse cx="50" cy="80" rx="20" ry="5" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </>
              )}
              {/* Telemetry coordinate nodes */}
              <circle cx="50" cy="20" r="1.5" fill="#FFD700" className="animate-ping" />
              <circle cx="30" cy="50" r="1.5" fill="#007FFF" className="animate-ping" />
            </svg>
          </div>

          {/* Diagnostics description */}
          <p className="text-[10px] text-white/50 leading-relaxed font-orbitron uppercase">
            {product.description}
          </p>
        </div>

        {/* Right pane: Telemetry dashboard readout */}
        <div className="w-full md:w-[380px] p-6 flex flex-col justify-between bg-black/20">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="font-orbitron text-[10px] font-black text-white/40 uppercase tracking-widest">Live Telemetry Metrics</span>
              <button 
                onClick={() => { playSound('click'); onClose(); }}
                className="p-1 text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulated Live Gauges */}
            <div className="grid grid-cols-2 gap-4 font-mono text-[9px] text-white/40 uppercase">
              <div className="border border-white/5 p-3 rounded-xl bg-white/2">
                <div className="flex items-center gap-1.5 text-racing-red mb-1">
                  <Zap size={12} />
                  <span className="font-orbitron font-bold">Extraction</span>
                </div>
                <span className="font-orbitron text-white text-base font-black">{pressure.toFixed(1)} Bar</span>
              </div>

              <div className="border border-white/5 p-3 rounded-xl bg-white/2">
                <div className="flex items-center gap-1.5 text-yellow-400 mb-1">
                  <Thermometer size={12} />
                  <span className="font-orbitron font-bold">Temp Target</span>
                </div>
                <span className="font-orbitron text-white text-base font-black">{temperature.toFixed(1)}°C</span>
              </div>
            </div>

            {/* SVG Real-time Wave Chart */}
            <div className="border border-white/5 p-4 rounded-xl bg-black/40 space-y-3">
              <div className="flex justify-between items-center text-[8px] font-orbitron font-black text-white/40 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Activity size={10} className="text-racing-red animate-pulse" />
                  <span>BAR PRESSURE STABILITY</span>
                </div>
                <span className="text-racing-red">9.0 MAX</span>
              </div>

              <div className="h-[100px] w-full border-b border-l border-white/10 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full text-racing-red overflow-visible">
                  {svgPath && (
                    <path
                      d={`M 0,${100 - (rpmCurve[0] || 50)} L ${svgPath}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Safety inspections status check */}
            <div className="border border-red-500/10 bg-red-500/5 p-3.5 rounded-xl flex items-center gap-3">
              <ShieldAlert size={18} className="text-racing-red shrink-0" />
              <div>
                <span className="font-orbitron text-[9px] font-black text-white uppercase block">RACING GRADE CALIBRATION</span>
                <span className="text-[8px] text-white/40 uppercase font-mono block mt-0.5">Optimized for high-pressure lap endurance.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="w-full py-3 border border-white/10 hover:border-racing-red hover:bg-racing-red/10 text-white rounded-xl font-orbitron text-[9px] font-black uppercase tracking-widest transition-all mt-6"
          >
            DISCONNECT TELEMETRY
          </button>
        </div>
      </div>
    </div>
  );
}
