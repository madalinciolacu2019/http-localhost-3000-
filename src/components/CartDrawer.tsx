'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const { playSound } = useSound();

  const handleCheckout = () => {
    playSound('engine-rev');
  };

  return (
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
                      key={item.product.id}
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
                          <div>
                            <p className="font-orbitron text-[11px] font-black text-white tracking-wider truncate">{item.product.name}</p>
                            <p className="text-[9px] text-white/30 tracking-widest uppercase mt-0.5">{item.product.category}</p>
                          </div>
                          <button
                            onClick={() => { removeItem(item.product.id); playSound('click'); }}
                            className="p-1 text-white/20 hover:text-racing-red transition-colors flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Control */}
                          <div className="flex items-center gap-2 glass rounded-lg px-2 py-1 border-white/5">
                            <button
                              onClick={() => { updateQuantity(item.product.id, item.quantity - 1); playSound('click'); }}
                              className="text-white/40 hover:text-white transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-orbitron text-[11px] font-black text-white w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => { updateQuantity(item.product.id, item.quantity + 1); playSound('click'); }}
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
              <div className="border-t border-white/5 p-6 space-y-6 bg-[#0a0a10]">
                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-white/30 uppercase tracking-widest">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-orbitron font-black text-white/60">€{totalPrice.toFixed(2)}</span>
                  </div>
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
                  Secure Stripe checkout — end-to-end encrypted
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
  );
}
