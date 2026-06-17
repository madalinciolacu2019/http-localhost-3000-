'use client';

import React, { useState } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import { motion } from 'framer-motion';
import { Hexagon, Zap, Thermometer, Save, Download, Coffee, ShoppingCart } from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { useCart } from '@/frontend/context/CartContext';
import dynamic from 'next/dynamic';

// Dynamically import the 3D component with SSR disabled
const BlendCustomizer3D = dynamic(() => import('@/frontend/components/BlendCustomizer3D'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#050508]">
      <div className="flex flex-col items-center gap-4">
        <Hexagon className="text-racing-red animate-spin-slow" size={32} />
        <span className="font-orbitron text-xs text-white/50 tracking-[0.3em] uppercase">Loading WebGL</span>
      </div>
    </div>
  )
});

export default function CustomizerPage() {
  const { playSound } = useSound();
  const { user, updateUserMetadata } = useAuth();
  const { addItem, openCart } = useCart();
  
  const [force, setForce] = useState(9.0);
  const [heat, setHeat] = useState(92.0);
  const [setupName, setSetupName] = useState('My Custom Roast');

  const handleSaveSetup = () => {
    playSound('success');
    if (user) {
      const currentSetups = user.user_metadata?.savedTelemetry || [];
      const newSetup = { name: setupName, force, heat };
      updateUserMetadata({
        savedTelemetry: [...currentSetups, newSetup]
      });
      alert('Telemetry saved to your Driver Profile!');
    } else {
      alert('You need a Paddock Pass to save custom telemetry setups.');
    }
  };

  const handleAddToOrder = () => {
    playSound('pit-stop');
    const customProduct = {
      id: -(100000 + Math.floor(Math.random() * 900000)),
      name: setupName || 'Custom Telemetry Roast',
      category: 'Espresso',
      price: 24.90,
      image: '/menu_espresso_turbo.png',
      description: `Custom calibrated F1 blend roasted with ${force.toFixed(1)} BAR extraction pressure & ${heat.toFixed(1)}°C thermal output.`,
      stats: {
        intensity: `${Math.round((force - 7) * 25)}%`,
        heat: `${heat.toFixed(0)}°C`
      },
      color: 'red'
    };
    addItem(customProduct);
    openCart();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-[#050508] pt-24 pb-0 relative overflow-hidden flex flex-col md:flex-row">
        
        {/* 3D Canvas Area */}
        <div className="w-full md:w-2/3 h-[50vh] md:h-auto relative">
          <div className="absolute top-6 left-6 z-10">
            <h1 className="font-orbitron text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
              AERO<span className="text-racing-red">ROAST</span>
            </h1>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">3D Blend Visualizer</p>
          </div>
          <BlendCustomizer3D force={force} heat={heat} />
        </div>

        {/* Telemetry Controls Sidebar */}
        <div className="w-full md:w-1/3 bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 md:p-8 flex flex-col justify-center min-h-[50vh] md:min-h-0 z-20">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-sm mx-auto w-full space-y-10"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coffee size={14} className="text-pit-yellow" />
                <h3 className="font-orbitron text-xs font-bold text-white/50 uppercase tracking-widest">Setup Configuration</h3>
              </div>
              <input 
                type="text" 
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 text-white font-orbitron text-xl font-bold py-2 focus:outline-none focus:border-racing-red transition-colors"
                placeholder="Name your blend..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="font-orbitron text-[10px] text-white/50 tracking-widest uppercase flex items-center gap-2">
                  <Zap size={12} className="text-pit-yellow" /> Extraction Force
                </label>
                <span className="font-mono text-sm font-bold text-pit-yellow">{force.toFixed(1)} BAR</span>
              </div>
              <input 
                type="range" min="8.0" max="12.0" step="0.1" 
                value={force} onChange={(e) => { setForce(parseFloat(e.target.value)); playSound('click'); }}
                className="w-full accent-pit-yellow cursor-ew-resize"
              />
              <p className="font-mono text-[9px] text-white/30">Higher pressure yields denser crema and darker appearance.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="font-orbitron text-[10px] text-white/50 tracking-widest uppercase flex items-center gap-2">
                  <Thermometer size={12} className="text-racing-red" /> Thermal Output
                </label>
                <span className="font-mono text-sm font-bold text-racing-red">{heat.toFixed(1)} °C</span>
              </div>
              <input 
                type="range" min="85.0" max="98.0" step="0.1" 
                value={heat} onChange={(e) => { setHeat(parseFloat(e.target.value)); playSound('click'); }}
                className="w-full accent-racing-red cursor-ew-resize"
              />
              <p className="font-mono text-[9px] text-white/30">Higher temperatures increase roast intensity and red-shift the chassis.</p>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <button 
                onClick={handleAddToOrder}
                className="w-full btn-racing group"
              >
                <span className="font-orbitron text-xs font-black relative z-10 flex items-center justify-center gap-2">
                  <ShoppingCart size={14} /> ADD TO FUEL ORDER (€24.90)
                </span>
              </button>

              <button 
                onClick={handleSaveSetup}
                className="w-full glass py-3 rounded border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all font-orbitron text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <Save size={14} className="text-pit-yellow" /> SAVE TELEMETRY TO PROFILE
              </button>
              
              <button className="w-full glass py-3 rounded border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all font-orbitron text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                <Download size={14} /> EXPORT CAD FILE
              </button>
            </div>
            
          </motion.div>
        </div>

      </main>
    </>
  );
}
