'use client';

import React, { useState } from 'react';
import { Activity, Check, Trophy } from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';

export default function StravaSync() {
  const { playSound } = useSound();
  const { applyCoupon } = useCart();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success'>('idle');

  const handleConnect = () => {
    playSound('engine-start');
    setStatus('connecting');
    
    // Simulate OAuth flow & fetching recent activity
    setTimeout(async () => {
      setStatus('success');
      playSound('success');
      // Apply the mock discount
      await applyCoupon('STRAVA15');
    }, 2500);
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 bg-black/60 relative overflow-hidden group">
      {/* Background Strava Orange Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC4C02] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-[#FC4C02]" />
            <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">Earn Your Fuel</h3>
          </div>
          <p className="text-[10px] font-mono text-white/50 max-w-[200px] leading-relaxed mb-4">
            Connect your fitness app. Run 5km or ride 20km to unlock the 15% <span className="text-[#FC4C02]">#ApexAthlete</span> discount.
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <button
          onClick={handleConnect}
          className="w-full bg-[#FC4C02] hover:bg-[#e04302] text-white text-xs font-orbitron font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(252,76,2,0.2)]"
        >
          Connect Strava
        </button>
      )}

      {status === 'connecting' && (
        <div className="w-full bg-white/5 border border-white/10 text-white/50 text-xs font-orbitron font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-[#FC4C02] border-t-transparent rounded-full animate-spin" />
          Syncing Telemetry...
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#FC4C02]/20 flex items-center justify-center">
              <Trophy size={14} className="text-[#FC4C02]" />
            </div>
            <div>
              <span className="block text-[10px] font-orbitron font-bold text-white uppercase">Last Activity: 52km Ride</span>
              <span className="block text-[9px] font-mono text-green-400">Target Achieved</span>
            </div>
          </div>
          <div className="w-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-orbitron font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2">
            <Check size={14} />
            15% Discount Applied
          </div>
        </div>
      )}
    </div>
  );
}
