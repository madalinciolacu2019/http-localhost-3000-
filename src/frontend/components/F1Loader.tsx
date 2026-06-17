'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function F1Loader() {
  const [lights, setLights] = useState(0);
  const [lightsOut, setLightsOut] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    // Sequence the 5 red lights
    const interval = setInterval(() => {
      setLights(prev => {
        if (prev < 5) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 400);

    // Lights out after all 5 are lit
    const timeout1 = setTimeout(() => {
      setLightsOut(true);
    }, 2500);

    // Remove loader completely
    const timeout2 = setTimeout(() => {
      setComplete(true);
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  if (complete) return null;

  return (
    <AnimatePresence>
      {!complete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#050508] flex flex-col items-center justify-center"
        >
          {/* Background grid for texture */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="font-orbitron text-2xl md:text-4xl font-black italic tracking-tighter text-white uppercase mb-12">
              APEX<span className="text-racing-red">BREWS</span>
            </h1>

            <div className="flex gap-4 p-4 glass rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-full bg-black border-2 border-[#222] flex items-center justify-center overflow-hidden">
                    <div 
                      className={`w-full h-full rounded-full transition-all duration-75 ${
                        !lightsOut && lights >= index 
                          ? 'bg-racing-red shadow-[0_0_20px_#E10600,inset_0_0_10px_#fff]' 
                          : 'bg-[#111] shadow-inner'
                      }`}
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black border-2 border-[#222] flex items-center justify-center overflow-hidden">
                    <div 
                      className={`w-full h-full rounded-full transition-all duration-75 ${
                        !lightsOut && lights >= index 
                          ? 'bg-racing-red shadow-[0_0_20px_#E10600,inset_0_0_10px_#fff]' 
                          : 'bg-[#111] shadow-inner'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: lightsOut ? 1 : 0, y: lightsOut ? 0 : 10 }}
              className="mt-12 text-center"
            >
              <h2 className="font-orbitron text-3xl font-black text-white italic uppercase tracking-widest text-glow-white">
                AND AWAY WE GO!
              </h2>
            </motion.div>

            <div className="absolute bottom-[-100px] text-white/20 font-mono text-xs uppercase tracking-[0.3em]">
              {lightsOut ? 'Deploying Telemetry...' : 'Initializing Systems...'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
