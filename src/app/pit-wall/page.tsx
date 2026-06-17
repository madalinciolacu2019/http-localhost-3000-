'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeGuard } from '@/frontend/components/EmployeeGuard';
import Navbar from '@/frontend/components/Navbar';
import { useDatabase, OrderStatus } from '@/frontend/context/DatabaseContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Flame, Truck, GripVertical, Activity, Clock, Users, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';

// Random telemetry generator for the cards
const generateTelemetry = () => ({
  temp: Math.floor(85 + Math.random() * 10) + '.' + Math.floor(Math.random() * 9),
  pressure: Math.floor(8 + Math.random() * 3) + '.' + Math.floor(Math.random() * 9),
  flow: Math.floor(1 + Math.random() * 2) + '.' + Math.floor(Math.random() * 9)
});

export default function PitWallPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, addRevenue } = useDatabase();
  const { playSound } = useSound();
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<Record<string, any>>({});
  const [sessionTime, setSessionTime] = useState(0);
  const [comms, setComms] = useState<Array<{ id: number; text: string; from: string; time: string; type: 'red' | 'blue' | 'green' }>>([
    { id: 1, text: '"Box Box. Execute strategy Bravo for order ORD-1002."', from: 'COMMAND DECK', time: '12s ago', type: 'red' },
    { id: 2, text: '"Telemetry sync established."', from: 'SYSTEM', time: '2m ago', type: 'blue' }
  ]);

  const handleUpdateStatus = (id: string, nextStatus: any) => {
    playSound('click');
    updateOrderStatus(id, nextStatus);
    setTelemetry(prev => ({...prev, [id]: generateTelemetry()}));
    
    const statusLabel = nextStatus === 'ROASTING' ? 'Active Roasting' : nextStatus === 'SHIPPED' ? 'Box Box (Shipped)' : nextStatus;
    const newComm = {
      id: Date.now(),
      text: `"Order #${id.slice(-6).toUpperCase()} transitioned to ${statusLabel}."`,
      from: 'PIT CREW',
      time: 'Just now',
      type: (nextStatus === 'ROASTING' ? 'red' : nextStatus === 'SHIPPED' ? 'green' : 'blue') as any
    };
    setComms(prev => [newComm, ...prev].slice(0, 8));
  };

  const handleCollectCash = (order: any) => {
    playSound('success');
    const price = order.price || 8.50;
    
    updateOrderStatus(order.id, 'COMPLETED');
    addRevenue(price);
    
    try {
      const currentVaultStr = localStorage.getItem('central_bank_balance');
      const currentVault = currentVaultStr ? parseFloat(currentVaultStr) : 12450.50;
      const nextVault = currentVault + price;
      localStorage.setItem('central_bank_balance', nextVault.toString());
      
      const currentLedgerStr = localStorage.getItem('central_bank_ledger');
      const currentLedger = currentLedgerStr ? JSON.parse(currentLedgerStr) : [];
      const newEntry = {
        id: `TX-${order.id}-${Math.floor(Math.random() * 1000)}`,
        amount: price,
        time: new Date().toLocaleTimeString(),
        type: 'injection'
      };
      localStorage.setItem('central_bank_ledger', JSON.stringify([newEntry, ...currentLedger].slice(0, 50)));
    } catch (e) {
      console.error('Failed to update CEO bank reserves:', e);
    }
    
    const newComm = {
      id: Date.now(),
      text: `"Order #${order.id.slice(-6).toUpperCase()} picked up. Collected €${price.toFixed(2)}."`,
      from: 'COMM DECK',
      time: 'Just now',
      type: 'green' as const
    };
    setComms(prev => [newComm, ...prev].slice(0, 8));
  };

  useEffect(() => {
    // Generate static telemetry for existing orders to avoid hydration mismatch
    const initialTels: Record<string, any> = {};
    orders.forEach(o => {
      initialTels[o.id] = generateTelemetry();
    });
    setTelemetry(initialTels);

    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const columns: { id: OrderStatus; title: string; icon: React.ReactNode; color: string; glow: string; text: string }[] = [
    { id: 'QUEUE', title: 'Telemetry Sync', icon: <Coffee size={16} />, color: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', text: 'text-blue-400' },
    { id: 'ROASTING', title: 'Active Roasting', icon: <Flame size={16} />, color: 'border-pit-yellow/40', glow: 'shadow-[0_0_15px_rgba(255,204,0,0.15)]', text: 'text-pit-yellow' },
    { id: 'SHIPPED', title: 'Box Box (Shipped)', icon: <Truck size={16} />, color: 'border-green-500/40', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.15)]', text: 'text-green-400' }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedOrder(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    playSound('click');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && draggedOrder) {
      playSound('success');
      updateOrderStatus(id, status);
      setDraggedOrder(null);
      // Generate new telemetry on move
      setTelemetry(prev => ({...prev, [id]: generateTelemetry()}));
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activeOrders = orders.filter(o => o.status !== 'SHIPPED').length;

  return (
    <EmployeeGuard>
      <div className="min-h-[100dvh] bg-[#020203] relative overflow-hidden flex flex-col pt-24 pb-12 font-mono">
        <Navbar />
        
        {/* Background Radar & Telemetry Lines */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-racing-red/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        {/* Radar Sweep Animation */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full border border-white/5 border-dashed pointer-events-none opacity-20"
        />

        <div className="max-w-[1400px] mx-auto w-full px-4 relative z-10 flex-1 flex flex-col">
          
          {/* Header */}
          <div className="border-b border-white/10 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-black/40 p-6 rounded-2xl border-t border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-racing-red/10 border border-racing-red/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(225,6,0,0.2)]">
                <Activity size={24} className="text-racing-red animate-pulse" />
              </div>
              <div>
                <h1 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter">
                  Pit Wall Command
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-racing-red tracking-widest uppercase font-bold">
                    <span className="w-2 h-2 rounded-full bg-racing-red animate-pulse" /> Live
                  </span>
                  <span className="text-white/30 text-xs uppercase tracking-widest">| Commander: {user?.user_metadata?.full_name || 'Staff'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="glass px-4 py-2 rounded-lg border border-white/10 text-center">
                <span className="block text-[9px] text-white/40 uppercase tracking-widest mb-1">Session Time</span>
                <span className="font-orbitron text-lg font-bold text-white">{formatTime(sessionTime)}</span>
              </div>
              <div className="glass px-4 py-2 rounded-lg border border-racing-red/20 text-center">
                <span className="block text-[9px] text-racing-red/70 uppercase tracking-widest mb-1">Network</span>
                <span className="font-orbitron text-lg font-bold text-racing-red">SECURE</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* Kanban Pipeline (Left 9 cols) */}
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
              {columns.map(col => {
                const colOrders = orders.filter(o => o.status === col.id);
                const isDragTarget = draggedOrder && orders.find(o => o.id === draggedOrder)?.status !== col.id;
                
                return (
                  <div 
                    key={col.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`bg-black/40 backdrop-blur-md border ${col.color} rounded-2xl flex flex-col transition-all duration-300 overflow-hidden ${isDragTarget ? col.glow + ' bg-white/5 scale-[1.02]' : ''}`}
                  >
                    {/* Column Header */}
                    <div className={`p-4 border-b ${col.color} bg-white/5 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md bg-black/50 ${col.text}`}>
                          {col.icon}
                        </div>
                        <h2 className="font-orbitron text-sm font-bold text-white uppercase tracking-widest">
                          {col.title}
                        </h2>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded bg-black/50 border ${col.color} ${col.text}`}>
                        {colOrders.length}
                      </div>
                    </div>

                    {/* Order Cards */}
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[300px]">
                      <AnimatePresence>
                        {colOrders.map(order => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={order.id}
                            draggable
                            onDragStart={(e: any) => handleDragStart(e, order.id)}
                            onDragEnd={() => setDraggedOrder(null)}
                            className={`relative bg-[#0a0a0c] border border-white/10 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-white/30 transition-all group ${draggedOrder === order.id ? 'opacity-50 scale-95' : 'hover:-translate-y-1 hover:shadow-lg'}`}
                          >
                            {/* Card Accent Line */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${col.id === 'QUEUE' ? 'bg-blue-500' : col.id === 'ROASTING' ? 'bg-pit-yellow' : 'bg-green-500'} rounded-l-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                            
                            <div className="pl-2">
                              <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-orbitron text-[10px] font-bold text-white/50 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">{order.id}</span>
                                  <span className="text-[10px] text-white/30">{order.time}</span>
                                </div>
                                <GripVertical size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                              </div>
                              
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-orbitron text-lg font-black text-white uppercase">{order.customer}</h3>
                                <span className="font-orbitron font-bold text-xs text-green-400">€{(order.price || 8.50).toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                                <Coffee size={12} className={col.text} /> {order.blend}
                              </p>
                              
                              {/* Fake Telemetry Data */}
                              <div className="grid grid-cols-3 gap-2 bg-black/50 p-2 rounded-lg border border-white/5 mb-4">
                                <div>
                                  <span className="block text-[8px] text-white/30 uppercase tracking-widest mb-0.5">Temp</span>
                                  <span className={`text-[10px] font-bold ${col.text}`}>{telemetry[order.id]?.temp || '00.0'}°C</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-white/30 uppercase tracking-widest mb-0.5">Press</span>
                                  <span className="text-[10px] font-bold text-white/70">{telemetry[order.id]?.pressure || '0.0'}b</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-white/30 uppercase tracking-widest mb-0.5">Flow</span>
                                  <span className="text-[10px] font-bold text-white/70">{telemetry[order.id]?.flow || '0.0'}s</span>
                                </div>
                              </div>

                              {/* Interactive Actions */}
                              <div className="mt-3 pt-3 border-t border-white/5">
                                {col.id === 'QUEUE' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'ROASTING')}
                                    className="w-full py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px] font-orbitron font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    Start Roasting →
                                  </button>
                                )}
                                {col.id === 'ROASTING' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                    className="w-full py-1.5 bg-pit-yellow/10 hover:bg-pit-yellow/20 text-pit-yellow border border-pit-yellow/30 rounded text-[9px] font-orbitron font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    Ship Roast →
                                  </button>
                                )}
                                {col.id === 'SHIPPED' && (
                                  <button
                                    onClick={() => handleCollectCash(order)}
                                    className="w-full py-1.5 bg-green-500/10 hover:bg-green-500/25 text-green-400 border border-green-500/30 rounded text-[9px] font-orbitron font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                                  >
                                    <span>Deliver & Pay</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {colOrders.length === 0 && (
                        <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">Awaiting Data</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Session Tracker (Right 3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* Tracker Widget 1: System Status */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <h3 className="font-orbitron text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Cpu size={14} /> Telemetry Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1 text-white/70">
                      <span>Roaster Array Load</span>
                      <span className="text-pit-yellow">{activeOrders * 15}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-pit-yellow" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(activeOrders * 15, 100)}%` }} 
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1 text-white/70">
                      <span>Network Throughput</span>
                      <span className="text-blue-400">94.2 MB/s</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[94%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracker Widget 2: Session Data */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <h3 className="font-orbitron text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldAlert size={14} /> Live Metrics
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <span className="block text-[9px] text-white/40 uppercase tracking-widest mb-1">Active Pits</span>
                    <span className="font-orbitron text-xl font-black text-white">{activeOrders}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <span className="block text-[9px] text-white/40 uppercase tracking-widest mb-1">Completed</span>
                    <span className="font-orbitron text-xl font-black text-green-400">{orders.filter(o => o.status === 'SHIPPED').length}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">Recent Comms</h4>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {comms.map(item => (
                      <div key={item.id} className="bg-[#0a0a0c] border border-white/5 p-3 rounded-lg flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${item.type === 'red' ? 'bg-racing-red animate-pulse' : item.type === 'green' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                        <div>
                          <span className="block text-[10px] text-white/70">{item.text}</span>
                          <span className="block text-[8px] text-white/30 mt-1">From: {item.from} • {item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </EmployeeGuard>
  );
}
