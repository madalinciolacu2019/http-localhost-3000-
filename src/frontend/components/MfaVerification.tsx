'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { useSound } from '@/frontend/context/SoundContext';

export default function MfaVerification({ onVerified }: { onVerified: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { verifyMfa } = useAuth();
  const { playSound } = useSound();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyMfa(code)) {
      playSound('pit-stop');
      onVerified();
    } else {
      playSound('error');
      setError('INVALID AUTHENTICATOR CODE');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]/90 backdrop-blur-md p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass max-w-md w-full p-8 rounded-3xl border border-racing-red/30 shadow-[0_0_50px_rgba(225,6,0,0.2)] text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,6,0,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-racing-red/10 border border-racing-red/30 rounded-full mb-6">
            <ShieldAlert size={40} className="text-racing-red" />
          </div>

          <h2 className="font-orbitron text-2xl font-black text-white uppercase mb-2">CEO Security Clearance</h2>
          <p className="text-white/50 text-xs font-mono mb-8">Enter the 6-digit pin from your authenticator app (Hint: 104277)</p>

          <form onSubmit={handleVerify} className="w-full space-y-6">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className={`w-full bg-black/50 border ${error ? 'border-racing-red' : 'border-white/10'} rounded-xl py-4 pl-12 pr-4 text-center font-orbitron text-2xl text-white tracking-[0.5em] focus:outline-none focus:border-racing-red transition-colors`}
                placeholder="------"
              />
            </div>
            
            {error && <p className="text-racing-red text-[10px] font-orbitron uppercase">{error}</p>}

            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full btn-racing py-4 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Identity
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
