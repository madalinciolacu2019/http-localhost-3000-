'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as baseProducts } from '@/lib/products';

export type OrderStatus = 'QUEUE' | 'ROASTING' | 'SHIPPED' | 'COMPLETED';

export interface Order {
  id: string;
  customer: string;
  blend: string;
  status: OrderStatus;
  time: string;
  price?: number;
}

export interface Setup {
  id: string;
  author: string;
  name: string;
  force: number;
  heat: number;
  upvotes: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  locked: boolean;
  intensity: number;
  type: string;
  tags: string[];
}

export interface BusinessStats {
  revenue: number;
  trafficMultiplier: number;
  unlockedResearch: string[];
}

interface DatabaseContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updateOrderStatus: (id: string, newStatus: OrderStatus) => void;
  addOrder: (order: Omit<Order, 'id' | 'time'>) => void;
  
  setups: Setup[];
  setSetups: React.Dispatch<React.SetStateAction<Setup[]>>;
  upvoteSetup: (id: string) => void;
  publishSetup: (setup: Omit<Setup, 'id' | 'upvotes'>) => void;

  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateProductPrice: (id: string, newPrice: number) => void;
  unlockProduct: (id: string) => void;

  stats: BusinessStats;
  setStats: React.Dispatch<React.SetStateAction<BusinessStats>>;
  addRevenue: (amount: number) => void;
  spendRevenue: (amount: number) => boolean;
  boostTraffic: (amount: number) => void;
}

const DatabaseContext = createContext<DatabaseContextType>({} as DatabaseContextType);

const DEFAULT_ORDERS: Order[] = [
  { id: 'ORD-1001', customer: 'VER', blend: 'DRS Espresso', status: 'SHIPPED', time: '1m ago', price: 8.50 },
  { id: 'ORD-1002', customer: 'HAM', blend: 'Apex Latte', status: 'ROASTING', time: '3m ago', price: 9.50 },
  { id: 'ORD-1003', customer: 'NOR', blend: 'Paddock Macchiato', status: 'QUEUE', time: 'Just now', price: 7.50 },
];

const DEFAULT_SETUPS: Setup[] = [
  { id: 'SET-1', author: 'Max V.', name: 'Monaco Quali', force: 9.5, heat: 94.5, upvotes: 342 },
  { id: 'SET-2', author: 'Lewis H.', name: 'Silverstone Rain', force: 8.8, heat: 96.0, upvotes: 256 },
  { id: 'SET-3', author: 'Charles L.', name: 'Monza Tifosi', force: 9.2, heat: 92.5, upvotes: 189 },
];

const DEFAULT_PRODUCTS: Product[] = baseProducts.map(p => ({
  id: p.id.toString(),
  name: p.name,
  description: p.description,
  price: p.price,
  image: p.image,
  locked: p.is_vip_only || false,
  intensity: parseInt(p.stats.intensity) || 50,
  type: p.category,
  tags: [p.category]
}));

const DEFAULT_STATS: BusinessStats = {
  revenue: 45990,
  trafficMultiplier: 1.0,
  unlockedResearch: []
};

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<BusinessStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Guarantee wipe before loading to avoid race conditions
    const wiped = localStorage.getItem('__auto_wipe_f1_merch_v4');
    if (!wiped) {
      localStorage.removeItem('apex_products');
      localStorage.removeItem('apex_orders');
      localStorage.removeItem('apex_stats');
      localStorage.setItem('__auto_wipe_f1_merch_v4', 'true');
    }

    const storedOrders = localStorage.getItem('apex_orders');
    const storedSetups = localStorage.getItem('apex_setups');
    const storedProducts = localStorage.getItem('apex_products');
    const storedStats = localStorage.getItem('apex_stats');

    setOrders(storedOrders ? JSON.parse(storedOrders) : DEFAULT_ORDERS);
    setSetups(storedSetups ? JSON.parse(storedSetups) : DEFAULT_SETUPS);
    setProducts(storedProducts ? JSON.parse(storedProducts) : DEFAULT_PRODUCTS);
    setStats(storedStats ? JSON.parse(storedStats) : DEFAULT_STATS);
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('apex_orders', JSON.stringify(orders));
      localStorage.setItem('apex_setups', JSON.stringify(setups));
      localStorage.setItem('apex_products', JSON.stringify(products));
      localStorage.setItem('apex_stats', JSON.stringify(stats));
    }
  }, [orders, setups, products, stats, isLoaded]);

  const updateOrderStatus = (id: string, newStatus: OrderStatus) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  
  const addOrder = (order: Omit<Order, 'id' | 'time'>) => {
    const price = order.price || parseFloat((6.50 + Math.random() * 8.50).toFixed(2));
    setOrders(prev => [{ ...order, price, id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, time: 'Just now' }, ...prev]);
  };

  const upvoteSetup = (id: string) => setSetups(prev => prev.map(s => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s).sort((a, b) => b.upvotes - a.upvotes));
  const publishSetup = (setup: Omit<Setup, 'id' | 'upvotes'>) => setSetups(prev => [{ ...setup, id: `SET-${Date.now()}`, upvotes: 0 }, ...prev]);

  const updateProductPrice = (id: string, newPrice: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
  };

  const unlockProduct = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, locked: false } : p));
    setStats(prev => ({ ...prev, unlockedResearch: [...prev.unlockedResearch, id] }));
  };

  const addRevenue = (amount: number) => setStats(prev => ({ ...prev, revenue: prev.revenue + amount }));
  
  const spendRevenue = (amount: number) => {
    if (stats.revenue >= amount) {
      setStats(prev => ({ ...prev, revenue: prev.revenue - amount }));
      return true;
    }
    return false;
  };

  const boostTraffic = (amount: number) => setStats(prev => ({ ...prev, trafficMultiplier: prev.trafficMultiplier + amount }));

  return (
    <DatabaseContext.Provider value={{ 
      orders, setOrders, updateOrderStatus, addOrder, 
      setups, setSetups, upvoteSetup, publishSetup,
      products, setProducts, updateProductPrice, unlockProduct,
      stats, setStats, addRevenue, spendRevenue, boostTraffic
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export const useDatabase = () => useContext(DatabaseContext);
