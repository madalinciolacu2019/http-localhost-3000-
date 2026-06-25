'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Product3DViewer from '@/components/Product3DViewer';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { ShoppingCart } from 'lucide-react';

const MERCH_ITEMS = [
  {
    id: 101,
    name: 'Paddock Coffee Tumbler',
    category: 'Merchandise',
    price: 35.00,
    image: '',
    description: 'Double-walled vacuum insulated tumbler engineered to keep telemetry-calibrated coffee hot for 6 hours.',
    stats: { intensity: 'N/A', heat: 'N/A' },
    color: 'red'
  },
  {
    id: 102,
    name: 'Apex Team Cap',
    category: 'Apparel',
    price: 45.00,
    image: '',
    description: 'Official 2026 team cap with carbon fiber weave visor and embroidered Apex Brews logo.',
    stats: { intensity: 'N/A', heat: 'N/A' },
    color: 'black'
  },
  {
    id: 103,
    name: 'Carbon Stealth Mug',
    category: 'Merchandise',
    price: 24.00,
    image: '',
    description: 'Lightweight ceramic mug finished with a matte carbon-black glaze.',
    stats: { intensity: 'N/A', heat: 'N/A' },
    color: 'black'
  },
  {
    id: 104,
    name: 'Champion Yellow Cup',
    category: 'Merchandise',
    price: 24.00,
    image: '',
    description: 'Bright pit-yellow ceramic mug for celebrating podium finishes.',
    stats: { intensity: 'N/A', heat: 'N/A' },
    color: 'yellow'
  }
];

export default function GearMerchPage() {
  const { playSound } = useSound();
  const { addItem, openCart } = useCart();

  const handleAddToCart = (item: typeof MERCH_ITEMS[0]) => {
    playSound('click');
    addItem({ ...item, color: item.color === 'red' ? '#E10600' : item.color === 'yellow' ? '#FFD700' : '#38383F' });
    openCart();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-carbon-black pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-6">
              OFFICIAL <span className="text-racing-red">GEAR</span>
            </h1>
            <p className="text-white/60 font-mono">
              Explore our precision-engineered merchandise in full 3D telemetry. Drag to rotate and inspect every angle before fueling up your cart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
            {MERCH_ITEMS.map(item => (
              <div key={item.id} className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row bg-black/60 group">
                <div className="w-full md:w-1/2 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 bg-black/40">
                  <Product3DViewer category={item.category} color={item.color} name={item.name} />
                </div>
                
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-racing-red uppercase tracking-widest mb-2 block">{item.category}</span>
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-4 uppercase">{item.name}</h3>
                    <p className="text-sm font-mono text-white/60 leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-orbitron text-2xl font-black text-white">€{item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-white/10 hover:bg-racing-red border border-white/10 hover:border-racing-red text-white p-3 rounded-xl transition-colors group-hover:shadow-[0_0_20px_rgba(225,6,0,0.3)]"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
