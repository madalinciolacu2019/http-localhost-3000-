"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowLeft, Trophy, AlertOctagon, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';

type OptionCategory = 'size' | 'roast' | 'milk';
type SelectionState = Record<OptionCategory, string | null>;

const OPTIONS = {
  size: ['V6 (Small)', 'V8 (Medium)', 'V10 (Large)'],
  roast: ['Slicks (Light)', 'Inters (Medium)', 'Wets (Dark)'],
  milk: ['Oat (Pirelli)', 'Almond (Soft)', 'Whole (Hard)'],
};

export default function PitStopPage() {
  const { playSound, playRadioMessage } = useSound();
  const { addItem, openCart } = useCart();
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'success' | 'fail'>('idle');
  const [timeLeft, setTimeLeft] = useState(2500); // 2.5 seconds in ms
  const [selections, setSelections] = useState<SelectionState>({ size: null, roast: null, milk: null });
  
  const lastUpdateRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const startPitStop = () => {
    playSound('scanner');
    playRadioMessage("Box, Box, Box!");
    setSelections({ size: null, roast: null, milk: null });
    setTimeLeft(2500);
    setGameState('playing');
    lastUpdateRef.current = performance.now();
    
    const updateTimer = (time: number) => {
      const delta = time - lastUpdateRef.current;
      lastUpdateRef.current = time;
      
      setTimeLeft((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          endGame('fail');
          return 0;
        }
        return next;
      });
      
      if (gameState === 'playing') {
        rafRef.current = requestAnimationFrame(updateTimer);
      }
    };
    
    rafRef.current = requestAnimationFrame(updateTimer);
  };

  const endGame = (result: 'success' | 'fail') => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setGameState(result);
    if (result === 'success') {
      playSound('gear-shift');
      setTimeout(() => playSound('engine-rev'), 500);
      
      // Add successful drink
      addItem({
        id: Date.now(),
        name: 'Pit Crew Special',
        category: 'Custom Fast-Track',
        price: 3.50, // Discounted
        image: '/menu_espresso_turbo.png',
        description: `Nailed the pit stop! Custom build: ${selections.size} | ${selections.roast} | ${selections.milk}`,
        stats: { intensity: '100%', heat: '90°C' },
        color: 'red'
      });
      setTimeout(openCart, 1500);
      
    } else {
      playSound('pit-stop');
      
      // Add penalty drink
      addItem({
        id: Date.now(),
        name: 'Penalty: Lukewarm Tap Water',
        category: 'Failure',
        price: 15.00, // Expensive penalty!
        image: '/menu_iced_tea.png', // Fallback
        description: `You missed the box. Engine stalled. Enjoy this lukewarm tap water.`,
        stats: { intensity: '0%', heat: '30°C' },
        color: 'gray'
      });
      setTimeout(openCart, 1500);
    }
  };

  const handleSelect = (category: OptionCategory, value: string) => {
    if (gameState !== 'playing') return;
    playSound('click');
    
    setSelections(prev => {
      const next = { ...prev, [category]: value };
      
      // Check win condition
      if (next.size && next.roast && next.milk) {
        endGame('success');
      }
      return next;
    });
  };

  // Cleanup RAF
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-hidden relative">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      <header className="flex items-center justify-between p-6 bg-black/50 border-b border-red-900/30 backdrop-blur-md relative z-10">
        <Link href="/" className="flex items-center text-red-500 hover:text-red-400 transition-colors group">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-orbitron tracking-wider text-xs uppercase font-bold">Abort Box</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Pitlane Active</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* State: IDLE */}
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center space-y-8"
            >
              <h1 className="font-orbitron text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
                <span className="text-racing-red">2.5 SECOND</span> <br/> PIT STOP
              </h1>
              <p className="text-neutral-400 font-mono text-xs uppercase tracking-widest max-w-md mx-auto">
                F1 mechanics change 4 tires in 2.5 seconds. You have the exact same time to build your coffee order.
                Select Size, Roast, and Milk before the timer hits 0.00.
              </p>
              
              <button 
                onClick={startPitStop}
                className="group relative inline-flex items-center justify-center px-12 py-6 overflow-hidden rounded-xl bg-racing-red font-orbitron font-black text-white text-2xl tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(225,6,0,0.4)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                BOX, BOX!
              </button>
            </motion.div>
          )}

          {/* State: PLAYING */}
          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full space-y-8"
            >
              <div className="flex flex-col items-center justify-center mb-12">
                <div className="font-orbitron text-7xl md:text-9xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  {(timeLeft / 1000).toFixed(2)}
                  <span className="text-3xl text-neutral-500">s</span>
                </div>
                <div className="w-full max-w-2xl h-4 bg-neutral-900 rounded-full mt-4 overflow-hidden border border-white/10">
                  <motion.div 
                    className="h-full bg-racing-red"
                    style={{ width: `${(timeLeft / 2500) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Size */}
                <div className="space-y-3">
                  <div className="text-center font-orbitron text-xs font-bold text-white/50 tracking-widest uppercase">CHASSIS (SIZE)</div>
                  {OPTIONS.size.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelect('size', opt)}
                      className={`w-full p-4 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase transition-all border ${
                        selections.size === opt 
                          ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                          : 'bg-black/50 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Roast */}
                <div className="space-y-3">
                  <div className="text-center font-orbitron text-xs font-bold text-white/50 tracking-widest uppercase">COMPOUND (ROAST)</div>
                  {OPTIONS.roast.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelect('roast', opt)}
                      className={`w-full p-4 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase transition-all border ${
                        selections.roast === opt 
                          ? 'bg-racing-red text-white border-racing-red shadow-[0_0_20px_rgba(225,6,0,0.4)]' 
                          : 'bg-black/50 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Milk */}
                <div className="space-y-3">
                  <div className="text-center font-orbitron text-xs font-bold text-white/50 tracking-widest uppercase">AERO (MILK)</div>
                  {OPTIONS.milk.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelect('milk', opt)}
                      className={`w-full p-4 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase transition-all border ${
                        selections.milk === opt 
                          ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                          : 'bg-black/50 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* State: SUCCESS */}
          {gameState === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-32 h-32 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                <Trophy className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="font-orbitron text-4xl md:text-6xl font-black italic text-white uppercase">
                PERFECT <span className="text-green-400">STOP</span>
              </h2>
              <p className="text-neutral-400 font-mono text-sm">
                Incredible reaction time! The Pit Crew Special has been added to your cart with a discount!
              </p>
              <div className="pt-8">
                <button 
                  onClick={() => setGameState('idle')}
                  className="font-orbitron text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <RotateCcw size={14} /> Go Again
                </button>
              </div>
            </motion.div>
          )}

          {/* State: FAIL */}
          {gameState === 'fail' && (
            <motion.div 
              key="fail"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-32 h-32 mx-auto bg-red-600/20 rounded-full flex items-center justify-center border border-red-600/50 shadow-[0_0_50px_rgba(225,6,0,0.3)]">
                <AlertOctagon className="w-16 h-16 text-racing-red" />
              </div>
              <h2 className="font-orbitron text-4xl md:text-6xl font-black italic text-white uppercase">
                UNSAFE <span className="text-racing-red">RELEASE</span>
              </h2>
              <p className="text-neutral-400 font-mono text-sm">
                Too slow! The car stalled in the box. Your penalty (Lukewarm Tap Water) has been added to your cart.
              </p>
              <div className="pt-8">
                <button 
                  onClick={() => setGameState('idle')}
                  className="font-orbitron text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <RotateCcw size={14} /> Try to redeem yourself
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
