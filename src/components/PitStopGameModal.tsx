'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Timer, Zap, AlertTriangle, CheckCircle, RefreshCw, Play, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';

interface PitStopGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GameStage = 'idle' | 'unbolt' | 'swap' | 'tighten' | 'release' | 'complete';

export default function PitStopGameModal({ isOpen, onClose }: PitStopGameModalProps) {
  const { applyCoupon, appliedCoupon } = useCart();
  const { playSound } = useSound();

  const [stage, setStage] = useState<GameStage>('idle');
  const [totalTime, setTotalTime] = useState(0);
  const [unboltTime, setUnboltTime] = useState(0);
  const [swapTime, setSwapTime] = useState(0);
  const [tightenTime, setTightenTime] = useState(0);
  const [releaseTime, setReleaseTime] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  
  // Game loops & timings
  const stageStartTime = useRef<number>(0);
  
  // State for Stage 1: Unbolt (Sweeping bar)
  const [sweepPosition, setSweepPosition] = useState(0);
  const sweepDirection = useRef(1);
  const sweepInterval = useRef<any>(null);

  // State for Stage 2: Overlapping circles
  const [targetScale, setTargetScale] = useState(1.8);
  const scaleDirection = useRef(-1);
  const scaleInterval = useRef<any>(null);

  // State for Stage 3: Tap wheel gun
  const [tightenProgress, setTightenProgress] = useState(0);

  // State for Stage 4: Clutch Reaction Lights
  const [lightsCount, setLightsCount] = useState(0);
  const [lightsActive, setLightsActive] = useState(false);
  const [redLightsOut, setRedLightsOut] = useState(false);
  const lightsInterval = useRef<any>(null);
  const lightsOutTimeout = useRef<any>(null);

  // Clean intervals on change
  useEffect(() => {
    return () => {
      clearInterval(sweepInterval.current);
      clearInterval(scaleInterval.current);
      clearInterval(lightsInterval.current);
      clearTimeout(lightsOutTimeout.current);
    };
  }, []);

  const startMiniGame = () => {
    playSound('engine-rev');
    setStage('unbolt');
    setTotalTime(0);
    setUnboltTime(0);
    setSwapTime(0);
    setTightenTime(0);
    setReleaseTime(0);
    setFeedback('GET READY: Wheel gun locked on.');
    stageStartTime.current = performance.now();
    startStage1();
  };

  // --- STAGE 1: UNBOLT WHEEL (Sweeping indicator) ---
  const startStage1 = () => {
    setSweepPosition(0);
    sweepDirection.current = 1;
    stageStartTime.current = performance.now();
    sweepInterval.current = setInterval(() => {
      setSweepPosition((prev) => {
        let next = prev + sweepDirection.current * 4;
        if (next >= 100) {
          next = 100;
          sweepDirection.current = -1;
        } else if (next <= 0) {
          next = 0;
          sweepDirection.current = 1;
        }
        return next;
      });
    }, 16);
  };

  const handleUnboltClick = () => {
    clearInterval(sweepInterval.current);
    const stopTime = (performance.now() - stageStartTime.current) / 1000;
    
    // Sweet spot is between 40% and 60%
    const isSweetSpot = sweepPosition >= 40 && sweepPosition <= 60;
    let finalTime = stopTime;
    
    if (isSweetSpot) {
      playSound('gear-shift');
      setFeedback('PERFECT NUT REMOVAL! Wheel loose.');
    } else {
      playSound('click'); // wrong click
      const penalty = 1.2;
      finalTime += penalty;
      setFeedback(`MISSED NUT! Bolt cross-threaded. +1.2s Penalty.`);
    }

    setUnboltTime(finalTime);
    playSound('scanner');
    setTimeout(() => {
      setStage('swap');
      startStage2();
    }, 800);
  };

  // --- STAGE 2: SWAP TIRE (Expanding/contracting circle alignment) ---
  const startStage2 = () => {
    setTargetScale(2.0);
    scaleDirection.current = -1;
    stageStartTime.current = performance.now();
    scaleInterval.current = setInterval(() => {
      setTargetScale((prev) => {
        let next = prev + scaleDirection.current * 0.04;
        if (next <= 0.8) {
          scaleDirection.current = 1;
        } else if (next >= 2.2) {
          scaleDirection.current = -1;
        }
        return next;
      });
    }, 16);
  };

  const handleSwapClick = () => {
    clearInterval(scaleInterval.current);
    const stopTime = (performance.now() - stageStartTime.current) / 1000;
    
    // Sweet spot scale is around 0.95 to 1.15
    const isAligned = targetScale >= 0.9 && targetScale <= 1.2;
    let finalTime = stopTime;
    
    if (isAligned) {
      playSound('gear-shift');
      setFeedback('TIRE SLID ON PERFECTLY!');
    } else {
      playSound('click');
      const penalty = 1.0;
      finalTime += penalty;
      setFeedback('STUCK TIRE! Alignment error. +1.0s Penalty.');
    }

    setSwapTime(finalTime);
    playSound('scanner');
    setTimeout(() => {
      setStage('tighten');
      startStage3();
    }, 800);
  };

  // --- STAGE 3: TIGHTEN NUT (Fast button taps) ---
  const startStage3 = () => {
    setTightenProgress(0);
    setFeedback('TAP RAPIDLY to torque the wheel nut!');
    stageStartTime.current = performance.now();
  };

  const handleTightenTap = () => {
    if (stage !== 'tighten') return;
    playSound('click');
    setTightenProgress((prev) => {
      const next = prev + 20;
      if (next >= 100) {
        playSound('gear-shift');
        const finalTime = (performance.now() - stageStartTime.current) / 1000;
        setTightenTime(finalTime);
        setFeedback('WHEEL SECURE! Jack dropping.');
        setTimeout(() => {
          setStage('release');
          startStage4();
        }, 800);
        return 100;
      }
      return next;
    });
  };

  // --- STAGE 4: CLUTCH RELEASE (Wait for lights out) ---
  const startStage4 = () => {
    setLightsCount(0);
    setLightsActive(true);
    setRedLightsOut(false);
    setFeedback('HOLD CLUTCH... React when lights go OUT!');
    
    let count = 0;
    lightsInterval.current = setInterval(() => {
      count += 1;
      setLightsCount(count);
      playSound('click');
      
      if (count === 5) {
        clearInterval(lightsInterval.current);
        // Random release time between 1.5 and 3.5 seconds
        const delay = 1200 + Math.random() * 2000;
        lightsOutTimeout.current = setTimeout(() => {
          setRedLightsOut(true);
          stageStartTime.current = performance.now();
        }, delay);
      }
    }, 600);
  };

  const handleClutchRelease = () => {
    if (!redLightsOut) {
      // Jump start!
      clearTimeout(lightsOutTimeout.current);
      clearInterval(lightsInterval.current);
      playSound('click');
      setReleaseTime(4.0);
      setFeedback('JUMP START! Pit Lane Drive-Through Penalty (+4.0s).');
      triggerGameComplete(unboltTime + swapTime + tightenTime + 4.0, 4.0);
    } else {
      const finalTime = (performance.now() - stageStartTime.current) / 1000;
      playSound('engine-rev');
      setFeedback(`GO GO GO! Reaction: ${finalTime.toFixed(3)}s`);
      setReleaseTime(finalTime);
      triggerGameComplete(unboltTime + swapTime + tightenTime + finalTime, finalTime);
    }
  };

  const triggerGameComplete = (total: number, release: number) => {
    setStage('complete');
    setTotalTime(total);
    if (total <= 3.00) {
      playSound('engine-rev');
      applyCoupon('PITSTOP15');
    }
  };

  const handleClaim = () => {
    applyCoupon('PITSTOP15');
    playSound('engine-rev');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] backdrop-blur-md pointer-events-auto"
            onClick={stage === 'idle' || stage === 'complete' ? onClose : undefined}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#09090e] border border-white/10 rounded-3xl p-8 z-[210] overflow-hidden select-none pointer-events-auto shadow-[0_0_50px_rgba(225,6,0,0.2)]"
          >
            {/* Ambient Red glow top */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-racing-red to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-racing-red/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-racing-red animate-ping" />
                <h2 className="font-orbitron text-sm font-black tracking-[0.2em] text-white uppercase">
                  PIT STOP CHALLENGE
                </h2>
              </div>
              {(stage === 'idle' || stage === 'complete') && (
                <button
                  onClick={onClose}
                  className="p-1.5 glass rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Stage Body */}
            <div className="min-h-[260px] flex flex-col justify-center items-center text-center">
              {stage === 'idle' && (
                <div className="space-y-6">
                  <div className="w-20 h-20 rounded-full bg-racing-red/10 border border-racing-red/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(225,6,0,0.1)]">
                    <Trophy className="text-racing-red" size={36} />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-xl font-black italic text-white uppercase tracking-tight">
                      3-SECOND CHALLENGE
                    </h3>
                    <p className="text-white/40 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                      Prove your skills under pressure! Change the tire and release the clutch in under <span className="text-white font-bold">3.00 seconds</span> to claim a 15% discount.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5 text-[10px] font-mono text-white/40 text-left max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span>🔧 Stage 1: Unbolt Nut</span>
                      <span className="text-white">Hit the Sweeper sweet-spot</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⭕ Stage 2: Tire Swap</span>
                      <span className="text-white">Align circles perfectly</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚡ Stage 3: Tighten Nut</span>
                      <span className="text-white">Tap rapidly to torque</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🚦 Stage 4: Launch clutch</span>
                      <span className="text-white">Click instantly on lights out</span>
                    </div>
                  </div>

                  <button
                    onClick={startMiniGame}
                    className="btn-racing px-10 py-3.5 font-orbitron font-black tracking-widest text-xs uppercase flex items-center gap-2 mx-auto"
                  >
                    <Play size={14} fill="currentColor" /> START PIT STOP
                  </button>
                </div>
              )}

              {stage === 'unbolt' && (
                <div className="space-y-6 w-full">
                  <div className="font-orbitron text-[10px] font-black tracking-widest text-racing-red uppercase">
                    STAGE 1: NUT REMOVAL
                  </div>
                  <h3 className="font-orbitron text-lg font-black text-white italic">
                    UNBOLT THE WHEEL NUT!
                  </h3>
                  
                  {/* Sweeper gauge */}
                  <div className="w-full h-8 bg-black/60 rounded-xl relative border border-white/5 overflow-hidden max-w-md mx-auto">
                    {/* Safe sweet spot */}
                    <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-green-500/20 border-l border-r border-green-500/40 flex items-center justify-center">
                      <span className="font-orbitron text-[8px] text-green-400 font-bold tracking-widest">TARGET</span>
                    </div>
                    {/* Sweeping cursor */}
                    <div 
                      className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_#fff]"
                      style={{ left: `${sweepPosition}%` }}
                    />
                  </div>

                  <p className="text-[10px] font-mono text-white/40">{feedback}</p>

                  <button
                    onClick={handleUnboltClick}
                    className="w-full max-w-xs btn-racing py-3 font-orbitron font-black tracking-widest text-xs uppercase"
                  >
                    LOCK & RELEASE NUT
                  </button>
                </div>
              )}

              {stage === 'swap' && (
                <div className="space-y-6 w-full">
                  <div className="font-orbitron text-[10px] font-black tracking-widest text-blue-400 uppercase">
                    STAGE 2: WHEEL REPLACEMENT
                  </div>
                  <h3 className="font-orbitron text-lg font-black text-white italic">
                    SWAP THE TIRE!
                  </h3>
                  
                  {/* Overlapping concentric circles */}
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    {/* Outer Target Circle */}
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400/40 flex items-center justify-center" />
                    {/* Ideal lock boundary */}
                    <div className="absolute w-12 h-12 rounded-full border border-blue-400" />
                    {/* Moving scale ring */}
                    <div 
                      className="absolute rounded-full border-2 border-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      style={{ 
                        width: `${targetScale * 48}px`, 
                        height: `${targetScale * 48}px`,
                        borderColor: targetScale >= 0.9 && targetScale <= 1.2 ? '#60a5fa' : '#ffffff'
                      }}
                    />
                  </div>

                  <p className="text-[10px] font-mono text-white/40">{feedback}</p>

                  <button
                    onClick={handleSwapClick}
                    className="w-full max-w-xs btn-racing !bg-blue-600 border-blue-500 hover:!bg-blue-700 py-3 font-orbitron font-black tracking-widest text-xs uppercase"
                  >
                    SWAP WHEEL
                  </button>
                </div>
              )}

              {stage === 'tighten' && (
                <div className="space-y-6 w-full">
                  <div className="font-orbitron text-[10px] font-black tracking-widest text-yellow-400 uppercase">
                    STAGE 3: FASTEN WHEEL NUT
                  </div>
                  <h3 className="font-orbitron text-lg font-black text-white italic">
                    TORQUE THE NUT!
                  </h3>
                  
                  {/* Progress bar */}
                  <div className="w-full max-w-md bg-black/60 h-3 rounded-full border border-white/5 overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-100 shadow-[0_0_10px_#facc15]"
                      style={{ width: `${tightenProgress}%` }}
                    />
                  </div>

                  <p className="text-[10px] font-mono text-white/40">{feedback}</p>

                  <button
                    onClick={handleTightenTap}
                    className="w-full max-w-xs btn-racing !bg-yellow-500 border-yellow-400 hover:!bg-yellow-600 py-3 font-orbitron font-black tracking-widest text-xs uppercase"
                  >
                    TAP RAPIDLY ({100 - tightenProgress}% REMAINING)
                  </button>
                </div>
              )}

              {stage === 'release' && (
                <div className="space-y-6 w-full">
                  <div className="font-orbitron text-[10px] font-black tracking-widest text-green-400 uppercase">
                    STAGE 4: CLUTCH RELEASE
                  </div>
                  
                  {/* F1 Traffic Lights Grid */}
                  <div className="flex justify-center gap-3 py-4 max-w-xs mx-auto">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const isActive = lightsActive && lightsCount > idx && !redLightsOut;
                      return (
                        <div key={idx} className="flex flex-col gap-1 items-center">
                          <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center relative overflow-hidden">
                            {isActive ? (
                              <div className="absolute inset-0 bg-red-600 shadow-[0_0_20px_#dc2626]" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#111]" />
                            )}
                          </div>
                          {/* Lower row indicator */}
                          <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center relative overflow-hidden">
                            {isActive ? (
                              <div className="absolute inset-0 bg-red-600 shadow-[0_0_20px_#dc2626]" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#111]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <h3 className="font-orbitron text-sm font-black text-white uppercase tracking-widest">
                    {redLightsOut ? (
                      <span className="text-green-400 animate-pulse font-black text-lg">RELEASE RELEASE RELEASE!</span>
                    ) : (
                      'WAIT FOR LIGHTS OUT...'
                    )}
                  </h3>

                  <p className="text-[10px] font-mono text-white/40">{feedback}</p>

                  <button
                    onMouseDown={handleClutchRelease}
                    onTouchStart={handleClutchRelease}
                    className="w-full max-w-xs btn-racing !bg-green-600 border-green-500 hover:!bg-green-700 py-4 font-orbitron font-black tracking-widest text-xs uppercase"
                  >
                    RELEASE CLUTCH (TAP!)
                  </button>
                </div>
              )}

              {stage === 'complete' && (
                <div className="space-y-6 w-full">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                    {totalTime <= 3.00 ? (
                      <Trophy className="text-pit-yellow" size={28} />
                    ) : (
                      <AlertTriangle className="text-racing-red animate-bounce" size={28} />
                    )}
                  </div>

                  <div>
                    <h3 className="font-orbitron text-xl font-black italic text-white uppercase tracking-tight">
                      {totalTime <= 3.00 ? 'CHAMPION PIT STOP!' : 'TOO SLOW FOR THE GRID!'}
                    </h3>
                    <div className="font-orbitron text-4xl font-black italic text-racing-red mt-2">
                      {totalTime.toFixed(3)}s
                    </div>
                  </div>

                  {/* Splits */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white/5 rounded-xl border border-white/5 text-[9px] font-mono text-white/40 text-left max-w-sm mx-auto">
                    <div className="flex justify-between pr-2 border-r border-white/5">
                      <span>1. Nut loosen:</span>
                      <span className="text-white font-bold">{unboltTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between pl-2">
                      <span>2. Tire Swap:</span>
                      <span className="text-white font-bold">{swapTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between pr-2 border-r border-white/5">
                      <span>3. Nut tighten:</span>
                      <span className="text-white font-bold">{tightenTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between pl-2">
                      <span>4. Clutch:</span>
                      <span className="text-white font-bold">{releaseTime.toFixed(2)}s</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-white/40 leading-relaxed max-w-sm mx-auto">
                    {totalTime <= 3.00 
                      ? 'Congratulations! You beat the clock and secured the sub-3 second pit stop. Your 15% discount has been applied!' 
                      : 'The team principal is not impressed. You need to complete the stop under 3.00 seconds to secure the 15% discount coupon.'}
                  </p>

                  <div className="flex gap-4 max-w-sm mx-auto">
                    {totalTime <= 3.00 ? (
                      <button
                        onClick={handleClaim}
                        className="flex-1 btn-racing py-3 font-orbitron font-black tracking-widest text-xs uppercase"
                      >
                        CLAIM 15% DISCOUNT
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={startMiniGame}
                          className="flex-1 btn-racing py-3 font-orbitron font-black tracking-widest text-xs uppercase flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw size={12} /> RETRY CHALLENGE
                        </button>
                        <button
                          onClick={onClose}
                          className="flex-1 glass py-3 border-white/10 hover:border-white/20 transition-all font-orbitron font-bold tracking-widest text-xs uppercase text-white/60 hover:text-white"
                        >
                          CLOSE
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
