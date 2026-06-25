'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { Package, Check, Zap, Award } from 'lucide-react';
import SubscriptionManager from '@/components/SubscriptionManager';

const TIERS = [
  {
    id: 'sub_rookie',
    name: 'Rookie Tier',
    price: 19.99,
    features: ['1 Bag Monthly (250g)', 'Standard Shipping', 'Digital Telemetry Access'],
    icon: Package,
    color: 'text-blue-400',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-400/10',
    product: {
      id: 901,
      name: 'Rookie Tier Subscription',
      category: 'Subscription',
      price: 19.99,
      image: '/models/baseColor_1.png',
      description: 'Monthly 250g coffee delivery.',
      stats: { intensity: 'N/A', heat: 'N/A' },
      color: '#60a5fa'
    }
  },
  {
    id: 'sub_pro',
    name: 'Pro Tier',
    price: 34.99,
    features: ['2 Bags Monthly (500g)', 'Free Priority Shipping', 'Early Access to New Roasts', 'Monthly Sticker Pack'],
    icon: Zap,
    color: 'text-racing-red',
    borderColor: 'border-racing-red',
    bgColor: 'bg-racing-red/10',
    isPopular: true,
    product: {
      id: 902,
      name: 'Pro Tier Subscription',
      category: 'Subscription',
      price: 34.99,
      image: '/models/baseColor_2.png',
      description: 'Monthly 500g coffee delivery with priority shipping.',
      stats: { intensity: 'N/A', heat: 'N/A' },
      color: '#E10600'
    }
  },
  {
    id: 'sub_champ',
    name: 'World Champ',
    price: 79.99,
    features: ['4 Bags Monthly (1kg)', 'Free Priority Shipping', 'Exclusive VIP Paddock Pass Lanyard', 'Private Factory Tour Access', 'Custom Profile Roasting'],
    icon: Award,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400',
    bgColor: 'bg-yellow-400/10',
    product: {
      id: 903,
      name: 'World Champ Subscription',
      category: 'Subscription',
      price: 79.99,
      image: '/models/baseColor_3.png',
      description: 'Monthly 1kg VIP coffee delivery with lanyard.',
      stats: { intensity: 'N/A', heat: 'N/A' },
      color: '#facc15'
    }
  }
];

export default function SubscriptionsPage() {
  const { playSound } = useSound();
  const { addItem, openCart } = useCart();
  const [email] = useState('user@apexbrews.com'); // Mock auth

  const handleSubscribe = (tier: typeof TIERS[0]) => {
    playSound('click');
    addItem(tier.product, undefined, true);
    openCart();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-carbon-black pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-6">
              PIT PASS <span className="text-racing-red">SUBSCRIPTIONS</span>
            </h1>
            <p className="text-white/60 font-mono">
              Secure your monthly fuel delivery. Subscribe to guarantee fresh, telemetry-driven roasts delivered straight to your garage, complete with exclusive paddock perks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TIERS.map(tier => (
              <div key={tier.id} className={`glass rounded-3xl border p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 ${tier.isPopular ? `border-racing-red shadow-[0_0_30px_rgba(225,6,0,0.15)] bg-racing-red/5` : `border-white/10 hover:border-white/20 bg-black/60`}`}>
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-racing-red text-white text-[10px] font-orbitron font-black uppercase tracking-widest rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-full border ${tier.borderColor} ${tier.bgColor} flex items-center justify-center mb-6`}>
                  <tier.icon size={24} className={tier.color} />
                </div>
                
                <h3 className="font-orbitron text-2xl font-bold text-white mb-2 uppercase">{tier.name}</h3>
                <div className="font-orbitron text-4xl font-black text-white mb-6">
                  €{tier.price} <span className="text-sm text-white/50 font-mono tracking-normal block mt-1">/ month</span>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check size={16} className={`${tier.color} shrink-0 mt-0.5`} />
                      <span className="text-sm font-mono text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(tier)}
                  className={`w-full py-4 rounded-xl font-orbitron font-bold uppercase tracking-widest transition-all ${tier.isPopular ? 'bg-racing-red hover:bg-red-700 text-white shadow-[0_0_20px_rgba(225,6,0,0.3)]' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="font-orbitron text-2xl font-bold text-white uppercase text-center mb-8">Manage Telemetry Streams</h2>
            <SubscriptionManager email={email} />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
