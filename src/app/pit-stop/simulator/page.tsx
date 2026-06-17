'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag, Play, RotateCcw, Cpu, Activity, Gauge, Zap, 
  Thermometer, ShieldCheck, ChevronRight, AlertTriangle, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';

interface TelemetryPoint {
  sector: string;
  progress: number;
  speed: number;
  extraction: number;
  temp: number;
}

const TRACKS = [
  { id: 'monza', name: 'Autodromo di Monza', type: 'High Speed', length: '5.793 km', baseSpeed: 280, speedJitter: 50, desc: 'Requires aerodynamically optimized roasting profiles.' },
  { id: 'monaco', name: 'Circuit de Monaco', type: 'Slow / Twisty', length: '3.337 km', baseSpeed: 140, speedJitter: 40, desc: 'Intense micro-extraction pressure zones.' },
  { id: 'spa', name: 'Spa-Francorchamps', type: 'Elevation / Rain', length: '7.004 km', baseSpeed: 220, speedJitter: 70, desc: 'Extreme thermal output shifts at Eau Rouge.' }
];

export default function SimulatorPage() {
  const { playSound } = useSound();
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
  const [force, setForce] = useState(9.0);
  const [heat, setHeat] = useState(92.0);
  const [compound, setCompound] = useState<'slicks' | 'inters' | 'wets'>('slicks');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [chartData, setChartData] = useState<TelemetryPoint[]>([]);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' }>>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const simInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    addLog('System initialized. Ready for chassis diagnostics.', 'info');
  }, []);

  const addLog = (text: string, type: 'info' | 'success' | 'warn') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time: timestamp, text, type }, ...prev].slice(0, 50));
  };

  const startSimulation = () => {
    if (isSimulating) return;
    
    playSound('engine-rev');
    setIsSimulating(true);
    setSimProgress(0);
    setChartData([]);
    setLogs([]);
    
    addLog(`[UPLINK] connecting to Apex Telemetry hub...`, 'info');
    
    setTimeout(() => {
      addLog(`[GPS] Track telemetry loaded: ${selectedTrack.name} (${selectedTrack.type})`, 'info');
      addLog(`[Roaster] Calibrating Thermal Core: ${heat}°C | Pressure: ${force} BAR`, 'info');
      addLog(`[Chassis] Tire Compound sync: ${compound.toUpperCase()}`, 'info');
    }, 600);

    let currentStep = 0;
    const totalSteps = 20;
    
    simInterval.current = setInterval(() => {
      currentStep++;
      const progressPercent = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
      setSimProgress(progressPercent);

      // Generate sector name
      let sectorName = `S1-${Math.floor(progressPercent / 5) + 1}`;
      if (progressPercent >= 33 && progressPercent < 66) sectorName = `S2-${Math.floor((progressPercent - 33) / 5) + 1}`;
      else if (progressPercent >= 66) sectorName = `S3-${Math.floor((progressPercent - 66) / 5) + 1}`;
      if (progressPercent === 100) sectorName = `FINISH`;

      // Sim Math
      const trackBaseSpeed = selectedTrack.baseSpeed;
      const speedJitter = Math.sin(currentStep) * selectedTrack.speedJitter;
      const compoundModifier = compound === 'slicks' ? 1.05 : compound === 'inters' ? 0.95 : 0.85;
      const currentSpeed = Math.floor((trackBaseSpeed + speedJitter) * compoundModifier);

      // Roast/Extraction yield math: optimum force is 9.0, optimum temp is 92-94
      const forceDelta = Math.abs(force - 9.0);
      const tempDelta = Math.abs(heat - 93.0);
      const extractionQuality = Math.max(0, 100 - (forceDelta * 12) - (tempDelta * 4));
      
      // Gradually build extraction yield over the lap
      const currentExtraction = parseFloat(((progressPercent / 100) * extractionQuality + Math.random() * 2).toFixed(1));
      
      // Simulated live temp fluctuates slightly based on speed cooling
      const liveTemp = parseFloat((heat + Math.sin(currentStep * 2) * (15 - force) * 0.15).toFixed(1));

      const newPoint: TelemetryPoint = {
        sector: sectorName,
        progress: progressPercent,
        speed: currentSpeed,
        extraction: Math.min(100, currentExtraction),
        temp: liveTemp
      };

      setChartData(prev => [...prev, newPoint]);

      // Sound feedback
      if (currentStep % 4 === 0) {
        playSound('gear-shift');
      }

      // Logging updates
      if (progressPercent === 15) {
        addLog(`[Sector 1] Launch complete. Apex roast speed: ${currentSpeed} km/h.`, 'info');
      } else if (progressPercent === 35) {
        addLog(`[Sector 2] High speed transition. Air cooling rate stabilized. Live Temp: ${liveTemp}°C.`, 'info');
      } else if (progressPercent === 55) {
        if (extractionQuality > 85) {
          addLog(`[Extraction] OPTIMAL YIELD detected. Telemetry sync: ${currentExtraction}%.`, 'success');
        } else if (extractionQuality < 60) {
          addLog(`[Extraction] WARNING: Low extraction yield detected. Under-roasted outputs.`, 'warn');
        } else {
          addLog(`[Extraction] Nominal roast level: ${currentExtraction}%.`, 'info');
        }
      } else if (progressPercent === 75) {
        addLog(`[Sector 3] DRS system active. Dynamic pressure: ${force} BAR.`, 'info');
      } else if (progressPercent === 100) {
        clearInterval(simInterval.current!);
        setIsSimulating(false);
        playSound('success');
        addLog(`[Telemetry] Lap simulated successfully! Final extraction efficiency: ${currentExtraction}%.`, 'success');
      }

    }, 500);
  };

  const resetSimulation = () => {
    if (simInterval.current) clearInterval(simInterval.current);
    setIsSimulating(false);
    setSimProgress(0);
    setChartData([]);
    setLogs([]);
    playSound('click');
    addLog('Simulation deck reset. Ready to deploy new chassis profile.', 'info');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050508] pt-28 pb-20 px-4 md:px-8 relative overflow-hidden font-mono text-white">
        {/* Background grids */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-racing-red/5 skew-x-[-15deg] pointer-events-none" />
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-grid-lines pointer-events-none opacity-[0.05]" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Header & Navigation Link */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 gap-4">
            <div>
              <Link href="/pit-stop" className="flex items-center text-racing-red hover:text-red-400 transition-colors group mb-3">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-orbitron tracking-wider text-[10px] uppercase font-bold">Return to Pitlane</span>
              </Link>
              <h1 className="font-orbitron text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
                ROAST <span className="text-racing-red">SIMULATOR</span> LAB
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Calibrate roast telemetry dynamics per F1 circuit</p>
            </div>
            
            <div className="flex gap-4">
              <div className="glass px-4 py-2 rounded-lg border border-white/10 text-center">
                <span className="block text-[8px] text-white/40 uppercase tracking-widest mb-1">Live Telemetry Uplink</span>
                <span className="font-orbitron text-xs font-bold text-green-400 flex items-center gap-1.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> NOMINAL
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Config Panel (Span 4) */}
            <div className="lg:col-span-4 glass rounded-3xl border border-white/10 p-6 flex flex-col justify-between bg-black/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-orbitron text-xs font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Cpu size={14} className="text-racing-red" />
                    Chassis & Track Config
                  </h3>
                  
                  {/* Track Selection Grid */}
                  <label className="text-[9px] text-white/40 uppercase tracking-widest block mb-2 font-bold">Select F1 Circuit</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {TRACKS.map(t => (
                      <button
                        key={t.id}
                        disabled={isSimulating}
                        onClick={() => { setSelectedTrack(t); playSound('click'); }}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all ${selectedTrack.id === t.id ? 'bg-racing-red/10 border-racing-red text-white' : 'bg-white/2 border-white/5 hover:border-white/20 text-white/60'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-orbitron text-xs font-black uppercase tracking-wide">{t.name}</span>
                          <span className="text-[8px] border border-white/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">{t.type}</span>
                        </div>
                        <p className="text-[9px] text-white/30 font-light">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compound Tires Selector */}
                <div>
                  <label className="text-[9px] text-white/40 uppercase tracking-widest block mb-2 font-bold">Tire Compound Roast</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['slicks', 'inters', 'wets'] as const).map(c => (
                      <button
                        key={c}
                        disabled={isSimulating}
                        onClick={() => { setCompound(c); playSound('click'); }}
                        className={`py-2 rounded-lg text-center font-orbitron text-[9px] font-bold uppercase tracking-wider border transition-all ${compound === c ? 'bg-white text-black border-white' : 'bg-white/2 border-white/5 text-white/50 hover:border-white/20'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Thermometer size={12} className="text-racing-red" /> Thermal Output
                    </label>
                    <span className="font-mono text-xs font-bold text-racing-red">{heat.toFixed(1)} °C</span>
                  </div>
                  <input
                    type="range" min="85.0" max="100.0" step="0.5"
                    disabled={isSimulating}
                    value={heat} onChange={(e) => { setHeat(parseFloat(e.target.value)); playSound('click'); }}
                    className="w-full accent-racing-red cursor-ew-resize disabled:opacity-50"
                  />
                </div>

                {/* Extraction Force Slider */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Gauge size={12} className="text-pit-yellow" /> Extraction Force
                    </label>
                    <span className="font-mono text-xs font-bold text-pit-yellow">{force.toFixed(1)} BAR</span>
                  </div>
                  <input
                    type="range" min="8.0" max="12.0" step="0.1"
                    disabled={isSimulating}
                    value={force} onChange={(e) => { setForce(parseFloat(e.target.value)); playSound('click'); }}
                    className="w-full accent-pit-yellow cursor-ew-resize disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/5 flex gap-3 mt-6">
                <button
                  disabled={isSimulating}
                  onClick={startSimulation}
                  className="flex-1 btn-racing uppercase tracking-widest text-[10px] py-4 rounded-xl flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={12} className="group-hover:scale-110 transition-transform" />
                  <span>Launch Sim</span>
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-4 border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 rounded-xl transition-all flex items-center justify-center"
                  title="Reset Simulation"
                >
                  <RefreshCw size={14} className={isSimulating ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Center Live Telemetry Graph (Span 5) */}
            <div className="lg:col-span-5 glass rounded-3xl border border-white/10 p-6 flex flex-col justify-between bg-black/60 min-h-[460px]">
              
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-orbitron text-xs font-bold text-white/50 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Activity size={14} className="text-racing-red animate-pulse" />
                    Live Telemetry Broadcast
                  </h3>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest leading-relaxed">
                    Graphing lap speed (km/h) and extraction rate (%) dynamically during sim cycle.
                  </p>
                </div>

                {/* Simulation Progress bar */}
                {isSimulating && (
                  <div className="w-full space-y-1 mt-2">
                    <div className="flex justify-between text-[8px] text-white/40 uppercase">
                      <span>Simulating chassis pass...</span>
                      <span>{simProgress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-racing-red transition-all duration-300" style={{ width: `${simProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Telemetry Line Chart */}
                <div className="h-64 mt-4 relative w-full flex-1">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="sector" stroke="rgba(255,255,255,0.2)" fontSize={8} fontFamily="monospace" />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={8} fontFamily="monospace" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 9, fontFamily: 'monospace', borderRadius: '12px' }}
                        />
                        <Line type="monotone" dataKey="speed" stroke="#E10600" strokeWidth={2.5} dot={false} name="Speed (km/h)" />
                        <Line type="monotone" dataKey="extraction" stroke="#facc15" strokeWidth={2} dot={false} name="Extraction (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {chartData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-black/20">
                      <span className="text-[10px] text-white/20 uppercase tracking-widest">Awaiting Simulation Ignition</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure data rate identifier */}
              <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[8px] text-white/30 font-mono mt-4">
                <span className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-green-400" /> SECURE DATALOG FEED</span>
                <span>RATE: 20HZ INTERNAL LINK</span>
              </div>
            </div>

            {/* Right Diagnostic Console Column (Span 3) */}
            <div className="lg:col-span-3 glass rounded-3xl border border-white/10 p-5 bg-black/60 flex flex-col h-[460px] lg:h-auto">
              <h3 className="font-orbitron text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                <Layers size={14} className="text-racing-red" />
                Console Logs
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 flex flex-col-reverse text-[10px] leading-relaxed">
                {logs.map((log, idx) => (
                  <div key={idx} className="border-l border-white/10 pl-2 py-0.5">
                    <span className="text-white/30 mr-2">[{log.time}]</span>
                    <span className={log.type === 'success' ? 'text-green-400' : log.type === 'warn' ? 'text-pit-yellow font-bold' : 'text-white/60'}>
                      {log.text}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="h-full flex items-center justify-center text-white/20 italic text-center text-[9px] py-12">
                    Diagnostic log feed inactive. Launch simulation to link diagnostics.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
