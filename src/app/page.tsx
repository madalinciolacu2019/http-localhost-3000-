'use client';

import React, { useState, useEffect } from 'react';
import Hero from "@/components/Hero";
import { LiveRaceCenter } from "@/components/LiveRaceCenter";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useSound } from "@/context/SoundContext";
import { products } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Shield, Zap, Thermometer, Gauge, Cpu, 
  Check, Activity, Mail, Sparkles, Coffee, AlertTriangle, 
  ArrowRight, Star, Sliders, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

// Preset configurations for livery bags
const LIVERIES = [
  { id: 'apex', label: 'APEX CARBON', bg: 'from-black via-[#1c1c24] to-black', border: 'border-white/10 hover:border-racing-red/50', activeBorder: 'border-racing-red', color: 'red', brand: 'APEX RACING' },
  { id: 'ferrari', label: 'SCUDERIA SCARLET', bg: 'from-[#E10600] via-[#B90500] to-[#7A0300]', border: 'border-red-500/30 hover:border-red-500/80', activeBorder: 'border-red-500', color: 'red', brand: 'SCUDERIA FERRARI' },
  { id: 'redbull', label: 'ORACLE INDIGO', bg: 'from-[#0600EF] via-[#04008A] to-[#0A0D1A]', border: 'border-yellow-400/30 hover:border-yellow-400/80', activeBorder: 'border-yellow-400', color: 'yellow', brand: 'RED BULL RACING' },
  { id: 'mercedes', label: 'PETRONAS SILVER', bg: 'from-[#8A9597] via-[#00A19B] to-[#1C1F22]', border: 'border-[#00A19B]/30 hover:border-[#00A19B]/80', activeBorder: 'border-[#00A19B]', color: 'teal', brand: 'AMG PETRONAS' },
  { id: 'mclaren', label: 'PAPAYA SPEED', bg: 'from-[#FF8700] via-[#CC5C00] to-[#1E1E1E]', border: 'border-orange-500/30 hover:border-orange-500/80', activeBorder: 'border-orange-500', color: 'orange', brand: 'MCLAREN F1' }
];

