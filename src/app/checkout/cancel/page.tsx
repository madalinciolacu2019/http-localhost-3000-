'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSound } from '@/frontend/context/SoundContext';

export default function CheckoutCancelPage() {
  const { playSound } = useSound();

  return (
    <main className="min-h-screen bg-carbon-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.05),transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-racing-red/30 to-transparent" />

      <div className="text-center max-w-md relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-racing-red/10 border-2 border-racing-red/30 mb-8 mx-auto"
        >
          <XCircle size={48} className="text-racing-red/60" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-10"
        >
          <span className="font-orbitron text-[10px] text-white/30 font-black tracking-[0.4em]">CHECKOUT CANCELLED</span>
          <h1 className="font-orbitron text-4xl font-black italic text-white tracking-tighter">
            BOX, BOX,<br /><span className="text-racing-red">BOX!</span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Your order was cancelled. Your pitbox items are still saved — head back and pick up where you left off.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/menu">
            <button
              className="btn-racing flex items-center gap-3 px-8 py-3 text-[11px]"
              onClick={() => playSound('engine-rev')}
            >
              <ShoppingCart size={16} />
              BACK TO MENU
            </button>
          </Link>
          <Link href="/">
            <button className="glass px-8 py-3 flex items-center gap-3 font-orbitron font-bold text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all border-white/5 text-white/60 hover:text-white">
              <ArrowLeft size={14} />
              RETURN TO GRID
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
