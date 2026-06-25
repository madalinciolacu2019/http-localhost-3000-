'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, Shield, Zap, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function VipSubscriptionPage() {
  const { user, session, updateUserMetadata } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const isVip = user?.user_metadata?.is_vip === true;

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/auth?redirect=/vip');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate Stripe/Payment checkout delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hit our API to upgrade
      const res = await fetch('/api/upgrade-vip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (res.ok) {
        // Update local context
        updateUserMetadata({ is_vip: true });
        router.refresh();
      } else {
        console.error("Failed to upgrade");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative bg-carbon-black flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,215,0,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-4xl w-full mx-auto relative z-10">
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Star className="text-yellow-400" size={24} />
            <span className="font-orbitron text-yellow-400 font-bold tracking-[0.3em] text-xs uppercase">Premium Access</span>
            <Star className="text-yellow-400" size={24} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-orbitron text-4xl md:text-6xl font-black mb-6 text-white"
          >
            PADDOCK CLUB <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">VIP</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto italic font-light text-lg"
          >
            Unlock the ultimate motorsport lifestyle. Exclusive merchandise, VIP race tickets, and permanent ERS point multipliers.
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass border-yellow-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.1)] relative"
        >
          {isVip && (
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 shadow-[0_0_20px_#facc15]" />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 md:p-12 bg-black/40 border-r border-white/5">
              <h3 className="font-orbitron text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <Crown className="text-yellow-400" />
                VIP BENEFITS
              </h3>
              
              <ul className="space-y-6">
                {[
                  'Access to VIP-Only F1 Race Tickets',
                  'Exclusive High-End Team Merchandise',
                  '2x ERS Point Multiplier on Scans',
                  'Priority Pitbox Allocations',
                  'Private Factory Tour Invites'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="bg-yellow-400/10 p-1 rounded-full mt-0.5">
                      <CheckCircle className="text-yellow-400" size={16} />
                    </div>
                    <span className="font-mono text-sm text-white/80 leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-10 md:p-12 bg-gradient-to-b from-black/80 to-yellow-900/10 flex flex-col justify-center items-center text-center">
              {isVip ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                    <Shield size={48} className="text-yellow-400" />
                  </div>
                  <h2 className="font-orbitron text-3xl font-black text-white uppercase tracking-wider">ACTIVE</h2>
                  <p className="text-white/60 text-sm font-mono max-w-[250px]">Your Paddock Club VIP status is currently active.</p>
                  <button 
                    onClick={() => router.push('/menu')}
                    className="mt-4 px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-orbitron text-xs uppercase font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Return to Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-8 w-full max-w-[300px]">
                  <div>
                    <span className="text-6xl font-orbitron font-black text-white block">€99</span>
                    <span className="text-white/40 font-mono text-sm tracking-widest uppercase mt-2 block">/ Year</span>
                  </div>
                  
                  <button 
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-5 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative font-orbitron text-sm font-black text-black uppercase tracking-widest flex items-center justify-center gap-2">
                      {isProcessing ? 'Processing...' : 'UPGRADE NOW'} 
                      {!isProcessing && <ArrowRight size={18} />}
                    </span>
                  </button>
                  
                  <p className="text-[10px] text-white/30 font-mono mt-4">
                    Secure 256-bit SSL encrypted checkout. Cancel anytime from your profile settings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
