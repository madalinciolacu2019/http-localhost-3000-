'use client';

import React, { useState, useEffect } from 'react';
import Hero from "@/frontend/components/Hero";
import { LiveRaceCenter } from "@/frontend/components/LiveRaceCenter";
import { useUI } from "@/frontend/context/UIContext";
import { useCart } from "@/frontend/context/CartContext";
import { useSound } from "@/frontend/context/SoundContext";
import { products } from "@/shared/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/frontend/context/AuthContext';
import { useRouter } from 'next/navigation';
import Card3D from '@/frontend/components/Card3D';
import { 
  Trophy, Shield, Zap, Thermometer, Gauge, Cpu, 
  Check, Activity, Mail, Sparkles, Coffee, AlertTriangle, 
  ArrowRight, Star, Sliders, ShoppingCart, Hexagon,
  ChevronDown, ChevronUp, Plus, Minus, Phone, MapPin, Globe, Info, Calendar, DollarSign, Award, X
} from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { raceMode } = useUI();
  const { addItem, openCart } = useCart();
  const { playSound } = useSound();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePost, setActivePost] = useState<any | null>(null);
  
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'linking' | 'linked'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  const [qrUrl, setQrUrl] = useState('http://192.168.68.60:5173/menu');
  
  useEffect(() => {
    setQrUrl('http://192.168.68.60:5173/menu');
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    playSound('click');
    setSubStatus('linking');
    setLogs(['[DNS] resolving paddock-dispatch.local...']);

    setTimeout(() => {
      setLogs(prev => [...prev, '[TLS] negotiating secure handshake...']);
    }, 500);

    setTimeout(() => {
      setLogs(prev => [...prev, '[SMTP] syncing chassis telemetry credentials...']);
    }, 1200);

    setTimeout(() => {
      setLogs(prev => [...prev, '[OK] link-up established!']);
      setSubStatus('linked');
      playSound('pit-stop');
    }, 2000);
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#050508]">
      <Hero />
      
      <AnimatePresence>
        {raceMode && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0A0A0F] border-b border-white/5"
          >
            <div className="py-12">
              <LiveRaceCenter />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── SECTION 1: Championship Blends ── */}
      <section className="py-32 px-6 relative overflow-hidden bg-[#050508]">
        {/* Dynamic mesh gradients */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-racing-red/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-24 flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-racing-red" />
              <span className="font-orbitron text-racing-red font-black tracking-[0.4em] text-xs uppercase flex items-center gap-2">
                <Hexagon size={12} /> The Lineup
              </span>
              <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-racing-red" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-orbitron text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase"
            >
              CHAMPIONSHIP <span className="text-gradient-red text-glow-red">BLENDS</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/40 mt-6 font-light text-sm max-w-2xl leading-relaxed"
            >
              Motorsport-grade specialty coffees calibrated for peak performance. Roasted with aggressive aerodynamic heating curves to guarantee maximum extraction yield.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {products.slice(0, 3).map((product, idx) => {
              const specColor = product.color === 'red' ? 'text-racing-red' : product.color === 'yellow' ? 'text-pit-yellow' : 'text-blue-400';
              
              return (
                <Card3D key={product.id} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="glass p-8 md:p-10 rounded-3xl relative flex flex-col justify-between overflow-hidden group h-full"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div>
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-[9px] font-orbitron font-black text-white/30 tracking-[0.3em] uppercase">
                          {product.category}
                        </span>
                        <span className="font-orbitron text-xl font-black text-white">
                          €{product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="aspect-square w-full rounded-2xl overflow-hidden mb-8 relative flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent border border-white/5 group-hover:border-white/20 transition-colors duration-500">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-[80%] h-[80%] object-contain drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700 ease-out" 
                        />
                      </div>

                      <h3 className="font-orbitron text-2xl font-black text-white mb-3 italic tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-white/40 text-xs font-light leading-relaxed mb-8">
                        {product.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mb-8">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/30 font-orbitron tracking-widest">
                            <Gauge size={10} className={specColor} /> INTENSITY
                          </div>
                          <span className="font-orbitron text-sm font-black text-white/90">{product.stats.intensity}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/30 font-orbitron tracking-widest">
                            <Thermometer size={10} className={specColor} /> TEMP
                          </div>
                          <span className="font-orbitron text-sm font-black text-white/90">{product.stats.heat}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addItem(product);
                        playSound('gear-shift');
                      }}
                      className="w-full py-4 glass border border-white/10 hover:border-racing-red hover:bg-racing-red/10 flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] font-orbitron font-black text-white transition-all duration-300 rounded-xl group/btn"
                    >
                      <span>FUEL ORDER</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </Card3D>
              );
            })}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <Link href="/menu">
              <button 
                onClick={() => playSound('click')}
                className="btn-racing"
              >
                <span>BROWSE FUEL STATION</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: Creative Portfolio & Paddock ── */}
      <section className="py-32 px-6 relative overflow-hidden bg-[#0A0A0F] border-t border-white/5">
        <div className="absolute left-0 bottom-0 w-[40vw] h-[40vw] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-24 flex flex-col items-center text-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
              <span className="font-orbitron text-white/50 font-black tracking-[0.4em] text-xs uppercase">
                The Ecosystem
              </span>
              <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
            </div>
            <h2 className="font-orbitron text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">
              CREATIVE <span className="text-white/40">PORTFOLIO</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Aerodynamic Blends', desc: 'Precision roasting profiles for single-origin beans.', image: '/menu_espresso_turbo.png', href: '/menu' },
              { title: 'Chassis Apparel', desc: 'Carbon-fiber mugs and team lanyards.', image: '/merch_cap.png', href: '/merch' },
              { title: 'Paddock Lounge', desc: 'Racing telemetry screens and simulator bays.', image: '/paddock_lounge.png', href: '/cafe-design' },
            ].map((item, i) => (
              <Link 
                key={i} 
                href={item.href} 
                className="group glass rounded-3xl overflow-hidden transition-all duration-500 hover:border-white/30 flex flex-col cursor-pointer"
                onClick={() => playSound('click')}
              >
                <div className="aspect-video w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors z-10" />
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out" 
                  />
                </div>
                <div className="p-8 space-y-3 bg-gradient-to-b from-white/5 to-transparent flex-1">
                  <h3 className="font-orbitron text-lg font-black text-white uppercase tracking-wide">{item.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Driver Reviews ── */}
      <section className="py-32 px-6 relative overflow-hidden bg-[#050508] border-t border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-20 text-center">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
              DRIVER <span className="text-racing-red">DATALOGS</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'The Prodigy', team: 'Indigo Racing', quote: 'Precision in the corner, perfection in the cup. The Full Wet is simply lovely.', role: 'PRODIGY' },
              { name: 'The Knight', team: 'Silver Works', quote: 'Still we rise. Still we grind. The DRS Espresso is unmatched right before Q3.', role: 'CHAMPION' },
              { name: 'The Tactician', team: 'Scarlet Aero', quote: 'I am always pushing the limit of the extraction. El Plan starts with a strong roast.', role: 'LEGEND' }
            ].map((driver, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.8 }}
                className="glass p-8 rounded-3xl relative flex flex-col justify-between hover:border-white/20 transition-colors"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#FFD700" className="text-pit-yellow" />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm italic font-light leading-relaxed">
                    "{driver.quote}"
                  </p>
                </div>
                <div className="border-t border-white/10 pt-6 mt-8 flex justify-between items-center">
                  <div>
                    <h4 className="font-orbitron text-sm font-black text-white">{driver.name}</h4>
                    <span className="text-[9px] text-white/40 tracking-[0.2em] font-orbitron block uppercase">{driver.team}</span>
                  </div>
                  <span className="font-orbitron text-[9px] font-black text-racing-red border border-racing-red/30 px-3 py-1.5 rounded-full">
                    {driver.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Pitlane Dispatch Newsletter ── */}
      <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-b from-[#0A0A0F] to-[#050508] border-t border-white/5">
        <div className="max-w-4xl mx-auto relative z-10 glass border-white/10 rounded-[2rem] p-10 md:p-16 text-center space-y-10 shadow-2xl">
          <header className="space-y-4">
            <span className="font-orbitron text-[10px] font-black text-racing-red tracking-[0.4em] uppercase">
              PITLANE TELEMETRY UPLINK
            </span>
            <h2 className="font-orbitron text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
              LINK YOUR CHASSIS
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed pt-4">
              Subscribe to the Paddock Dispatch logs. Receive firmware upgrades, telemetry roasting reports, and priority pitbox allocations directly to your console.
            </p>
          </header>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="DRIVER@APEXBREWS.COM"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 font-mono text-sm text-white focus:outline-none focus:border-racing-red placeholder:text-white/20 transition-colors"
              />
              <button
                type="submit"
                disabled={subStatus !== 'idle'}
                className="btn-racing !px-8 !py-4 text-[10px] rounded-xl font-orbitron font-black tracking-widest flex items-center justify-center gap-3 cursor-pointer"
              >
                <Mail size={14} />
                <span>SUBSCRIBE</span>
              </button>
            </div>

            {subStatus !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[#050508] border border-white/10 rounded-xl p-5 font-mono text-[10px] text-green-400 text-left space-y-2 h-32 overflow-y-auto"
              >
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-white/20">[{i.toString().padStart(2, '0')}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                {subStatus === 'linking' && (
                  <div className="flex gap-3">
                    <span className="text-white/20">[{logs.length}]</span>
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-2 h-4 bg-green-500"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </form>
        </div>
      </section>

    </main>
  );
}
