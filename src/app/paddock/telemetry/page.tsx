'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Activity, 
  Zap, 
  Timer, 
  TrendingUp, 
  Gauge, 
  Radio, 
  Flag,
  CloudRain
} from 'lucide-react';
import Link from 'next/link';
import { useSound } from '@/context/SoundContext';

const driversData = [
  { id: 1, name: 'Max Verstappen', team: 'Red Bull', lap: '1:27.097', gap: 'INTERVAL', s1: '27.4', s2: '34.2', s3: '25.4', status: 'PURPLE', image: '/assets/tracks/silverstone.png' },
  { id: 2, name: 'Lewis Hamilton', team: 'Mercedes', lap: '1:27.212', gap: '+0.115', s1: '27.5', s2: '34.3', s3: '25.4', status: 'GREEN', image: '/assets/tracks/silverstone.png' },
  { id: 3, name: 'Charles Leclerc', team: 'Ferrari', lap: '1:27.445', gap: '+0.348', s1: '27.6', s2: '34.4', s3: '25.4', status: 'YELLOW', image: '/assets/tracks/silverstone.png' },
  { id: 4, name: 'Lando Norris', team: 'McLaren', lap: '1:27.589', gap: '+0.492', s1: '27.7', s2: '34.5', s3: '25.3', status: 'PURPLE', image: '/assets/tracks/silverstone.png' },
  { id: 5, name: 'George Russell', team: 'Mercedes', lap: '1:27.812', gap: '+0.715', s1: '27.8', s2: '34.6', s3: '25.4', status: 'GREEN', image: '/assets/tracks/silverstone.png' },
];

