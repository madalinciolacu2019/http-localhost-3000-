'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, Crown, Zap, ShieldCheck, Trophy, ChevronRight,
  Settings, LogOut, CreditCard, History, Target, Bell,
  Lock, Volume2, Cpu, Package, Clock, CheckCircle, Activity
} from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/shared/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items?: { product_name: string; quantity: number; price: number }[];
};

export default function PaddockClubPage() {
  const { playSound } = useSound();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [rewardNotified, setRewardNotified] = useState(false);
  const [qrUrl, setQrUrl] = useState('http://192.168.1.8:5173/menu');

  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [redeemedRewards, setRedeemedRewards] = useState<any[]>([]);

  // Load redeemed rewards when user is set
  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`redeemed_rewards_${user.id}`);
      if (stored) {
        setRedeemedRewards(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabase) {
      Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('bookings').select('*').eq('user_id', user.id).order('booking_date', { ascending: false }),
        supabase.from('telemetry_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]).then(([profileRes, bookingsRes, telemetryRes]) => {
        if (profileRes.data) setProfile(profileRes.data);
        if (bookingsRes.data) setBookings(bookingsRes.data);
        if (telemetryRes.data) setTelemetryLogs(telemetryRes.data);
        setDataLoading(false);
      }).catch(err => {
        console.error("Error loading paddock telemetry data:", err);
        setDataLoading(false);
      });
    } else {
      // Mock data in localStorage fallback
      const storedKey = `profile_demo_${user.id}`;
      const stored = localStorage.getItem(storedKey);
      let localProfile = {
        full_name: user.user_metadata?.full_name || 'Demo Driver',
        credits: 1250,
        xp: 3200,
        level: 4,
        role: 'admin'
      };
      if (stored) {
        try {
          localProfile = JSON.parse(stored);
        } catch (e) {}
      } else {
        localStorage.setItem(storedKey, JSON.stringify(localProfile));
      }
      setProfile(localProfile);
      setBookings([
        { id: 'b1', booking_date: new Date().toISOString().split('T')[0], start_time: '14:00', end_time: '15:00', status: 'confirmed', total_price: 45, rig_id: 1 }
      ]);
      setTelemetryLogs([
        { id: 't1', track_name: 'Spa-Francorchamps', car_name: 'Apex Motion Rig', lap_time_ms: 106450, max_speed_kmh: 312.4, created_at: new Date().toISOString() },
        { id: 't2', track_name: 'Monza Circuit', car_name: 'Fanatec Direct Drive', lap_time_ms: 82120, max_speed_kmh: 345.8, created_at: new Date(Date.now() - 86400000).toISOString() }
      ]);
      setDataLoading(false);
    }
  }, [user]);

  const [settingsState, setSettingsState] = useState({
    notifications: true,
    security: true,
    audioEngine: true,
    performance: false
  });

  const [toast, setToast] = useState<{ show: boolean, message: string, title?: string }>({ show: false, message: '' });

  const triggerNotification = (title: string, message: string) => {
    playSound('engine-rev');
    setToast({ show: true, title, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleRedeem = async (rewardTitle: string, rewardPts: number) => {
    if (!user || !profile) return;
    playSound('click');

    const currentPts = profile.credits || 0;
    if (currentPts < rewardPts) {
      triggerNotification('INSUFFICIENT FUNDS', 'Not enough ERS points to redeem this reward.');
      return;
    }

    playSound('pit-stop');
    const newPts = currentPts - rewardPts;
    const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ credits: newPts, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        
        if (error) throw error;
        setProfile((prev: any) => ({ ...prev, credits: newPts }));
      } catch (err) {
        console.error("Failed to redeem reward in Supabase:", err);
        triggerNotification('SYSTEM ERROR', 'Could not process redemption on telemetry network.');
        return;
      }
    } else {
      const storedKey = `profile_demo_${user.id}`;
      const updatedProfile = { ...profile, credits: newPts };
      localStorage.setItem(storedKey, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    }

    // Generate voucher code
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const voucherCode = `APEX-${rewardTitle.toUpperCase().replace(/\s+/g, '')}-${randomHex}`;
    const newVoucher = {
      code: voucherCode,
      reward: rewardTitle,
      pts: rewardPts,
      redeemedAt: new Date().toISOString()
    };

    const updatedVouchers = [newVoucher, ...redeemedRewards];
    localStorage.setItem(`redeemed_rewards_${user.id}`, JSON.stringify(updatedVouchers));
    setRedeemedRewards(updatedVouchers);

    triggerNotification('REWARD REDEEMED', `Successfully unlocked ${rewardTitle}! Code: ${voucherCode}`);
  };

  const toggleSetting = (key: keyof typeof settingsState) => {
    playSound('click');
    const newState = !settingsState[key];
    setSettingsState(prev => ({ ...prev, [key]: newState }));

    if (key === 'notifications' && newState) {
      triggerNotification('TELEMETRY ALERT', 'Engine parameters nominal. Ready for qualifying.');
    }
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/paddock-pass');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Hardcode to current active network IP
    setQrUrl('http://192.168.68.60:5173/menu');
  }, []);

  // Fetch orders when history/billing/rewards tab is opened
  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'billing' || activeTab === 'rewards') && user) {
      setOrdersLoading(true);
      
      // Determine if real Supabase is configured
      const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (isSupabaseConfigured) {
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            setOrders((data as Order[]) || []);
            setOrdersLoading(false);
          });
      } else {
        // Read Demo mode orders from localStorage
        const localOrders: Order[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('order_demo_')) {
            try {
              const orderData = JSON.parse(localStorage.getItem(key) || '{}');
              if (orderData.id) {
                localOrders.push({
                  id: orderData.id,
                  status: 'completed',
                  total: orderData.total,
                  created_at: new Date(orderData.created * 1000).toISOString(),
                  order_items: orderData.items || []
                });
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        }
        localOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(localOrders);
        setOrdersLoading(false);
      }
    }
  }, [activeTab, user]);

  const handleTerminateSession = async () => {
    playSound('pit-stop');
    setIsLoggingOut(true);
    await signOut();
    setTimeout(() => router.push('/'), 1500);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'DRIVER';

  const tabs = [
    { id: 'overview', label: 'OVERVIEW', icon: User },
    { id: 'rewards', label: 'REWARDS', icon: Crown },
    { id: 'history', label: 'HISTORY', icon: History },
    { id: 'billing', label: 'BILLING', icon: CreditCard },
    { id: 'telemetry', label: 'TELEMETRY', icon: Activity },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-racing-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-carbon-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-racing-red/5 skew-x-[-15deg] -translate-x-1/2" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

      {/* Logout Overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 border-4 border-racing-red border-t-transparent rounded-full mb-8"
            />
            <h2 className="font-orbitron text-3xl font-black italic text-white tracking-tighter">PIT STOP IN PROGRESS</h2>
            <p className="text-white/40 text-[10px] tracking-[0.5em] mt-4 uppercase">Terminating Encrypted Session...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification Overlay */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: -20 }}
            className="fixed top-24 right-8 z-[150] glass border-l-[4px] border-pit-yellow p-4 shadow-2xl min-w-[300px] backdrop-blur-xl bg-black/60"
          >
            <div className="flex items-start gap-3">
              <Bell className="text-pit-yellow mt-1 animate-pulse" size={16} />
              <div>
                <h4 className="font-orbitron text-[10px] font-black text-white uppercase tracking-widest mb-1">{toast.title || 'SYSTEM ALERT'}</h4>
                <p className="text-[11px] text-white/70 font-mono leading-relaxed">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setShowQR(false)}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 cursor-pointer"
          >
            <div 
              className="bg-white p-6 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={qrUrl} className="block">
                <QRCodeSVG 
                  value={qrUrl} 
                  size={256}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                />
              </a>
            </div>
            <p className="text-white/50 text-[10px] uppercase font-orbitron tracking-widest mt-6">SCAN AT FUELING STATION</p>
            <p className="text-racing-red text-[8px] uppercase font-orbitron tracking-widest mt-2">TAP ANYWHERE TO CLOSE</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-racing-red" />
              <span className="font-orbitron text-[10px] font-black tracking-[0.5em] text-racing-red">PADDOCK CLUB EXCLUSIVE</span>
            </div>
            <h1 className="font-orbitron text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">
              WELCOME BACK, <br />
              <span className="text-racing-red">{displayName.toUpperCase()}</span>
            </h1>
          </div>

          <div className="glass p-8 border-l-[6px] border-pit-yellow min-w-[300px]">
            <div className="flex justify-between items-start mb-6">
              <div className="font-orbitron text-[10px] font-black text-white/40 tracking-widest">MEMBERSHIP STATUS</div>
              <div className="p-1 bg-pit-yellow/20 rounded"><Crown size={16} className="text-pit-yellow" /></div>
            </div>
            <div className="font-orbitron text-2xl font-black italic text-white mb-2 tracking-tight">CLUB MEMBER</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-black tracking-widest">ACTIVE SESSION</span>
            </div>
            <div className="mt-3 text-[9px] text-white/30 font-orbitron tracking-widest truncate">{user.email}</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-1 gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); playSound('click'); }}
                className={`w-full p-4 lg:p-6 flex items-center justify-center lg:justify-between transition-all skew-x-[-15deg] group ${
                  activeTab === tab.id 
                    ? 'bg-racing-red text-white shadow-[0_0_30px_#E10600]' 
                    : 'glass bg-white/5 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-4 skew-x-[15deg]">
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'group-hover:text-racing-red transition-colors'} />
                  <span className="font-orbitron font-black text-[9px] lg:text-[11px] tracking-[0.2em]">{tab.label}</span>
                </div>
                <ChevronRight size={16} className={`skew-x-[15deg] hidden lg:block ${activeTab === tab.id ? 'text-white' : 'text-white/10 group-hover:text-racing-red group-hover:translate-x-1 transition-all'}`} />
              </button>
            ))}

            <div className="pt-8">
              <button 
                onClick={handleTerminateSession}
                className="w-full p-6 glass border-racing-red/20 text-racing-red/60 hover:bg-racing-red hover:text-white flex items-center gap-4 skew-x-[-15deg] transition-all group"
              >
                <LogOut size={18} className="skew-x-[15deg]" />
                <span className="font-orbitron text-[10px] font-black tracking-[0.2em] skew-x-[15deg]">TERMINATE SESSION</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="glass p-12 border-white/5 min-h-[600px] relative overflow-hidden"
              >
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-12 relative z-10">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* Left Column: Driver Stats and Achievements */}
                      <div className="xl:col-span-2 space-y-8">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <div className="text-[10px] text-white/30 font-black tracking-widest uppercase flex items-center gap-2">
                              <Target size={12} className="text-racing-red animate-pulse" /> TOTAL ORDERS
                            </div>
                            <div className="font-orbitron text-3xl font-black italic text-white tracking-tighter">{orders.length || '—'}</div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-[10px] text-white/30 font-black tracking-widest uppercase flex items-center gap-2">
                              <Crown size={12} className="text-pit-yellow" /> ERS POINTS
                            </div>
                            <div className="font-orbitron text-3xl font-black italic text-pit-yellow tracking-tighter">
                              {profile?.credits || 0} PTS
                            </div>
                          </div>

                          <div className="space-y-2 col-span-2 sm:col-span-1">
                            <div className="text-[10px] text-white/30 font-black tracking-widest uppercase flex items-center gap-2">
                              <ShieldCheck size={12} className="text-blue-400" /> DRIVER LEVEL
                            </div>
                            <div className="font-orbitron text-3xl font-black italic text-white tracking-tighter">
                              LVL {profile?.level || 1}
                            </div>
                          </div>
                        </div>

                        {/* Experience point progress bar */}
                        <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                            <span>CHASSIS TUNING XP</span>
                            <span className="text-racing-red font-bold">{(profile?.xp || 0) % 1000} / 1000 XP</span>
                          </div>
                          <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
                            <div 
                              className="h-full bg-gradient-to-r from-racing-red to-orange-500 shadow-[0_0_10px_#E10600]" 
                              style={{ width: `${((profile?.xp || 0) % 1000) / 10}%` }}
                            />
                          </div>
                        </div>

                        {/* Achievements Row */}
                        <div className="space-y-3">
                          <div className="text-[9px] text-white/30 font-black tracking-widest uppercase">DRIVER BADGES & ACCREDITATIONS</div>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 py-2 px-3 bg-white/5 border border-white/5 rounded-lg text-[9px] font-mono text-white/70">
                              <Zap size={14} className="text-pit-yellow" /> <span>GRID LAUNCHER</span>
                            </div>
                            <div className="flex items-center gap-2 py-2 px-3 bg-white/5 border border-white/5 rounded-lg text-[9px] font-mono text-white/70">
                              <Trophy size={14} className="text-racing-red" /> <span>PODIUM PACE</span>
                            </div>
                            <div className="flex items-center gap-2 py-2 px-3 bg-white/5 border border-white/5 rounded-lg text-[9px] font-mono text-white/70">
                              <ShieldCheck size={14} className="text-blue-400" /> <span>TELEMETRY MASTER</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Simulated Apple Wallet Pass */}
                      <div className="space-y-4">
                        <div className="text-[10px] text-white/30 font-black tracking-widest uppercase text-center xl:text-left">
                          DIGITAL WALLET MEMBERSHIP
                        </div>
                        <div className="glass p-6 rounded-3xl border border-racing-red/20 bg-gradient-to-br from-black/95 to-racing-red/10 relative overflow-hidden flex flex-col justify-between max-w-sm mx-auto shadow-2xl skew-y-[-1deg] group hover:scale-[1.01] transition-all">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-racing-red/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-racing-red rounded-full animate-pulse" />
                              <span className="font-orbitron text-[9px] font-black text-white tracking-widest uppercase">COFFEE XF1 PASS</span>
                            </div>
                            <span className="font-orbitron text-[8px] font-bold text-racing-red border border-racing-red/30 px-2 py-0.5 rounded tracking-wider uppercase">PADDOCK CLUB</span>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[7px] text-white/40 font-mono tracking-widest uppercase block">MEMBER PROFILE</span>
                              <span className="font-orbitron text-sm font-black text-white italic uppercase tracking-tighter">
                                {profile?.full_name?.toUpperCase() || displayName.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[7px] text-white/40 font-mono tracking-widest uppercase block">ERS BALANCE</span>
                                <span className="font-orbitron text-lg font-black text-pit-yellow">{profile?.credits || 0} PTS</span>
                              </div>
                              <div>
                                <span className="text-[7px] text-white/40 font-mono tracking-widest uppercase block">CHASSIS LEVEL</span>
                                <span className="font-orbitron text-lg font-black text-white">LVL {profile?.level || 1}</span>
                              </div>
                            </div>

                            <div className="bg-black/80 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                              <div>
                                <span className="text-[6px] text-white/40 font-mono uppercase tracking-widest block">TELEMETRY ID</span>
                                <span className="text-[9px] text-white font-mono uppercase tracking-wider">{user.id.slice(0, 12).toUpperCase()}...</span>
                              </div>
                              {/* Functional QR code for Points Scanning */}
                              <div 
                                className="w-16 h-16 bg-white p-1 rounded flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => { playSound('click'); setShowQR(true); }}
                                title="Click to enlarge"
                              >
                                <QRCodeSVG 
                                  value={user.id} 
                                  size={56}
                                  bgColor={"#ffffff"}
                  level={"M"}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/10 hidden md:block">
                            <a 
                              href={`/api/wallet/pass?userId=${user.id}&download=true`} 
                              className="btn-racing !py-2.5 text-[9px] w-full text-center flex items-center justify-center gap-1.5"
                              onClick={() => playSound('click')}
                            >
                              <CreditCard size={12} /> ADD TO APPLE WALLET
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bookings and Telemetry Grid lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                      {/* Telemetry Logs */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <Target className="text-racing-red animate-pulse" size={14} />
                          <span className="font-orbitron text-[10px] font-black text-white uppercase tracking-wider">LIVE TELEMETRY LAP RECORDS</span>
                        </div>
                        {telemetryLogs.length === 0 ? (
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono py-4 text-center">No telemetry loops synchronized yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                            {telemetryLogs.map((log, index) => (
                              <div key={log.id || index} className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-[10px] font-mono hover:bg-white/10 transition-colors">
                                <div>
                                  <span className="text-white block font-orbitron font-bold uppercase tracking-wider">{log.track_name}</span>
                                  <span className="text-white/40 block text-[9px] mt-0.5">{log.car_name}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-green-400 block font-orbitron font-black">{Math.floor(log.lap_time_ms / 60000)}:{(Math.floor((log.lap_time_ms % 60000) / 1000)).toString().padStart(2, '0')}.{(log.lap_time_ms % 1000).toString().padStart(3, '0')}</span>
                                  <span className="text-white/30 block text-[8px] mt-0.5">{log.max_speed_kmh} KM/H</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Active Bookings */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <Clock className="text-pit-yellow" size={14} />
                          <span className="font-orbitron text-[10px] font-black text-white uppercase tracking-wider">ACTIVE SIMULATOR SLOTS</span>
                        </div>
                        {bookings.length === 0 ? (
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono py-4 text-center">No active simulator rig slots locked.</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                            {bookings.map((booking, index) => (
                              <div key={booking.id || index} className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-[10px] font-mono hover:bg-white/10 transition-colors">
                                <div>
                                  <span className="text-white block font-orbitron font-bold uppercase tracking-wider">
                                    {booking.rig_id === 1 ? 'APEX MOTION RIG' : booking.rig_id === 2 ? 'FANATEC DIRECT DRIVE' : 'VR G-FORCE POD'}
                                  </span>
                                  <span className="text-white/40 block text-[9px] mt-0.5">{booking.booking_date}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-pit-yellow block font-orbitron font-black uppercase tracking-wider">{booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</span>
                                  <span className="text-white/30 block text-[8px] mt-0.5">STATUS: {booking.status.toUpperCase()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex gap-4">
                      <Link href="/menu">
                        <button className="btn-racing flex items-center gap-3 text-[11px]" onClick={() => playSound('engine-rev')}>
                          <Package size={16} />
                          ORDER COFFEE NOW
                        </button>
                      </Link>

                    </div>
                  </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                      <div className="p-4 bg-racing-red rounded-lg"><History size={24} className="text-white" /></div>
                      <div>
                        <h2 className="font-orbitron text-2xl font-black italic text-white tracking-tight uppercase">Race History</h2>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest">Your past orders</p>
                      </div>
                    </div>

                    {ordersLoading ? (
                      <div className="flex justify-center py-20">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8 border-2 border-racing-red border-t-transparent rounded-full"
                        />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <Package size={48} className="text-white/10" />
                        <p className="font-orbitron text-sm font-black text-white/20 tracking-widest uppercase">No Orders Yet</p>
                        <p className="text-[10px] text-white/10 tracking-widest">Place your first order from the Fueling Station</p>
                        <Link href="/menu">
                          <button className="btn-racing text-[10px] px-6 py-2 mt-2">BROWSE MENU</button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="glass border-white/5 rounded-xl p-6 hover:border-racing-red/20 transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle size={12} className="text-green-400" />
                                  <span className="text-[9px] text-green-400 font-orbitron font-black tracking-widest uppercase">{order.status}</span>
                                </div>
                                <p className="font-orbitron text-white font-black text-sm">ORDER #{order.id.slice(-8).toUpperCase()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-orbitron text-racing-red font-black text-lg">€{order.total.toFixed(2)}</p>
                                <div className="flex items-center gap-1 text-white/30 text-[9px] font-orbitron tracking-widest mt-1">
                                  <Clock size={10} />
                                  {new Date(order.created_at).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                            {order.order_items && order.order_items.length > 0 && (
                              <div className="border-t border-white/5 pt-4 space-y-1">
                                {order.order_items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-[10px] text-white/40 font-orbitron">
                                    <span>{item.product_name} ×{item.quantity}</span>
                                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* BILLING TAB */}
                {activeTab === 'billing' && (
                  <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                      <div className="p-4 bg-racing-red rounded-lg"><CreditCard size={24} className="text-white" /></div>
                      <div>
                        <h2 className="font-orbitron text-2xl font-black italic text-white tracking-tight uppercase">Billing Center</h2>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest">Manage payments & receipts</p>
                      </div>
                    </div>

                    <div className="glass border-pit-yellow/20 rounded-xl p-6">
                      <p className="font-orbitron text-[11px] text-white/60 mb-4">
                        All payments are processed securely via <span className="text-pit-yellow">Stripe</span>. You can download receipts from your Stripe invoice emails.
                      </p>
                      <div className="space-y-2">
                        <p className="text-[9px] text-white/30 font-orbitron tracking-widest">TOTAL SPENT</p>
                        <p className="font-orbitron text-3xl font-black text-racing-red">
                          €{orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-orbitron text-[10px] text-white/30 tracking-widest uppercase">RECENT TRANSACTIONS</p>
                      {ordersLoading ? (
                        <div className="flex justify-center py-8">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-6 h-6 border-2 border-racing-red border-t-transparent rounded-full" />
                        </div>
                      ) : orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="glass border-white/5 rounded-xl p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={14} className="text-green-400" />
                            <div>
                              <p className="font-orbitron text-[11px] text-white font-black">#{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-[9px] text-white/30 font-orbitron tracking-widest">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="font-orbitron text-sm font-black text-racing-red">€{order.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REWARDS TAB */}
                {activeTab === 'rewards' && (
                  <div className="space-y-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-pit-yellow rounded-lg"><Crown size={24} className="text-black" /></div>
                        <div>
                          <h2 className="font-orbitron text-2xl font-black italic text-white tracking-tight uppercase">Pit Stop Rewards</h2>
                          <p className="text-white/30 text-[10px] uppercase tracking-widest">Redeem points for exclusive gear</p>
                        </div>
                      </div>
                      <div className="md:text-right bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-[10px] text-white/50 font-orbitron tracking-widest uppercase mb-1">AVAILABLE POINTS</p>
                        <p className="font-orbitron text-4xl font-black text-pit-yellow">{profile?.credits ?? 0}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { title: 'Free Apex Espresso', pts: 300, desc: 'A complimentary double-shot of our high-octane dark roast blend.', icon: Package },
                        { title: 'F1 Telemetry HUD Customizer', pts: 500, desc: 'Unlock racing telemetry HUD overlays on your driver profile dashboard.', icon: Target },
                        { title: 'Championship Coffee Cup', pts: 800, desc: 'Voucher for our custom insulated double-walled steel thermal mug.', icon: Trophy },
                        { title: 'Redline Audio Engine Swap', pts: 1200, desc: 'Swap standard UI clicks for legendary V10 engine roar sound effects.', icon: Crown },
                        { title: 'Carbon Fiber Travel Mug', pts: 2000, desc: 'Ultra-lightweight genuine carbon fiber thermal commuter mug.', icon: Trophy },
                        { title: 'Factory Tour & Sim Ride', pts: 5000, desc: 'VIP access behind the scenes at our roastery and 1 hour inside the motion simulator.', icon: Target },
                      ].map((reward, i) => {
                        const currentPts = profile?.credits ?? 0;
                        const canRedeem = currentPts >= reward.pts;
                        return (
                          <div key={i} className="glass p-6 border-white/5 hover:border-pit-yellow/30 transition-all flex flex-col justify-between group">
                            <div className="flex justify-between items-start mb-6">
                              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-pit-yellow/10 transition-colors">
                                <reward.icon size={20} className="text-white/40 group-hover:text-pit-yellow transition-colors" />
                              </div>
                              <div className="font-orbitron text-lg font-black text-pit-yellow">{reward.pts} PTS</div>
                            </div>
                            <div className="mb-8">
                              <h3 className="font-orbitron text-sm font-black text-white uppercase mb-2">{reward.title}</h3>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">{reward.desc}</p>
                            </div>
                            <button 
                              onClick={() => canRedeem && handleRedeem(reward.title, reward.pts)}
                              disabled={!canRedeem}
                              className={`w-full py-4 text-[10px] font-orbitron font-black tracking-[0.2em] skew-x-[-10deg] transition-all ${
                                canRedeem 
                                  ? 'bg-pit-yellow text-black hover:bg-white cursor-pointer' 
                                  : 'bg-white/5 text-white/30 cursor-not-allowed'
                              }`}
                            >
                              <span className="skew-x-[10deg] block">{canRedeem ? 'REDEEM REWARD' : 'INSUFFICIENT POINTS'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Racing Vouchers */}
                    {redeemedRewards.length > 0 && (
                      <div className="space-y-4 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Crown className="text-pit-yellow animate-pulse" size={14} />
                          <span className="font-orbitron text-[10px] font-black text-white uppercase tracking-wider">ACTIVE RACING VOUCHERS</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {redeemedRewards.map((voucher, idx) => (
                            <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-lg flex flex-col justify-between font-mono text-[11px] relative overflow-hidden group hover:border-pit-yellow/20 transition-all">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-pit-yellow/5 rounded-full blur-xl pointer-events-none" />
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-white font-orbitron font-bold uppercase tracking-wider block">{voucher.reward}</span>
                                  <span className="text-white/30 text-[9px] block">Redeemed: {new Date(voucher.redeemedAt).toLocaleDateString()}</span>
                                </div>
                                <span className="text-pit-yellow font-orbitron font-black">{voucher.pts} PTS</span>
                              </div>
                              <div className="bg-black/40 rounded border border-white/5 p-2 flex justify-between items-center mt-2">
                                <span className="text-white/80 font-mono tracking-widest text-[10px] select-all cursor-pointer" title="Click to copy">{voucher.code}</span>
                                <span className="text-[8px] text-pit-yellow uppercase tracking-widest font-orbitron font-black">READY</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between bg-pit-yellow/5 border border-pit-yellow/10 p-6 rounded-xl gap-6">
                      <div>
                        <h4 className="font-orbitron text-sm font-black text-white uppercase mb-1">NEW REWARDS DROPPING SOON</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Be the first to know when limited edition gear is available.</p>
                      </div>
                      <button 
                        onClick={() => { playSound('click'); setRewardNotified(true); triggerNotification('REWARDS SYSTEM', 'You will be notified for the next exclusive gear drop.'); }}
                        disabled={rewardNotified}
                        className={`px-8 py-4 font-orbitron text-[10px] font-black tracking-[0.4em] transition-all skew-x-[-15deg] whitespace-nowrap ${rewardNotified ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-white text-black hover:bg-pit-yellow'}`}
                      >
                        <span className="skew-x-[15deg] flex items-center justify-center gap-2">
                          {rewardNotified ? <CheckCircle size={14} /> : <Bell size={14} />}
                          {rewardNotified ? 'NOTIFICATIONS ON' : 'NOTIFY ME'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TELEMETRY TAB */}
                {activeTab === 'telemetry' && (
                  <div className="space-y-12 relative z-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                      <div className="p-4 bg-racing-red rounded-lg"><Activity size={24} className="text-white" /></div>
                      <div>
                        <h2 className="font-orbitron text-2xl font-black italic text-white tracking-tight uppercase">Caffeine Telemetry</h2>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest">Real-time driver energy logs</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* G-Force Flavor Radar */}
                      <div className="glass p-6 border-white/5 rounded-xl space-y-4">
                        <h3 className="font-orbitron text-xs font-black text-white uppercase tracking-wider">Caffeine G-Force radar</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                          Plots sweet vs. acidic vs. bold profile parameters of your consumption patterns.
                        </p>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                              { subject: 'Acidity', A: 70, fullMark: 100 },
                              { subject: 'Sweetness', A: 85, fullMark: 100 },
                              { subject: 'Body', A: 90, fullMark: 100 },
                              { subject: 'Crema', A: 75, fullMark: 100 },
                              { subject: 'Aftertaste', A: 80, fullMark: 100 },
                            ]}>
                              <PolarGrid stroke="rgba(255,255,255,0.1)" />
                              <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={10} fontFamily="monospace" />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={false} />
                              <Radar name="Fuel Profile" dataKey="A" stroke="#E10600" fill="#E10600" fillOpacity={0.25} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Caffeine Decay (RoR) */}
                      <div className="glass p-6 border-white/5 rounded-xl space-y-4">
                        <h3 className="font-orbitron text-xs font-black text-white uppercase tracking-wider">Caffeine Rate of Rise (RoR)</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                          Simulated absorption and decay of caffeine in the driver's bloodstream over a 12-hour session.
                        </p>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                              { hour: '0h', level: 0 },
                              { hour: '1h', level: 95 },
                              { hour: '2h', level: 85 },
                              { hour: '3h', level: 75 },
                              { hour: '4h', level: 60 },
                              { hour: '5h', level: 50 },
                              { hour: '6h', level: 42 },
                              { hour: '7h', level: 35 },
                              { hour: '8h', level: 28 },
                              { hour: '9h', level: 22 },
                              { hour: '10h', level: 18 },
                              { hour: '11h', level: 12 },
                              { hour: '12h', level: 8 },
                            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace" />
                              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace" />
                              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace', fontSize: 10 }} />
                              <Line type="monotone" dataKey="level" stroke="#E10600" strokeWidth={2} dot={{ fill: '#E10600', r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Sectors and Extraction Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                      <div className="glass p-5 border-white/5 rounded-xl">
                        <span className="text-[8px] text-white/30 font-black tracking-widest uppercase block mb-1">TOTAL FUEL INTAKE</span>
                        <span className="font-orbitron text-2xl font-black italic text-white tracking-tight">4.2 LITERS</span>
                        <span className="text-[8px] text-white/40 font-mono block mt-1">12 Cups equivalent logged</span>
                      </div>
                      <div className="glass p-5 border-white/5 rounded-xl">
                        <span className="text-[8px] text-white/30 font-black tracking-widest uppercase block mb-1">AVG EXTRACTION PRESSURE</span>
                        <span className="font-orbitron text-2xl font-black italic text-green-400 tracking-tight">9.24 BAR</span>
                        <span className="text-[8px] text-white/40 font-mono block mt-1">Optimal espresso zone calibration</span>
                      </div>
                      <div className="glass p-5 border-white/5 rounded-xl">
                        <span className="text-[8px] text-white/30 font-black tracking-widest uppercase block mb-1">MAX RPM ENERGY SCORE</span>
                        <span className="font-orbitron text-2xl font-black italic text-pit-yellow tracking-tight">14,800 RPM</span>
                        <span className="text-[8px] text-white/40 font-mono block mt-1">Peak driver focus sector achieved</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-12 relative z-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                      <div className="p-4 bg-racing-red rounded-lg"><Settings size={24} className="text-white" /></div>
                      <div>
                        <h2 className="font-orbitron text-2xl font-black italic text-white tracking-tight uppercase">Control Center</h2>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest">Manage your Paddock Club experience</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Telemetry alerts and race starts' },
                        { id: 'security', label: 'Security', icon: Lock, desc: 'Encrypted key management' },
                        { id: 'audioEngine', label: 'Audio Engine', icon: Volume2, desc: 'Mechanical feedback volume' },
                        { id: 'performance', label: 'Performance', icon: Cpu, desc: '3D rendering optimization' },
                      ].map((item, i) => {
                        const isActive = settingsState[item.id as keyof typeof settingsState];
                        return (
                        <div 
                          key={i} 
                          onClick={() => toggleSetting(item.id as keyof typeof settingsState)}
                          className={`glass p-8 transition-all flex justify-between items-center group cursor-pointer ${isActive ? 'border-racing-red/30 bg-racing-red/5' : 'border-white/5 hover:bg-white/5'}`}
                        >
                          <div className="flex gap-4 items-center">
                            <item.icon size={20} className={`transition-colors ${isActive ? 'text-racing-red' : 'text-white/20 group-hover:text-racing-red'}`} />
                            <div>
                              <div className="text-[10px] font-black text-white tracking-widest uppercase mb-1">{item.label}</div>
                              <div className="text-[8px] text-white/30 uppercase tracking-widest">{item.desc}</div>
                            </div>
                          </div>
                          <div className={`w-10 h-6 rounded-full relative p-1 transition-colors ${isActive ? 'bg-racing-red/20' : 'bg-white/5 group-hover:bg-racing-red/10'}`}>
                            <div className={`w-4 h-4 rounded-full transition-all ${isActive ? 'translate-x-4 bg-racing-red shadow-[0_0_10px_#E10600]' : 'bg-white/20 group-hover:bg-racing-red/50'}`} />
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
