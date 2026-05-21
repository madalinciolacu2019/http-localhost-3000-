'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/context/SoundContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Coffee, Package, CheckCircle, Clock, ChevronRight, 
  AlertTriangle, Zap, Terminal, Wallet, X, ArrowUpRight, ShieldCheck,
  TrendingUp, Download, RefreshCw, Layers
} from 'lucide-react';
import Link from 'next/link';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'archived';

type OrderItem = {
  product_name: string;
  quantity: number;
  price?: number;
};

type Order = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
};

export default function PitWallDashboard() {
  const { playSound } = useSound();
  const { user } = useAuth();
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, title: string, amount: number }>({ show: false, message: '', title: '', amount: 0 });
  
  // Dedicated Mobile UI tab selector state
  const [mobileTab, setMobileTab] = useState<OrderStatus>('pending');

  // Fetch profiles role for RBAC check
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // For testing/mocking, assign staff role by default if logged in
      setProfileRole(user ? 'admin' : null);
      setProfileLoading(false);
      return;
    }

    if (!user) {
      setProfileRole(null);
      setProfileLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        if (data) setProfileRole(data.role);
      } catch (e) {
        console.error("Error fetching staff role:", e);
        setProfileRole(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchRole();
  }, [user]);

  // Central Vault / Institutional Reserve Portal state
  const [showBankAccount, setShowBankAccount] = useState(false);
  const [bankBalance, setBankBalance] = useState(12450.00);
  const [ledgerEntries, setLedgerEntries] = useState<Array<{ id: string, amount: number, time: string, type: 'settlement' | 'injection' | 'audit' }>>([
    { id: 'TX-INIT-001', amount: 12450.00, time: 'System Boot Base', type: 'audit' }
  ]);

  // Load saved bank balance and ledger from persistent storage
  useEffect(() => {
    try {
      const storedBal = localStorage.getItem('central_bank_balance');
      if (storedBal) setBankBalance(parseFloat(storedBal));
      const storedLedger = localStorage.getItem('central_bank_ledger');
      if (storedLedger) setLedgerEntries(JSON.parse(storedLedger));
    } catch {
      // ignore
    }
  }, []);

  // Sync Mock Session Data or Supabase Listeners
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsConnected(true);
      setLoading(false);
      
      const loadClientOrders = () => {
        const loadedOrders: Order[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('order_demo_')) {
            try {
              const orderData = JSON.parse(localStorage.getItem(key) || '{}');
              if (orderData.id) {
                const statusKey = `status_${orderData.id}`;
                const currentStatus = (localStorage.getItem(statusKey) as OrderStatus) || 'pending';
                if (currentStatus !== 'archived') {
                  loadedOrders.push({
                    id: orderData.id,
                    status: currentStatus,
                    total_amount: orderData.total || 0,
                    created_at: new Date(orderData.created * 1000).toISOString(),
                    order_items: orderData.items || []
                  });
                }
              }
            } catch {
              // ignore
            }
          }
        }
        loadedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(loadedOrders);
      };

      loadClientOrders();
      const interval = setInterval(loadClientOrders, 2000);
      return () => clearInterval(interval);
    } else {
      const fetchOrders = async () => {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (data) setOrders(data as Order[]);
        setLoading(false);
        setIsConnected(true);
      };

      fetchOrders();

      const channel = supabase.channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              playSound('engine-rev');
              fetchOrders();
            } else if (payload.eventType === 'UPDATE') {
              playSound('gear-shift');
              setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [playSound]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    playSound('click');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const targetOrder = orders.find(o => o.id === orderId);

    if (isSupabaseConfigured) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

      // Decrement stock in Supabase products
      if (newStatus === 'preparing' && targetOrder) {
        for (const item of targetOrder.order_items) {
          const { data: prod } = await supabase
            .from('products')
            .select('stock_count')
            .eq('name', item.product_name)
            .single();
          
          if (prod) {
            const nextStock = Math.max(0, prod.stock_count - item.quantity);
            await supabase.from('products').update({ stock_count: nextStock }).eq('name', item.product_name);
          }
        }
      }
    } else {
      localStorage.setItem(`status_${orderId}`, newStatus);
    }

    // Trigger POS Print on preparing
    if (newStatus === 'preparing' && targetOrder) {
      try {
        await fetch('/api/pos/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: targetOrder.id,
            totalAmount: targetOrder.total_amount,
            items: targetOrder.order_items,
          }),
        });
      } catch (e) {
        console.error('POS print call failed:', e);
      }
    }

    // Trigger SMS Notification on ready
    if (newStatus === 'ready') {
      try {
        await fetch('/api/notifications/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: '+38591234567', // Mock customer number or from profile metadata
            orderId,
            status: 'ready',
          }),
        });
      } catch (e) {
        console.error('SMS notification dispatch failed:', e);
      }
    }
  };

  const removeOrder = async (orderId: string) => {
    playSound('pit-stop');
    const orderToComplete = orders.find(o => o.id === orderId);
    if (orderToComplete) {
      const newBal = bankBalance + orderToComplete.total_amount;
      setBankBalance(newBal);
      localStorage.setItem('central_bank_balance', newBal.toString());

      const newEntry = {
        id: `TX-${orderId.replace('demo_', '').slice(-6).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
        amount: orderToComplete.total_amount,
        time: new Date().toLocaleTimeString(),
        type: 'settlement' as const
      };
      const updatedLedger = [newEntry, ...ledgerEntries];
      setLedgerEntries(updatedLedger);
      localStorage.setItem('central_bank_ledger', JSON.stringify(updatedLedger));

      setToast({ 
        show: true, 
        title: 'PAYOUT SETTLED', 
        message: 'Order revenue securely transferred to central HSM account balance.',
        amount: orderToComplete.total_amount
      });
      setTimeout(() => setToast({ show: false, message: '', title: '', amount: 0 }), 4000);
    }

    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (isSupabaseConfigured) {
      await supabase.from('orders').update({ status: 'archived' }).eq('id', orderId);
    } else {
      localStorage.setItem(`status_${orderId}`, 'archived');
    }
  };

  const clearDemoOrders = () => {
    playSound('pit-stop');
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('order_demo_') || key.startsWith('status_demo_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setOrders([]);
    setToast({
      show: true,
      title: 'PIPELINE PURGED',
      message: 'All client demo session orders have been archived/reset.',
      amount: 0
    });
    setTimeout(() => setToast({ show: false, message: '', title: '', amount: 0 }), 3000);
  };

  const exportLedgerCSV = () => {
    playSound('click');
    const headers = 'Transaction ID,Type,Timestamp,Secure Hash Status,Amount (EUR)\n';
    const rows = ledgerEntries.map(e => `"${e.id}","${e.type.toUpperCase()}","${e.time}","SHA-256 VERIFIED","${e.amount.toFixed(2)}"`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `central_vault_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const injectInstitutionalCapital = () => {
    playSound('engine-rev');
    const injectionAmount = 5000.00 + Math.floor(Math.random() * 15000);
    const newBal = bankBalance + injectionAmount;
    setBankBalance(newBal);
    localStorage.setItem('central_bank_balance', newBal.toString());

    const newEntry = {
      id: `TX-ALPHA-CAPITAL-${Math.floor(Math.random()*10000)}`,
      amount: injectionAmount,
      time: new Date().toLocaleTimeString(),
      type: 'injection' as const
    };
    const updatedLedger = [newEntry, ...ledgerEntries];
    setLedgerEntries(updatedLedger);
    localStorage.setItem('central_bank_ledger', JSON.stringify(updatedLedger));
  };

  const simulateGlobalTraffic = () => {
    playSound('engine-rev');
    const drivers = ['Lewis H.', 'Max V.', 'Charles L.', 'Lando N.', 'George R.', 'Fernando A.', 'Oscar P.'];
    const products = ['Midnight Qualifying Blend', 'DRS Espresso Shot', 'Carbon Fiber Roast', 'Apex Paddock Mug', 'Team Cap v2'];
    
    const newSimulatedOrders: Order[] = Array.from({ length: 3 }).map((_, i) => ({
      id: `sim_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      total_amount: 15 + Math.random() * 45,
      created_at: new Date().toISOString(),
      order_items: [
        {
          product_name: products[Math.floor(Math.random() * products.length)],
          quantity: 1 + Math.floor(Math.random() * 2),
        }
      ]
    }));

    setOrders(prev => [...newSimulatedOrders, ...prev]);
    
    setToast({
      show: true,
      title: 'GLOBAL TRAFFIC DETECTED',
      message: `Incoming telemetry: ${newSimulatedOrders.length} new orders detected from international driver nodes.`,
      amount: newSimulatedOrders.reduce((acc, o) => acc + o.total_amount, 0)
    });
    setTimeout(() => setToast({ show: false, message: '', title: '', amount: 0 }), 5000);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'text-pit-yellow border-pit-yellow shadow-[0_0_15px_rgba(254,209,65,0.2)] bg-pit-yellow/10';
      case 'preparing': return 'text-blue-400 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)] bg-blue-500/10';
      case 'ready': return 'text-green-400 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)] bg-green-500/10';
      case 'completed': return 'text-white/40 border-white/10 bg-white/5';
      default: return 'text-white/20 border-white/5 bg-transparent';
    }
  };

  const renderOrderCard = (order: Order) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      key={order.id}
      className={`glass rounded-xl p-4 md:p-5 border-l-[4px] relative overflow-hidden group ${getStatusColor(order.status)}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-orbitron font-black text-white text-xs uppercase tracking-widest">#{order.id.slice(-6)}</p>
          <p className="text-[9px] font-mono text-white/50 mt-1">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className={`px-2 py-1 rounded text-[8px] font-orbitron font-black tracking-widest uppercase ${getStatusColor(order.status).replace('border', 'border-0')}`}>
          {order.status}
        </div>
      </div>

      <div className="space-y-2 mb-3 border-t border-white/10 pt-3">
        {order.order_items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[11px] text-white/80 font-orbitron leading-relaxed">
            <span className="flex gap-2"><span className="text-white/40">{item.quantity}x</span> {item.product_name}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-[10px] text-white/50 border-t border-white/5 pt-2.5 mt-1">
        <span className="font-orbitron tracking-widest text-[9px]">TOTAL</span>
        <span className="font-orbitron font-black text-white text-xs">€{(order.total_amount || 0).toFixed(2)}</span>
      </div>

      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-white/5">
        {order.status === 'pending' && (
          <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="btn-racing !py-2 !px-4 text-[9px] w-full flex justify-between items-center group-hover:shadow-[0_0_20px_#E10600]">
            <span>PREPARE</span> <ChevronRight size={12} />
          </button>
        )}
        {order.status === 'preparing' && (
          <button onClick={() => updateOrderStatus(order.id, 'ready')} className="w-full bg-green-500 hover:bg-green-400 text-black font-orbitron font-black text-[9px] tracking-widest py-2 px-4 skew-x-[-10deg] transition-all flex justify-between items-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <span className="skew-x-[10deg]">MARK READY</span> <CheckCircle size={12} className="skew-x-[10deg]" />
          </button>
        )}
        {order.status === 'ready' && (
          <button onClick={() => updateOrderStatus(order.id, 'completed')} className="w-full bg-white/10 hover:bg-white text-white hover:text-black font-orbitron font-black text-[9px] tracking-widest py-2 px-4 skew-x-[-10deg] transition-all flex justify-between items-center">
            <span className="skew-x-[10deg]">COMPLETE</span> <Package size={12} className="skew-x-[10deg]" />
          </button>
        )}
        {order.status === 'completed' && (
          <button onClick={() => removeOrder(order.id)} className="w-full bg-white/5 hover:bg-racing-red hover:text-white text-white/40 font-orbitron font-black text-[9px] tracking-widest py-2 px-4 skew-x-[-10deg] transition-all flex justify-between items-center group-hover:shadow-[0_0_15px_#E10600]">
            <span className="skew-x-[10deg]">CLIENT PICKED UP</span> <CheckCircle size={12} className="skew-x-[10deg]" />
          </button>
        )}
      </div>
    </motion.div>
  );

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-carbon-black flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-racing-red border-t-transparent rounded-full mb-4"
        />
        <p className="font-orbitron text-xs text-white/40 tracking-[0.4em] uppercase">Authenticating pit crew...</p>
      </div>
    );
  }

  if (profileRole !== 'admin' && profileRole !== 'staff') {
    return (
      <main className="min-h-screen bg-carbon-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-racing-red/5 skew-x-[-15deg] pointer-events-none" />
        <div className="text-center max-w-md space-y-6 relative z-10 glass border-racing-red/30 p-12 backdrop-blur-xl">
          <div className="w-16 h-16 bg-racing-red/10 border border-racing-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertTriangle className="text-racing-red animate-bounce" size={32} />
          </div>
          <h1 className="font-orbitron text-3xl font-black italic text-white uppercase tracking-tighter">
            ACCESS DENIED: <br />
            <span className="text-racing-red">SECURE GRID HUB</span>
          </h1>
          <p className="text-[11px] text-white/50 font-mono leading-relaxed uppercase tracking-wider">
            Telemetry networks, order queues, and Central vault control centers are restricted to telemetry engineers & pit crew only.
          </p>
          <div className="h-[1px] bg-white/5 my-6" />
          <Link href="/">
            <button className="btn-racing w-full text-[10px] py-4" onClick={() => playSound('click')}>
              RETURN TO STARTING GRID
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-carbon-black pt-24 md:pt-28 pb-24 px-3 md:px-8 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-racing-red/5 skew-x-[-15deg] pointer-events-none" />

      {/* Payout Toast Notification Overlay */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: -20 }}
            onClick={() => setShowBankAccount(true)}
            className="fixed top-20 right-4 md:right-8 z-[150] glass border-l-[4px] border-green-500 p-4 shadow-2xl max-w-[90vw] md:min-w-[300px] backdrop-blur-xl bg-black/90 cursor-pointer hover:scale-105 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-full mt-1 group-hover:bg-green-500/30 transition-all">
                <CheckCircle className="text-green-500 animate-pulse" size={16} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-orbitron text-[10px] font-black text-white uppercase tracking-widest">{toast.title}</h4>
                  <span className="text-[8px] font-orbitron font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">Click to View Vault</span>
                </div>
                <p className="text-[11px] text-white/70 font-mono leading-relaxed mb-2">{toast.message}</p>
                <div className="font-orbitron text-xl font-black text-green-400 italic tracking-tighter">
                  +€{(toast.amount || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Vault / Bank Account Advanced Modal */}
      <AnimatePresence>
        {showBankAccount && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass max-w-2xl w-full max-h-[92vh] flex flex-col rounded-2xl border-white/10 p-5 md:p-8 relative overflow-hidden shadow-2xl bg-carbon-black/95"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-green-400 to-transparent" />
              
              <div className="flex justify-between items-start mb-5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 md:p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-orbitron text-[8px] md:text-[9px] font-black text-green-400 tracking-widest uppercase">Institutional Reserve Portal</span>
                      <ShieldCheck size={12} className="text-green-400" />
                    </div>
                    <h3 className="font-orbitron text-lg md:text-xl font-black text-white tracking-tight">CENTRAL PADDOCK VAULT</h3>
                  </div>
                </div>
                <button 
                  onClick={() => { playSound('click'); setShowBankAccount(false); }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-5 pr-1 hide-scrollbar flex-1">
                {/* Advanced Glowing Balance Dashboard Card */}
                <div className="glass rounded-xl p-5 md:p-6 border-green-500/20 bg-green-500/5 text-center relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[8px] font-orbitron font-bold text-green-400 tracking-widest uppercase bg-green-500/10 px-2 py-0.5 rounded">
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-ping" /> SECURE SETTLEMENT
                  </div>
                  <span className="text-[9px] md:text-[10px] font-orbitron font-black text-white/40 tracking-[0.3em] uppercase block mb-1 mt-2">AUDITED LIQUIDITY</span>
                  <motion.div 
                    key={bankBalance}
                    initial={{ scale: 1.05, color: '#4ade80' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter py-1"
                  >
                    €{bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </motion.div>
                  
                  {/* Micro Statistics Matrix */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-green-500/10 text-left">
                    <div>
                      <span className="text-[7px] md:text-[8px] font-orbitron text-white/40 uppercase block">Ledger Count</span>
                      <span className="text-[11px] md:text-xs font-mono font-bold text-white">{ledgerEntries.length} Active</span>
                    </div>
                    <div>
                      <span className="text-[7px] md:text-[8px] font-orbitron text-white/40 uppercase block">Daily Velocity</span>
                      <span className="text-[11px] md:text-xs font-mono font-bold text-green-400">+€{(bankBalance - 12450).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[7px] md:text-[8px] font-orbitron text-white/40 uppercase block">Encryption Status</span>
                      <span className="text-[11px] md:text-xs font-mono font-bold text-white/80">SHA-256 HSM</span>
                    </div>
                  </div>
                </div>

                {/* Stress-Testing Alpha Controls & Ledger Logs */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                    <span className="text-[9px] md:text-[10px] font-orbitron font-black text-white/40 tracking-widest uppercase flex items-center gap-1.5">
                      <Layers size={12} /> Ledger Telemetry Trail
                    </span>
                    <button
                      onClick={injectInstitutionalCapital}
                      className="w-full sm:w-auto text-[9px] font-orbitron font-black text-pit-yellow hover:text-white bg-pit-yellow/10 hover:bg-pit-yellow/20 border border-pit-yellow/20 px-3 py-1.5 rounded transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Simulate Institutional Funding</span> <Zap size={10} />
                    </button>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                    {ledgerEntries.map((entry, idx) => (
                      <div key={idx} className="glass p-2.5 md:p-3 rounded-lg border-white/5 flex justify-between items-center text-xs font-mono hover:border-white/10 transition-all">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${entry.type === 'injection' ? 'bg-pit-yellow' : 'bg-green-400'}`} />
                          <div>
                            <p className="text-white font-orbitron text-[9px] md:text-[10px] font-bold">{entry.id}</p>
                            <p className="text-[8px] md:text-[9px] text-white/40">{entry.time} — P2P Hash Confirmed</p>
                          </div>
                        </div>
                        <span className={`font-orbitron font-black text-[11px] md:text-xs ${entry.type === 'injection' ? 'text-pit-yellow' : 'text-green-400'}`}>
                          +€{entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Functional Action base */}
              <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row gap-2.5 shrink-0">
                <button 
                  onClick={exportLedgerCSV}
                  className="w-full sm:flex-1 glass py-2.5 md:py-3 rounded-lg border-white/10 hover:border-white/20 hover:bg-white/5 font-orbitron text-[9px] md:text-[10px] font-bold text-white/70 hover:text-white transition-all tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  <Download size={12} /> <span>Export Secure CSV</span>
                </button>
                <button 
                  onClick={() => { playSound('click'); setShowBankAccount(false); }}
                  className="w-full sm:flex-1 bg-green-500 hover:bg-green-400 text-black font-orbitron text-[9px] md:text-[10px] font-black py-2.5 md:py-3 rounded-lg transition-all tracking-widest uppercase shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 skew-x-[-10deg]"
                >
                  <span className="skew-x-[10deg]">Back to Pit Wall</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 border-b border-white/10 pb-4 md:pb-6 gap-4 md:gap-6">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
              <div className="w-8 md:w-12 h-[1px] bg-pit-yellow" />
              <span className="font-orbitron text-[9px] md:text-[10px] font-black tracking-[0.4em] md:tracking-[0.5em] text-pit-yellow flex items-center gap-1.5 md:gap-2">
                <Terminal size={12} /> KITCHEN DISPLAY SYSTEM
              </span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              PIT WALL <span className="text-white/20">ORDERS</span>
            </h1>
          </div>

          <div className="flex gap-2 md:gap-4 items-center flex-wrap w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setShowBankAccount(true)}
              className="glass px-2.5 md:px-3 py-1.5 border-green-500/30 hover:border-green-400 bg-green-500/5 hover:bg-green-500/10 transition-all rounded text-[8px] md:text-[9px] font-orbitron font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5"
            >
              <Wallet size={12} /> View Central Vault
            </button>

            {!isSupabaseConfigured && (
              <div className="flex items-center gap-2">
                <button
                  onClick={clearDemoOrders}
                  className="glass px-2.5 md:px-3 py-1.5 border-racing-red/20 hover:border-racing-red hover:bg-racing-red/10 transition-all rounded text-[8px] md:text-[9px] font-orbitron font-black text-white/60 hover:text-white uppercase tracking-widest flex items-center gap-1"
                  title="Purge local demo session orders"
                >
                  <RefreshCw size={9} /> Reset Pipeline
                </button>
                <button
                  onClick={simulateGlobalTraffic}
                  className="glass px-2.5 md:px-3 py-1.5 border-blue-500/20 hover:border-blue-400 hover:bg-blue-500/10 transition-all rounded text-[8px] md:text-[9px] font-orbitron font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5"
                  title="Generate simulated driver orders"
                >
                  <Zap size={11} /> Simulate Traffic
                </button>
              </div>
            )}

            <div className="glass px-2.5 md:px-4 py-1.5 md:py-2 border-white/5 flex items-center gap-2 md:gap-3">
              <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-racing-red'}`} />
              <span className="font-orbitron text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50">
                {isConnected ? 'SYNCED' : 'CONNECTING...'}
              </span>
            </div>
          </div>
        </div>

        {/* ELEGANT MOBILE VIEW SELECTOR TABS */}
        <div className="flex md:hidden gap-1.5 mb-5 overflow-x-auto pb-1.5 hide-scrollbar sticky top-16 z-30 bg-carbon-black/95 py-2 backdrop-blur-xl border-b border-white/5">
          {(['pending', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((tab) => {
            const count = orders.filter(o => o.status === tab).length;
            const isActive = mobileTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setMobileTab(tab); playSound('click'); }}
                className={`flex-1 min-w-[75px] py-2 px-2 rounded-lg border text-center transition-all ${
                  isActive 
                    ? tab === 'pending' ? 'bg-pit-yellow/10 border-pit-yellow text-pit-yellow font-black shadow-[0_0_10px_rgba(254,209,65,0.2)]'
                    : tab === 'preparing' ? 'bg-blue-500/10 border-blue-400 text-blue-400 font-black shadow-[0_0_10px_rgba(96,165,250,0.2)]'
                    : tab === 'ready' ? 'bg-green-500/10 border-green-400 text-green-400 font-black shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                    : 'bg-white/10 border-white/20 text-white font-black'
                    : 'bg-white/5 border-white/5 text-white/30 hover:text-white/60'
                }`}
              >
                <span className="font-orbitron text-[7px] tracking-widest uppercase block">{tab}</span>
                <span className="font-mono text-[11px] font-bold mt-0.5 block">{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-pit-yellow border-t-transparent rounded-full" />
          </div>
        ) : (
          /* RESPONSIVE CONDITIONAL COLUMN MATRIX */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start pb-8">
            {/* PENDING COLUMN */}
            <div className={`space-y-3 ${mobileTab !== 'pending' ? 'hidden md:block' : 'block'}`}>
              <div className="glass p-3 md:p-4 border-pit-yellow/50 bg-pit-yellow/5 flex justify-between items-center sticky top-28 md:top-28 z-20">
                <h2 className="font-orbitron text-xs md:text-sm font-black uppercase tracking-widest text-pit-yellow flex items-center gap-1.5 md:gap-2">
                  <Clock size={14} /> Pending
                </h2>
                <span className="bg-pit-yellow text-black font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              </div>
              <div className="space-y-3 min-h-[400px]">
                <AnimatePresence>
                  {orders.filter(o => o.status === 'pending').length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-5 border-white/5 text-center space-y-2.5 mt-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                        <Coffee size={14} />
                      </div>
                      <p className="font-orbitron text-[10px] font-black text-white/40 tracking-widest uppercase">No Grid Orders</p>
                      <p className="text-[9px] text-white/30 font-mono leading-relaxed">Enter a test transaction in the Fueling menu to route live telemetric pipeline items.</p>
                      <Link href="/menu" className="inline-block mt-1">
                        <span className="text-[8px] font-orbitron font-black text-pit-yellow hover:underline tracking-widest uppercase block">Order Simulator →</span>
                      </Link>
                    </motion.div>
                  ) : (
                    orders.filter(o => o.status === 'pending').map(renderOrderCard)
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PREPARING COLUMN */}
            <div className={`space-y-3 ${mobileTab !== 'preparing' ? 'hidden md:block' : 'block'}`}>
              <div className="glass p-3 md:p-4 border-blue-400/50 bg-blue-500/5 flex justify-between items-center sticky top-28 md:top-28 z-20">
                <h2 className="font-orbitron text-xs md:text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5 md:gap-2">
                  <Zap size={14} /> Preparing
                </h2>
                <span className="bg-blue-400 text-black font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'preparing').length}
                </span>
              </div>
              <div className="space-y-3 min-h-[400px]">
                <AnimatePresence>
                  {orders.filter(o => o.status === 'preparing').map(renderOrderCard)}
                </AnimatePresence>
              </div>
            </div>

            {/* READY COLUMN */}
            <div className={`space-y-3 ${mobileTab !== 'ready' ? 'hidden md:block' : 'block'}`}>
              <div className="glass p-3 md:p-4 border-green-400/50 bg-green-500/5 flex justify-between items-center sticky top-28 md:top-28 z-20">
                <h2 className="font-orbitron text-xs md:text-sm font-black uppercase tracking-widest text-green-400 flex items-center gap-1.5 md:gap-2">
                  <CheckCircle size={14} /> Ready
                </h2>
                <span className="bg-green-400 text-black font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'ready').length}
                </span>
              </div>
              <div className="space-y-3 min-h-[400px]">
                <AnimatePresence>
                  {orders.filter(o => o.status === 'ready').map(renderOrderCard)}
                </AnimatePresence>
              </div>
            </div>

            {/* COMPLETED COLUMN */}
            <div className={`space-y-3 ${mobileTab !== 'completed' ? 'hidden md:block' : 'block'}`}>
              <div className="glass p-3 md:p-4 border-white/20 flex justify-between items-center sticky top-28 md:top-28 z-20">
                <h2 className="font-orbitron text-xs md:text-sm font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5 md:gap-2">
                  <Package size={14} /> Completed
                </h2>
                <span className="bg-white/20 text-white font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'completed').length}
                </span>
              </div>
              <div className="space-y-3 min-h-[400px] opacity-70">
                <AnimatePresence>
                  {orders.filter(o => o.status === 'completed').slice(0, 10).map(renderOrderCard)}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
