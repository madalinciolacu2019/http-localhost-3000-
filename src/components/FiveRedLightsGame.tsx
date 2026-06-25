'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, AlertCircle } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

export default function FiveRedLightsGame() {
  const [gameState, setGameState] = useState<'idle' | 'sequence' | 'ready' | 'finished' | 'jumpStart'>('idle');
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const { playSound } = useSound();

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return clearTimeouts;
  }, []);

  const startGame = () => {
    playSound('engine-rev');
    setGameState('sequence');
    setReactionTime(null);
    setLights([false, false, false, false, false]);
    clearTimeouts();

    // Sequence the 5 red lights
    for (let i = 0; i < 5; i++) {
      const t = setTimeout(() => {
        setLights(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        playSound('click');
      }, (i + 1) * 1000);
      timeoutRefs.current.push(t);
    }

    // Lights out (random delay after 5th light)
    const randomDelay = Math.random() * 2000 + 1000;
    const lightsOutTimeout = setTimeout(() => {
      setLights([false, false, false, false, false]);
      setGameState('ready');
      startTimeRef.current = performance.now();
      playSound('gear-shift'); // Beep
    }, 5000 + randomDelay);
    
    timeoutRefs.current.push(lightsOutTimeout);
  };

  const handleAction = () => {
    if (gameState === 'idle' || gameState === 'finished' || gameState === 'jumpStart') {
      startGame();
    } else if (gameState === 'sequence') {
      // Jump start!
      clearTimeouts();
      setGameState('jumpStart');
      playSound('error');
    } else if (gameState === 'ready') {
      // Valid reaction!
      const time = performance.now() - startTimeRef.current;
      setReactionTime(time);
      setGameState('finished');
      if (time < 250) {
        playSound('pit-stop'); // Success sound
      }
    }
  };

  return (
    <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
      
      {/* Lights display */}
      <div 
        onClick={handleAction}
        className="bg-black/80 border border-white/10 p-4 rounded-xl flex gap-3 mb-6 cursor-pointer select-none"
      >
        {lights.map((isOn, i) => (
          <div 
            key={i} 
            className={`w-10 h-10 rounded-full border-4 transition-colors ${isOn ? 'bg-red-500 border-red-700 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'bg-black border-white/10'}`}
          />
        ))}
      </div>

      <div className="h-12 flex items-center justify-center">
        {gameState === 'idle' && (
          <button 
            onClick={startGame}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-orbitron text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Start Sequence
          </button>
        )}
        
        {gameState === 'sequence' && (
          <span className="font-orbitron text-xs text-white/50 tracking-widest uppercase animate-pulse">Wait for it...</span>
        )}

        {gameState === 'jumpStart' && (
          <div className="flex items-center gap-2 text-red-500 font-orbitron text-sm font-black uppercase">
            <AlertCircle size={16} /> Jump Start!
          </div>
        )}

        {gameState === 'finished' && reactionTime && (
          <div className="flex flex-col items-center">
            <span className="font-orbitron text-xl font-black text-white">{reactionTime.toFixed(0)} ms</span>
            {reactionTime < 250 && (
              <div className="flex items-center gap-1 text-green-400 text-[10px] uppercase font-bold mt-1 bg-green-400/10 px-2 py-0.5 rounded">
                <Trophy size={10} /> Reward Code: APEX250
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
