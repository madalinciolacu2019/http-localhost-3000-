'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Package, Users, Settings } from 'lucide-react';

export default function ManagerDashboard() {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user || (role !== 'MANAGER' && role !== 'CEO')) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center text-racing-red font-orbitron text-xl">
          <ShieldAlert className="mx-auto mb-4" size={48} />
          MANAGER ACCESS REQUIRED
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-6">
          <h1 className="font-orbitron text-3xl font-black text-white italic uppercase">Pit Wall <span className="text-blue-400">Operations</span></h1>
          <p className="text-white/40 font-mono text-xs mt-2">Manager Dashboard | {user.user_metadata?.full_name}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'PENDING ORDERS', val: '14', icon: Package, color: 'text-blue-400' },
            { label: 'ACTIVE CREW', val: '8', icon: Users, color: 'text-green-400' },
            { label: 'SYSTEM ALERTS', val: '0', icon: Settings, color: 'text-white/50' },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl border border-white/5 relative">
              <stat.icon className={`absolute right-6 top-6 opacity-20 ${stat.color}`} size={32} />
              <div className="text-[10px] font-orbitron text-white/40 tracking-widest mb-2">{stat.label}</div>
              <div className="font-orbitron text-2xl font-black text-white">{stat.val}</div>
            </div>
          ))}
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 h-[300px] flex items-center justify-center text-white/20 font-orbitron font-black text-xl uppercase">
          [Team Management UI coming soon]
        </div>
      </div>
    </div>
  );
}
