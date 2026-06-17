'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, Users, DollarSign, Power, AlertTriangle, Server, Terminal as TerminalIcon, Package, Zap, Sliders, FlaskConical, TrendingUp, Unlock } from 'lucide-react';
import { CeoGuard } from '@/frontend/components/CeoGuard';
import { useGlobalEvent } from '@/frontend/context/GlobalEventContext';
import { useAuth } from '@/frontend/context/AuthContext';
import Navbar from '@/frontend/components/Navbar';
import { useDatabase } from '@/frontend/context/DatabaseContext';
import { useSound } from '@/frontend/context/SoundContext';

export default function CommandCenterPage() {
  const { user } = useAuth();
  const { playSound } = useSound();
  const { isOverheat, toggleOverheat } = useGlobalEvent();
  const { stats, addRevenue, spendRevenue, boostTraffic, products, updateProductPrice, unlockProduct } = useDatabase();
  
  // Fake telemetry state
  const [activeUsers, setActiveUsers] = useState(1342);
  const [orders, setOrders] = useState(89);

  // Advanced Systems state
  const [nodes, setNodes] = useState([
    { id: 'EU-WEST', latency: 14, status: 'ok' },
    { id: 'US-EAST', latency: 45, status: 'ok' },
    { id: 'ASIA-PAC', latency: 120, status: 'warn' }
  ]);
  
  const [inventory, setInventory] = useState([
    { name: 'V12 Dark Roast', level: 92, color: 'bg-racing-red' },
    { name: 'Medium Blend', level: 64, color: 'bg-pit-yellow' },
    { name: 'Soft Espresso', level: 31, color: 'bg-blue-500' }
  ]);

  const [logs, setLogs] = useState<{id: number, text: string, type: string, time: string}[]>([
    { id: 1, text: 'SYSTEM INITIALIZATION COMPLETE', type: 'info', time: new Date().toLocaleTimeString() }
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const [researching, setResearching] = useState<string | null>(null);

  // Main tick simulator
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Basic Stats
      setActiveUsers(prev => Math.floor(prev + (Math.random() * 15 - 6) * stats.trafficMultiplier));
      if (Math.random() > (0.6 / stats.trafficMultiplier)) {
        setOrders(prev => prev + 1);
        addRevenue(Math.floor(Math.random() * 50) + 15);
      }

      // 2. Node Latencies
      setNodes(prev => prev.map(n => {
        let nextLat = n.latency + (Math.floor(Math.random() * 10) - 5);
        if (nextLat < 5) nextLat = 5;
        let status = 'ok';
        if (nextLat > 80) status = 'warn';
        if (nextLat > 150) status = 'error';
        return { ...n, latency: nextLat, status };
      }));

      // 3. Inventory Drain
      if (Math.random() > 0.8) {
        setInventory(prev => prev.map(inv => {
          let drain = Math.random() > 0.5 ? 1 : 0;
          return { ...inv, level: Math.max(0, inv.level - drain) };
        }));
      }

      // 4. Incident Logs
      if (Math.random() > 0.85) {
        const events = [
          { text: `ORDER #${Math.floor(Math.random() * 9000 + 1000)} ROUTED TO ${['EU-WEST', 'US-EAST', 'ASIA-PAC'][Math.floor(Math.random() * 3)]}`, type: 'info' },
          { text: 'NEW DRIVER PRO TIER REGISTRATION', type: 'success' },
          { text: 'TRAFFIC SPIKE DETECTED', type: 'warn' },
          { text: 'SUPPLY WARNING: BEANS IN TRANSIT', type: 'warn' },
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        
        setLogs(prev => {
          const next = [...prev, { id: Date.now(), text: event.text, type: event.type, time: new Date().toLocaleTimeString() }];
          return next.slice(-15); // Keep last 15
        });
      }

    }, 2000);
    return () => clearInterval(interval);
  }, [stats.trafficMultiplier, addRevenue]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handlePriceChange = (id: string, newPrice: number) => {
    updateProductPrice(id, newPrice);
  };

  const handleResearch = (id: string, cost: number) => {
    if (spendRevenue(cost)) {
      playSound('gear-shift');
      setResearching(id);
      setLogs(prev => [...prev, { id: Date.now(), text: `R&D LAB INITIATED RESEARCH ON PROD-${id.toUpperCase()}`, type: 'success', time: new Date().toLocaleTimeString() }]);
      
      // Simulate research delay
      setTimeout(() => {
        unlockProduct(id);
        setResearching(null);
        playSound('success');
        setLogs(prev => [...prev, { id: Date.now(), text: `R&D LAB COMPLETED. NEW PRODUCT INJECTED TO PUBLIC MENU.`, type: 'success', time: new Date().toLocaleTimeString() }]);
      }, 5000);
    } else {
      playSound('error');
      setLogs(prev => [...prev, { id: Date.now(), text: `R&D LAB REJECTED: INSUFFICIENT REVENUE`, type: 'error', time: new Date().toLocaleTimeString() }]);
    }
  };

  const handleMarketing = (cost: number, boost: number, name: string) => {
    if (spendRevenue(cost)) {
      playSound('success');
      boostTraffic(boost);
      setLogs(prev => [...prev, { id: Date.now(), text: `CAMPAIGN "${name}" LAUNCHED. TRAFFIC BOOSTED BY ${boost}x`, type: 'success', time: new Date().toLocaleTimeString() }]);
    } else {
      playSound('error');
      setLogs(prev => [...prev, { id: Date.now(), text: `CAMPAIGN REJECTED: INSUFFICIENT REVENUE`, type: 'error', time: new Date().toLocaleTimeString() }]);
    }
  };

  return (
    <CeoGuard>
      <div className="min-h-[100dvh] bg-[#050508] relative overflow-hidden flex flex-col pt-24 pb-12">
        <Navbar />
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff0a 1px, transparent 1px), linear-gradient(90deg, #ffffff0a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 relative z-10 flex-1 flex flex-col">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-6">
            <div>
              <h1 className="font-orbitron text-3xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <ShieldAlert className="text-racing-red" size={36} />
                PADDOCK <span className="text-racing-red">COMMAND</span>
              </h1>
              <p className="font-mono text-white/50 text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
                <Zap size={12} className="text-pit-yellow" />
                Commander: {user?.user_metadata?.full_name || 'CEO'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-orbitron text-[10px] text-green-500 font-bold uppercase tracking-widest">Global Link Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* LEFT COLUMN: Main Telemetry & Business Development */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Top KPI Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                    <Users size={64} />
                  </div>
                  <p className="font-orbitron text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Active Drivers</p>
                  <p className="font-mono text-4xl text-white font-bold">{activeUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="font-mono text-[9px] text-green-400">+{((stats.trafficMultiplier - 1) * 100).toFixed(0)}% Traffic Boost</p>
                  </div>
                </div>

                <div className="glass bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                    <Activity size={64} />
                  </div>
                  <p className="font-orbitron text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Live Orders</p>
                  <p className="font-mono text-4xl text-white font-bold">{orders.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-pit-yellow rounded-full animate-pulse" />
                    <p className="font-mono text-[9px] text-pit-yellow">Processing Queue</p>
                  </div>
                </div>

                <div className="glass bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                    <DollarSign size={64} />
                  </div>
                  <p className="font-orbitron text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Session Revenue</p>
                  <p className="font-mono text-3xl text-pit-yellow font-bold">€{stats.revenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[78%] h-full bg-gradient-to-r from-pit-yellow/50 to-pit-yellow" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Pricing Matrix */}
              <div className="glass bg-white/5 border border-white/10 rounded-3xl p-6">
                <h3 className="font-orbitron text-lg font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sliders size={20} className="text-pit-yellow" /> Pricing Matrix
                </h3>
                <p className="font-mono text-[10px] text-white/40 mb-6">Dynamically adjust global storefront prices in real-time. Changes instantly reflect on the public menu.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.filter(p => !p.locked).map(product => (
                    <div key={product.id} className="bg-black/40 border border-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-orbitron text-sm text-white uppercase">{product.name}</span>
                        <span className="font-mono text-racing-red font-bold">€{product.price.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="80" 
                        step="0.5"
                        value={product.price} 
                        onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value))}
                        className="w-full accent-racing-red"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* R&D Lab & Marketing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                  <h3 className="font-orbitron text-lg font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FlaskConical size={20} className="text-purple-400" /> R&D Laboratory
                  </h3>
                  <p className="font-mono text-[10px] text-white/40 mb-4">Fund research to unlock new products on the public menu.</p>
                  
                  {products.filter(p => p.locked).length > 0 ? (
                    products.filter(p => p.locked).map(product => (
                      <div key={product.id} className="bg-black/40 border border-purple-500/20 rounded-xl p-4 mt-2 border-dashed">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-orbitron text-xs text-white uppercase">{product.name}</span>
                          <span className="font-mono text-purple-400 text-xs">€5,000</span>
                        </div>
                        <p className="font-mono text-[9px] text-white/30 mb-4">{product.description}</p>
                        <button 
                          onClick={() => handleResearch(product.id, 5000)}
                          disabled={researching === product.id || stats.revenue < 5000}
                          className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 text-purple-300 rounded font-orbitron text-[9px] uppercase tracking-widest transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                          {researching === product.id ? <span className="animate-pulse">Researching...</span> : <><Unlock size={12} /> Fund Research</>}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                      <span className="font-mono text-[10px] text-white/30 uppercase">All Tech Unlocked</span>
                    </div>
                  )}
                </div>

                <div className="glass bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h3 className="font-orbitron text-lg font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" /> Global Marketing
                  </h3>
                  <p className="font-mono text-[10px] text-white/40 mb-4">Launch campaigns to boost traffic multiplier and drive order volume.</p>
                  <div className="space-y-3">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="font-orbitron text-[10px] text-white uppercase">Social Influencer</p>
                        <p className="font-mono text-[9px] text-white/30">+0.5x Traffic Boost</p>
                      </div>
                      <button 
                        onClick={() => handleMarketing(1000, 0.5, "Social Influencer")}
                        disabled={stats.revenue < 1000}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black border border-green-500/50 rounded font-orbitron text-[9px] uppercase font-bold disabled:opacity-50 transition-colors"
                      >
                        €1,000
                      </button>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="font-orbitron text-[10px] text-white uppercase">F1 Title Sponsor</p>
                        <p className="font-mono text-[9px] text-white/30">+2.0x Traffic Boost</p>
                      </div>
                      <button 
                        onClick={() => handleMarketing(10000, 2.0, "F1 Title Sponsor")}
                        disabled={stats.revenue < 10000}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black border border-green-500/50 rounded font-orbitron text-[9px] uppercase font-bold disabled:opacity-50 transition-colors"
                      >
                        €10,000
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Terminal & Systems */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Server Nodes */}
              <div className="glass bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-orbitron text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Server size={14} /> Server Nodes
                </h3>
                <div className="space-y-3">
                  {nodes.map(node => (
                    <div key={node.id} className="flex items-center justify-between p-2 bg-black/40 rounded border border-white/5">
                      <span className="font-orbitron text-xs text-white/80">{node.id}</span>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-[10px] ${node.status === 'ok' ? 'text-green-400' : node.status === 'warn' ? 'text-pit-yellow' : 'text-racing-red'}`}>
                          {node.latency}ms
                        </span>
                        <div className={`w-2 h-2 rounded-full ${node.status === 'ok' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : node.status === 'warn' ? 'bg-pit-yellow shadow-[0_0_8px_#f1c40f]' : 'bg-racing-red shadow-[0_0_8px_#E10600] animate-pulse'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Big Red Switch */}
              <div className="glass bg-black/50 border border-white/10 rounded-3xl p-6 text-center relative overflow-hidden flex flex-col justify-center items-center">
                {isOverheat && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-racing-red pointer-events-none"
                  />
                )}
                
                <AlertTriangle size={20} className={`mb-4 ${isOverheat ? 'text-racing-red animate-bounce' : 'text-white/20'}`} />
                
                <h2 className="font-orbitron text-sm font-black text-white uppercase tracking-widest mb-2">
                  Defcon 1 Overheat Mode
                </h2>

                <button
                  onClick={() => toggleOverheat(!isOverheat)}
                  className={`relative group flex flex-col items-center justify-center transition-all duration-300 mt-4 ${isOverheat ? 'scale-95' : 'hover:scale-105'}`}
                >
                  <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-colors ${isOverheat ? 'border-racing-red shadow-[0_0_50px_#E10600]' : 'border-white/20 group-hover:border-racing-red/50'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isOverheat ? 'bg-racing-red animate-pulse' : 'bg-black border border-white/20 group-hover:bg-racing-red/20'}`}>
                      <Power size={20} className={isOverheat ? 'text-white' : 'text-white/50 group-hover:text-racing-red'} />
                    </div>
                  </div>
                </button>
              </div>

              {/* Incident Terminal */}
              <div className="flex-1 glass bg-black/80 border border-white/10 rounded-2xl p-4 flex flex-col relative overflow-hidden min-h-[250px]">
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
                <h3 className="font-orbitron text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2 shrink-0">
                  <TerminalIcon size={14} /> Global Event Log
                </h3>
                <div className="flex-1 overflow-y-auto overflow-x-hidden font-mono text-[9px] space-y-2 pr-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {logs.map((log) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2"
                      >
                        <span className="text-white/30 shrink-0">[{log.time}]</span>
                        <span className={`
                          ${log.type === 'info' ? 'text-white/70' : ''}
                          ${log.type === 'success' ? 'text-green-400' : ''}
                          ${log.type === 'warn' ? 'text-pit-yellow' : ''}
                          ${log.type === 'error' ? 'text-racing-red' : ''}
                        `}>
                          {log.text}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={logsEndRef} />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </CeoGuard>
  );
}
