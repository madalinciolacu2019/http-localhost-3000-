'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap, Thermometer, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { products as baseProducts } from '@/lib/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Product } from '@/context/CartContext';

type DynamicProduct = Product & {
  stock_count: number;
  is_active: boolean;
};

const ProductCard = ({ product, onAdd }: { product: DynamicProduct; onAdd: () => void }) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock_count <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAdd();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <motion.div
      onMouseEnter={() => { if (!isOutOfStock) { setIsHovered(true); playSound('click'); } }}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group glass p-6 rounded-2xl border-white/5 transition-all duration-500 overflow-hidden ${
        isOutOfStock 
          ? 'opacity-40 border-red-500/10' 
          : 'hover:border-racing-red/50'
      }`}
    >
      {/* Background Glow */}
      {!isOutOfStock && (
        <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[100px] transition-all duration-500 opacity-20 ${
          product.color === 'red' ? 'bg-racing-red' : product.color === 'yellow' ? 'bg-pit-yellow' : 'bg-blue-500'
        } group-hover:opacity-40`} />
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-orbitron font-bold tracking-[0.2em] text-white/40 uppercase">{product.category}</span>
            <div className="font-orbitron text-racing-red font-black text-xl">€{product.price.toFixed(2)}</div>
          </div>

          {/* Product Image */}
          <div className="aspect-square w-full mb-6 relative flex items-center justify-center overflow-hidden rounded-xl bg-white/5">
            <img 
              src={product.image} 
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isOutOfStock 
                  ? 'grayscale opacity-30' 
                  : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'
              }`}
            />
            
            {isOutOfStock && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 text-center">
                <AlertTriangle size={24} className="text-racing-red mb-2 animate-bounce" />
                <span className="font-orbitron text-xs font-black tracking-widest text-racing-red uppercase">SOLD OUT</span>
                <span className="text-[8px] font-orbitron text-white/40 uppercase tracking-widest mt-1">Pitbox Depleted</span>
              </div>
            )}
            
            {/* Telemetry Overlay on Hover */}
            <AnimatePresence>
              {isHovered && !isOutOfStock && product.category !== 'Merchandise' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 p-4 flex flex-col justify-center bg-carbon-black/80 backdrop-blur-sm rounded-xl"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Zap size={12} className="text-racing-red" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Intensity</span>
                      </div>
                      <span className="font-orbitron text-[10px]">{product.stats.intensity}</span>
                    </div>
                    <div className="w-full h-[2px] bg-white/10 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: product.stats.intensity }} 
                        className="h-full bg-racing-red" 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Thermometer size={12} className="text-pit-yellow" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Temperature</span>
                      </div>
                      <span className="font-orbitron text-[10px]">{product.stats.heat}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <h3 className="font-orbitron text-xl font-bold mb-2 group-hover:text-racing-red transition-colors">{product.name}</h3>
          <p className="text-white/50 text-xs mb-8 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        <button 
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-between px-6 py-3 rounded-xl transition-all group/btn ${
            isOutOfStock
              ? 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
              : justAdded
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'glass hover:bg-racing-red border-white/5'
          }`}
          onClick={handleAdd}
        >
          <span className="font-orbitron text-[10px] font-black uppercase tracking-widest">
            {isOutOfStock ? 'SOLD OUT' : justAdded ? 'Added to Pitbox!' : 'Add to Order'}
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
    </motion.div>
  );
};

const MenuPage = () => {
  const [filter, setFilter] = useState('All');
  const [products, setProducts] = useState<DynamicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, totalItems, openCart } = useCart();
  const { playSound } = useSound();
  const categories = ['All', 'Espresso', 'Milk Based', 'Iced', 'Merchandise'];

  useEffect(() => {
    const syncMenuProducts = async () => {
      if (!isSupabaseConfigured) {
        // Load mock products from local storage variables
        const localList: DynamicProduct[] = [];
        baseProducts.forEach((p) => {
          const storedStock = localStorage.getItem(`stock_prod_${p.id}`);
          const storedPrice = localStorage.getItem(`price_prod_${p.id}`);
          const storedActive = localStorage.getItem(`active_prod_${p.id}`);

          const stock = storedStock !== null ? parseInt(storedStock) : 25;
          const price = storedPrice !== null ? parseFloat(storedPrice) : p.price;
          const is_active = storedActive !== null ? storedActive === 'true' : true;

          localList.push({
            ...p,
            stock_count: stock,
            price: price,
            is_active: is_active
          });
        });
        // Filter out de-listed items for the customers
        setProducts(localList.filter(p => p.is_active));
        setLoading(false);
      } else {
        try {
          const { data } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

          if (data) {
            const formatted: DynamicProduct[] = data.map((d: any) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              price: d.price,
              stock_count: d.stock_count ?? 15,
              description: d.description || '',
              image: d.metadata?.image || '/menu_espresso_turbo.png',
              color: d.metadata?.color || 'red',
              stats: d.metadata?.stats || { intensity: '85%', heat: '90°C' },
              is_active: d.metadata?.is_active ?? true
            }));
            setProducts(formatted.filter(p => p.is_active));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };

    syncMenuProducts();
    // Set up a regular poll to refresh stock levels instantly
    const interval = setInterval(syncMenuProducts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToOrder = (product: DynamicProduct) => {
    addItem(product);
    playSound('gear-shift');
  };

  return (
    <main className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-racing-red"></span>
            <span className="font-orbitron text-racing-red font-bold tracking-[0.3em] text-xs uppercase">The Fueling Station</span>
            <span className="w-12 h-[1px] bg-racing-red"></span>
          </div>
          <h1 className="font-orbitron text-5xl md:text-7xl font-black mb-6">PADDOCK MENU</h1>
          <p className="text-white/40 max-w-2xl mx-auto italic font-light">Optimize your internal performance with our high-pressure extraction systems.</p>
        </header>

        {/* Filter Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-2 rounded-full border transition-all font-orbitron text-[10px] font-black uppercase tracking-widest ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products
              .filter(p => filter === 'All' || p.category === filter)
              .map((product) => (
                <ProductCard key={product.id} product={product} onAdd={() => handleAddToOrder(product)} />
              ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-20 glass p-12 rounded-3xl border-racing-red/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-racing-red to-transparent" />
          <div className="relative z-10 text-center md:text-left">
            <h3 className="font-orbitron text-2xl font-black mb-2">PIT CREW SPECIALS</h3>
            <p className="text-white/50 text-sm">
              {totalItems > 0
                ? `You have ${totalItems} item${totalItems !== 1 ? 's' : ''} in your Pitbox. Ready to checkout?`
                : 'Add items to your Pitbox and get 20% off your first order.'}
            </p>
          </div>
          <button
            className="btn-racing"
            onClick={() => { openCart(); playSound('engine-rev'); }}
          >
            {totalItems > 0 ? `VIEW PITBOX (${totalItems})` : 'BROWSE MENU'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default MenuPage;
