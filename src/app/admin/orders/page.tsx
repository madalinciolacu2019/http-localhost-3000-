'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CheckCircle, Clock, ChevronRight, 
  Search, X, Printer, Bell, ShieldCheck, DollarSign, AlertCircle 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useSound } from '@/context/SoundContext';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

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
  customer_email?: string;
};

export default function AdminOrdersPage() {
  const { playSound } = useSound();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync and fetch orders
  useEffect(() => {
    if (!isSupabaseConfigured) {
      const loadLocalOrders = () => {
        const loaded: Order[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('order_demo_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              if (data.id) {
                const statusKey = `status_${data.id}`;
                const currentStatus = (localStorage.getItem(statusKey) as OrderStatus) || 'pending';
                loaded.push({
                  id: data.id,
                  status: currentStatus,
                  total_amount: data.total || 0,
                  created_at: new Date(data.created * 1000).toISOString(),
                  order_items: data.items || [],
                  customer_email: data.customerEmail || 'driver@apex.f1'
                });
              }
            } catch {
              // ignore
            }
          }
        }
        loaded.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(loaded);
        setLoading(false);
      };
      loadLocalOrders();
      const interval = setInterval(loadLocalOrders, 4000);
      return () => clearInterval(interval);
    } else {
      const fetchSupabaseOrders = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (data) {
          const formatted: Order[] = data.map((o: any) => ({
            id: o.id,
            status: o.status as OrderStatus,
            total_amount: o.total_amount,
            created_at: o.created_at,
            order_items: o.order_items?.map((item: any) => ({
              product_name: item.product_name || `Product #${item.product_id}`,
              quantity: item.quantity,
              price: item.unit_price
            })) || []
          }));
          setOrders(formatted);
        }
        setLoading(false);
      };
      fetchSupabaseOrders();
      return;
    }
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    playSound('gear-shift');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    if (!isSupabaseConfigured) {
      localStorage.setItem(`status_${orderId}`, newStatus);
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    }

    // Trigger POS Receipt printer simulator on preparing
    if (newStatus === 'preparing') {
      try {
        await fetch('/api/pos/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: newStatus })
        });
        showToast('POS LINK: Simulating kitchen thermal receipt printing');
      } catch (e) {
        console.error(e);
      }
    }

    // Trigger Twilio SMS dispatcher on ready
    if (newStatus === 'ready') {
      try {
        await fetch('/api/notifications/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: newStatus })
        });
        showToast('SMS DISPATCH: Customer notification triggered');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total_amount : sum, 0);
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length;
  const efficiency = orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 100;

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (o.customer_email && o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-500/20';
      case 'ready': return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
      case 'preparing': return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
      case 'pending': return 'text-purple-400 bg-purple-400/10 border-purple-500/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-500/20';
      default: return 'text-white bg-white/10';
    }
  };

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
            <span className="font-orbitron text-[9px] font-black tracking-widest text-racing-red uppercase">Race Control Logistics</span>
          </div>
          <h1 className="text-4xl font-orbitron font-black italic">ORDER TELEMETRY</h1>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-orbitron font-bold text-white/40 uppercase bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          <ShieldCheck size={12} className="text-green-400" />
          <span>Fulfillment Live Sync</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Sales Revenue', value: `€${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-racing-red' },
          { label: 'Fulfillment Active', value: pendingCount, icon: Clock, color: 'text-purple-400' },
          { label: 'Completed Deliveries', value: completedCount, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Completion efficiency', value: `${efficiency}%`, icon: ShoppingBag, color: 'text-blue-400' }
        ].map((stat, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
            <div className="flex justify-between items-start mb-4">
              <span className="font-orbitron text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="font-orbitron text-3xl font-black italic text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Body Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table List Stream */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setStatusFilter(tab); playSound('click'); }}
                  className={`px-4 py-1.5 rounded-lg border text-[9px] font-orbitron font-black uppercase tracking-widest transition-all ${
                    statusFilter === tab
                      ? 'bg-racing-red border-racing-red text-white shadow-[0_0_15px_rgba(225,6,0,0.5)]'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Driver/Order ID..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-9 font-orbitron text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-racing-red transition-all w-full sm:w-60"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
          </div>

          {loading ? (
            <div className="glass p-12 text-center rounded-2xl border-white/5 font-orbitron text-white/30 text-xs animate-pulse">
              Synchronizing Live Dispatch Feeds...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="glass p-16 text-center rounded-2xl border-white/5">
              <ShoppingBag size={32} className="mx-auto text-white/10 mb-4 animate-bounce" />
              <div className="font-orbitron text-xs font-bold text-white/40 uppercase tracking-widest">No matching order telemetry found</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => { setSelectedOrder(order); playSound('click'); }}
                  className={`glass p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                    selectedOrder?.id === order.id 
                      ? 'border-racing-red bg-racing-red/5' 
                      : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white font-bold tracking-wider">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 border rounded text-[8px] font-orbitron font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/40 truncate">
                      {order.customer_email || 'Guest Driver'} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="font-orbitron font-black text-sm text-white">€{order.total_amount.toFixed(2)}</div>
                      <div className="text-[8px] font-mono text-white/30">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items</div>
                    </div>
                    <ChevronRight size={14} className="text-white/20" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel Detail View */}
        <div className="lg:col-span-4">
          <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden h-fit sticky top-32">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-racing-red" />
            
            {selectedOrder ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-orbitron font-black text-sm tracking-wider">ORDER DETAILS</h3>
                    <button 
                      onClick={() => setSelectedOrder(null)} 
                      className="text-white/40 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <span className="font-mono text-xs text-racing-red font-bold">#{selectedOrder.id.toUpperCase()}</span>
                </div>

                {/* Status bar actions */}
                <div className="space-y-2 border-y border-white/5 py-4">
                  <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Race Control Action</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                        className="col-span-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-orbitron text-[10px] font-black rounded-lg transition-all"
                      >
                        START PREPARATION
                      </button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                        className="col-span-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-orbitron text-[10px] font-black rounded-lg transition-all"
                      >
                        MARK READY / SEND SMS
                      </button>
                    )}
                    {selectedOrder.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                        className="col-span-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-orbitron text-[10px] font-black rounded-lg transition-all"
                      >
                        COMPLETE DISPATCH
                      </button>
                    )}
                    {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        className="px-3 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 font-orbitron text-[10px] font-bold rounded-lg transition-all"
                      >
                        CANCEL ORDER
                      </button>
                    )}
                    
                    {/* Simulator tests */}
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                      className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 font-orbitron text-[10px] text-white/60 hover:text-white rounded-lg flex items-center justify-center gap-1.5 transition-all"
                      title="Trigger thermal ticketing"
                    >
                      <Printer size={12} />
                      <span>Print Ticket</span>
                    </button>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="space-y-3">
                  <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-widest block">Product Manifest</span>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-white/80 font-bold">{item.quantity}x {item.product_name}</span>
                        <span className="text-white/40 font-mono">€{((item.price || selectedOrder.total_amount) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="font-orbitron text-xs font-black text-white">ORDER TOTAL</span>
                  <span className="font-orbitron text-base font-black text-racing-red">€{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <AlertCircle size={24} className="mx-auto text-white/20 mb-3" />
                <p className="font-orbitron text-[10px] font-bold text-white/40 uppercase tracking-widest">Select an order ticket to inspect logistics data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
