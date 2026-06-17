'use client';

import React, { useState, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface VipPaddockPassProps {
  user: any;
  isVip: boolean;
}

export default function VipPaddockPass({ user, isVip }: VipPaddockPassProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Mouse tracking values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for a heavier, premium feel
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to rotation (-15deg to 15deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  // Dynamic glare based on mouse position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['100%', '0%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['100%', '0%']);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="w-full mt-10 relative flex justify-center perspective-[1200px]">
      
      {/* NFC Pulsing Rings Background (only visible when not flipped) */}
      <AnimatePresence>
        {!isFlipped && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none"
          >
            <div className="absolute inset-0 rounded-full border border-racing-red/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-4 rounded-full border border-racing-red/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            <div className="absolute inset-8 rounded-full border border-racing-red/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="relative w-full max-w-[280px] aspect-[2/3] cursor-pointer"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        
        {/* Lanyard Clip (Floats above the card) */}
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-8 bg-gradient-to-b from-gray-400 via-gray-600 to-gray-800 rounded-t-xl z-50 flex items-start justify-center shadow-2xl"
          style={{ transform: 'translateZ(10px)' }}
        >
          <div className="w-6 h-2.5 bg-black rounded-full mt-1.5 opacity-80 shadow-inner" />
          <div className="absolute bottom-0 w-full h-2 bg-gradient-to-b from-transparent to-black/40" />
        </div>

        {/* ================= FRONT OF CARD ================= */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505] rounded-2xl border border-white/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Dynamic Glare Effect */}
          <motion.div 
            className="absolute inset-0 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay z-40"
            style={{ 
              x: glareX, 
              y: glareY,
              rotate: '-45deg',
              translateX: '-50%',
              translateY: '-50%'
            }} 
          />
          
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
          
          {/* Red stripe header */}
          <div className="h-16 bg-gradient-to-r from-racing-red via-red-600 to-racing-red w-full flex items-center justify-center relative shadow-lg">
            <h3 className="font-orbitron font-black text-sm tracking-[0.3em] text-white z-10 drop-shadow-md">PADDOCK PASS</h3>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-between h-[calc(100%-4rem)] relative z-10">
            <div className="text-center w-full">
              <span className="font-orbitron text-[9px] text-white/50 tracking-widest uppercase block mb-1">Driver Profile</span>
              <span className="font-orbitron font-black text-sm text-white uppercase truncate block w-full drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {user.user_metadata?.full_name || 'Driver Cadet'}
              </span>
            </div>

            {/* QR Code central container with Laser */}
            <div className="relative mt-2 mb-2 group-qr">
              <div className="absolute -inset-2 bg-gradient-to-r from-racing-red to-yellow-500 rounded-xl blur-md opacity-40 animate-pulse" />
              <div className="relative bg-white p-3 rounded-xl shadow-2xl overflow-hidden border border-white/40">
                <QRCodeSVG value={user.id} size={140} bgColor="#ffffff" fgColor="#000000" level="H" />
                
                {/* F1 logo overlay in middle of QR */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white flex items-center justify-center rounded border-2 border-black">
                  <img src="/logo.png" alt="Apex" className="w-full h-full object-contain filter grayscale invert" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>

                {/* Animated Scanning Laser */}
                <div className="absolute left-0 w-full h-[2px] bg-racing-red shadow-[0_0_15px_#E10600] z-20"
                  style={{
                    animation: 'scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                  }}
                />
                <style jsx>{`
                  @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                `}</style>
              </div>
            </div>

            <div className="w-full">
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-3" />
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="font-orbitron text-[7px] text-white/40 uppercase tracking-widest">ID</span>
                  <span className="font-mono text-[9px] text-white/80 tracking-widest uppercase">{user.id.substring(0, 8)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-orbitron text-[7px] text-white/40 uppercase tracking-widest">Clearance</span>
                  <span className={`font-orbitron font-black text-[11px] uppercase tracking-widest ${isVip ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-white'}`}>
                    {isVip ? 'VIP' : 'STANDARD'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BACK OF CARD ================= */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#222] to-[#0a0a0a] rounded-2xl border border-white/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Dynamic Glare Effect */}
          <motion.div 
            className="absolute inset-0 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none mix-blend-overlay z-40"
            style={{ 
              x: glareX, 
              y: glareY,
              rotate: '45deg',
              translateX: '-50%',
              translateY: '-50%'
            }} 
          />
          
          {/* Magnetic Stripe */}
          <div className="w-full h-12 bg-black mt-8 shadow-inner" />
          
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="font-orbitron text-[8px] text-white/40 uppercase tracking-widest block mb-1">Terms & Conditions</span>
                <p className="font-mono text-[6px] text-white/30 leading-tight">
                  This card is property of Apex Racing. Non-transferable. Present at checkout to accrue ERS points. Lost or stolen cards will result in a 5-second time penalty.
                </p>
              </div>

              {/* Fake Barcode */}
              <div className="w-full h-10 bg-white/80 flex items-center justify-between px-2 opacity-80 mix-blend-screen rounded-sm">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${Math.random() * 4 + 1}px`, opacity: Math.random() > 0.3 ? 1 : 0 }} />
                ))}
              </div>
              <div className="text-center font-mono text-[8px] text-white/40 tracking-[0.3em]">{user.id.substring(0, 16)}</div>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-3">
              <div>
                <span className="font-orbitron text-[7px] text-white/40 uppercase tracking-widest block">Authorized By</span>
                <span className="font-script text-lg text-white/80 opacity-80" style={{ fontFamily: "'Brush Script MT', cursive" }}>Toto Wolff</span>
              </div>
              <img src="/logo.png" alt="Apex" className="w-6 h-6 opacity-30 filter grayscale" />
            </div>
          </div>
        </div>

      </motion.div>
      <div className="absolute -bottom-6 font-orbitron text-[9px] text-white/30 uppercase tracking-widest animate-pulse">
        Tap to flip card
      </div>
    </div>
  );
}
