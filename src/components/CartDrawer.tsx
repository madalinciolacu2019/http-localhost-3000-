'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import Link from 'next/link';
import PitStopGameModal from '@/components/PitStopGameModal';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice, subtotal, bundleDiscount, weatherDiscount, weatherCondition, couponDiscount, appliedCoupon, removeCoupon } = useCart();
  const { playSound } = useSound();
  const [isGameOpen, setIsGameOpen] = useState(false);

  const handleCheckout = () => {
    playSound('engine-rev');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
              onClick={closeCart}
            />

            {/* Drawer */}
            <motion.div
              key="cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-[#0d0d14] border-l border-white/5 z-[95] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-racing-red/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-racing-red/10 rounded-lg">
                      <ShoppingCart size={18} className="text-racing-red" />
                    </div>
                    <div>
                      <h2 className="font-orbitron text-sm font-black tracking-[0.2em] text-white uppercase">Pitbox</h2>
                      <p className="text-[10px] text-white/30 tracking-widest uppercase">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { closeCart(); playSound('click'); }}
                  className="relative z-10 p-2 glass rounded-lg hover:bg-racing-red/20 hover:border-racing-red/30 transition-all text-white/50 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Telemetry Line */}
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-racing-red to-transparent opacity-50" />

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {items.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center py-20 space-y-6"
                    >
                      <div className="p-8 bg-white/5 rounded-full">
                        <ShoppingCart size={48} className="text-white/10" />
                      </div>
                      <div>
                        <p className="font-orbitron text-sm font-black text-white/20 tracking-widest uppercase">Pitbox Empty</p>
                        <p className="text-[10px] text-white/10 tracking-widest uppercase mt-2">Add some fuel to your order</p>
                      </div>
                      <button
                        onClick={closeCart}
                        className="btn-racing text-[10px] px-6 py-2"
                      >
                        Browse Menu
                      </button>
                    </motion.div>
                  ) : (
                    items.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.size || 'default'}-${item.isSubscription ? 'sub' : 'oneoff'}-${item.eventDate || 'nodate'}`}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="glass border-white/5 rounded-xl p-4 flex gap-4 group hover:border-racing-red/20 transition-all"
                      >
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="w-full">
                              <p className="font-orbitron text-[11px] font-black text-white tracking-wider truncate">{item.product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] text-white/40 tracking-widest uppercase">
                                  {item.product.category} {item.size && `• Size: ${item.size}`}
                                </span>
                                {item.eventDate && (
                                  <span className="px-1.5 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded text-[7px] text-yellow-400 tracking-widest uppercase flex items-center gap-1">
                                    DATE: {item.eventDate}
                                  </span>
                                )}
                                {item.product.stats && (
                                  <span className="px-1.5 py-0.5 bg-racing-red/10 border border-racing-red/20 rounded text-[7px] text-racing-red tracking-widest uppercase flex items-center gap-1">
                                    <Zap size={8} /> {item.product.stats.intensity || 'OPT'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => { removeItem(item.product.id, item.size, item.isSubscription, item.eventDate); playSound('click'); }}
                              className="p-1 text-white/20 hover:text-racing-red transition-colors flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Control */}
                            <div className="flex items-center gap-2 glass rounded-lg px-2 py-1 border-white/5">
                              <button
                                onClick={() => { updateQuantity(item.product.id, item.quantity - 1, item.size, item.isSubscription, item.eventDate); playSound('click'); }}
                                className="text-white/40 hover:text-white transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="font-orbitron text-[11px] font-black text-white w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => { updateQuantity(item.product.id, item.quantity + 1, item.size, item.isSubscription, item.eventDate); playSound('click'); }}
                                className="text-white/40 hover:text-white transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <span className="font-orbitron text-sm font-black text-racing-red">
                              €{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-white/5 p-6 space-y-4 bg-[#0a0a10]">
                  {/* Coupon section */}
                  <div className="py-1">
                    {appliedCoupon ? (
                      <div className="w-full py-2.5 px-4 rounded-xl border border-green-500/20 bg-green-500/5 text-green-400 font-orbitron text-[9px] font-black tracking-widest uppercase flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><CheckCircle size={10} /> Coupon PITSTOP15 Active (-15%)</span>
                        <button 
                          onClick={() => { removeCoupon(); playSound('click'); }} 
                          className="text-white/40 hover:text-white uppercase text-[8px] font-mono font-normal transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsGameOpen(true)}
                        className="w-full py-3 px-4 rounded-xl border border-dashed border-racing-red/40 bg-racing-red/5 hover:bg-racing-red/10 text-racing-red transition-all font-orbitron text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 group"
                      >
                        <Zap size={12} className="group-hover:scale-125 transition-transform text-racing-red" />
                        🏁 Win 15% Off: Take Pit Challenge
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-white/30 uppercase tracking-widest">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-orbitron font-black text-white/60">€{subtotal.toFixed(2)}</span>
                    </div>
                    {bundleDiscount > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-racing-red uppercase tracking-widest">
                        <span>Pit Stop Bundle (10% Off)</span>
                        <span className="font-orbitron font-black">-€{bundleDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {weatherDiscount > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-blue-400 uppercase tracking-widest">
                        <span>Track Condition: {weatherCondition?.toUpperCase()}</span>
                        <span className="font-orbitron font-black">-€{weatherDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {appliedCoupon && couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-green-400 uppercase tracking-widest">
                        <span>Tire-Change Coupon ({appliedCoupon})</span>
                        <span className="font-orbitron font-black">-€{couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-white/30 uppercase tracking-widest">
                      <span>Pit Stop Fee</span>
                      <span className="font-orbitron font-black text-green-400">FREE</span>
                    </div>
                    <div className="h-[1px] bg-white/5 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-orbitron text-xs font-black tracking-widest text-white uppercase">Total</span>
                      <span className="font-orbitron text-xl font-black text-racing-red">€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="flex items-center gap-2 text-[9px] text-white/30 uppercase tracking-widest">
                    <Zap size={10} className="text-racing-red animate-pulse" />
                    Secure PayPal checkout — end-to-end encrypted
                  </div>

                  {/* Checkout Button */}
                  <Link href="/checkout" onClick={() => { closeCart(); handleCheckout(); }}>
                    <button className="w-full btn-racing flex items-center justify-center gap-3 py-4 text-[11px]">
                      <span>PROCEED TO CHECKOUT</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>

                  <button
                    onClick={() => { closeCart(); playSound('click'); }}
                    className="w-full text-[10px] text-white/30 hover:text-white transition-colors font-orbitron tracking-widest uppercase"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PitStopGameModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
    </>
  );
}