export default function Home() {
  const { raceMode } = useUI();
  const { addItem, openCart } = useCart();
  const { playSound } = useSound();

  // Custom Blend Builder Telemetry States
  const [pressure, setPressure] = useState(9.2); // Bar
  const [temp, setTemp] = useState(93.0); // °C
  const [grind, setGrind] = useState(4.5); // 1-10
  const [selectedLivery, setSelectedLivery] = useState(LIVERIES[0]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [blendAdded, setBlendAdded] = useState(false);

  // Newsletter Subscriptions
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'linking' | 'linked'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  // Dynamically compute flavor profile stats based on slider values
  const acidity = Math.max(10, Math.min(100, Math.round(50 + (93 - temp) * 6 + (grind - 4.5) * 5)));
  const body = Math.max(10, Math.min(100, Math.round(60 + (pressure - 9.2) * 12 - (grind - 4.5) * 6)));
  const bitterness = Math.max(10, Math.min(100, Math.round(45 + (temp - 93) * 7 + (pressure - 9.2) * 8)));
  const crema = Math.max(10, Math.min(100, Math.round(80 + (pressure - 9.2) * 10 - Math.abs(93 - temp) * 3)));
  const extractionTime = Math.max(18, Math.min(42, Math.round(28 - (grind - 4.5) * 2.5 - (pressure - 9.2) * 1.5)));

  // Calculate Custom price dynamically based on telemetry values (simulates hardware calibration costs)
  const customPrice = 4.90 + (pressure * 0.12) + ((96 - temp) * 0.04) + (selectedLivery.id !== 'apex' ? 0.80 : 0);

  // Custom telemetry ordering handler
  const handleAddCustomBlend = () => {
    playSound('engine-rev');
    setBlendAdded(true);

    const customProduct = {
      id: 100 + Math.floor(Math.random() * 900), // Unique dynamic ID
      name: `${selectedLivery.brand} Custom Blend`,
      category: 'Custom Blend',
      price: Number(customPrice.toFixed(2)),
      image: selectedLivery.id === 'apex' ? '/menu_espresso_turbo.png' :
             selectedLivery.id === 'ferrari' ? '/ferrari_sf24.png' :
             selectedLivery.id === 'redbull' ? '/redbull_rb20.png' : '/menu_flat_white.png',
      description: `Custom calibrated blend roasted to: ${pressure.toFixed(1)} BAR / ${temp.toFixed(1)}°C / Grind #${grind.toFixed(1)}. Custom packaging.`,
      stats: { intensity: `${Math.round(pressure * 9)}%`, heat: `${temp.toFixed(0)}°C` },
      color: selectedLivery.color
    };

    addItem(customProduct);

    setTimeout(() => {
      setBlendAdded(false);
      openCart();
    }, 1500);
  };

  // Simulated email telemetry link-up
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    playSound('click');
    setSubStatus('linking');
    setLogs(['[DNS] resolving paddock-dispatch.local...']);

    setTimeout(() => {
      setLogs(prev => [...prev, '[TLS] negotiating security handshake...']);
    }, 500);

    setTimeout(() => {
      setLogs(prev => [...prev, '[SMTP] synchronizing chassis telemetry credentials...']);
    }, 1200);

    setTimeout(() => {
      setLogs(prev => [...prev, '[OK] link-up established! Box, box, box!']);
      setSubStatus('linked');
      playSound('pit-stop');
    }, 2000);
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#0A0A0F]">
      <Hero />
      
      <AnimatePresence>
        {raceMode && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="py-12 bg-carbon-black border-t border-white/5"
          >
            <LiveRaceCenter />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── SECTION 1: Flagship Championship Blends ── */}
      <section className="py-24 px-6 relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-carbon-black to-[#0A0A0F]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-12 h-[1px] bg-racing-red" />
              <span className="font-orbitron text-racing-red font-black tracking-[0.3em] text-xs uppercase">Championship Blends</span>
              <span className="w-12 h-[1px] bg-racing-red" />
            </div>
            <h2 className="font-orbitron text-4xl md:text-6xl font-black italic tracking-tighter text-white">
              THE FLAGSHIP <span className="text-racing-red">LINEUP</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto italic font-light mt-3">
              F1-grade specialty coffees calibrated under maximum extraction telemetry constraints.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.slice(0, 3).map((product) => {
              const specColor = product.color === 'red' ? 'text-racing-red' : product.color === 'yellow' ? 'text-pit-yellow' : 'text-blue-400';
              const specGlow = product.color === 'red' ? 'hover:shadow-[0_0_30px_rgba(225,6,0,0.15)]' : product.color === 'yellow' ? 'hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]';
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`glass p-8 rounded-3xl border-white/5 relative flex flex-col justify-between overflow-hidden group transition-all duration-500 ${specGlow}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/2 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div>
                    {/* Header Spec */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-orbitron font-black text-white/30 tracking-widest uppercase">
                        {product.category}
                      </span>
                      <span className="font-orbitron text-2xl font-black text-white">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 bg-white/5 relative flex items-center justify-center border border-white/5">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                      />
                    </div>

                    <h3 className="font-orbitron text-2xl font-black text-white mb-2 italic">
                      {product.name}
                    </h3>
                    <p className="text-white/45 text-xs font-light leading-relaxed mb-6">
                      {product.description}
                    </p>

                    {/* Telemetry Stats */}
                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mb-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/30 font-orbitron">
                          <Gauge size={10} className={specColor} />
                          INTENSITY
                        </div>
                        <span className="font-orbitron text-xs font-black text-white/80">{product.stats.intensity}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/30 font-orbitron">
                          <Thermometer size={10} className={specColor} />
                          EXTRACTION TEMP
                        </div>
                        <span className="font-orbitron text-xs font-black text-white/80">{product.stats.heat}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addItem(product);
                      playSound('gear-shift');
                    }}
                    className="w-full btn-racing flex items-center justify-center gap-2 py-3 text-[10px] tracking-widest font-black"
                  >
                    <span>FUEL ORDER</span>
                    <ArrowRight size={12} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/menu">
              <button 
                onClick={() => playSound('click')}
                className="glass px-8 py-3.5 border-white/10 hover:border-racing-red/40 hover:bg-racing-red/5 font-orbitron text-[10px] font-black tracking-widest text-white uppercase rounded-xl transition-all"
              >
                BROWSE COMPLETE FUEL STATION
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Espresso Custom Telemetry Configurator ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-[#0A0A0F] border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.04),transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <header className="mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-12 h-[1px] bg-racing-red" />
              <span className="font-orbitron text-racing-red font-black tracking-[0.3em] text-xs uppercase">Interactive Labs</span>
              <span className="w-12 h-[1px] bg-racing-red" />
            </div>
            <h2 className="font-orbitron text-4xl md:text-6xl font-black italic tracking-tighter text-white">
              CUSTOM TELEMETRY <span className="text-racing-red">BUILDER</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto italic font-light mt-3">
              Calibrate extraction metrics, design packaging skin, and brew your custom parameters.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Sliders (7 Cols) */}
            <div className="lg:col-span-7 glass border-white/5 rounded-3xl p-8 flex flex-col justify-between bg-white/2">
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-2 pb-4 border-b border-white/5">
                  <Sliders className="text-racing-red" size={18} />
                  <span className="font-orbitron text-[11px] font-black text-white/80 tracking-widest uppercase">
                    Chassis Calibration Sliders
                  </span>
                </div>

                {/* Slider 1: Pressure */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline font-orbitron">
                    <span className="text-[10px] font-black text-white/40 tracking-wider">EXTRACTION PRESSURE</span>
                    <span className="text-base font-black text-racing-red italic">{pressure.toFixed(1)} BAR</span>
                  </div>
                  <div className="relative flex items-center">
                    <input 
                      type="range" 
                      min="8.0" 
                      max="12.0" 
                      step="0.1" 
                      value={pressure}
                      onChange={(e) => {
                        setPressure(parseFloat(e.target.value));
                        playSound('click');
                      }}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-racing-red"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-white/20 font-orbitron">
                    <span>8.0 BAR (UNDER-EXTRACTED FLUID)</span>
                    <span>10.0 BAR (OPIMAL POINT)</span>
                    <span>12.0 BAR (OVER-PRESSURE)</span>
                  </div>
                </div>

                {/* Slider 2: Water Temp */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline font-orbitron">
                    <span className="text-[10px] font-black text-white/40 tracking-wider">WATER TEMPERATURE</span>
                    <span className="text-base font-black text-pit-yellow italic">{temp.toFixed(1)} °C</span>
                  </div>
                  <div className="relative flex items-center">
                    <input 
                      type="range" 
                      min="88.0" 
                      max="96.0" 
                      step="0.5" 
                      value={temp}
                      onChange={(e) => {
                        setTemp(parseFloat(e.target.value));
                        playSound('click');
                      }}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-pit-yellow"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-white/20 font-orbitron">
                    <span>88°C (SOFTER & SWEETER)</span>
                    <span>92°C (RECOMMENDED ROAST)</span>
                    <span>96°C (STRONG INTENSITY)</span>
                  </div>
                </div>

                {/* Slider 3: Grind Calibration */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline font-orbitron">
                    <span className="text-[10px] font-black text-white/40 tracking-wider">GRIND MICROMETER CALIBRATION</span>
                    <span className="text-base font-black text-blue-400 italic">#{grind.toFixed(1)}</span>
                  </div>
                  <div className="relative flex items-center">
                    <input 
                      type="range" 
                      min="1.0" 
                      max="10.0" 
                      step="0.5" 
                      value={grind}
                      onChange={(e) => {
                        setGrind(parseFloat(e.target.value));
                        playSound('click');
                      }}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-white/20 font-orbitron">
                    <span>#1.0 (ULTRA FINE - STRONGER BODY)</span>
                    <span>#5.0 (MEDIUM BALANCE)</span>
                    <span>#10.0 (COARSE - HIGH ACIDITY)</span>
                  </div>
                </div>

                {/* Livery Bag design selection */}
                <div className="space-y-3 pt-4">
                  <span className="font-orbitron text-[10px] font-black text-white/40 tracking-wider block">
                    TEAM CUSTOM PACKAGE LIVERY
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {LIVERIES.map((liv) => (
                      <button
                        key={liv.id}
                        onClick={() => {
                          setSelectedLivery(liv);
                          playSound('gear-shift');
                        }}
                        className={`px-3 py-2 rounded-xl text-[9px] font-orbitron font-black tracking-widest border transition-all ${
                          selectedLivery.id === liv.id 
                            ? `${liv.activeBorder} bg-white/5 text-white scale-105` 
                            : `${liv.border} text-white/40 hover:text-white`
                        }`}
                      >
                        {liv.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Flavor Metrics Radar Simulation */}
              <div className="border-t border-white/5 pt-8 mt-8 space-y-4">
                <span className="font-orbitron text-[9px] font-black text-white/30 tracking-wider block uppercase">
                  SIMULATED FLAVOR BLUEPRINT TELEMETRY
                </span>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    { label: 'ACIDITY', val: acidity, color: 'bg-blue-500' },
                    { label: 'SWEETNESS', val: 100 - bitterness, color: 'bg-green-500' },
                    { label: 'BODY & WEIGHT', val: body, color: 'bg-racing-red' },
                    { label: 'CREMA DEPTH', val: crema, color: 'bg-pit-yellow' }
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex justify-between text-[8px] font-black font-orbitron text-white/40">
                        <span>{metric.label}</span>
                        <span>{metric.val}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${metric.color}`}
                          animate={{ width: `${metric.val}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Interactive Bag Preview (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              {/* Coffee Bag Visual Widget */}
              <div className="glass border-white/5 rounded-3xl p-8 flex-1 flex flex-col justify-between items-center text-center relative overflow-hidden bg-white/2">
                {/* Livery Background glow */}
                <div className={`absolute inset-0 bg-gradient-to-b ${selectedLivery.bg} opacity-15 pointer-events-none transition-colors duration-700`} />
                <div className="absolute top-4 right-4 text-[7px] font-orbitron font-black text-white/10 tracking-widest border border-white/5 px-2 py-0.5 rounded">
                  MODEL NO: APX-93T
                </div>

                <div className="space-y-1 mt-4">
                  <div className="flex justify-center mb-1">
                    <Coffee size={36} className="text-white/20 animate-pulse" />
                  </div>
                  <span className="font-orbitron text-[9px] font-black text-white/30 tracking-[0.3em] uppercase block">
                    {selectedLivery.brand}
                  </span>
                  <h3 className="font-orbitron text-2xl font-black italic tracking-tighter text-white uppercase truncate max-w-[240px]">
                    TELEMETRY CUSTOM
                  </h3>
                </div>

                {/* Graphic representing custom bags */}
                <motion.div 
                  className="w-40 h-56 rounded-2xl relative shadow-2xl flex flex-col justify-between p-4 overflow-hidden border border-white/10 mt-6"
                  style={{
                    background: `linear-gradient(135deg, #15151e 0%, #0d0d14 100%)`
                  }}
                  animate={{ rotateY: blendAdded ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Team Accent stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${selectedLivery.bg}`} />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

                  <div className="flex justify-between items-start z-10">
                    <span className="text-[5px] font-orbitron text-white/40 tracking-widest">APEX LABS</span>
                    <Cpu size={12} className="text-white/30 animate-pulse" />
                  </div>

                  {/* Real-time slider reading */}
                  <div className="space-y-1 z-10 text-left">
                    <div className="font-mono text-[7px] text-white/40 space-y-0.5 leading-none">
                      <p>P: {pressure.toFixed(1)} BAR</p>
                      <p>T: {temp.toFixed(1)} °C</p>
                      <p>G: #{grind.toFixed(1)}</p>
                      <p>EST: {extractionTime} SEC</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end z-10">
                    <div className="text-[6px] text-white/30 font-orbitron uppercase text-left leading-tight">
                      <p>CHASSIS LIVERY</p>
                      <p className="font-black text-white/70">{selectedLivery.brand}</p>
                    </div>
                    <div className="text-[8px] font-orbitron font-black text-racing-red bg-racing-red/10 px-2 py-0.5 rounded">
                      €{customPrice.toFixed(2)}
                    </div>
                  </div>
                </motion.div>

                {/* Metrics output footer */}
                <div className="w-full grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-6 text-center font-orbitron">
                  <div>
                    <span className="text-[7px] text-white/30 block uppercase tracking-wider">EXTRACTION</span>
                    <span className="text-xs font-black text-white">{extractionTime}s</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-white/30 block uppercase tracking-wider">BODY INTENSITY</span>
                    <span className="text-xs font-black text-white">{Math.round(pressure * 8.5)}%</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-white/30 block uppercase tracking-wider">CALIBRATION</span>
                    <span className="text-xs font-black text-green-400">PASSED</span>
                  </div>
                </div>
              </div>

              {/* Confirm / Add to Cart Card */}
              <div className="glass border-white/5 rounded-3xl p-6 bg-white/2 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[7px] text-white/30 block font-orbitron tracking-widest">CALCULATED VALUE</span>
                    <span className="font-orbitron text-2xl font-black text-white italic">€{customPrice.toFixed(2)}</span>
                  </div>
                  <span className="text-[8px] font-orbitron font-black text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    250G Bag Telemetry
                  </span>
                </div>

                <button
                  onClick={handleAddCustomBlend}
                  disabled={blendAdded}
                  className="w-full btn-racing flex items-center justify-center gap-3 py-4 text-[10px] tracking-[0.2em] font-black disabled:opacity-50"
                >
                  <ShoppingCart size={14} />
                  {blendAdded ? 'CONFIGURING HARDWARE...' : 'DEPLOY CUSTOM PARAMETERS'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Roastery Curve Telemetry ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#0A0A0F] to-carbon-black border-t border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Description (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[2px] bg-racing-red" />
                <span className="font-orbitron text-[9px] text-racing-red font-black tracking-widest uppercase">
                  THERMAL TELEMETRY
                </span>
              </div>
              <h2 className="font-orbitron text-3xl md:text-5xl font-black italic tracking-tighter text-white leading-tight">
                THERMO-DYNAMIC <span className="text-racing-red">ROASTING</span>
              </h2>
              <p className="text-white/45 text-xs font-light leading-relaxed">
                Roasting isn't just baking; it's physics. Our Loring-powered air-recirculation roasters log temperature data at 10Hz intervals, generating optimal thermodynamic curves to caramelize organic sugars with maximum precision.
              </p>

              <div className="space-y-3 font-orbitron text-[10px] text-white/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-racing-red" />
                  <span>Rate of Rise (RoR) optimized at 12°C/min</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-pit-yellow" />
                  <span>Interactive Drum Speed: 55 RPM static control</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Rapid 90s fluid bed cooling cycle</span>
                </div>
              </div>
            </div>

            {/* Roasting Graph Widget (7 Cols) */}
            <div className="lg:col-span-7 glass border-white/5 rounded-3xl p-6 md:p-8 bg-black/60 relative overflow-hidden space-y-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <Activity className="text-racing-red animate-pulse" size={16} />
                  <span className="font-orbitron text-[10px] text-white/80 font-black tracking-wider uppercase">
                    Live Roast Profile Telemetry
                  </span>
                </div>
                <span className="font-orbitron text-[8px] text-green-400 border border-green-500/20 bg-green-500/5 px-2 py-0.5 rounded uppercase tracking-widest">
                  Active Run #8839
                </span>
              </div>

              {/* Roasting Curve Line Plot SVG */}
              <div className="w-full h-56 relative bg-white/2 border border-white/5 rounded-2xl p-4">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  
                  {/* Temp Curve (Roast Curve) */}
                  <motion.path 
                    d="M 5 90 Q 20 88 35 60 T 70 30 T 95 15" 
                    fill="none" 
                    stroke="url(#roastGradient)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />

                  {/* RoR Curve */}
                  <motion.path
                    d="M 5 60 Q 25 20 45 40 T 80 65 T 95 80"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.2, ease: "easeInOut" }}
                  />

                  {/* SVG Gradient Definition */}
                  <defs>
                    <linearGradient id="roastGradient" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ffeb3b" />
                    </linearGradient>
                  </defs>
                  
                  {/* Highlighting Points */}
                  <circle cx="5" cy="90" r="1.5" fill="#ef4444" />
                  <circle cx="35" cy="60" r="1.5" fill="#f59e0b" />
                  <circle cx="70" cy="30" r="1.5" fill="#ffeb3b" />
                  <circle cx="95" cy="15" r="1.5" fill="#ffffff" />
                </svg>

                {/* Point Labels */}
                <div className="absolute inset-0 p-4 font-mono text-[7px] text-white/30 pointer-events-none select-none flex justify-between flex-col">
                  <div className="flex justify-between items-start">
                    <p>230°C [DROP - STAGE 4]</p>
                    <p>ROR: 8.5°C/MIN</p>
                  </div>
                  <div className="flex justify-between items-end relative h-full">
                    <p className="absolute left-[30%] bottom-[35%]">150°C [YELLOWING]</p>
                    <p className="absolute left-[65%] bottom-[65%]">196°C [1ST CRACK]</p>
                    <p className="absolute left-[2%] bottom-[2%]">22°C [CHARGE]</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-[8px] text-white/30 font-orbitron tracking-widest border-t border-white/5 pt-4">
                <span>DATALOG INTEGRATION: ACTIVE</span>
                <span>LORING FLUID PROFILE SENSORS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Active Pit Wall Reviews (Testimonials) ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-carbon-black border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(225,6,0,0.05),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-12 h-[1px] bg-racing-red" />
              <span className="font-orbitron text-racing-red font-black tracking-[0.3em] text-xs uppercase">Chassis Logs</span>
              <span className="w-12 h-[1px] bg-racing-red" />
            </div>
            <h2 className="font-orbitron text-4xl md:text-6xl font-black italic tracking-tighter text-white">
              DRIVER REVIEW <span className="text-racing-red">DATALOG</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto italic font-light mt-3">
              Read what champion athletes are saying about our telemetry-driven brews.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sir Lewis Hamilton',
                team: 'Mercedes AMG Petronas',
                quote: 'The DRS Espresso is unmatched. It gives me that high-pressure performance boost right before Q3. Plus, the silver/teal packaging matches my chassis details perfectly.',
                stars: 5,
                role: '7-Time Champion'
              },
              {
                name: 'Max Verstappen',
                team: 'Oracle Red Bull Racing',
                quote: 'The Full Wet Cold Brew is simply lovely. On long straights or during off-season simulators, it has absolute grip and consistency. The telemetry is spot on.',
                stars: 5,
                role: '3-Time Champion'
              },
              {
                name: 'Charles Leclerc',
                team: 'Scuderia Ferrari',
                quote: 'My favorite is the Paddock Macchiato. Smooth micro-foam, clean extraction pressure, and Scuderia Scarlet bag. Truly an elite espresso for staying alert in paddock briefings.',
                stars: 5,
                role: 'Grand Prix Winner'
              }
            ].map((driver, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-3xl border-white/5 bg-white/2 relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(driver.stars)].map((_, i) => (
                      <Star key={i} size={12} fill="#FFD700" className="text-pit-yellow" />
                    ))}
                  </div>

                  <p className="text-white/60 text-xs italic font-light leading-relaxed">
                    "{driver.quote}"
                  </p>
                </div>

                <div className="border-t border-white/5 pt-6 mt-8 flex justify-between items-center">
                  <div>
                    <h4 className="font-orbitron text-xs font-black text-white">{driver.name}</h4>
                    <span className="text-[8px] text-white/30 tracking-widest font-orbitron block uppercase">{driver.team}</span>
                  </div>
                  <span className="font-orbitron text-[8px] font-black text-racing-red bg-racing-red/10 border border-racing-red/20 px-2 py-1 rounded">
                    {driver.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Newsletter Pitlane Dispatch ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-carbon-black to-[#0A0A0F] border-t border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 glass border-white/5 rounded-3xl p-8 md:p-12 bg-black/40 text-center space-y-8">
          <header className="space-y-2">
            <span className="font-orbitron text-[10px] font-black text-racing-red tracking-[0.4em] uppercase">
              PITLANE TELEMETRY UPLINK
            </span>
            <h2 className="font-orbitron text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
              LINK YOUR CHASSIS
            </h2>
            <p className="text-white/40 text-xs max-w-xl mx-auto leading-relaxed">
              Subscribe to the Paddock Dispatch logs. Receive firmware upgrades, telemetry roasting reports, and priority pitbox allocations directly to your console.
            </p>
          </header>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="DRIVER@APEXBREWS.COM"
                className="flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red placeholder:text-white/10"
              />
              <button
                type="submit"
                disabled={subStatus !== 'idle'}
                className="btn-racing !px-8 !py-3.5 text-[10px] font-orbitron font-black tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail size={12} />
                <span>SUBSCRIBE</span>
              </button>
            </div>

            {/* Newsletter Subscription Status Logs console */}
            {subStatus !== 'idle' && (
              <div className="bg-black border border-white/5 rounded-xl p-4 font-mono text-[9px] text-green-400 text-left space-y-1.5 h-24 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-white/15">[{i.toString().padStart(2, '0')}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                {subStatus === 'linking' && (
                  <div className="flex gap-2">
                    <span className="text-white/10">[{logs.length}]</span>
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-1.5 h-3.5 bg-green-500"
                    />
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

