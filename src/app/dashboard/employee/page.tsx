'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ListChecks, Wrench } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user || (role !== 'EMPLOYEE' && role !== 'MANAGER' && role !== 'CEO')) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center text-racing-red font-orbitron text-xl">
          <ShieldAlert className="mx-auto mb-4" size={48} />
          CREW ACCESS REQUIRED
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-6">
          <h1 className="font-orbitron text-3xl font-black text-white italic uppercase">Pit Crew <span className="text-pit-yellow">Station</span></h1>
          <p className="text-white/40 font-mono text-xs mt-2">Active Engineer | {user.user_metadata?.full_name}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl border border-white/5 relative">
            <ListChecks className="absolute right-6 top-6 opacity-20 text-pit-yellow" size={32} />
            <div className="text-[10px] font-orbitron text-white/40 tracking-widest mb-2">MY QUEUE</div>
            <div className="font-orbitron text-2xl font-black text-white">4 Orders</div>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/5 relative">
            <Wrench className="absolute right-6 top-6 opacity-20 text-white/50" size={32} />
            <div className="text-[10px] font-orbitron text-white/40 tracking-widest mb-2">EQUIPMENT STATUS</div>
            <div className="font-orbitron text-2xl font-black text-green-400">NOMINAL</div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 h-[300px] flex items-center justify-center text-white/20 font-orbitron font-black text-xl uppercase">
          [Order Processing Queue UI]
        </div>
      </div>
    </div>
  );
}
