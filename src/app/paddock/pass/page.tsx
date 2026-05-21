'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, QrCode, RefreshCw, ArrowLeft, Trophy, CheckCircle, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useSound } from '@/context/SoundContext';

const ROASTS = [
  { id: 'apex', name: 'Apex Espresso', notes: 'Dark Chocolate, Toasted Pecan, 9.2 Bar telemetry extraction', color: '#E10600' },
  { id: 'podium', name: 'Podium Golden Roast', notes: 'Honeyed Citrus, Silky Crema, High-altitude paddock batch', color: '#fbbf24' },
  { id: 'drs', name: 'DRS Cold Brew Blend', notes: 'Nitrogen-Infused Berry, Ultra Low Viscosity, Maximum Drag Reduction', color: '#3b82f6' },
  { id: 'monza', name: 'Monza Ultra-Dark', notes: 'Smoked Oak, Volcanic Ash, Intense Caffeinated Horsepower', color: '#22c55e' }
];

export default function PaddockPassGenerator() {
  const { playSound } = useSound();
  const [handle, setHandle] = useState('MAD-77');
  const [selectedRoast, setSelectedRoast] = useState(ROASTS[0]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [accessHash, setAccessHash] = useState('AUTH-INIT-00');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic 3D Tilting state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isGyroEnabled, setIsGyroEnabled] = useState(false);

  // Canvas ref for animated scrolling sine-wave telemetry vectors
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate cryptographic-style serial hash on update
  useEffect(() => {
    const raw = `${handle.toUpperCase()}-${selectedRoast.id}-${Date.now().toString().slice(-4)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    setAccessHash(`FIA-SECURE-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`);
  }, [handle, selectedRoast]);

  // Handle standard desktop mouse perspective mapping
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGyroEnabled) return; // Prioritize sensor streams if active
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth boundary mapping limits card rotations to exquisite visual range
    const rX = ((y - centerY) / centerY) * -18;
    const rY = ((x - centerX) / centerX) * 18;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    if (isGyroEnabled) return;
    setRotateX(0);
    setRotateY(0);
  };

  // Request Mobile Gyroscope / DeviceOrientation permissions gracefully
  const enableGyroControls = async () => {
    playSound('click');
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setIsGyroEnabled(true);
          window.addEventListener('deviceorientation', handleOrientationEvent);
          setToastMessage('SENSOR LINK: Mobile Gyroscope depth streams bound successfully');
        }
      } catch (err) {
        // ignore fallback
      }
    } else {
      // Pure Android / Standard Web API mapped immediately
      setIsGyroEnabled(true);
      window.addEventListener('deviceorientation', handleOrientationEvent);
      setToastMessage('SENSOR LINK: Spatial device orientation mapping active');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOrientationEvent = (event: DeviceOrientationEvent) => {
    if (event.beta !== null && event.gamma !== null) {
      // Map hardware axes to gorgeous spatial tilt boundaries
      // event.beta: front-to-back tilt in degrees
      // event.gamma: left-to-right tilt in degrees
      const clampedX = Math.max(-25, Math.min(25, (event.beta - 40) * 0.6));
      const clampedY = Math.max(-25, Math.min(25, event.gamma * 0.6));
      setRotateX(clampedX);
      setRotateY(clampedY);
    }
  };

  // Cleanup orientation listeners on drop
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientationEvent);
    };
  }, []);

  // Continuous loop drawing of futuristic telemetry graphics inside HTML Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const renderTelemetryLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render crisp grid layout
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 15;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw primary high-frequency telemetry wave
      ctx.beginPath();
      ctx.strokeStyle = selectedRoast.color;
      ctx.lineWidth = 2;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.05 + phase) * 12 + Math.sin(x * 0.1 + phase * 2) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw secondary trailing digital target wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2.5 + Math.cos(x * 0.03 - phase * 0.8) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      phase += 0.08;
      animationFrameId = requestAnimationFrame(renderTelemetryLoop);
    };

    renderTelemetryLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedRoast, isGenerated]);

  const triggerPassGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('engine-rev');
    setIsGenerated(true);
    setToastMessage(`SUCCESS: Holographic pass synchronized for ID ${handle.toUpperCase()}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pure Local Custom SVG matrix rendering premium discount QR codes without heavy third party npm script wrappers
  const renderSecureSVGQRCode = () => {
    // Generates fixed stylized matrix matching dynamic telemetry signature hash
    const matrixSize = 21;
    const squares = [];
    // Seed deterministically based on input access hash string lengths
    let seed = accessHash.charCodeAt(accessHash.length - 1) + accessHash.charCodeAt(accessHash.length - 2);

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Draw primary positioning outer squares
        const isFinder = (r < 7 && c < 7) || (r < 7 && c >= matrixSize - 7) || (r >= matrixSize - 7 && c < 7);
        const isInnerFinder = (r >= 2 && r < 5 && c >= 2 && c < 5) || 
                              (r >= 2 && r < 5 && c >= matrixSize - 5 && c < matrixSize - 2) || 
                              (r >= matrixSize - 5 && r < matrixSize - 2 && c >= 2 && c < 5);
        
        // Populate procedural payload bits
        seed = (seed * 9301 + 49297) % 233280;
        const isFilled = isFinder || isInnerFinder || (seed / 233280) > 0.45;

        if (isFilled) {
          squares.push(
            <rect 
              key={`${r}-${c}`} 
              x={c * 6} 
              y={r * 6} 
              width="6" 
              height="6" 
              fill={isFinder && !isInnerFinder ? selectedRoast.color : '#FFFFFF'} 
              rx={isFinder ? 1 : 0.5}
            />
          );
        }
      }
    }

    return (
      <svg viewBox={`0 0 ${matrixSize * 6} ${matrixSize * 6}`} className="w-full h-full p-2 bg-black/40 rounded-xl border border-white/10">
        {squares}
      </svg>
    );
  };

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-carbon-black relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic Laser Backdrop overlay grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,6,0,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15 pointer-events-none" />

      {/* Floating Dynamic Feedback HUD Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] glass px-5 py-3 rounded-2xl border border-racing-red bg-black/90 shadow-[0_0_30px_rgba(225,6,0,0.4)] flex items-center gap-3 backdrop-blur-2xl pointer-events-auto"
          >
            <span className="w-2 h-2 rounded-full bg-racing-red animate-ping shrink-0" />
            <span className="font-orbitron text-[10px] sm:text-xs font-black tracking-widest text-white uppercase">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title base strip */}
      <div className="max-w-6xl mx-auto w-full relative z-10 shrink-0">
        <Link 
          href="/paddock" 
          onClick={() => playSound('click')}
          className="inline-flex items-center gap-2 text-xs font-orbitron font-bold text-white/40 hover:text-white transition-colors mb-6 no-underline"
        >
          <ArrowLeft size={14} /> BACK TO PADDOCK PORTAL
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[1px] bg-racing-red" />
              <span className="font-orbitron text-[9px] font-black tracking-widest text-racing-red uppercase">Apple Vision Pro UI x FIA Guidelines</span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              VIP PADDOCK <span className="text-racing-red">CREDENTIALS</span>
            </h1>
          </div>
          <p className="text-white/40 text-xs font-mono max-w-sm text-left md:text-right">
            Forge an advanced holographic multi-tier paddock credential embedded with live extract telemetry hashes and cryptographic entry codes.
          </p>
        </div>
      </div>

      {/* Main Builder Split Matrix */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 relative z-20 my-auto pointer-events-auto">
        
        {/* Left Side: Configuration Controls Console */}
        <div className="lg:col-span-5 space-y-6 glass p-6 md:p-8 rounded-3xl border-white/10 relative backdrop-blur-2xl bg-black/60 pointer-events-auto">
          <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-racing-red to-transparent rounded-full" />
          
          <form onSubmit={triggerPassGeneration} className="space-y-5">
            {/* Input Driver Tag */}
            <div className="space-y-2">
              <label className="font-orbitron text-[10px] font-black tracking-widest text-white/70 uppercase block">
                1. ENTER DRIVER HANDLE
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={8}
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
                  }}
                  placeholder="MAD-77"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-orbitron font-black text-lg text-white uppercase tracking-widest focus:outline-none focus:border-racing-red focus:bg-white/10 transition-all placeholder:text-white/20"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/30 uppercase tracking-wider">
                  MAX 8 CHARS
                </span>
              </div>
            </div>

            {/* Select Blend Matrix */}
            <div className="space-y-3">
              <label className="font-orbitron text-[10px] font-black tracking-widest text-white/70 uppercase block">
                2. SELECT FUEL COMPOUND (ROAST)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROASTS.map((roast) => {
                  const isSelected = selectedRoast.id === roast.id;
                  return (
                    <button
                      type="button"
                      key={roast.id}
                      onClick={() => { 
                        setSelectedRoast(roast); 
                        playSound('click'); 
                        setToastMessage(`TELEMETRY LINK: Calibrating ${roast.name} compound profile`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                          : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: roast.color }} />
                          <span className="font-orbitron text-xs font-bold">{roast.name}</span>
                        </div>
                        <p className="text-[9px] font-mono text-white/40 line-clamp-1 pl-4">
                          {roast.notes}
                        </p>
                      </div>
                      {isSelected && <CheckCircle size={14} className="text-racing-red shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action compilation submit */}
            <button
              type="submit"
              className="w-full btn-racing !py-3.5 mt-2 flex items-center justify-center gap-3 text-xs tracking-widest group"
            >
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              <span>{isGenerated ? 'UPDATE CREDENTIALS' : 'GENERATE HOLOGRAPHIC PASS'}</span>
            </button>
          </form>

          {/* Device Orientation Setup Trigger */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-orbitron text-[9px] font-black tracking-wider text-white uppercase block">
                MOBILE SENSOR LINK
              </span>
              <span className="text-[8px] font-mono text-white/40 block">
                Tilt phone to preview real-time spatial depth
              </span>
            </div>
            <button
              type="button"
              onClick={enableGyroControls}
              className={`p-2 rounded-lg border text-[9px] font-orbitron font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                isGyroEnabled 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone size={12} />
              <span>{isGyroEnabled ? 'GYRO CONNECTED' : 'ENABLE TILT'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: High-Fidelity 3D Holographic Rendering Presentation Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[480px]">
          
          {/* Outer perspective coordinate boundary container */}
          <div 
            className="relative w-full max-w-md aspect-[1/1.5] rounded-3xl p-4 md:p-6 transition-all duration-300 select-none cursor-grab active:cursor-grabbing"
            style={{ perspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Inner rotated credential node mapping native CSS 3D perspectives */}
            <motion.div
              animate={{ rotateX, rotateY }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full h-full rounded-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between border-[1.5px] border-white/20 shadow-2xl"
            >
              {/* Layer 1: Laser-Etched Carbon Fiber background layout with procedural ambient styling */}
              <div 
                className="absolute inset-0 opacity-90 z-0" 
                style={{ 
                  backgroundColor: '#0A0A0E',
                  backgroundImage: `radial-gradient(circle at 50% 30%, ${selectedRoast.color}25, transparent 70%), url('https://www.transparenttextures.com/patterns/carbon-fibre.png')`,
                  backgroundSize: '100% 100%, 12px 12px'
                }} 
              />

              {/* Layer 2: Glowing Holographic Neon Trim Overlays */}
              <div 
                className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none z-0 transition-all duration-500"
                style={{
                  background: `linear-gradient(${135 + rotateX * 2}deg, ${selectedRoast.color}40 0%, transparent 40%, transparent 60%, #FFFFFF30 100%)`
                }}
              />

              {/* Layer 3: Physical FIA Hologram Foil Stamp overlay */}
              <div className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full border border-white/20 bg-gradient-to-tr from-white/10 via-white/5 to-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden group shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
                <Shield size={20} className="text-white/80 relative z-10" />
                <span className="absolute bottom-1 font-orbitron text-[4px] font-black tracking-tighter text-white/50">FIA 2026</span>
              </div>

              {/* Top Credential Header */}
              <div className="relative z-10 space-y-1 transform-gpu" style={{ transform: 'translateZ(30px)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: selectedRoast.color }} />
                  <span className="font-orbitron text-[8px] font-black tracking-[0.3em] text-white/60 uppercase">
                    APEX BREWS VIP ACCREDITATION
                  </span>
                </div>
                <h2 className="font-orbitron text-2xl font-black italic text-white tracking-tight uppercase">
                  PADDOCK CLUB
                </h2>
                <div className="inline-block bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8px] font-mono tracking-widest text-white/80 uppercase">
                  ZONE 1 / GRID WALK
                </div>
              </div>

              {/* Center Holographic Content Container */}
              <div className="relative z-10 my-auto py-6 transform-gpu space-y-4" style={{ transform: 'translateZ(50px)' }}>
                {/* Dynamically assigned handle typography */}
                <div>
                  <span className="text-[8px] font-orbitron font-bold text-white/40 tracking-widest uppercase block mb-0.5">
                    ACCREDITED DRIVER ID
                  </span>
                  <div className="font-orbitron text-4xl sm:text-5xl font-black tracking-tighter text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {handle || 'MAD-77'}
                  </div>
                </div>

                {/* Animated Telemetry Graphics Vector Array */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                    <span>TELEMETRY FEED</span>
                    <span style={{ color: selectedRoast.color }}>{selectedRoast.name}</span>
                  </div>
                  <div className="w-full h-12 rounded-lg bg-black/60 border border-white/10 overflow-hidden relative p-1">
                    <canvas ref={canvasRef} width={280} height={40} className="w-full h-full block" />
                  </div>
                </div>
              </div>

              {/* Bottom Credential Footer with Native SVG QR payload voucher */}
              <div className="relative z-10 border-t border-white/10 pt-4 mt-auto flex items-end justify-between gap-3 transform-gpu" style={{ transform: 'translateZ(40px)' }}>
                <div className="space-y-1 flex-1">
                  <span className="text-[7px] font-orbitron font-bold text-white/40 tracking-widest uppercase block">
                    SECURE SIGNATURE HASH
                  </span>
                  <div className="font-mono text-[9px] text-white/80 font-bold truncate">
                    {accessHash}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Trophy size={10} className="text-pit-yellow" />
                    <span className="text-[7px] font-orbitron font-bold text-pit-yellow tracking-wider uppercase">
                      15% Paddock Store Discount Active
                    </span>
                  </div>
                </div>

                {/* Scannable Real-time Rendered Inline SVG QR Voucher layout */}
                <div className="w-16 h-16 shrink-0 relative group">
                  {renderSecureSVGQRCode()}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-xs">
                    <QrCode size={16} className="text-white animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Absolute Corner edge markers reinforcing high end architectural Vision Pro feel */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
            </motion.div>
          </div>

          {/* Mouse prompt caption */}
          <div className="text-center mt-3 text-white/30 text-[9px] font-mono uppercase tracking-widest">
            {isGyroEnabled ? '✦ TILT SMARTPHONE TO EXPLORE ✦' : '✦ DRAG MOUSE ACROSS PASS TO ROTATE PERSPECTIVES ✦'}
          </div>
        </div>
      </div>
    </main>
  );
}
