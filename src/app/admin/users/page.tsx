'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, ShieldAlert, Award, Star, Search, 
  ChevronRight, Sparkles, Check, ArrowUpRight, Zap 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/shared/lib/supabase';
import { useSound } from '@/frontend/context/SoundContext';

type DriverProfile = {
  id: string;
  full_name: string;
  email: string;
  role: 'driver' | 'staff' | 'admin';
  credits: number;
  xp: number;
  level: number;
  driver_rank?: string;
};

const defaultDrivers: DriverProfile[] = [
  { id: 'lh-44', full_name: 'Lewis Hamilton', email: 'lewis.hamilton@mercedes.f1', role: 'driver', credits: 4400, xp: 9900, level: 8, driver_rank: 'PRO-1' },
  { id: 'mv-33', full_name: 'Max Verstappen', email: 'max.verstappen@redbull.f1', role: 'driver', credits: 3300, xp: 9500, level: 7, driver_rank: 'PRO-1' },
  { id: 'cl-16', full_name: 'Charles Leclerc', email: 'charles.leclerc@ferrari.f1', role: 'driver', credits: 1600, xp: 6200, level: 5, driver_rank: 'AM-2' },
  { id: 'ln-4', full_name: 'Lando Norris', email: 'lando.norris@mclaren.f1', role: 'driver', credits: 2400, xp: 7500, level: 6, driver_rank: 'PRO-2' },
];

