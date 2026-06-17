'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Trophy, Coffee, Shield, FileText, Camera, MessageCircle, PlayCircle, Lock, ShieldCheck, Activity, Wifi, Cpu, X, Sliders, Calendar, ShoppingBag, Terminal } from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';

const footerLinks = [
  {
    category: 'Navigate',
    links: [
      { label: 'Grid (Home)', href: '/', icon: Flag },
      { label: 'Fueling Station', href: '/menu', icon: Coffee },
      { label: 'Paddock Club', href: '/paddock-club', icon: Shield },
    ],
  },
  {
    category: 'Explore',
    links: [
      { label: 'Gear & Merch', href: '/merch', icon: ShoppingBag },
      { label: 'Academy', href: '/academy', icon: Trophy },
    ],
  },
  {
    category: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy', icon: Lock },
      { label: 'Terms & Conditions', href: '/terms', icon: FileText },
    ],
  },
];

const socials = [
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: MessageCircle, href: '#', label: 'Twitter / X' },
  { icon: PlayCircle, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const { playSound } = useSound();
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [ping, setPing] = useState(14);
  const [activePackets, setActivePackets] = useState<string[]>([]);

  useEffect(() => {
    if (!isTelemetryOpen) return;
    
    // Fluctuating ping simulation
    const pingInterval = setInterval(() => {
      setPing(Math.floor(Math.random() * 8) + 9);
    }, 1500);

    // Stream logs simulation
    const logs = [
      'UPLINK STATUS: ESTABLISHED',
      'CIPHER: TLS_AES_256_GCM_SHA384',
      'FIREWALL LEVEL: MAX ACTIVE',
      'SSL HANDSHAKE: COMPLETED',
      'PORT ROUTE: HTTPS (443)',
      'ENCRYPTION SPEC: SHA-256 HASHED',
      'INTEGRITY VERIFIED: STRIPE CERTIFIED'
    ];
    setActivePackets([logs[0]]);
    
    let currentIdx = 1;
    const logInterval = setInterval(() => {
      if (currentIdx < logs.length) {
        setActivePackets(prev => [...prev, logs[currentIdx]]);
        currentIdx++;
        playSound('click');
      } else {
        // Mock periodic heartbeats
        setActivePackets(prev => [
          ...prev.slice(-6),
          `API PING: ${Math.floor(Math.random() * 5) + 10}ms [HEARTBEAT]`
        ]);
      }
    }, 1000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(logInterval);
    };
  }, [isTelemetryOpen]);

  const handleOpenTelemetry = () => {
    playSound('engine-rev');
    setIsTelemetryOpen(true);
  };

  return (
    <footer className="relative bg-[#0a0a10] border-t border-white/5 overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-racing-red to-transparent" />

      {/* Racing stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-racing-red" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit" onClick={() => playSound('click')}>
              <div className="bg-racing-red px-4 py-1.5 skew-x-[-15deg] group-hover:shadow-[0_0_20px_#E10600] transition-all">
                <span className="font-orbitron font-black text-xl text-white skew-x-[15deg] tracking-tighter">APEX</span>
              </div>
              <span className="font-orbitron text-lg font-black tracking-[0.2em] text-white italic">BREWS</span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Precision-engineered coffee for champions. F1-inspired flavors, telemetry-driven brewing, and paddock-exclusive experiences.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="p-2.5 glass rounded-lg border-white/5 hover:bg-racing-red/20 hover:border-racing-red/30 transition-all text-white/30 hover:text-white"
                  onClick={() => playSound('click')}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          {footerLinks.map((group) => (
            <div key={group.category} className="space-y-4">
              <h3 className="font-orbitron text-[9px] font-black tracking-[0.4em] text-white/30 uppercase">{group.category}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => playSound('click')}
                      className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white transition-colors font-orbitron tracking-wider group/link"
                    >
                      <link.icon size={12} className="text-racing-red/40 group-hover/link:text-racing-red transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-white/30">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-racing-red shadow-[0_0_8px_#E10600]"
              />
              <p className="font-orbitron text-[9px] text-white/30 tracking-[0.3em] uppercase m-0">
                © 2026 Apex Brews SRL
              </p>
            </div>
            
            <span className="text-white/10 hidden md:inline">|</span>
            
            <Link href="/privacy" className="font-orbitron text-[9px] hover:text-white transition-colors tracking-widest uppercase no-underline">
              Privacy Policy
            </Link>
            
            <span className="text-white/10 hidden md:inline">|</span>
            
            <Link href="/terms" className="font-orbitron text-[9px] hover:text-white transition-colors tracking-widest uppercase no-underline">
              Terms & Conditions
            </Link>
          </div>

          {/* Premium Stripe secure telemetry button */}
          <button
            onClick={handleOpenTelemetry}
            className="flex items-center gap-3.5 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-racing-red/20 px-4 py-2 rounded-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              <span className="font-orbitron text-[9px] font-black text-white/60 group-hover:text-white tracking-widest uppercase transition-colors">
                STRIPE VERIFIED
              </span>
            </div>
            
            <div className="h-3 w-[1px] bg-white/10" />
            
            {/* Payment Card Icon Vectors */}
            <div className="flex items-center gap-2">
              {/* Stripe logo vector */}
              <svg viewBox="0 0 40 16" className="h-3 w-auto fill-current text-white/30 group-hover:text-[#635BFF] transition-colors" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.95 7.15c0-1.63-1.25-2.28-3.05-2.28-1.57 0-3 .55-3.8 1.05l.63 1.55c.78-.45 1.95-.9 3.03-.9 1.15 0 1.63.38 1.63.95 0 1.83-5.4 1.1-5.4 4.35 0 1.6 1.25 2.33 3.07 2.33 1.7 0 2.8-.57 3.5-1.07l-.6-1.55c-.75.48-1.8.87-2.73.87-1.12 0-1.68-.42-1.68-1.02 0-1.95 5.43-1.18 5.43-4.3zM15.42 2.35l-1.92.4v1.85h-1.3v1.55h1.3v4.98c0 1.7 1 2.25 2.73 2.25.55 0 1-.05 1.33-.18v-1.58c-.28.08-.63.12-.95.12-.75 0-1.18-.32-1.18-1.13v-4.46h2.13v-1.55h-2.13V2.35zM22.84 4.88c-.62 0-1.33.27-1.78.68l-.07-.53h-1.8v8.62h1.92v-5.1c0-1.28.82-1.82 1.73-1.82.25 0 .55.05.78.13V4.98a3.1 3.1 0 00-.8-.1zm3.66-2.18a1.16 1.16 0 100 2.32 1.16 1.16 0 000-2.32zm-.96 3.45h1.92v8.62H25.54V6.15zM31.25 6.03c-1 0-1.7.53-2.18 1v8.72h1.92V9.9c0-1.55.9-2.2 1.95-2.2.17 0 .37.02.5.07V6.15a2.6 2.6 0 00-.77-.12zM38.83 9.4c0-2.5-1.73-3.37-3.48-3.37-2.22 0-3.8 1.63-3.8 4.45 0 2.8 1.5 4.37 3.75 4.37 1.48 0 2.85-.53 3.63-1.15l-.65-1.42c-.65.45-1.72.82-2.83.82-1.28 0-2-.62-2.05-1.7h5.53c.03-.28.05-.63.05-1zM33.5 8.7c.05-1 .73-1.47 1.83-1.47 1 0 1.57.48 1.57 1.47H33.5z"/>
              </svg>
              {/* Visa vector */}
              <svg viewBox="0 0 24 16" className="h-3 w-auto fill-current text-white/30 group-hover:text-[#1A1F71] transition-colors" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.1 12.3l1.1-6.7H8.5l-.2.9c-.3-.9-1.2-1.1-2-.1l-1.9 4.9v.1h2.2l.4-1.2c.1 0 1.9 0 2 0l.2 2.1h1.9zm-2.4-2.5l.6-1.7.4 1.7h-1zm9.9-1.1c.3-.8.6-1.5.3-2.1-.3-.6-1.1-.9-2.2-.9-1.7 0-2.7 1-2.7 1l.4 1.4s.8-.5 1.5-.5c.6 0 .9.2 1 .4.1.3 0 .6-.4.9l-1 1c-.8.8-1 1.7-.6 2.4.3.6 1 .9 2 .9 1.7 0 2.5-1 2.5-1l-.4-1.5s-.6.5-1.2.5c-.5 0-.8-.2-.9-.4 0-.3.1-.6.4-.9l1.3-1.1zm6.5-2.6H21l-1.8 6.7h1.9l2-6.7zM2 5.6L0 6v.2c1.2.3 2.1.8 2.8 1.6l.8 3.3.6 1.2h2l3.1-6.7H7.3l-2.2 4.9L3.8 5.6H2z"/>
              </svg>
              {/* Mastercard vector */}
              <svg viewBox="0 0 24 16" className="h-3 w-auto text-white/30 group-hover:text-[#FF5F00] transition-colors" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.8" />
                <circle cx="16" cy="8" r="6" fill="currentColor" fillOpacity="0.8" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Stripe secure telemetry window modal */}
      <AnimatePresence>
        {isTelemetryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full glass p-6 md:p-8 rounded-2xl bg-black border border-white/10 shadow-2xl text-left space-y-6 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playSound('click');
                  setIsTelemetryOpen(false);
                }}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Carbon overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

              {/* Header */}
              <div className="space-y-1 relative">
                <div className="flex items-center gap-2">
                  <Lock className="text-racing-red animate-pulse" size={16} />
                  <span className="font-orbitron text-[9px] font-black text-racing-red tracking-[0.4em] uppercase">
                    SECURE UPLINK ESTABLISHED
                  </span>
                </div>
                <h3 className="font-orbitron text-xl font-black italic text-white tracking-tight uppercase">
                  PAYMENT GATEWAY <span className="text-racing-red">TELEMETRY</span>
                </h3>
              </div>

              {/* Main metrics grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-20">
                  <div className="flex items-center gap-2 text-[8px] font-orbitron font-black text-white/40 tracking-wider">
                    <Wifi size={10} className="text-[#635BFF]" />
                    STRIPE API SERVER
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-orbitron text-sm font-black text-white tracking-wide">ONLINE</span>
                    <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block" />
                      100% UP
                    </span>
                  </div>
                </div>

                <div className="glass bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-20">
                  <div className="flex items-center gap-2 text-[8px] font-orbitron font-black text-white/40 tracking-wider">
                    <Activity size={10} className="text-pit-yellow" />
                    LATENCY RATE
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-orbitron text-sm font-black text-white tracking-wide">{ping} ms</span>
                    <span className="text-[8px] text-white/40 font-mono">STABLE SPEED</span>
                  </div>
                </div>

                <div className="glass bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-20">
                  <div className="flex items-center gap-2 text-[8px] font-orbitron font-black text-white/40 tracking-wider">
                    <ShieldCheck size={10} className="text-green-400" />
                    CIPHER SYSTEM
                  </div>
                  <div className="font-mono text-[9px] text-white/80 mt-1 truncate">
                    AES-256-GCM-SHA384
                  </div>
                </div>

                <div className="glass bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-20">
                  <div className="flex items-center gap-2 text-[8px] font-orbitron font-black text-white/40 tracking-wider">
                    <Cpu size={10} className="text-[#635BFF]" />
                    TLS STACK
                  </div>
                  <div className="font-mono text-[9px] text-white/80 mt-1">
                    TLS 1.3 (SECURE)
                  </div>
                </div>
              </div>

              {/* Logs display */}
              <div className="space-y-2">
                <span className="font-orbitron text-[8px] font-black text-white/40 tracking-wider uppercase">
                  Telemetry Packet Stream
                </span>
                <div className="bg-black/80 rounded-xl border border-white/5 p-4 font-mono text-[9px] leading-relaxed text-green-400 h-36 overflow-y-auto space-y-1.5 select-none custom-scrollbar">
                  {activePackets.map((pkt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-white/20 select-none">[{idx.toString().padStart(2, '0')}]</span>
                      <span className="font-black text-white/40">&gt;&gt;</span>
                      <span className="text-green-400 uppercase tracking-wider">{pkt}</span>
                    </div>
                  ))}
                  {activePackets.length < 7 && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/10">[{activePackets.length.toString().padStart(2, '0')}]</span>
                      <span className="text-white/20">&gt;&gt;</span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-1.5 h-3 bg-green-500 inline-block"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[9px] text-white/40 font-orbitron tracking-widest uppercase">
                <span>SECURITY ENCRYPTED BY APEX</span>
                <span className="flex items-center gap-1.5 text-[#635BFF]">
                  <Lock size={10} /> Stripe Terminal Link
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
