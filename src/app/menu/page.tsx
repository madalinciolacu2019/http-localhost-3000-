'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Zap, Thermometer, CheckCircle, AlertTriangle, 
  Star, MessageSquare, X, Cpu, Sparkles, Activity 
} from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';
import { useCart } from '@/frontend/context/CartContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { useDatabase } from '@/frontend/context/DatabaseContext';
import { products as baseProducts } from '@/shared/lib/products';
import { supabase, isSupabaseConfigured } from '@/shared/lib/supabase';
import type { Product } from '@/shared/lib/products';
import SizeGuideModal from '@/frontend/components/SizeGuideModal';
import TelemetryHUDInspector from '@/frontend/components/TelemetryHUDInspector';
import Card3D from '@/frontend/components/Card3D';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

type DynamicProduct = Product & {
  stock_count: number;
  is_active: boolean;
};

// Reviews Modal Component
interface ReviewsModalProps {
  product: DynamicProduct;
  isOpen: boolean;
  onClose: () => void;
}

function ReviewsModal({ product, isOpen, onClose }: ReviewsModalProps) {
  const { playSound } = useSound();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [isOpen, product.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    setIsSubmitting(true);
    playSound('scanner');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment,
          userName: name
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => [data.review, ...prev]);
        setComment('');
        setName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass w-full max-w-lg rounded-2xl border-white/10 overflow-hidden relative flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-racing-red" />
            <h3 className="font-orbitron font-black text-sm tracking-wider text-white uppercase">{product.name} Reviews</h3>
          </div>
          <button 
            onClick={() => { playSound('click'); onClose(); }} 
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Reviews list */}
          <div className="space-y-4">
            <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-widest block">TELEMETRY DEBRIEFS</span>
            
            {loading ? (
              <div className="text-center py-6 font-orbitron text-xs text-white/20 animate-pulse">Syncing debrief logs...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-xl text-white/30 text-[10px] font-orbitron uppercase">No driver debriefs logged yet</div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, idx) => (
                  <div key={idx} className="border border-white/5 bg-white/2 p-3.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-orbitron font-bold text-xs text-white uppercase">{r.user_name}</span>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-white/50 font-orbitron leading-relaxed uppercase">{r.comment}</p>
                    <span className="text-[8px] text-white/20 font-mono block text-right">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review form */}
          <form onSubmit={handleSubmit} className="border-t border-white/5 pt-6 space-y-4">
            <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-widest block">LOG YOUR DEBRIEF</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] text-white/40 font-orbitron uppercase block mb-1">Driver Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. L. Hamilton"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red"
                  required
                />
              </div>
              <div>
                <label className="text-[8px] text-white/40 font-orbitron uppercase block mb-1">Star Rating</label>
                <div className="flex gap-1.5 h-9 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => { playSound('click'); setRating(star); }}
                      className="text-yellow-400 hover:scale-125 transition-transform"
                    >
                      <Star size={16} fill={rating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[8px] text-white/40 font-orbitron uppercase block mb-1">Telemetry Comments</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Share your driving telemetry feedback..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-racing-red text-white rounded-xl font-orbitron text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Logging Debrief...' : 'Submit Debrief'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const ProductCard = ({ product, onAdd, onInspect, isVip }: { product: DynamicProduct; onAdd: () => void; onInspect: () => void; isVip: boolean }) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const isOutOfStock = product.stock_count <= 0;
  const isLowStock = product.stock_count > 0 && product.stock_count < 5;

  const isLocked = product.is_vip_only && !isVip;

  const handleAdd = () => {
    if (isOutOfStock || isLocked) return;
    onAdd();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Card3D className="h-full">
      <motion.div
        onMouseEnter={() => { if (!isOutOfStock) { setIsHovered(true); playSound('click'); } }}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative group glass p-4 md:p-6 rounded-2xl border-white/5 transition-all duration-500 overflow-hidden h-full flex flex-col ${
          isOutOfStock 
            ? 'opacity-40 border-red-500/10' 
            : isLocked 
              ? 'opacity-80 border-yellow-500/20'
              : 'hover:border-racing-red/50'
        }`}
      >
        {/* Background Glow */}
        {!isOutOfStock && (
          <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[100px] transition-all duration-500 opacity-20 ${
            product.color === 'red' ? 'bg-racing-red' : product.color === 'yellow' ? 'bg-pit-yellow' : 'bg-blue-500'
          } group-hover:opacity-40 pointer-events-none`} />
        )}

        {/* Flashing Low Stock Indicator */}
        {isLowStock && (
          <div className="absolute top-4 left-4 z-20">
            <span className="font-orbitron font-black text-[8px] bg-yellow-500/25 border border-yellow-500/50 text-yellow-400 px-2 py-0.5 rounded animate-pulse">
              LOW FUEL WARNING ({product.stock_count} Left)
            </span>
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div>
                <span className="text-[10px] font-orbitron font-bold tracking-[0.2em] text-white/40 uppercase block mb-1">{product.category}</span>
                
                {/* Star reviews rating bar trigger */}
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('click'); setIsReviewsOpen(true); }}
                  className="flex items-center gap-1 group/stars"
                >
                  <div className="flex text-yellow-400">
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" className="opacity-40" />
                  </div>
                  <span className="text-[8px] font-orbitron font-black text-white/40 group-hover/stars:text-yellow-400 transition-colors uppercase">Debriefs</span>
                </button>
              </div>
              <div className="font-orbitron text-racing-red font-black text-lg md:text-xl">€{product.price.toFixed(2)}</div>
            </div>

            {/* Product Image */}
            <div className="aspect-square w-full mb-4 md:mb-6 relative flex items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/5">
              <img 
                src={product.image} 
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isOutOfStock 
                    ? 'grayscale opacity-30' 
                    : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'
                }`}
              />
              
              {isOutOfStock && !isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 text-center">
                  <AlertTriangle size={24} className="text-racing-red mb-2 animate-bounce" />
                  <span className="font-orbitron text-xs font-black tracking-widest text-racing-red uppercase">SOLD OUT</span>
                  <span className="text-[8px] font-orbitron text-white/40 uppercase tracking-widest mt-1">Pitbox Depleted</span>
                </div>
              )}
              
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center border-2 border-yellow-500/50 rounded-xl">
                  <Star size={32} className="text-yellow-400 mb-2 animate-pulse" />
                  <span className="font-orbitron text-xs font-black tracking-widest text-yellow-400 uppercase">VIP EXCLUSIVE</span>
                  <Link href="/vip" className="mt-4 px-4 py-2 bg-yellow-500 text-black text-[10px] font-orbitron font-black uppercase rounded hover:bg-yellow-400 transition-colors">
                    Upgrade to Unlock
                  </Link>
                </div>
              )}
              

            </div>

            <h3 className="font-orbitron text-lg md:text-xl font-bold mb-2 group-hover:text-racing-red transition-colors">{product.name}</h3>
            <p className="text-white/50 text-[10px] md:text-xs mb-4 md:mb-8 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>

          <button 
            disabled={isOutOfStock || isLocked}
            className={`w-full flex items-center justify-between px-4 py-3 md:px-6 rounded-xl transition-all group/btn ${
              isOutOfStock
                ? 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                : isLocked
                  ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/50 cursor-not-allowed'
                  : justAdded
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'glass hover:bg-racing-red border-white/5'
            }`}
            onClick={handleAdd}
          >
            <span className="font-orbitron text-[10px] font-black uppercase tracking-widest">
              {isOutOfStock ? 'SOLD OUT' : isLocked ? 'LOCKED' : justAdded ? 'Added to Pitbox!' : 'Add to Order'}
            </span>
            {isOutOfStock ? (
              <AlertTriangle size={14} className="text-white/20" />
            ) : justAdded ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : (
              <ShoppingCart size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            )}
          </button>
        </div>

        {/* Embedded Reviews Modal */}
        <ReviewsModal 
          product={product} 
          isOpen={isReviewsOpen} 
          onClose={() => setIsReviewsOpen(false)} 
        />
      </motion.div>
    </Card3D>
  );
};

const MenuPage = () => {
  const [filter, setFilter] = useState('All');
  const [products, setProducts] = useState<DynamicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInspectorProduct, setActiveInspectorProduct] = useState<DynamicProduct | null>(null);
  const [dateSelectionProduct, setDateSelectionProduct] = useState<DynamicProduct | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { addItem, totalItems, openCart } = useCart();
  const { user } = useAuth();
  const { playSound } = useSound();
  const categories = ['All', 'Espresso', 'Milk Based', 'Iced', 'Pastries', 'Merchandise'];

  const isVip = user?.user_metadata?.is_vip === true;

  const { products: dbProducts } = useDatabase();

  useEffect(() => {
    // Map DatabaseContext products to DynamicProduct format needed by the Menu UI
    const mappedProducts: DynamicProduct[] = dbProducts.map(p => {
      const baseProduct = baseProducts.find(b => b.id.toString() === p.id) || {} as any;
      return {
        ...baseProduct,
        ...p,
        id: p.id,
        category: baseProduct.category || p.type,
        stock_count: 50, // Infinite stock for now
        is_active: !p.locked,
        color: baseProduct.color || 'red',
        is_vip_only: baseProduct.is_vip_only || false,
        requires_date: baseProduct.requires_date || false,
        fixed_date: baseProduct.fixed_date || undefined
      };
    }) as unknown as DynamicProduct[];

    setProducts(mappedProducts.filter(p => p.is_active));
    setLoading(false);
  }, [dbProducts]);



  const handleAddToOrder = (product: DynamicProduct) => {
    if (product.requires_date) {
      setDateSelectionProduct(product);
      setSelectedDate('');
    } else if (product.fixed_date) {
      addItem(product, undefined, false, product.fixed_date);
      playSound('gear-shift');
    } else {
      addItem(product);
      playSound('gear-shift');
    }
  };

  const confirmDateSelection = () => {
    if (dateSelectionProduct && selectedDate) {
      addItem(dateSelectionProduct, undefined, false, selectedDate);
      playSound('gear-shift');
      setDateSelectionProduct(null);
    }
  };



  return (
    <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-racing-red"></span>
            <span className="font-orbitron text-racing-red font-bold tracking-[0.3em] text-xs uppercase">The Fueling Station</span>
            <span className="w-12 h-[1px] bg-racing-red"></span>
          </div>
          <h1 className="font-orbitron text-4xl md:text-7xl font-black mb-6">PADDOCK MENU</h1>
          <p className="text-white/40 max-w-2xl mx-auto italic font-light">Optimize your internal performance with our high-pressure extraction systems.</p>
        </header>

        {/* Date Selection Modal */}
        <AnimatePresence>
          {dateSelectionProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-black border border-yellow-500/50 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(255,215,0,0.2)]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-orbitron font-black text-xl text-white uppercase tracking-wider">Select Event Date</h2>
                    <p className="text-white/50 text-xs font-mono mt-1">{dateSelectionProduct.name}</p>
                  </div>
                  <button onClick={() => setDateSelectionProduct(null)} className="text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="text-[10px] text-white/40 font-orbitron uppercase block mb-2">Target Date</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 color-scheme-dark"
                    style={{ colorScheme: 'dark' }}
                  />
                  <p className="text-white/30 text-[9px] mt-2 font-mono">Date selections are subject to availability. Our concierge will confirm your slot within 24 hours.</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setDateSelectionProduct(null)}
                    className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDateSelection}
                    disabled={!selectedDate}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-orbitron text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                  >
                    Confirm & Add
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Navigation */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 md:px-8 py-2 rounded-full border transition-all font-orbitron text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                filter === cat 
                ? 'bg-racing-red border-racing-red text-white shadow-[0_0_15px_rgba(225,6,0,0.5)]' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 font-orbitron text-white/30 text-xs animate-pulse">
            Syncing Menu Telemetry...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products
                .filter(p => !p.is_vip_only)
                .filter(p => filter === 'All' || p.category === filter)
                .map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    onAdd={() => handleAddToOrder(product)} 
                    onInspect={() => {
                      playSound('gear-shift');
                      setActiveInspectorProduct(product);
                    }}
                    isVip={isVip}
                  />
                ))}
            </div>

            {/* VIP Exclusive Section */}
            {(filter === 'All' || filter === 'Merchandise') && (
              <div className="mt-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
                  <h2 className="font-orbitron font-black text-2xl tracking-widest text-yellow-400 flex items-center gap-3">
                    <Star size={24} className="text-yellow-400" />
                    PADDOCK CLUB EXCLUSIVES
                    <Star size={24} className="text-yellow-400" />
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
                </div>
                
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${!isVip ? 'opacity-90' : ''}`}>
                  {products
                    .filter(p => p.is_vip_only)
                    .map((product) => (
                      <ProductCard 
                        key={product.id}
                        product={product} 
                        onAdd={() => handleAddToOrder(product)} 
                        onInspect={() => {
                          playSound('gear-shift');
                          setActiveInspectorProduct(product);
                        }}
                        isVip={isVip}
                      />
                    ))}
                </div>
              </div>
            )}

            {products.filter(p => filter === 'All' || p.category === filter).length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                <div className="p-8 bg-white/5 rounded-full border border-white/5">
                  <AlertTriangle size={48} className="text-white/20" />
                </div>
                <div>
                  <p className="font-orbitron text-sm font-black text-white/30 tracking-widest uppercase">No Items Found</p>
                  <p className="text-[10px] text-white/20 tracking-widest uppercase mt-2">No products match the <span className="text-racing-red">{filter}</span> category</p>
                </div>
                <button
                  onClick={() => { setFilter('All'); playSound('click'); }}
                  className="btn-racing text-[10px] px-6 py-2"
                >
                  RESET FILTER
                </button>
              </div>
            )}
          </>
        )}


      </div>
      {activeInspectorProduct && (
        <TelemetryHUDInspector
          product={activeInspectorProduct}
          onClose={() => setActiveInspectorProduct(null)}
        />
      )}
    </main>
  );
};

export default MenuPage;