export default function AdminUsersPage() {
  const { playSound } = useSound();
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  useEffect(() => {
    const loadDrivers = async () => {
      if (!isSupabaseConfigured) {
        // Load custom localStorage profiles + fallback static drivers
        const loaded: DriverProfile[] = [];
        
        // Read all local demo profiles
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('profile_demo_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              const uid = key.replace('profile_demo_', '');
              if (data.full_name) {
                loaded.push({
                  id: uid,
                  full_name: data.full_name,
                  email: uid === 'mock-user-id' ? 'demo.driver@apex.f1' : `${data.full_name.toLowerCase().replace(' ', '.')}@apex.f1`,
                  role: data.role || 'driver',
                  credits: data.credits ?? 1250,
                  xp: data.xp ?? 3200,
                  level: data.level ?? 4,
                  driver_rank: getRankFromLevel(data.level ?? 4)
                });
              }
            } catch (e) {}
          }
        }

        // Merge defaults
        defaultDrivers.forEach((d) => {
          if (!loaded.find((l) => l.id === d.id)) {
            loaded.push(d);
          }
        });

        setDrivers(loaded);
        setLoading(false);
      } else {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('level', { ascending: false });

          if (data) {
            const formatted: DriverProfile[] = data.map((d: any) => ({
              id: d.id,
              full_name: d.full_name || 'Anonymous Driver',
              email: d.email || 'guest@apex.f1',
              role: d.role || 'driver',
              credits: d.credits ?? 0,
              xp: d.xp ?? 0,
              level: d.level ?? 1,
              driver_rank: d.driver_rank || 'ROOKIE'
            }));
            setDrivers(formatted);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDrivers();
  }, []);

  const getRankFromLevel = (lvl: number) => {
    if (lvl >= 8) return 'PRO-1';
    if (lvl >= 6) return 'PRO-2';
    if (lvl >= 4) return 'AM-1';
    if (lvl >= 2) return 'AM-2';
    return 'ROOKIE';
  };

  const handleAdjustPoints = (id: string, amount: number) => {
    playSound('gear-shift');
    const updated = drivers.map(d => {
      if (d.id === id) {
        const nextCredits = Math.max(0, d.credits + amount);
        updateProfileStorageOrDb(id, { credits: nextCredits });
        return { ...d, credits: nextCredits };
      }
      return d;
    });
    setDrivers(updated);
    if (selectedDriver?.id === id) {
      setSelectedDriver(prev => prev ? { ...prev, credits: Math.max(0, prev.credits + amount) } : null);
    }
    showToast(`ERS wallet adjusted: ${amount > 0 ? '+' : ''}${amount} points`);
  };

  const handleAdjustLevel = (id: string, delta: number) => {
    playSound('click');
    const updated = drivers.map(d => {
      if (d.id === id) {
        const nextLvl = Math.max(1, Math.min(10, d.level + delta));
        const nextRank = getRankFromLevel(nextLvl);
        updateProfileStorageOrDb(id, { level: nextLvl, driver_rank: nextRank });
        return { ...d, level: nextLvl, driver_rank: nextRank };
      }
      return d;
    });
    setDrivers(updated);
    if (selectedDriver?.id === id) {
      setSelectedDriver(prev => prev ? { ...prev, level: Math.max(1, Math.min(10, prev.level + delta)), driver_rank: getRankFromLevel(Math.max(1, Math.min(10, prev.level + delta))) } : null);
    }
  };

  const handleToggleRole = (id: string, newRole: 'driver' | 'staff' | 'admin') => {
    playSound('click');
    const updated = drivers.map(d => {
      if (d.id === id) {
        updateProfileStorageOrDb(id, { role: newRole });
        return { ...d, role: newRole };
      }
      return d;
    });
    setDrivers(updated);
    if (selectedDriver?.id === id) {
      setSelectedDriver(prev => prev ? { ...prev, role: newRole } : null);
    }
    showToast(`Security clearance updated: role set to ${newRole}`);
  };

  const updateProfileStorageOrDb = async (uid: string, updates: Partial<DriverProfile>) => {
    if (!isSupabaseConfigured) {
      const storedKey = `profile_demo_${uid}`;
      const stored = localStorage.getItem(storedKey);
      let localData: any = {};
      if (stored) {
        try {
          localData = JSON.parse(stored);
        } catch (e) {}
      } else {
        const matchingBase = drivers.find(d => d.id === uid);
        localData = {
          full_name: matchingBase?.full_name || 'Driver',
          credits: matchingBase?.credits ?? 1250,
          xp: matchingBase?.xp ?? 3200,
          level: matchingBase?.level ?? 4,
          role: matchingBase?.role ?? 'driver'
        };
      }

      const nextData = { ...localData, ...updates };
      localStorage.setItem(storedKey, JSON.stringify(nextData));
    } else {
      await supabase.from('profiles').update(updates).eq('id', uid);
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const filtered = drivers.filter(d => 
    d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats Aggregations
  const totalDriversCount = drivers.length;
  const avgPoints = totalDriversCount > 0 ? Math.round(drivers.reduce((sum, d) => sum + d.credits, 0) / totalDriversCount) : 0;
  const staffCount = drivers.filter(d => d.role === 'admin' || d.role === 'staff').length;

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
            <span className="w-2 h-2 rounded-full bg-racing-red shrink-0 animate-ping" />
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
            <span className="font-orbitron text-[9px] font-black tracking-widest text-racing-red uppercase">Race Control Registry</span>
          </div>
          <h1 className="text-4xl font-orbitron font-black italic">DRIVER ROCKS</h1>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Driver Name or email..."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-9 font-orbitron text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-racing-red w-full sm:w-64 transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Registered Drivers', value: totalDriversCount, icon: Users, color: 'text-racing-red' },
          { label: 'Average ERS Points', value: avgPoints, icon: Star, color: 'text-yellow-400' },
          { label: 'Staff Clearances', value: staffCount, icon: ShieldAlert, color: 'text-blue-400' }
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

      {/* Roster & Inspect Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Driver List */}
        <div className="lg:col-span-8 space-y-3">
          {loading ? (
            <div className="glass p-12 text-center rounded-2xl border-white/5 font-orbitron text-white/30 text-xs animate-pulse">
              Synchronizing Live Driver Registry...
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass p-16 text-center rounded-2xl border-white/5">
              <Users size={32} className="mx-auto text-white/10 mb-4" />
              <div className="font-orbitron text-xs font-bold text-white/40 uppercase tracking-widest">No matching drivers found</div>
            </div>
          ) : (
            filtered.map((driver) => (
              <div
                key={driver.id}
                onClick={() => { setSelectedDriver(driver); playSound('click'); }}
                className={`glass p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedDriver?.id === driver.id 
                    ? 'border-racing-red bg-racing-red/5' 
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-orbitron text-xs font-black italic shrink-0">
                    {driver.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-orbitron text-xs font-bold text-white truncate">{driver.full_name}</span>
                      {driver.role !== 'driver' && (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-orbitron font-black uppercase tracking-wider border ${
                          driver.role === 'admin' 
                            ? 'bg-racing-red/10 border-racing-red/20 text-racing-red' 
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          {driver.role}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/40 truncate">{driver.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="font-orbitron text-[10px] font-black text-racing-red">{driver.driver_rank}</div>
                    <div className="text-[9px] text-white/30 uppercase font-orbitron font-bold">LVL {driver.level}</div>
                  </div>
                  <ChevronRight size={14} className="text-white/20" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Adjuster Details Sheet */}
        <div className="lg:col-span-4">
          <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden h-fit sticky top-32">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-racing-red" />
            
            {selectedDriver ? (
              <div className="space-y-6">
                {/* Header Profile Info */}
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 border-2 border-racing-red/40 flex items-center justify-center font-orbitron text-base font-black italic text-racing-red shrink-0">
                    {selectedDriver.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-orbitron font-black text-sm text-white truncate uppercase tracking-wider">{selectedDriver.full_name}</h3>
                    <span className="font-mono text-[9px] text-white/30 truncate block">{selectedDriver.id}</span>
                  </div>
                </div>

                {/* ERS Loyalty Points Adjusters */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-widest">ERS Point Wallet</span>
                    <span className="font-orbitron font-black text-sm text-yellow-400">{selectedDriver.credits} pts</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAdjustPoints(selectedDriver.id, 100)}
                      className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-orbitron font-bold text-white transition-all"
                    >
                      +100
                    </button>
                    <button
                      onClick={() => handleAdjustPoints(selectedDriver.id, 500)}
                      className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-orbitron font-bold text-white transition-all"
                    >
                      +500
                    </button>
                    <button
                      onClick={() => handleAdjustPoints(selectedDriver.id, -100)}
                      className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-orbitron font-bold text-white/60 transition-all"
                    >
                      -100
                    </button>
                  </div>
                </div>

                {/* Level Adjusters */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-widest">Driver Rank & level</span>
                    <span className="font-orbitron font-black text-xs text-white">{selectedDriver.driver_rank} (LVL {selectedDriver.level})</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdjustLevel(selectedDriver.id, -1)}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-orbitron font-bold text-white transition-all"
                      disabled={selectedDriver.level <= 1}
                    >
                      LEVEL DOWN
                    </button>
                    <button
                      onClick={() => handleAdjustLevel(selectedDriver.id, 1)}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-orbitron font-bold text-white transition-all"
                      disabled={selectedDriver.level >= 10}
                    >
                      LEVEL UP
                    </button>
                  </div>
                </div>

                {/* Role Toggles */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <span className="font-orbitron text-[9px] font-black text-white/40 uppercase tracking-widest block">Race Control Access</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['driver', 'staff', 'admin'] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => handleToggleRole(selectedDriver.id, role)}
                        className={`py-1.5 border rounded-lg text-[9px] font-orbitron font-black uppercase tracking-widest transition-all ${
                          selectedDriver.role === role 
                            ? 'bg-racing-red border-racing-red text-white' 
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-white/40 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24">
                <Users size={24} className="mx-auto text-white/20 mb-3" />
                <p className="font-orbitron text-[10px] font-bold text-white/40 uppercase tracking-widest">Select a driver profile sheet to inspect statistics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
