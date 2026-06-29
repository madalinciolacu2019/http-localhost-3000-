'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, Edit3, Save, TrendingUp, AlertTriangle, 
  RotateCw, Plus, Minus, Check, Layers, DollarSign 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { products as baseProducts } from '@/lib/products';
import { useSound } from '@/context/SoundContext';

type AdminProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock_count: number;
  description: string;
  image: string;
  stats?: { intensity: string; heat: string };
  color: string;
  is_active: boolean;
  printful_variant_id?: string;
};

export default function AdminProductsPage() {
  const { playSound } = useSound();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editVariantId, setEditVariantId] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync products state
  useEffect(() => {
    const syncProducts = async () => {
      if (!isSupabaseConfigured) {
        // Mock DB using LocalStorage
        const localList: AdminProduct[] = [];
        baseProducts.forEach((p) => {
          const storedStock = localStorage.getItem(`stock_prod_${p.id}`);
          const storedPrice = localStorage.getItem(`price_prod_${p.id}`);
          const storedActive = localStorage.getItem(`active_prod_${p.id}`);

          const stock = storedStock !== null ? parseInt(storedStock) : 25;
          const price = storedPrice !== null ? parseFloat(storedPrice) : p.price;
          const is_active = storedActive !== null ? storedActive === 'true' : true;

          localList.push({
            ...p,
            description: p.description || '',
            stock_count: stock,
            price: price,
            is_active: is_active,
            printful_variant_id: p.metadata?.printful_variant_id || ''
          });
        });
        setProducts(localList);
        setLoading(false);
      } else {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

          if (data) {
            const formatted: AdminProduct[] = data.map((d: any) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              price: d.price,
              stock_count: d.stock_count ?? 15,
              description: d.description || '',
              image: d.metadata?.image || '/menu_espresso_turbo.png',
              color: d.metadata?.color || 'red',
              is_active: d.metadata?.is_active ?? true,
              printful_variant_id: d.metadata?.printful_variant_id || ''
            }));
            setProducts(formatted);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };

    syncProducts();
  }, []);

  const handleStockAdjust = async (id: number, delta: number) => {
    playSound('click');
    const updated = products.map(p => {
      if (p.id === id) {
        const nextStock = Math.max(0, p.stock_count + delta);
        updateStorageOrDb(id, { stock_count: nextStock });
        return { ...p, stock_count: nextStock };
      }
      return p;
    });
    setProducts(updated);
  };

  const handleToggleActive = (id: number) => {
    playSound('click');
    const updated = products.map(p => {
      if (p.id === id) {
        const nextActive = !p.is_active;
        updateStorageOrDb(id, { is_active: nextActive });
        return { ...p, is_active: nextActive };
      }
      return p;
    });
    setProducts(updated);
  };

  const handleStartEdit = (p: AdminProduct) => {
    playSound('click');
    setEditingId(p.id);
    setEditPrice(p.price.toFixed(2));
    setEditVariantId(p.printful_variant_id || '');
  };

  const handleSavePrice = async (id: number) => {
    const newVariantId = editVariantId;
    playSound('gear-shift');
    const newPriceVal = parseFloat(editPrice);
    if (isNaN(newPriceVal) || newPriceVal <= 0) return;

    const updated = products.map(p => {
      if (p.id === id) {
        updateStorageOrDb(id, { price: newPriceVal, printful_variant_id: newVariantId });
        return { ...p, price: newPriceVal, printful_variant_id: newVariantId };
      }
      return p;
    });
    setProducts(updated);
    setEditingId(null);
    showToast('Catalog updated: New pricing applied');
  };

  const handleRestockShipment = () => {
    playSound('engine-rev');
    const updated = products.map(p => {
      const nextStock = p.stock_count + 50;
      updateStorageOrDb(p.id, { stock_count: nextStock });
      return { ...p, stock_count: nextStock };
    });
    setProducts(updated);
    showToast('RESTOCK: Applied +50 units to all ingredients');
  };

  const updateStorageOrDb = async (id: number, updates: { stock_count?: number; price?: number; is_active?: boolean; printful_variant_id?: string }) => {
    if (!isSupabaseConfigured) {
      if (updates.stock_count !== undefined) {
        localStorage.setItem(`stock_prod_${id}`, updates.stock_count.toString());
      }
      if (updates.price !== undefined) {
        localStorage.setItem(`price_prod_${id}`, updates.price.toString());
      }
      if (updates.is_active !== undefined) {
        localStorage.setItem(`active_prod_${id}`, updates.is_active.toString());
      }
    } else {
      const { data: dbItem } = await supabase.from('products').select('metadata').eq('id', id).single();
      const nextMeta = { ...(dbItem?.metadata || {}) };
      if (updates.is_active !== undefined) nextMeta.is_active = updates.is_active;
      if (updates.printful_variant_id !== undefined) nextMeta.printful_variant_id = updates.printful_variant_id;
      if (updates.printful_variant_id !== undefined) nextMeta.printful_variant_id = updates.printful_variant_id;

      const dbUpdates: any = {};
      if (updates.stock_count !== undefined) dbUpdates.stock_count = updates.stock_count;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.is_active !== undefined) dbUpdates.metadata = nextMeta;

      await supabase.from('products').update(dbUpdates).eq('id', id);
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Metrics
  const lowStockThreshold = 10;
  const lowStockItems = products.filter(p => p.stock_count < lowStockThreshold);
  const outOfStockItems = products.filter(p => p.stock_count === 0);

  return (
    <div className="space-y-8 relative pb-20">
      {/* Toast Alert */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] glass px-5 py-3 rounded-xl border border-racing-red bg-black/95 shadow-[0_0_30px_rgba(225,6,0,0.3)] flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-racing-red animate-ping shrink-0" />
            <span className="font-orbitron text-[11px] font-black tracking-widest text-white uppercase">
              {feedbackToast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1px] bg-racing-red" />
            <span className="font-orbitron text-[9px] font-black tracking-widest text-racing-red uppercase">Race Control Supply Chain</span>
          </div>
          <h1 className="text-4xl font-orbitron font-black italic">STOCK & INVENTORY</h1>
        </div>

        <button 
          onClick={handleRestockShipment}
          className="btn-racing flex items-center gap-2 !py-2.5 !px-5 !text-[10px]"
        >
          <RotateCw size={12} />
          <span>RECEIVE RESTOCK SHIPMENT</span>
        </button>
      </div>

      {/* Critical Warnings */}
      {lowStockItems.length > 0 && (
        <div className="bg-racing-red/10 border border-racing-red/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-racing-red shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="font-orbitron text-[11px] font-black tracking-wider text-racing-red uppercase">Depleted Stock Warning</div>
            <p className="text-[10px] text-white/50 font-orbitron mt-1 leading-relaxed">
              The following ingredients are below the safe threshold of {lowStockThreshold} units and risk locking out user ordering: 
              <span className="text-white font-bold ml-1">
                {lowStockItems.map(p => `${p.name} (${p.stock_count})`).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Grid of Product Cards */}
      {loading ? (
        <div className="glass p-12 text-center rounded-2xl border-white/5 font-orbitron text-white/30 text-xs animate-pulse">
          Synchronizing Live Supply Logistics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`glass p-6 rounded-2xl border transition-all relative overflow-hidden group flex flex-col justify-between ${
                product.stock_count === 0 
                  ? 'border-red-500/20 bg-red-950/5' 
                  : product.stock_count < lowStockThreshold 
                    ? 'border-yellow-500/20 bg-yellow-950/5' 
                    : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                {/* Header indicators */}
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] font-orbitron font-bold tracking-[0.2em] text-white/40 uppercase">{product.category}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(product.id)}
                      className={`px-2 py-0.5 rounded text-[8px] font-orbitron font-black uppercase tracking-wider border ${
                        product.is_active 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                          : 'bg-white/5 border-white/10 text-white/30'
                      }`}
                    >
                      {product.is_active ? 'Listed' : 'Delisted'}
                    </button>
                    
                    <span className={`px-2 py-0.5 border rounded text-[8px] font-orbitron font-black uppercase tracking-wider ${
                      product.stock_count === 0 
                        ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                        : product.stock_count < lowStockThreshold 
                          ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' 
                          : 'bg-green-500/20 border-green-500/30 text-green-400'
                    }`}>
                      {product.stock_count === 0 ? 'Out of Stock' : product.stock_count < lowStockThreshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex gap-4 items-start mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-60" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white group-hover:text-racing-red transition-colors">{product.name}</h3>
                    
                    {/* Price editor block */}
                    {editingId === product.id ? (
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-1">
                          <span className="text-white/40 font-mono text-[9px] uppercase w-16">Price</span>
                          <span className="text-white/40 font-mono text-xs">€</span>
                          <input
                            type="text"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="bg-white/5 border border-white/20 rounded px-1.5 py-0.5 font-mono text-xs text-white w-16 focus:outline-none focus:border-racing-red"
                          />
                        </div>
                        {product.category === 'Merchandise' && (
                          <div className="flex items-center gap-1">
                            <span className="text-white/40 font-mono text-[9px] uppercase w-16">Printful ID</span>
                            <input
                              type="text"
                              value={editVariantId}
                              onChange={(e) => setEditVariantId(e.target.value)}
                              placeholder="e.g. 11342"
                              className="bg-white/5 border border-white/20 rounded px-1.5 py-0.5 font-mono text-xs text-white w-20 focus:outline-none focus:border-racing-red"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => handleSavePrice(product.id)}
                          className="w-full mt-1 p-1.5 bg-green-500 text-white text-[10px] uppercase font-black tracking-wider rounded hover:bg-green-600 transition-colors flex justify-center items-center gap-2"
                        >
                          <Check size={12} /> Save Changes
                        </button>
                      </div>

                    ) : (
                      <div className="flex items-center gap-2 mt-1.5">
                        
                        <div className="flex flex-col">
                          
                        <div className="flex flex-col">
                          <span className="font-orbitron font-black text-racing-red text-sm">€{product.price.toFixed(2)}</span>
                          {product.category === 'Merchandise' && product.printful_variant_id && (
                            <span className="text-[8px] font-mono text-white/40 mt-1">Printful ID: {product.printful_variant_id}</span>
                          )}
                          {product.category === 'Merchandise' && !product.printful_variant_id && (
                            <span className="text-[8px] font-mono text-yellow-500 mt-1">Printful ID: Missing!</span>
                          )}
                        </div>

                          {product.category === 'Merchandise' && product.printful_variant_id && (
                            <span className="text-[8px] font-mono text-white/40 mt-1">Printful ID: {product.printful_variant_id}</span>
                          )}
                          {product.category === 'Merchandise' && !product.printful_variant_id && (
                            <span className="text-[8px] font-mono text-yellow-500 mt-1">Printful ID: Missing!</span>
                          )}
                        </div>

                        <button 
                          onClick={() => handleStartEdit(product)}
                          className="text-white/20 hover:text-white transition-colors"
                        >
                          <Edit3 size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock control sliders/counters */}
              <div className="border-t border-white/5 pt-4 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-orbitron text-[9px] font-black uppercase tracking-widest text-white/30">Stock Level</span>
                  <span className="font-mono font-bold text-sm text-white">{product.stock_count} units</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStockAdjust(product.id, -1)}
                    className="flex-1 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    onClick={() => handleStockAdjust(product.id, 1)}
                    className="flex-1 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => handleStockAdjust(product.id, 10)}
                    className="py-1.5 px-3 bg-white/5 border border-white/10 rounded-lg text-[9px] font-orbitron font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
