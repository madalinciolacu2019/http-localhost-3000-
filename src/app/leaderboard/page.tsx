'use client';

import React, { useState } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import { useDatabase } from '@/frontend/context/DatabaseContext';
import { motion } from 'framer-motion';
import { Trophy, ChevronUp, Crosshair, Users } from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';

export default function LeaderboardPage() {
  const { setups, upvoteSetup } = useDatabase();
  const { playSound } = useSound();
  const [votedSetups, setVotedSetups] = useState<Record<string, boolean>>({});

  const handleUpvote = (id: string) => {
    if (!votedSetups[id]) {
      playSound('success');
      upvoteSetup(id);
      setVotedSetups(prev => ({ ...prev, [id]: true }));
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-[#050508] pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-pit-yellow/10 blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-pit-yellow/10 flex items-center justify-center border border-pit-yellow/30">
                <Trophy size={24} className="text-pit-yellow" />
              </div>
            </div>
            <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
              Global Setups
            </h1>
            <p className="font-mono text-white/50 text-sm max-w-lg mx-auto">
              Discover and vote on the highest performing coffee telemetry setups published by the Apex Brews community.
            </p>
          </div>

          <div className="space-y-4">
            {setups.map((setup, index) => (
              <motion.div 
                key={setup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-orbitron text-2xl font-black text-white/20">#{index + 1}</span>
                    <h2 className="font-orbitron text-xl font-bold text-white uppercase">{setup.name}</h2>
                  </div>
                  
                  <div className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest mb-4">
                    <Users size={12} /> Engineered by: <span className="text-white">{setup.author}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div className="bg-black/50 rounded p-2 border border-white/5">
                      <span className="block font-mono text-[9px] text-white/40 mb-1">FORCE</span>
                      <span className="font-orbitron text-sm text-pit-yellow font-bold">{setup.force.toFixed(1)} BAR</span>
                    </div>
                    <div className="bg-black/50 rounded p-2 border border-white/5">
                      <span className="block font-mono text-[9px] text-white/40 mb-1">HEAT</span>
                      <span className="font-orbitron text-sm text-racing-red font-bold">{setup.heat.toFixed(1)} °C</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto md:border-l border-white/10 md:pl-8">
                  <button 
                    onClick={() => handleUpvote(setup.id)}
                    disabled={votedSetups[setup.id]}
                    className={`p-4 rounded-full transition-all ${votedSetups[setup.id] ? 'bg-pit-yellow/20 text-pit-yellow border border-pit-yellow/50' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-transparent'}`}
                  >
                    <ChevronUp size={24} />
                  </button>
                  <span className="font-orbitron text-2xl font-black text-white mt-2">{setup.upvotes}</span>
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">ERS Votes</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
