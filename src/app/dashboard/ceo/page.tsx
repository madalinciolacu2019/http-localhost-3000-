'use client';

import React, { useState } from 'react';
import { useAuth } from '@/frontend/context/AuthContext';
import { useActivityLog } from '@/frontend/context/ActivityLogContext';
import { useRouter } from 'next/navigation';
import MfaVerification from '@/frontend/components/MfaVerification';
import { BarChart3, Users, DollarSign, Activity, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ytdData = [
  { name: 'Jan', revenue: 180000 },
  { name: 'Feb', revenue: 210000 },
  { name: 'Mar', revenue: 195000 },
  { name: 'Apr', revenue: 240000 },
  { name: 'May', revenue: 285000 },
  { name: 'Jun', revenue: 310000 },
];

export default function CeoDashboard() {
  const { user, role, mfaVerified, loading } = useAuth();
  const { logs } = useActivityLog();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading) return null;

  if (!user || role !== 'CEO') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center text-racing-red font-orbitron text-xl">
          <ShieldAlert className="mx-auto mb-4" size={48} />
          UNAUTHORIZED ACCESS
        </div>
      </div>
    );
  }

  if (!mfaVerified) {
    return <MfaVerification onVerified={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-orbitron text-4xl font-black text-white italic uppercase">Executive <span className="text-racing-red">Command</span></h1>
            <p className="text-white/40 font-mono text-xs">Welcome back, {user.user_metadata?.full_name}</p>
          </div>
          <div className="flex items-center gap-2 bg-racing-red/10 border border-racing-red/30 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
            <span className="font-orbitron text-[10px] text-racing-red font-black tracking-widest">LIVE TELEMETRY</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'YTD REVENUE', val: '€1.42M', icon: DollarSign, color: 'text-green-400' },
            { label: 'ACTIVE USERS', val: '24,591', icon: Users, color: 'text-blue-400' },
            { label: 'CONVERSION', val: '4.8%', icon: BarChart3, color: 'text-purple-400' },
            { label: 'SYSTEM LOAD', val: '22%', icon: Activity, color: 'text-racing-red' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden"
            >
              <stat.icon className={`absolute right-6 top-6 opacity-20 ${stat.color}`} size={40} />
              <div className="text-[10px] font-orbitron text-white/40 tracking-widest mb-2">{stat.label}</div>
              <div className="font-orbitron text-3xl font-black text-white">{stat.val}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-orbitron text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <BarChart3 size={14} className="text-racing-red" />
                Financial Telemetry (YTD)
              </h3>
              <span className="text-[9px] text-green-400 font-mono">NOMINAL SYSTEM OUTPUT</span>
            </div>
            <div className="h-72 w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ytdData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ceoRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E10600" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#E10600" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
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
                      tickFormatter={(val) => `€${val / 1000}k`}
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
                      formatter={(value: any) => [`€${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#E10600" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#ceoRevenueGlow)" 
                      activeDot={{ r: 5, strokeWidth: 0, fill: '#E10600' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col h-[400px]">
            <h3 className="font-orbitron text-xs font-black text-white tracking-widest uppercase border-b border-white/10 pb-4 mb-4">
              Activity Feed
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {logs.map(log => (
                <div key={log.id} className="border-l-2 border-racing-red/50 pl-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-orbitron text-[9px] text-white/80">{log.userName}</span>
                    <span className="font-mono text-[8px] text-white/30">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-mono text-[10px] text-white/50">{log.details}</div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-white/30 text-xs text-center font-mono py-8">No recent activity.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
