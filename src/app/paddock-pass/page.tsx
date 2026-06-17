'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/frontend/components/Navbar';
import Footer from '@/frontend/components/Footer';
import { useAuth } from '@/frontend/context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Unlock, Zap, Trophy, History, Shield, Database, Crosshair, Eye, EyeOff, User, ChevronLeft, Plus } from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/frontend/context/DatabaseContext';

interface Profile {
  email: string;
  name: string;
  role: 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';
  avatar: string;
}

const DEFAULT_PROFILES: Profile[] = [
  {
    email: 'madalinciolacu2019@gmail.com',
    name: 'Madalin Ciolacu',
    role: 'CEO',
    avatar: 'M'
  },
  {
    email: 'mihail@apex.com',
    name: 'Mihail',
    role: 'CEO',
    avatar: 'M'
  },
  {
    email: 'steliana@apex.com',
    name: 'Steliana',
    role: 'CUSTOMER',
    avatar: 'S'
  }
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'CEO': return 'text-racing-red border-racing-red/20 shadow-[0_0_15px_rgba(225,6,0,0.15)]';
    case 'MANAGER': return 'text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]';
    case 'EMPLOYEE': return 'text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
    default: return 'text-white/80 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]';
  }
};

export default function PaddockPassPage() {
  const { user, role, signIn, signOut, updateUserMetadata } = useAuth();
  const { playSound } = useSound();
  const { publishSetup } = useDatabase();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedSetups, setPublishedSetups] = useState<Record<string, boolean>>({});
  
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [customProfiles, setCustomProfiles] = useState<Profile[]>([]);

  // Load custom profiles from mock database
  useEffect(() => {
    try {
      const dbStr = localStorage.getItem('mock_users_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const profiles: Profile[] = Object.entries(db).map(([emailKey, info]: [string, any]) => {
          const name = info.full_name || 'Driver';
          const initial = name.trim().charAt(0).toUpperCase() || 'D';
          return {
            email: emailKey,
            name,
            role: (info.role || 'CUSTOMER') as any,
            avatar: initial,
          };
        });
        // Filter out those already in DEFAULT_PROFILES
        const filtered = profiles.filter(
          p => !DEFAULT_PROFILES.some(dp => dp.email.toLowerCase() === p.email.toLowerCase())
        );
        setCustomProfiles(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Extract custom metadata or fallback to defaults
  const ersPoints = user?.user_metadata?.ersPoints || 0;
  const licenseTier = user?.user_metadata?.licenseTier || 'ROOKIE';
  const savedTelemetry = user?.user_metadata?.savedTelemetry || [];

  const handlePublish = (setup: any) => {
    playSound('success');
    publishSetup({
      author: user?.user_metadata?.full_name || 'Driver',
      name: setup.name,
      force: setup.force,
      heat: setup.heat
    });
    setPublishedSetups(prev => ({ ...prev, [setup.name]: true }));
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');
    const res = await signIn(email, password, true, email.split('@')[0]);
    if (res.error) {
      setError(res.error);
      playSound('error');
    } else {
      playSound('success');
      setError(null);
      // Initialize driver data if new
      const currentMeta = res.error ? {} : user?.user_metadata || {};
      if (!currentMeta.ersPoints) {
        updateUserMetadata({
          ersPoints: 1200,
          licenseTier: 'PRO',
          savedTelemetry: [
            { name: 'Quali Espresso', force: 9.5, heat: 96.0 }
          ]
        });
      }
      router.push('/paddock-club');
    }
  };

  const handleLogout = () => {
    playSound('click');
    signOut();
    setSelectedProfile(null);
    setShowManualForm(false);
  };

  const handleSelectProfile = async (profile: Profile) => {
    playSound('click');
    let pwd = 'password';
    try {
      const dbStr = localStorage.getItem('mock_users_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        if (db[profile.email] && db[profile.email].password) {
          pwd = db[profile.email].password;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const res = await signIn(profile.email, pwd, true, profile.name);
    if (res.error) {
      setError(res.error);
      playSound('error');
    } else {
      playSound('success');
      setError(null);
      // Initialize driver data if new
      const currentMeta = res.error ? {} : user?.user_metadata || {};
      if (!currentMeta.ersPoints) {
        updateUserMetadata({
          ersPoints: 1200,
          licenseTier: 'PRO',
          savedTelemetry: [
            { name: 'Quali Espresso', force: 9.5, heat: 96.0 }
          ]
        });
      }
      router.push('/paddock-club');
    }
  };

  const allProfiles = [...DEFAULT_PROFILES, ...customProfiles];

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-[#050508] pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-racing-red/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none mix-blend-overlay" />

        <div className="max-w-5xl mx-auto relative z-10">
          
          {!user ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="glass p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-racing-red to-transparent" />
                
                {!showManualForm ? (
                  <>
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-racing-red/10 flex items-center justify-center border border-racing-red/30">
                        <User size={24} className="text-racing-red" />
                      </div>
                    </div>
                    
                    <h1 className="font-orbitron text-3xl font-black text-white text-center mb-2 tracking-tighter uppercase">Paddock Access</h1>
                    <p className="text-white/40 text-center font-mono text-xs mb-8 uppercase tracking-widest">Select Driver Profile to Connect</p>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-xs font-mono text-center mb-6">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {allProfiles.map((profile, i) => (
                        <motion.button
                          key={profile.email}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => handleSelectProfile(profile)}
                          className="glass p-4 rounded-xl border border-white/10 hover:border-racing-red/50 text-left flex items-center gap-4 transition-all duration-300 hover:bg-white/5 hover:translate-y-[-2px] group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-racing-red/5 blur-[20px] pointer-events-none group-hover:bg-racing-red/10 transition-colors" />
                          <div className={`w-12 h-12 rounded-full bg-black/40 border flex items-center justify-center text-xl font-black font-orbitron group-hover:scale-110 transition-transform ${getRoleColor(profile.role)}`}>
                            {profile.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-orbitron text-sm font-bold text-white truncate">{profile.name}</span>
                              <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase ${
                                profile.role === 'CEO' ? 'bg-racing-red text-white shadow-[0_0_10px_rgba(225,6,0,0.3)]' :
                                profile.role === 'MANAGER' ? 'bg-orange-500 text-black font-bold' :
                                profile.role === 'EMPLOYEE' ? 'bg-blue-500 text-white' :
                                'bg-white/10 text-white/60'
                              }`}>
                                {profile.role}
                              </span>
                            </div>
                            <span className="block font-mono text-[10px] text-white/40 truncate">{profile.email}</span>
                          </div>
                        </motion.button>
                      ))}

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: allProfiles.length * 0.05 }}
                        onClick={() => { playSound('click'); setShowManualForm(true); setError(null); }}
                        className="glass p-4 rounded-xl border border-white/5 border-dashed hover:border-white/30 text-left flex items-center gap-4 transition-all duration-300 hover:bg-white/5 hover:translate-y-[-2px] group"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                          <Plus size={20} />
                        </div>
                        <div>
                          <span className="font-orbitron text-sm font-bold text-white/60 group-hover:text-white block transition-colors uppercase">Custom Access</span>
                          <span className="font-mono text-[10px] text-white/30 group-hover:text-white/40 transition-colors uppercase">Enter driver details</span>
                        </div>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        playSound('click');
                        setSelectedProfile(null);
                        setShowManualForm(false);
                        setError(null);
                      }}
                      className="flex items-center gap-1.5 text-white/40 hover:text-white font-mono text-xs uppercase mb-6 transition-colors"
                    >
                      <ChevronLeft size={14} /> Back to Profiles
                    </button>

                    <div className="flex flex-col items-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-racing-red/10 flex items-center justify-center border border-racing-red/30 mb-3">
                        <Lock size={20} className="text-racing-red" />
                      </div>
                      <h2 className="font-orbitron text-xl font-bold text-white uppercase tracking-tight">Custom Access</h2>
                      <p className="text-white/40 font-mono text-xs mt-1">Enter your credentials below</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-xs font-mono text-center">
                          {error}
                        </div>
                      )}
                      
                      {showManualForm && (
                        <div className="space-y-2">
                          <label className="font-orbitron text-[10px] text-white/50 tracking-widest uppercase">Driver ID (Email)</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-racing-red focus:outline-none transition-colors"
                            required
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="font-orbitron text-[10px] text-white/50 tracking-widest uppercase">Clearance Code (Password)</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pr-12 text-white font-mono text-sm focus:border-racing-red focus:outline-none transition-colors"
                            required
                            placeholder={selectedProfile ? "Enter password" : ""}
                          />
                          <button 
                            type="button"
                            onClick={() => { playSound('click'); setShowPassword(!showPassword); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="w-full btn-racing group">
                        <span className="font-orbitron text-sm font-black relative z-10 flex items-center justify-center gap-2">
                          <Unlock size={16} /> INITIALIZE TELEMETRY
                        </span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={16} className="text-racing-red" />
                    <span className="font-mono text-xs text-racing-red tracking-widest uppercase">Telemetry Link Active</span>
                  </div>
                  <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-4 flex-wrap">
                    {user.user_metadata?.full_name || 'Driver'} Profile
                    {role === 'CEO' && (
                      <span className="px-3 py-1 bg-racing-red text-white text-lg font-black tracking-widest rounded uppercase shadow-[0_0_15px_#E10600]">
                        CEO
                      </span>
                    )}
                  </h1>
                </motion.div>
                
                <div className="flex gap-4">

                  {/* Command Center Quick Access for CEO */}
                  {role === 'CEO' && (
                    <motion.button 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        playSound('scanner');
                        window.location.href = '/command-center';
                      }}
                      className="px-6 py-2 rounded bg-racing-red text-white font-orbitron text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_20px_#E10600] hover:scale-105"
                    >
                      ENTER COMMAND CENTER
                    </motion.button>
                  )}

                  <motion.button 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                    className="hidden md:block px-6 py-2 rounded border border-racing-red/50 text-racing-red hover:bg-racing-red hover:text-white font-orbitron text-xs font-bold tracking-widest uppercase transition-all"
                  >
                    Delete Account
                  </motion.button>
                  
                  <motion.button 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleLogout}
                    className="px-6 py-2 rounded border border-white/10 text-white/50 hover:bg-white/5 hover:text-white font-orbitron text-xs font-bold tracking-widest uppercase transition-all"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* ERS Stats Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-4 glass rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pit-yellow/10 blur-[50px]" />
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-orbitron text-sm font-bold text-white/50 uppercase tracking-widest">ERS Battery</h3>
                    <Zap size={18} className="text-pit-yellow" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <span className="font-orbitron text-5xl font-black text-white tracking-tighter">{ersPoints}</span>
                    <span className="font-mono text-xs text-white/40 block">Loyalty Points Available</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pit-yellow/50 to-pit-yellow w-[65%]" />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10px] text-white/30">
                    <span>0</span>
                    <span>NEXT TIER: 2000</span>
                  </div>
                </motion.div>

                {/* License Tier Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-8 glass rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-racing-red/10 blur-[50px]" />
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-orbitron text-sm font-bold text-white/50 uppercase tracking-widest">Super License Status</h3>
                    <Trophy size={18} className="text-racing-red" />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-racing-red/30 flex items-center justify-center bg-black/50 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-racing-red border-t-transparent animate-spin-slow" />
                      <span className="font-orbitron text-2xl font-black text-white">{licenseTier.charAt(0)}</span>
                    </div>
                    <div>
                      <h2 className="font-orbitron text-3xl font-black text-racing-red uppercase tracking-tighter">
                        {role === 'CEO' ? 'COMMANDER' : `${licenseTier} CLASS`}
                      </h2>
                      <p className="font-mono text-xs text-white/50 mt-2 max-w-sm">
                        {role === 'CEO' 
                          ? 'You have ultimate override capabilities, global Defcon 1 access, and total platform control.' 
                          : 'You have access to custom telemetry blending, early access to new compound roasts, and priority paddock shipping.'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Saved Telemetry */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-6 glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-orbitron text-sm font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                      <Database size={16} /> Saved Setups
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {savedTelemetry.length > 0 ? savedTelemetry.map((setup: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-orbitron text-sm font-bold text-white">{setup.name}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handlePublish(setup)}
                              disabled={publishedSetups[setup.name]}
                              className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold tracking-widest transition-colors ${publishedSetups[setup.name] ? 'bg-white/10 text-white/30' : 'bg-pit-yellow/20 text-pit-yellow hover:bg-pit-yellow hover:text-black'}`}
                            >
                              {publishedSetups[setup.name] ? 'Published' : 'Publish'}
                            </button>
                            <Crosshair size={14} className="text-white/30 group-hover:text-racing-red transition-colors" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block font-mono text-[9px] text-white/40 mb-1">FORCE</span>
                            <span className="font-orbitron text-xs text-pit-yellow font-bold">{setup.force} BAR</span>
                          </div>
                          <div>
                            <span className="block font-mono text-[9px] text-white/40 mb-1">HEAT</span>
                            <span className="font-orbitron text-xs text-racing-red font-bold">{setup.heat} °C</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center border border-white/5 border-dashed rounded-xl">
                        <span className="font-mono text-xs text-white/30">NO SAVED SETUPS FOUND</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Recent Debriefs (Orders) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-6 glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-orbitron text-sm font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                      <History size={16} /> Race Debriefs
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'ORD-7742', item: 'V12 Dark Roast (1kg)', date: '2026-06-01', status: 'DELIVERED' },
                      { id: 'ORD-7711', item: 'Carbon Ceramic Mug', date: '2026-05-15', status: 'DELIVERED' }
                    ].map((order, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
                        <div>
                          <span className="font-orbitron text-xs font-bold text-white block mb-1">{order.item}</span>
                          <span className="font-mono text-[10px] text-white/40">{order.id} • {order.date}</span>
                        </div>
                        <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 font-mono text-[9px] font-bold">
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
