'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scan, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';

export default function PointScannerPage() {
  const { user, session } = useAuth();
  const [scannedId, setScannedId] = useState('');
  const [points, setPoints] = useState(10);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused for physical scanners
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.activeElement !== inputRef.current && status === 'idle') {
        inputRef.current?.focus();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scannedId.trim()) return;

    setStatus('processing');
    
    try {
      const res = await fetch('/api/award-points', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ userId: scannedId.trim(), points })
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(`Successfully awarded ${points} ERS Points!`);
        setTimeout(() => {
          setScannedId('');
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to award points');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error occurred.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-carbon-black flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,6,0,0.05),transparent_60%)] pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="glass p-8 border-racing-red/20 rounded-3xl shadow-[0_0_50px_rgba(225,6,0,0.1)]">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Scan size={32} className="text-racing-red" />
            <h1 className="font-orbitron text-2xl font-black text-white uppercase tracking-widest">Scanner</h1>
          </div>
          
          <p className="text-center text-white/50 text-sm mb-8 font-mono">
            Scan a customer's Paddock Pass QR code to award ERS points.
          </p>

          <form onSubmit={handleScanSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-orbitron font-bold text-white/40 uppercase tracking-widest block mb-2">
                Scanned Telemetry ID
              </label>
              <input
                ref={inputRef}
                type="text"
                value={scannedId}
                onChange={(e) => setScannedId(e.target.value)}
                placeholder="Waiting for scanner..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-center text-white focus:outline-none focus:border-racing-red transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[10px] font-orbitron font-bold text-white/40 uppercase tracking-widest block mb-2">
                ERS Points to Award
              </label>
              <div className="flex items-center gap-4">
                {[10, 50, 100, 500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPoints(val)}
                    className={`flex-1 py-2 rounded-lg font-orbitron text-xs font-bold transition-all ${
                      points === val 
                        ? 'bg-racing-red text-white' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'processing' || !scannedId}
              className="w-full py-4 bg-white text-black rounded-xl font-orbitron font-black uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'processing' ? 'Processing...' : 'Award Points'}
              <ShieldCheck size={18} />
            </button>
          </form>

          {/* Status Overlay */}
          {status !== 'idle' && status !== 'processing' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${
                status === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {status === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <span className="font-orbitron text-xs uppercase tracking-wider">{message}</span>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
