'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, DollarSign, ShoppingCart, Users, ArrowUpRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const weeklyTelemetry = [
  { day: 'Mon', revenue: 1240, orders: 34 },
  { day: 'Tue', revenue: 1450, orders: 42 },
  { day: 'Wed', revenue: 1100, orders: 28 },
  { day: 'Thu', revenue: 1900, orders: 55 },
  { day: 'Fri', revenue: 2200, orders: 63 },
  { day: 'Sat', revenue: 2800, orders: 81 },
  { day: 'Sun', revenue: 2500, orders: 72 },
];

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!isSupabaseConfigured) {
      // Mock data if no Supabase configured
      setStats({
        revenue: 12450.50,
        orders: 342,
        users: 156,
        products: 24,
      });
      setLoading(false);
      return;
    }

    try {
      const [ordersRes, usersRes, productsRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total_amount', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        revenue: totalRevenue,
        orders: ordersRes.count || 0,
        users: usersRes.count || 0,
        products: productsRes.count || 0,
      });
      
      if (recentRes.data) {
        setRecentOrders(recentRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDispatch = async (orderId: string) => {
    try {
      const res = await fetch('/api/order/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend: string }) => (
    <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-racing-red/10 rounded-full blur-2xl group-hover:bg-racing-red/20 transition-colors" />
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl text-white/70">
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold bg-green-400/10 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} />
          {trend}
        </div>
      </div>
      <div>
        <div className="text-3xl font-orbitron font-black mb-1">{value}</div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest font-orbitron">{title}</div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="animate-pulse flex items-center justify-center h-64 text-white/50 font-orbitron">Loading Telemetry...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-orbitron font-black mb-2">SYSTEM TELEMETRY</h1>
          <p className="text-white/40 italic text-sm">Real-time overview of APEX platform performance.</p>
        </div>
        <button className="btn-racing !py-2 !px-4 !text-[10px]">EXPORT REPORT</button>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-pit-yellow/10 border border-pit-yellow/30 text-pit-yellow p-4 rounded-xl text-sm font-orbitron flex items-center gap-3">
          <Activity size={18} />
          <span>Warning: Supabase is not configured. Displaying mock telemetry data.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`€${stats.revenue.toFixed(2)}`} icon={DollarSign} trend="+12.5%" />
        <StatCard title="Total Orders" value={stats.orders} icon={ShoppingCart} trend="+8.2%" />
        <StatCard title="Active Drivers" value={stats.users} icon={Users} trend="+15.3%" />
        <StatCard title="Menu Items" value={stats.products} icon={Activity} trend="+0.0%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl border-white/5 h-[400px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-orbitron font-bold text-lg">Sales Telemetry (7-Day Trend)</h3>
            <span className="text-[9px] text-racing-red font-mono font-bold tracking-widest bg-racing-red/10 border border-racing-red/20 px-2 py-0.5 rounded">LIVE TRACKING</span>
          </div>
          <div className="h-72 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTelemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E10600" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E10600" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `€${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 15, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#E10600', fontWeight: 'bold', fontFamily: 'Orbitron' }}
                    formatter={(value: any, name?: any) => [
                      name === 'revenue' ? `€${value.toFixed(2)}` : `${value} units`,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#E10600" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#adminRevenueGlow)" 
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#E10600' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border-white/5">
          <h3 className="font-orbitron font-bold text-lg mb-6">RECENT ORDERS</h3>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0">
                <div>
                  <div className="font-orbitron text-sm">Order #{order.id.slice(-6).toUpperCase()}</div>
                  <div className="text-[10px] text-white/40">{new Date(order.created_at).toLocaleTimeString()}</div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="font-orbitron font-bold text-racing-red">€{Number(order.total_amount).toFixed(2)}</div>
                    <div className={`text-[10px] px-2 rounded-full inline-block mt-1 ${order.status === 'dispatched' ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10'}`}>
                      {order.status}
                    </div>
                  </div>
                  {order.status !== 'dispatched' && (
                    <button 
                      onClick={() => handleDispatch(order.id)}
                      className="px-3 py-1.5 bg-racing-red text-white text-[10px] font-orbitron font-bold uppercase rounded hover:bg-red-600 transition"
                    >
                      Dispatch Drone
                    </button>
                  )}
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-white/40 text-sm font-orbitron italic">No live orders.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
