'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, Flag, Users } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

export default function ReferralPage() {
  const router = useRouter();
  const { userId } = useParams();
  const { playSound } = useSound();

  useEffect(() => {
    if (userId && typeof userId === 'string') {
      try {
        localStorage.setItem('apex_referrer', userId);
        playSound('engine-rev');
      } catch (e) {
        console.error(e);
      }
    }
  }, [userId, playSound]);

  const handleAccept = () => {
    playSound('gear-shift');
    router.push('/auth');
  };

  return (
    <main className="min-h-screen bg-carbon-black flex items-center justify-center font-orbitron text-white px-4 relative z-10">
      <div className="glass max-w-md w-full p-8 rounded-2xl border-white/5 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
        
        <div className="w-16 h-16 rounded-full bg-racing-red/10 border border-racing-red/20 flex items-center justify-center mx-auto mb-6 text-racing-red animate-pulse">
          <Award size={32} />
        </div>

        <h1 className="font-orbitron font-black text-2xl mb-2 text-white">INVITATION RECEIVED</h1>
        <p className="text-[10px] text-white/40 uppercase tracking-widest block mb-6">Pitlane Cadets Program</p>

        <div className="border-y border-white/5 py-6 my-6 text-xs text-white/60 leading-relaxed uppercase">
          🏁 A driver has invited you to join the APEX BREWS Paddock. Claim your rookie license now to receive <span className="text-yellow-400 font-bold">100 ERS points</span> on registration!
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-4 btn-racing text-xs tracking-widest font-black uppercase flex items-center justify-center gap-2"
        >
          <span>ACCEPT INVITE & JOIN GRID</span>
        </button>
      </div>
    </main>
  );
}