const TelemetryPage = () => {
  const { playSound } = useSound();
  const [selectedDriver, setSelectedDriver] = useState(driversData[0]);
  const [speed, setSpeed] = useState(304);
  const [rpm, setRpm] = useState(11500);
  const [telemetryPoints, setTelemetryPoints] = useState<number[]>(Array(50).fill(250));

  // Simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const next = prev + (Math.random() * 4 - 2);
        return Math.max(280, Math.min(330, next));
      });
      setRpm(prev => {
        const next = prev + (Math.random() * 200 - 100);
        return Math.max(10000, Math.min(12500, next));
      });
      setTelemetryPoints(prev => {
        const next = [...prev.slice(1), 280 + Math.random() * 40];
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-carbon-black pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <Link 
              href="/paddock" 
              className="flex items-center gap-4 text-white/40 hover:text-white transition-colors group mb-6 no-underline"
              onClick={() => playSound('click')}
            >
              <div className="p-2 glass rounded-full group-hover:bg-racing-red transition-all">
                <ChevronLeft size={16} />
              </div>
              <span className="font-orbitron text-[10px] font-bold tracking-[0.3em]">BACK TO PADDOCK</span>
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-orbitron text-5xl font-black italic tracking-tighter">LIVE TELEMETRY</h1>
              <div className="px-3 py-1 bg-racing-red text-white font-orbitron text-[10px] font-bold animate-pulse">LIVE</div>
            </div>
            <p className="text-white/40 font-orbitron text-[10px] tracking-[0.4em] uppercase">FP1 - Silverstone Grand Prix | Session Timer: 42:15</p>
          </div>

          <div className="flex gap-4">
            <div className="glass p-4 rounded-xl border-white/5 flex items-center gap-4">
              <CloudRain size={20} className="text-blue-400" />
              <div>
                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Track Status</div>
                <div className="font-orbitron text-xs font-bold text-blue-400">DAMP (15%)</div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl border-white/5 flex items-center gap-4">
              <Flag size={20} className="text-green-500" />
              <div>
                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Flag Status</div>
                <div className="font-orbitron text-xs font-bold text-green-500">GREEN FLAG</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Live Timing */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-3xl border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer size={18} className="text-racing-red" />
                  <h3 className="font-orbitron text-xs font-black tracking-widest">LIVE TIMING INTERFACE</h3>
                </div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Updated 0.1s ago</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-white/20 uppercase tracking-widest border-b border-white/5">
                      <th className="p-6">Pos</th>
                      <th className="p-6">Driver</th>
                      <th className="p-6">Lap Time</th>
                      <th className="p-6">Gap</th>
                      <th className="p-6">S1</th>
                      <th className="p-6">S2</th>
                      <th className="p-6">S3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driversData.map((driver, index) => (
                      <motion.tr 
                        key={driver.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => { setSelectedDriver(driver); playSound('click'); }}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${
                          selectedDriver.id === driver.id ? 'bg-racing-red/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="p-6 font-orbitron font-black text-sm">{index + 1}</td>
                        <td className="p-6">
                          <div className="font-bold text-sm">{driver.name}</div>
                          <div className="text-[10px] text-white/30 uppercase">{driver.team}</div>
                        </td>
                        <td className={`p-6 font-orbitron font-bold text-sm ${
                          driver.status === 'PURPLE' ? 'text-purple-500' : driver.status === 'GREEN' ? 'text-green-500' : 'text-white'
                        }`}>
                          {driver.lap}
                        </td>
                        <td className="p-6 font-orbitron text-xs text-white/40">{driver.gap}</td>
                        <td className="p-6 text-xs">{driver.s1}</td>
                        <td className="p-6 text-xs">{driver.s2}</td>
                        <td className="p-6 text-xs font-bold text-purple-500">{driver.s3}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Telemetry Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden h-64">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Gauge size={16} className="text-racing-red" />
                    <span className="font-orbitron text-[10px] font-bold tracking-widest uppercase">Speed Profile (KM/H)</span>
                  </div>
                  <span className="font-orbitron text-2xl font-black italic">{Math.round(speed)}</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 flex items-end px-8 pb-8 gap-1">
                  {telemetryPoints.map((p, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: `${(p / 330) * 100}%` }}
                      className="flex-1 bg-racing-red/20 border-t-2 border-racing-red/60"
                    />
                  ))}
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden h-64">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-blue-500" />
                    <span className="font-orbitron text-[10px] font-bold tracking-widest uppercase">Engine RPM</span>
                  </div>
                  <span className="font-orbitron text-2xl font-black italic">{Math.round(rpm)}</span>
                </div>
                {/* Simulated Waveform */}
                <div className="w-full h-32 flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <motion.path
                      d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      animate={{ 
                        d: `M0,50 Q25,${40 + Math.random() * 20} 50,50 T100,50 T150,${30 + Math.random() * 40} T200,50 T250,50 T300,${40 + Math.random() * 20} T350,50 T400,50` 
                      }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Driver Detail & Comms */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-racing-red" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <img src={selectedDriver.image} alt={selectedDriver.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-orbitron text-xl font-black italic">{selectedDriver.name}</h4>
                  <p className="text-[10px] font-bold text-racing-red tracking-widest uppercase">{selectedDriver.team}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3 text-white/40">
                    <Zap size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tyre Compound</span>
                  </div>
                  <div className="font-orbitron text-xs font-bold text-yellow-500">MEDIUM (C3)</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3 text-white/40">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tyre Age</span>
                  </div>
                  <div className="font-orbitron text-xs font-bold">12 LAPS</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3 text-white/40">
                    <Timer size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pit Stop Strategy</span>
                  </div>
                  <div className="font-orbitron text-xs font-bold">1-STOP (S-M)</div>
                </div>
              </div>
            </div>

            {/* Radio Comms */}
            <div className="glass p-8 rounded-3xl border-white/5">
              <div className="flex items-center gap-3 mb-6 text-white/20">
                <Radio size={16} />
                <h4 className="font-orbitron text-[10px] font-bold tracking-widest uppercase">Team Radio Feed</h4>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-racing-red/5 border-l-2 border-racing-red rounded-r-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Race Engineer (RBR)</p>
                  <p className="text-[11px] font-light italic leading-relaxed">"Max, we need to manage the front left through Copse. Watch the entry speed."</p>
                </div>
                <div className="p-4 bg-white/5 border-l-2 border-white/20 rounded-r-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Max Verstappen</p>
                  <p className="text-[11px] font-light italic leading-relaxed">"Copy that. The wind is picking up on the main straight."</p>
                </div>
              </div>
            </div>

            {/* System Status HUD */}
            <div className="glass p-8 rounded-3xl border-white/5 text-center">
              <div className="w-16 h-16 border-4 border-racing-red/20 border-t-racing-red rounded-full mx-auto mb-4 animate-spin" />
              <p className="font-orbitron text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Synchronizing Telemetry</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TelemetryPage;
