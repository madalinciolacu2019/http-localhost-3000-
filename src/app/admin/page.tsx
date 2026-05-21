'use client';

import React, { useState, useEffect } from 'react';
import { Activity, DollarSign, ShoppingCart, Users, ArrowUpRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
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
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          supabase.from('orders').select('total_amount', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('products').select('id', { count: 'exact' })
        ]);

        const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        setStats({
          revenue: totalRevenue,
          orders: ordersRes.count || 0,
          users: usersRes.count || 0,
          products: productsRes.count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
        <div className="lg:col-span-2 glass p-6 rounded-2xl border-white/5 min-h-[400px]">
          <h3 className="font-orbitron font-bold text-lg mb-6">REVENUE CHART</h3>
          <div className="flex items-center justify-center h-full text-white/20 italic text-sm">
            Interactive charts will be rendered here via Recharts.
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border-white/5">
          <h3 className="font-orbitron font-bold text-lg mb-6">RECENT ORDERS</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0">
                <div>
                  <div className="font-orbitron text-sm">Order #{Math.floor(Math.random() * 10000)}</div>
                  <div className="text-[10px] text-white/40">2 mins ago</div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron font-bold text-racing-red">€{(Math.random() * 50 + 10).toFixed(2)}</div>
                  <div className="text-[10px] text-green-400 bg-green-400/10 px-2 rounded-full inline-block mt-1">Paid</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
