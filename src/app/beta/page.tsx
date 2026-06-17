'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ChevronRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/shared/lib/supabase';

export default function BetaPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [slotsRemaining, setSlotsRemaining] = useState(142);

  // Simulation: Slots slowly decreasing
  useEffect(() => {
    const timer = setInterval(() => {
      setSlotsRemaining(prev => Math.max(prev - Math.floor(Math.random() * 2), 12));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      if (!isSupabaseConfigured) {
        // Simulate a successful network request for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('success');
        return;
      }

      const { error } = await supabase
        .from('beta_waitlist')
        .insert({ email, full_name: name });

      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error('Waitlist error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-10" />
        <img 
          src="/paddock_lounge.png" 
          className="w-full h-full object-cover opacity-30 grayscale" 
          alt="Paddock Background"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05] z-10 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-20 w-full max-w-xl">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-racing-red/10 border border-racing-red/30 rounded-full mb-8"
          >
            <Shield size={14} className="text-racing-red" />
            <span className="font-orbitron text-[10px] font-bold text-racing-red tracking-[0.3em] uppercase">
              Limited Paddock Access
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-orbitron text-5xl md:text-7xl font-black mb-6 leading-tight italic"
          >
            ENTER THE<br/><span className="text-racing-red">GRID</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg leading-relaxed max-w-md mx-auto"
          >
            We are granting exclusive Beta membership to the first 500 drivers. Secure your slot for early access to limited-edition roasts and hardware.
          </motion.p>
        </div>

        {/* Status Counter */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass border-white/5 p-8 rounded-3xl mb-8 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-orbitron text-[10px] font-bold text-white/30 uppercase tracking-widest">Enrollment Status</span>
            <span className="font-orbitron text-[10px] font-bold text-racing-red uppercase tracking-widest animate-pulse">Live Telemetry</span>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-6xl font-black font-orbitron tabular-nums">{slotsRemaining}</span>
            <span className="text-white/30 text-sm font-bold uppercase tracking-widest mb-2">Slots Remaining</span>
          </div>
          
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${(slotsRemaining / 500) * 100}%` }}
              className="h-full bg-racing-red shadow-[0_0_20px_rgba(225,6,0,0.5)]"
            />
          </div>
        </motion.div>

        {/* Enrollment Form */}
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border-green-500/20 bg-green-500/5 p-12 rounded-3xl text-center"
            >
              <CheckCircle2 size={48} className="text-green-400 mx-auto mb-6" />
              <h3 className="font-orbitron text-2xl font-black mb-2">ACCESS GRANTED</h3>
              <p className="text-white/40 text-sm">Your telemetry has been verified. Check your uplink (email) for activation instructions soon.</p>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  required
                  type="text"
                  placeholder="FULL NAME"
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 font-orbitron text-xs tracking-widest focus:border-racing-red/50 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  required
                  type="email"
                  placeholder="DRIVERS EMAIL UPLINK"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 font-orbitron text-xs tracking-widest focus:border-racing-red/50 outline-none transition-all"
                />
              </div>
              <button 
                disabled={status === 'loading'}
                className="w-full btn-racing py-5 text-sm flex items-center justify-center gap-3 group"
              >
                {status === 'loading' ? 'SYNCHRONIZING...' : (
                  <>
                    SECURE MY SLOT <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              {status === 'error' && (
                <div className="flex items-center gap-2 text-racing-red text-[10px] font-bold uppercase tracking-widest justify-center mt-4">
                  <AlertCircle size={14} /> Uplink Failed - Transmission Interrupted
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-[8px] text-white/20 font-bold tracking-[0.4em] uppercase mt-12">
          Encrypted Connection • Apex Racing Security Protocol v4.2
        </p>
      </div>
    </main>
  );
}
