'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Plus, Check, Heart, Ruler, Eye, 
  X, MessageSquare, Star, AlertTriangle, CheckCircle, Activity 
} from 'lucide-react';
import { useCart } from '@/frontend/context/CartContext';
import { useSound } from '@/frontend/context/SoundContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { products as baseProducts } from '@/shared/lib/products';
import { supabase, isSupabaseConfigured } from '@/shared/lib/supabase';
import SizeGuideModal from '@/frontend/components/SizeGuideModal';
import Product3DViewer from '@/frontend/components/Product3DViewer';
import TelemetryHUDInspector from '@/frontend/components/TelemetryHUDInspector';

type DynamicProduct = any & {
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

export default function MerchPage() {
  const { addItem, openCart } = useCart();
  const { playSound } = useSound();
  const { user, session } = useAuth();
  
  const [merchItems, setMerchItems] = useState<DynamicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  
  // Wishlist, Guides, and 3D states
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeGuideCategory, setSizeGuideCategory] = useState('apparel');
  const [active3DProduct, setActive3DProduct] = useState<DynamicProduct | null>(null);
  const [activeReviewsProduct, setActiveReviewsProduct] = useState<DynamicProduct | null>(null);
  const [activeInspectorProduct, setActiveInspectorProduct] = useState<DynamicProduct | null>(null);

  useEffect(() => {
    const syncMerchProducts = async () => {
      if (!isSupabaseConfigured) {
        const localList: DynamicProduct[] = [];
        baseProducts.forEach((p) => {
          const storedStock = localStorage.getItem(`stock_prod_${p.id}`);
          const storedPrice = localStorage.getItem(`price_prod_${p.id}`);
          const storedActive = localStorage.getItem(`active_prod_${p.id}`);

          const stock = storedStock !== null ? parseInt(storedStock) : 15;
          const price = storedPrice !== null ? parseFloat(storedPrice) : p.price;
          const is_active = storedActive !== null ? storedActive === 'true' : true;

          localList.push({
            ...p,
            stock_count: stock,
            price: price,
            is_active: is_active
          });
        });
        setMerchItems(localList.filter(p => p.category === 'Merchandise' && p.is_active));
        setLoading(false);
      } else {
        try {
          const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category', 'Merchandise')
            .order('id', { ascending: true });

          if (data) {
            const formatted = data.map((d: any) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              price: d.price,
              stock_count: d.stock_count ?? 15,
              description: d.description || '',
              image: d.metadata?.image || '/merch_tshirt.png',
              color: d.metadata?.color || 'red',
              stats: d.metadata?.stats || { intensity: 'N/A', heat: 'N/A' },
              is_active: d.metadata?.is_active ?? true
            }));
            setMerchItems(formatted.filter(p => p.is_active));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };

    syncMerchProducts();

    // Fetch user wishlist
    if (user) {
      fetch(`/api/wishlist?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.wishlist) setWishlist(data.wishlist);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleSizeSelect = (productId: number, size: string) => {
    playSound('click');
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const isApparel = (name: string) => ['Cap', 'Hoodie', 'T-Shirt', 'Gloves'].some(k => name.includes(k));

  const handleAddToCart = (item: any) => {
    if (item.stock_count <= 0) return;
    if (isApparel(item.name) && !selectedSizes[item.id]) {
      return;
    }
    
    const size = isApparel(item.name) ? selectedSizes[item.id] : undefined;
    
    playSound('scanner');
    addItem(item, size);
    openCart();
    
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleToggleWishlist = async (productId: number) => {
    playSound('click');
    
    if (!user) {
      // Local mock toggle if no user logged in
      setWishlist(prev => 
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ userId: user.id, productId })
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(prev => 
          prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSizeGuide = (itemCategory: string) => {
    playSound('click');
    setSizeGuideCategory(itemCategory.toLowerCase().includes('glove') ? 'gloves' : 'apparel');
    setIsSizeGuideOpen(true);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-orbitron text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-red to-orange-600">APEX</span> GEAR
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto font-light tracking-wide">
            Official team merchandise. Buy any gear with a coffee and get a 10% Pit Stop Bundle discount.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 font-orbitron text-white/30 text-xs animate-pulse">
            Syncing Gear Catalog Telemetry...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {merchItems.map((item, index) => {
              const isAdded = addedItems[item.id];
              const needsSize = isApparel(item.name);
              const hasSize = !!selectedSizes[item.id];
              const canAdd = (!needsSize || hasSize) && item.stock_count > 0;
              const isOutOfStock = item.stock_count <= 0;
              const isLowStock = item.stock_count > 0 && item.stock_count < 5;
              const isWished = wishlist.includes(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-2xl p-6 border-white/5 hover:border-racing-red/30 transition-all group flex flex-col justify-between ${
                    isOutOfStock ? 'opacity-40 border-red-500/10' : ''
                  }`}
                >
                  <div>
                    {/* Image viewport */}
                    <div className="relative aspect-square mb-6 rounded-xl overflow-hidden bg-white/5">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                      
                      {/* Wishlist toggle */}
                      <button
                        onClick={() => handleToggleWishlist(item.id)}
                        className={`absolute top-4 left-4 z-20 p-2 rounded-full border transition-all ${
                          isWished 
                            ? 'bg-racing-red/20 border-racing-red text-racing-red' 
                            : 'bg-black/60 border-white/10 text-white/40 hover:text-white'
                        }`}
                      >
                        <Heart size={14} fill={isWished ? 'currentColor' : 'none'} />
                      </button>

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-4 right-4 z-20">
                        <span className="font-orbitron font-black text-xl text-white shadow-black drop-shadow-md">
                          €{item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Stock overlay flags */}
                      {isOutOfStock ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px] z-20 p-4 text-center">
                          <AlertTriangle size={24} className="text-racing-red mb-2 animate-bounce" />
                          <span className="font-orbitron text-xs font-black tracking-widest text-racing-red uppercase">DEPLETED</span>
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                          <span className="font-orbitron text-[7px] font-black uppercase tracking-widest bg-yellow-500/25 border border-yellow-500/50 text-yellow-400 px-2 py-0.5 rounded animate-pulse">
                            LOW STOCK ({item.stock_count})
                          </span>
                        </div>
                      ) : null}

                      {/* Inspect 3D and Telemetry Overlay buttons */}
                      {!isOutOfStock && (
                        <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                          <button 
                            onClick={() => { playSound('click'); setActive3DProduct(item); }}
                            className="bg-black/60 border border-white/10 hover:border-racing-red/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[7px] font-orbitron font-black uppercase tracking-widest text-white/50 hover:text-white transition-all shadow-lg"
                          >
                            <Eye size={11} className="text-racing-red" />
                            <span>3D</span>
                          </button>
                          <button 
                            onClick={() => { playSound('click'); setActiveInspectorProduct(item); }}
                            className="bg-black/60 border border-white/10 hover:border-racing-red/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[7px] font-orbitron font-black uppercase tracking-widest text-white/50 hover:text-white transition-all shadow-lg"
                          >
                            <Activity size={11} className="text-racing-red animate-pulse" />
                            <span>Telemetry</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-orbitron font-bold text-base tracking-wide uppercase truncate max-w-[150px]">{item.name}</h3>
                      
                      <button
                        onClick={() => { playSound('click'); setActiveReviewsProduct(item); }}
                        className="flex items-center gap-1 text-white/30 hover:text-yellow-400 transition-colors"
                      >
                        <Star size={11} fill="currentColor" className="text-yellow-400" />
                        <span className="text-[8px] font-orbitron font-black uppercase">Debriefs</span>
                      </button>
                    </div>

                    <p className="text-xs text-white/50 mb-6 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {needsSize && !isOutOfStock && (
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center text-[8px] font-orbitron font-bold text-white/40 uppercase">
                          <span>SELECT SIZE</span>
                          <button 
                            onClick={() => handleOpenSizeGuide(item.name)} 
                            className="text-racing-red hover:underline tracking-widest flex items-center gap-1 cursor-pointer"
                          >
                            <Ruler size={10} />
                            <span>Size Guide</span>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {['S', 'M', 'L', 'XL'].map(size => (
                            <button
                              key={size}
                              onClick={() => handleSizeSelect(item.id, size)}
                              className={`flex-1 py-2 font-orbitron text-xs font-black tracking-widest rounded-lg transition-colors border ${
                                selectedSizes[item.id] === size
                                  ? 'bg-racing-red border-racing-red text-white'
                                  : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!canAdd}
                    className={`w-full py-4 rounded-xl font-orbitron text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all mt-4 ${
                      isAdded
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : canAdd
                        ? 'btn-racing'
                        : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={18} />
                        <span>ADDED</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        <span>{isOutOfStock ? 'OUT OF STOCK' : needsSize && !hasSize ? 'SELECT SIZE' : 'ADD TO PITBOX'}</span>
                      </>
                    )}
                  </button>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sizing guide popups */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={sizeGuideCategory}
      />

      {/* Interactive 3D Model Modal Inspect Canvas */}
      <AnimatePresence>
        {active3DProduct && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass w-full max-w-lg rounded-2xl border-white/10 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
              
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-orbitron font-black text-racing-red uppercase block">COCKPIT INSPECTION</span>
                  <h3 className="font-orbitron font-black text-sm text-white">{active3DProduct.name}</h3>
                </div>
                <button 
                  onClick={() => { playSound('click'); setActive3DProduct(null); }} 
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6">
                <Product3DViewer 
                  category={active3DProduct.category} 
                  color={active3DProduct.color} 
                  name={active3DProduct.name} 
                />
                
                <p className="text-[10px] text-white/40 font-orbitron uppercase text-center mt-6 tracking-wide leading-relaxed">
                  🔬 Precision Telemetry inspection view. Click and drag model to inspect materials.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Reviews Debrief Modal */}
      {activeReviewsProduct && (
        <ReviewsModal 
          product={activeReviewsProduct}
          isOpen={!!activeReviewsProduct}
          onClose={() => setActiveReviewsProduct(null)}
        />
      )}

      {/* Telemetry HUD Inspector Modal */}
      {activeInspectorProduct && (
        <TelemetryHUDInspector 
          product={activeInspectorProduct}
          onClose={() => setActiveInspectorProduct(null)}
        />
      )}

    </main>
  );
}
