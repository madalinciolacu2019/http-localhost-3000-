'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Activity, Clock } from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';

export default function LiveTimingTower() {
  const pathname = usePathname();
  const { orders } = useDatabase();
  const [isOpen, setIsOpen] = useState(false);
  
  // Show the most recent 8 orders
  const displayOrders = orders.slice(0, 8);

  const getSectorColors = (status: string) => {
    if (status === 'SHIPPED') {
      return ['bg-purple-500', 'bg-purple-500', 'bg-purple-500'];
    }
    if (status === 'ROASTING') {
      return ['bg-green-500', 'bg-green-500', 'bg-white/10'];
    }
    // QUEUE
    return ['bg-green-500', 'bg-white/10', 'bg-white/10'];
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-4 md:right-8 z-50 bg-black/80 border border-white/10 p-2 rounded-lg text-white/50 hover:text-white hover:border-white/30 backdrop-blur transition-all flex items-center gap-2"
        title="Toggle Live Timing Tower"
      >
        <Activity size={16} className={isOpen ? "text-racing-red animate-pulse" : ""} />
        <span className="hidden md:inline-block font-orbitron text-[9px] uppercase tracking-widest">Timing</span>
      </button>

      {/* Desktop & Mobile Sidebar */}
      <div className={`fixed top-36 right-4 md:right-8 z-40 w-64 pointer-events-auto transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-[150%]'}`}>
        <div className="glass bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          
          {/* Header */}
          <div className="bg-racing-red text-white p-2 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center gap-2">
              <Clock size={12} className="animate-pulse" />
              <span className="font-orbitron text-[9px] font-black tracking-widest uppercase">Live Orders</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          {/* List */}
          <div className="flex flex-col relative h-[300px] overflow-hidden">
            <AnimatePresence initial={false}>
              {displayOrders.map((order, i) => {
                const sectors = getSectorColors(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={`flex items-center justify-between p-2 border-b border-white/5 ${i === 0 ? 'bg-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-orbitron font-bold text-xs w-8 text-white truncate">{order.customer.substring(0, 3).toUpperCase()}</span>
                      <div className="flex flex-col">
                        <span className="font-mono text-[9px] text-white/50 truncate max-w-[100px]">{order.blend}</span>
                        <div className="flex gap-1 mt-0.5">
                          <div className={`w-3 h-1 rounded-full ${sectors[0]}`} />
                          <div className={`w-3 h-1 rounded-full ${sectors[1]}`} />
                          <div className={`w-3 h-1 rounded-full ${sectors[2]}`} />
                        </div>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] ${order.status === 'SHIPPED' ? 'text-purple-400 font-bold' : order.status === 'ROASTING' ? 'text-pit-yellow' : 'text-white/40'}`}>
                      {order.status === 'SHIPPED' ? 'OUT' : order.status === 'ROASTING' ? 'BOX' : 'Q'}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {displayOrders.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <span className="font-mono text-[10px] text-white/30 uppercase">No Active Orders</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
