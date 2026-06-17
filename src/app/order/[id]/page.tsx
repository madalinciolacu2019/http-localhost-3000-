'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Coffee, Compass, CheckCircle, Package, Timer } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      if (orderId.startsWith('demo_')) {
        const stored = localStorage.getItem(`order_${orderId}`);
        if (stored) setOrder(JSON.parse(stored));
        const currentStatus = localStorage.getItem(`status_${orderId}`) || 'pending';
        setStatus(currentStatus);
        setLoading(false);
      } else {
        try {
          const res = await fetch(`/api/fulfillment/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('apex-brews-token') || ''}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setOrder({ 
              id: data.orderId, 
              status: data.status, 
              trackingNumber: data.trackingNumber, 
              trackingUrl: data.trackingUrl,
              total_amount: data.totalAmount || 24.90
            });
            setStatus(data.status || 'pending');
          } else {
            // fallback
            const stored = localStorage.getItem(`order_${orderId}`);
            if (stored) {
              setOrder(JSON.parse(stored));
              const currentStatus = localStorage.getItem(`status_${orderId}`) || 'pending';
              setStatus(currentStatus);
            }
          }
        } catch {
          // fallback
          const stored = localStorage.getItem(`order_${orderId}`);
          if (stored) {
            setOrder(JSON.parse(stored));
            const currentStatus = localStorage.getItem(`status_${orderId}`) || 'pending';
            setStatus(currentStatus);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadOrder();
    
    // Poll for status changes
    const interval = setInterval(async () => {
      if (orderId.startsWith('demo_')) {
        const currentStatus = localStorage.getItem(`status_${orderId}`) || 'pending';
        setStatus(currentStatus);
      } else {
        try {
          const res = await fetch(`/api/fulfillment/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('apex-brews-token') || ''}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setStatus(data.status || 'pending');
          }
        } catch {
          // ignore
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-racing-red border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-carbon-black pt-32 pb-20 px-4 text-center">
        <h1 className="text-white font-orbitron font-black text-3xl">ORDER NOT FOUND</h1>
      </div>
    );
  }

  const steps = [
    { id: 'pending', title: 'SECTOR 1: GRID', desc: 'Order secured, preparing to launch', icon: Timer, color: 'text-white' },
    { id: 'preparing', title: 'SECTOR 2: BREWING', desc: 'Beans extracting at 9.0 bar', icon: Coffee, color: 'text-blue-400' },
    { id: 'ready', title: 'SECTOR 3: TARGET', desc: 'Dispatched to target coordinates', icon: Compass, color: 'text-pit-yellow' },
    { id: 'completed', title: 'CHECKERED FLAG', desc: 'Successfully delivered', icon: Flag, color: 'text-green-400' }
  ];

  const getMappedStatus = (rawStatus: string) => {
    const s = (rawStatus || '').toLowerCase();
    if (s === 'completed' || s === 'delivered' || s === 'fulfilled') return 'completed';
    if (s === 'ready' || s === 'dispatched' || s === 'shipped' || s === 'sent') return 'ready';
    if (s === 'preparing' || s === 'processing' || s === 'draft' || s === 'brewing') return 'preparing';
    return 'pending';
  };

  const mappedStatus = getMappedStatus(status);
  const currentStepIndex = steps.findIndex(s => s.id === mappedStatus);
  const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const progressPercent = (safeIndex / (steps.length - 1)) * 100;

  return (
    <main className="min-h-screen bg-carbon-black pt-32 pb-20 px-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-racing-red/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black italic text-white tracking-tighter uppercase mb-3">
            LIVE <span className="text-racing-red">TELEMETRY</span>
          </h1>
          <div className="inline-block bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <p className="text-white/60 tracking-[0.2em] text-[10px] uppercase font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
              ORDER REF: #{order.id?.slice(-6) || 'UNKNOWN'}
            </p>
          </div>
        </div>

        <div className="glass border-white/10 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(225,6,0,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-racing-red/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-12">
            <div>
              <span className="font-orbitron text-[10px] font-black tracking-widest text-white/50 uppercase block mb-1">CIRCUIT STATUS</span>
              <span className={`font-orbitron text-sm sm:text-base font-black tracking-widest uppercase ${steps[safeIndex].color}`}>
                {steps[safeIndex].title}
              </span>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${steps[safeIndex].color} shadow-[0_0_15px_currentColor]`}>
              {React.createElement(steps[safeIndex].icon, { size: 24 })}
            </div>
          </div>

          <div className="relative mb-20 mt-12 px-2 sm:px-6">
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white/10 -translate-y-1/2 rounded-full" />
            
            <motion.div 
              className="absolute top-1/2 left-0 h-1.5 bg-racing-red -translate-y-1/2 rounded-full shadow-[0_0_10px_#E10600]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -mt-4 text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20"
              initial={{ left: '0%' }}
              animate={{ left: `calc(${progressPercent}% - 20px)` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              🏎️
            </motion.div>

            <div className="relative z-10 flex justify-between items-center px-0">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center gap-3 relative">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      backgroundColor: idx <= safeIndex ? '#E10600' : '#1A1A1A',
                      borderColor: idx <= safeIndex ? '#E10600' : '#333333',
                      scale: idx === safeIndex ? 1.3 : 1
                    }}
                    className={`w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center`}
                  >
                    {idx < safeIndex && <CheckCircle size={10} className="text-white" />}
                  </motion.div>
                  
                  <div className={`absolute top-6 w-24 text-center transition-all ${idx <= safeIndex ? 'opacity-100' : 'opacity-40'}`}>
                    <span className="font-orbitron text-[8px] sm:text-[9px] font-black tracking-widest text-white uppercase block">
                      Sector {idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute -left-2 top-0 w-1 h-full bg-racing-red" />
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start sm:items-center gap-4"
              >
                <div className={`p-3 rounded-full bg-white/5 ${steps[safeIndex].color}`}>
                  {React.createElement(steps[safeIndex].icon, { size: 20 })}
                </div>
                <div>
                  <h3 className="font-orbitron font-black text-white text-lg sm:text-xl uppercase tracking-tight">
                    {steps[safeIndex].title}
                  </h3>
                  <p className="text-white/60 font-mono text-xs mt-1">
                    {steps[safeIndex].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/paddock-club')}
              className="flex-1 btn-racing text-[10px] py-4 flex items-center justify-center gap-2"
            >
              <Package size={14} />
              RETURN TO PADDOCK CLUB
            </button>
            <button
              onClick={() => router.push('/menu')}
              className="flex-1 glass text-[10px] font-orbitron font-black text-white py-4 border-white/20 hover:bg-white/10 uppercase tracking-widest transition-all"
            >
              NEW ORDER
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
