'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import { useSound } from '@/frontend/context/SoundContext';
import StravaSync from '@/frontend/components/StravaSync';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Thermometer, Gauge, Clock, ShoppingCart, Award, Cpu, RotateCcw, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// --- TELEMETRY ORDER TYPE ---
interface TelemetryOrder {
  id: string;
  items: string;
  value: number;
  status: 'calibrating' | 'roasting' | 'extracting' | 'packaging' | 'ready';
  destination: string;
}

export default function StorefrontTelemetryPage() {
  const { playSound } = useSound();

  // Simulated live bean hopper capacities
  const [hoppers, setHoppers] = useState([
    { name: 'Scarlet Aero', capacity: 84, temp: 21.2, status: 'nominal' },
    { name: 'Indigo Racing', capacity: 62, temp: 20.8, status: 'nominal' },
    { name: 'Silver Works', capacity: 91, temp: 21.0, status: 'optimal' },
    { name: 'Papaya Speed', capacity: 48, temp: 22.4, status: 'critical' }
  ]);

  // Live order queue simulation state
  const [orders, setOrders] = useState<TelemetryOrder[]>([
    { id: 'F1-9231', items: 'Scarlet Aero Custom Blend', value: 24.50, status: 'calibrating', destination: 'Paddock Box 4' },
    { id: 'F1-9230', items: 'Redline Espresso + Cap', value: 18.20, status: 'roasting', destination: 'Grandstand A' },
    { id: 'F1-9229', items: 'Indigo Racing Blend', value: 19.50, status: 'extracting', destination: 'Pitbox 12' },
    { id: 'F1-9228', items: 'Apex Mug + Custom Grind', value: 34.10, status: 'packaging', destination: 'Paddock Suite 3' },
    { id: 'F1-9227', items: 'Double Shot Nitro Cold', value: 12.00, status: 'ready', destination: 'Trackside Bar' }
  ]);

  // Simulated operations counters
  const [sessionLaps, setSessionLaps] = useState(882);
  const [revenueScore, setRevenueScore] = useState(6124.50);

  // Dynamic simulation loop updating order states and adding new orders
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Progress active orders to next step
      setOrders(prev => {
        let progressed = prev.map(order => {
          let nextStatus: TelemetryOrder['status'] = order.status;
          if (order.status === 'calibrating') nextStatus = 'roasting';
          else if (order.status === 'roasting') nextStatus = 'extracting';
          else if (order.status === 'extracting') nextStatus = 'packaging';
          else if (order.status === 'packaging') nextStatus = 'ready';

          return { ...order, status: nextStatus };
        });

        // Filter out orders that have been completed/picked up (are ready and get popped)
        progressed = progressed.filter(o => o.status !== 'ready' || Math.random() > 0.4);

        // 2. Randomly add a new paddock order to feed (simulate high-frequency operations)
        if (progressed.length < 7 && Math.random() > 0.3) {
          const names = ['Scarlet Aero Blend', 'Indigo Custom Grind', 'Carbon Stealth Roast', 'Double Apex Espresso', 'Redline Gear Cap'];
          const values = [24.50, 19.50, 26.00, 8.50, 45.00];
          const boxes = ['Pitbox 1', 'Pitbox 3', 'Grandstand C', 'Paddock Box 9', 'Trackside Lounge'];
          const idx = Math.floor(Math.random() * names.length);
          
          const newId = `F1-${Math.floor(9232 + Math.random() * 800)}`;
          
          playSound('click');
          progressed = [
            {
              id: newId,
              items: names[idx],
              value: values[idx],
              status: 'calibrating',
              destination: boxes[Math.floor(Math.random() * boxes.length)]
            },
            ...progressed
          ];

          // Increment counters
          setSessionLaps(l => l + 1);
          setRevenueScore(r => r + values[idx]);
        }

        return progressed.slice(0, 8); // Hold max 8 in viewport feed
      });

      // 3. Jitter hopper capacities down slightly
      setHoppers(prev => 
        prev.map(hop => {
          const drain = Math.random() > 0.75 ? parseFloat((Math.random() * 0.8).toFixed(1)) : 0;
          let nextCap = parseFloat((hop.capacity - drain).toFixed(1));
          if (nextCap <= 0) nextCap = 100; // Refuel hopper simulation
          
          return {
            ...hop,
            capacity: nextCap,
            status: nextCap < 50 ? 'critical' : nextCap < 75 ? 'nominal' : 'optimal'
          };
        })
      );

    }, 3800);

    return () => clearInterval(interval);
  }, [playSound]);

  const getStatusStyle = (status: TelemetryOrder['status']) => {
    switch (status) {
      case 'calibrating': return 'border-orange-500 text-orange-400 bg-orange-500/10';
      case 'roasting': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
      case 'extracting': return 'border-blue-500 text-blue-400 bg-blue-500/10';
      case 'packaging': return 'border-purple-500 text-purple-400 bg-purple-500/10';
      case 'ready': return 'border-green-500 text-green-400 bg-green-500/10';
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-carbon-black pt-28 pb-20 px-4 md:px-8 relative overflow-hidden">
        {/* Carbon fiber grid mesh */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-racing-red/5 skew-x-[-15deg] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          {/* Header */}
          <div className="border-b border-white/10 pb-6 space-y-2">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-racing-red animate-pulse" />
              <span className="font-orbitron text-[10px] font-black tracking-[0.4em] text-racing-red uppercase">Operational Paddock telemetry</span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">
              STOREFRONT <span className="text-racing-red">TELEMETRY</span>
            </h1>
          </div>

          {/* Quick HUD Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass p-5 border-white/5 rounded-2xl bg-black/40">
              <span className="text-[8px] text-white/30 font-orbitron tracking-widest uppercase block mb-1">TOTAL SYSTEM SALES</span>
              <span className="font-orbitron text-2xl font-black italic text-white">{sessionLaps} ORDERS</span>
              <span className="text-[8px] text-green-500 font-mono block mt-1">▲ Nominal telemetry connection</span>
            </div>
            <div className="glass p-5 border-white/5 rounded-2xl bg-black/40">
              <span className="text-[8px] text-white/30 font-orbitron tracking-widest uppercase block mb-1">PADDOCK LIVE REVENUE</span>
              <span className="font-orbitron text-2xl font-black italic text-pit-yellow">€{revenueScore.toFixed(2)}</span>
              <span className="text-[8px] text-white/40 font-mono block mt-1">Live order value sum</span>
            </div>
            <div className="glass p-5 border-white/5 rounded-2xl bg-black/40">
              <span className="text-[8px] text-white/30 font-orbitron tracking-widest uppercase block mb-1">LORING THERMAL LOAD</span>
              <span className="font-orbitron text-2xl font-black italic text-white">205.4 °C</span>
              <span className="text-[8px] text-white/40 font-mono block mt-1">Rate of Rise: 12.4°C/min</span>
            </div>
            <div className="glass p-5 border-white/5 rounded-2xl bg-black/40">
              <span className="text-[8px] text-white/30 font-orbitron tracking-widest uppercase block mb-1">FIA COMM NETWORK</span>
              <span className="font-orbitron text-2xl font-black italic text-green-400">100% ONLINE</span>
              <span className="text-[8px] text-green-400 font-mono block mt-1">Latency: 14ms connection</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Block: Hopper Stock Telemetry (Span 5) */}
            <div className="lg:col-span-5 glass rounded-3xl border border-white/10 p-6 flex flex-col justify-between bg-black/60 min-h-[460px]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-orbitron text-xs font-black text-white uppercase tracking-wider mb-1">BEAN HOPPER STOCK CALIBRATION</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                    Live telemetry tracking of single-origin beans remaining in the grinder hoppers.
                  </p>
                </div>

                {/* Stock Hopper level visualization using Recharts BarChart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hoppers} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} fontFamily="monospace" />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} fontFamily="monospace" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#0c0d0e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, fontFamily: 'monospace' }} />
                      <Bar dataKey="capacity" fill="#E10600" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status footer for inventory levels */}
              <div className="pt-6 border-t border-white/5 space-y-3">
                <span className="text-[8px] text-white/30 font-orbitron tracking-widest uppercase block">HOPPER ENVIRONMENTAL DATA</span>
                <div className="grid grid-cols-2 gap-4 text-mono text-[9px] uppercase">
                  {hoppers.map((hop, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/2 p-2 rounded-lg border border-white/5">
                      <span className="text-white/50">{hop.name.split(' ')[0]}</span>
                      <span className={hop.status === 'critical' ? 'text-racing-red font-bold animate-pulse' : 'text-white font-bold'}>
                        {hop.capacity}% ({hop.temp}°C)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Block: Live Order Feed Queue (Span 7) */}
            <div className="lg:col-span-7 glass rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col justify-between bg-black/60 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-orbitron text-xs font-black text-white uppercase tracking-wider mb-1">LIVE ORDER PROCESSING QUEUE</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                    Orders transition from calibration up to pickup. Watch parameters shift as orders are processed trackside.
                  </p>
                </div>

                {/* Orders list timeline */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  <AnimatePresence initial={false}>
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-4 bg-white/2 border border-white/5 rounded-xl flex justify-between items-center text-[10px] font-mono hover:bg-white/5 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-orbitron text-xs font-black text-white">{order.id}</span>
                            <span className="text-[8px] text-white/40">→ {order.destination.toUpperCase()}</span>
                          </div>
                          <span className="text-white/60 block text-[9px] uppercase tracking-wider">{order.items}</span>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <span className="text-white font-orbitron font-black">€{order.value.toFixed(2)}</span>
                          <span className={`px-2 py-1 rounded text-[8px] font-orbitron font-black tracking-widest uppercase border ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Secure check signature */}
              <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[8px] text-white/40 font-mono">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-500" /> SECURE DATALOG FEED</span>
                <span>DATA RATE: 10HZ INTERVALS</span>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <StravaSync />
          </div>

        </div>
      </main>
    </>
  );
}
