'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Award, AwardIcon, History, AlertTriangle, 
  Trash2, X, Clipboard, Share2, LogOut, CheckCircle, Package, ArrowUpRight, Copy, Check, Crown, Star, SwitchCamera, BarChart, Wallet, ShieldCheck, Layers, Zap, Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSound } from '@/context/SoundContext';
import VipPaddockPass from '@/components/VipPaddockPass';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import SubscriptionManager from '@/components/SubscriptionManager';
import { QRCodeSVG } from 'qrcode.react';
import { products } from '@/lib/products';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Order = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
};

interface DriverProfile {
  credits: number;
  xp: number;
  level: number;
  driver_rank: string;
}

function CeoDashboard() {
  const { playSound } = useSound();
  const [bankBalance, setBankBalance] = useState(0.00);
  const [showBankAccount, setShowBankAccount] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<Array<{ id: string, amount: number, time: string, type: 'settlement' | 'injection' | 'audit' }>>([
    { id: 'TX-INIT-001', amount: 0.00, time: 'System Boot Base', type: 'audit' }
  ]);

  useEffect(() => {
    try {
      const storedBal = localStorage.getItem('central_bank_balance');
      if (storedBal) setBankBalance(parseFloat(storedBal));
      const storedLedger = localStorage.getItem('central_bank_ledger');
      if (storedLedger) setLedgerEntries(JSON.parse(storedLedger));
    } catch {}
  }, []);

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

  return (
    <div className="w-full glass rounded-2xl p-6 border-white/5 border-l-4 border-l-yellow-400 mb-8 bg-black/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-orbitron font-black text-xl text-yellow-400 flex items-center gap-3">
          <Crown size={24} />
          CEO TELEMETRY DASHBOARD
        </h2>
        <button
          onClick={() => { playSound('click'); setShowBankAccount(true); }}
          className="glass px-3 py-1.5 border-green-500/30 hover:border-green-400 bg-green-500/5 hover:bg-green-500/10 transition-all rounded text-[10px] font-orbitron font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5"
        >
          <Wallet size={12} /> View Bank Account
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-orbitron block mb-1">Central Vault Balance</span>
          <span className="text-2xl font-black text-white">€{bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-green-400 text-[10px] ml-2 block mt-1">+€{(bankBalance - 12450).toFixed(2)} total profit</span>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-orbitron block mb-1">Total Orders</span>
          <span className="text-2xl font-black text-white">4,281</span>
          <span className="text-green-400 text-[10px] ml-2 block mt-1">+8% vs last month</span>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-orbitron block mb-1">Active VIPs</span>
          <span className="text-2xl font-black text-white">1,150</span>
          <span className="text-yellow-400 text-[10px] ml-2 block mt-1">Paddock Club</span>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-orbitron block mb-1">Top Selling Pass</span>
          <span className="text-md font-black text-white block mt-1">Monaco GP</span>
          <span className="text-white/40 text-[10px] block mt-1">120 bookings</span>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/5 h-[350px] w-full">
        <h3 className="text-white/50 text-xs font-orbitron uppercase tracking-widest mb-6">6-Month Revenue Telemetry</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[
            { name: 'Jan', revenue: 150000 },
            { name: 'Feb', revenue: 180000 },
            { name: 'Mar', revenue: 175000 },
            { name: 'Apr', revenue: 210000 },
            { name: 'May', revenue: 245000 },
            { name: 'Jun', revenue: 310000 },
          ]}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e10600" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#e10600" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `€${val/1000}k`} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#e10600', fontWeight: '900', fontFamily: 'Orbitron' }}
              formatter={(value: any) => [`€${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#e10600" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <AnimatePresence>
        {showBankAccount && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass max-w-2xl w-full max-h-[92vh] flex flex-col rounded-2xl border-white/10 p-5 md:p-8 relative overflow-hidden shadow-2xl bg-carbon-black/95 text-left"
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

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                    <span className="text-[9px] md:text-[10px] font-orbitron font-black text-white/40 tracking-widest uppercase flex items-center gap-1.5">
                      <Layers size={12} /> Ledger Telemetry Trail
                    </span>
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
                  <span className="skew-x-[10deg]">Close Vault</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountSwitcherModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { playSound } = useSound();
  const { signIn } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const dbStr = localStorage.getItem('mock_users_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        setUsers(Object.entries(db).map(([email, data]) => ({ email, ...(data as any) })));
      }
    }
  }, [isOpen]);

  const handleSwitch = async (email: string) => {
    playSound('gear-shift');
    await signIn(email, 'password');
    onClose();
    window.location.reload(); // Refresh to reset profile data view
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-[#0a0a10] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-orbitron font-black text-xl text-white uppercase tracking-wider">Switch Account</h2>
                <p className="text-white/50 text-xs font-mono mt-1">Select a driver profile</p>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {users.map((u) => (
                <button
                  key={u.email}
                  onClick={() => handleSwitch(u.email)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-4 rounded-xl flex items-center gap-4 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-racing-red/20 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-racing-red" />
                  </div>
                  <div>
                    <div className="font-orbitron font-black text-sm text-white uppercase">{u.full_name}</div>
                    <div className="text-[10px] text-white/50 font-mono mt-1">{u.email} • Role: {u.role}</div>
                  </div>
                </button>
              ))}
              {users.length === 0 && (
                <div className="text-center text-white/40 text-xs py-4 font-mono">No other profiles found.</div>
              )}
            </div>

            <button 
              onClick={() => {
                onClose();
              }}
              className="w-full py-3 bg-white/5 text-white/50 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProfilePage() {
  const { user, session, signOut, loading: authLoading, updateUserMetadata } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();
  const isVip = user?.user_metadata?.is_vip === true;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profile, setProfile] = useState<DriverProfile>({
    credits: 1250,
    xp: 3200,
    level: 4,
    driver_rank: 'AM-1'
  });
  
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isCancellingId, setIsCancellingId] = useState<string | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [ceoExists, setCeoExists] = useState(false);

  useEffect(() => {
    const checkCeo = async () => {
      if (!isSupabaseConfigured) {
        try {
          // Use cross-device API instead of just isolated localStorage
          const res = await fetch('/api/ceo');
          const data = await res.json();
          if (data.hasCeo) setCeoExists(true);
        } catch(e) {}
      } else {
        try {
          const { data } = await supabase.from('profiles').select('role').eq('role', 'CEO').limit(1);
          if (data && data.length > 0) setCeoExists(true);
        } catch(e) {}
      }
    };
    checkCeo();
  }, []);

  // Sync profile data and orders
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    // Load orders
    const fetchProfileAndOrders = async () => {
      if (!isSupabaseConfigured) {
        // Fallback mock orders from LocalStorage
        const localList: Order[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('order_demo_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              if (data.id) {
                const statusKey = `status_${data.id}`;
                const currentStatus = localStorage.getItem(statusKey) || 'pending';
                localList.push({
                  id: data.id,
                  total_amount: data.total || 0,
                  status: currentStatus,
                  created_at: new Date(data.created * 1000).toISOString()
                });
              }
            } catch (e) {}
          }
        }
        localList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(localList);
        setOrdersLoading(false);

        // Fetch local profiles metadata globally
        try {
          const res = await fetch(`/api/profile-points?userId=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token || ''}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setProfile(prev => ({
              ...prev,
              credits: data.credits,
              xp: data.xp,
              level: Math.max(1, Math.floor(data.xp / 1000) + 1)
            }));
          }
        } catch(e) {}
      } else {
        try {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (dbProfile) {
            setProfile({
              credits: dbProfile.credits ?? 0,
              xp: dbProfile.xp ?? 0,
              level: dbProfile.level ?? 1,
              driver_rank: dbProfile.driver_rank || 'ROOKIE'
            });
            if (dbProfile.avatar_url) {
              setAvatarBase64(dbProfile.avatar_url);
            }
          }

          const { data: dbOrders } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (dbOrders) {
            setOrders(dbOrders);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchProfileAndOrders();
  }, [user, authLoading, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSound('click');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setAvatarBase64(base64);
        
        // Save to Auth context user metadata
        updateUserMetadata({ avatar_url: base64 });

        // Update database
        if (isSupabaseConfigured) {
          await supabase.from('profiles').update({ avatar_url: base64 }).eq('id', user?.id);
        } else {
          localStorage.setItem(`avatar_${user?.id}`, base64);
        }
        triggerAlert('Telemetry sync: Avatar telemetry uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    playSound('pit-stop');
    setIsCancellingId(orderId);

    try {
      const res = await fetch('/api/order/cancel', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ orderId, userId: user?.id })
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
        
        // Subtract points from profile display if they were refunded
        const pointsRefund = Math.floor(Number(orders.find(o => o.id === orderId)?.total_amount || 0) * 10);
        setProfile(prev => ({
          ...prev,
          credits: Math.max(0, prev.credits - pointsRefund)
        }));
        
        // Update local storage status
        if (!isSupabaseConfigured) {
          localStorage.setItem(`status_${orderId}`, 'cancelled');
        }
        
        triggerAlert('Refund triggered: Telemetry logs cancelled');
      } else {
        triggerAlert(`Cancellation failed: ${data.error || 'Server error'}`);
      }
    } catch {
      triggerAlert('Network error occurred during cancellation');
    } finally {
      setIsCancellingId(null);
    }
  };

  const copyReferralLink = () => {
    playSound('scanner');
    const link = `${window.location.origin}/ref/${user?.id || 'guest'}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    triggerAlert('F1 Team Invite link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const triggerAlert = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleLogout = async () => {
    playSound('gear-shift');
    await signOut();
    router.push('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center font-orbitron text-white">
        <div className="w-8 h-8 border-2 border-racing-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Next level calculations
  const nextLevelXp = profile.level * 1000;
  const currentLevelXp = profile.xp % 1000;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelXp / 1000) * 100));

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl mx-auto">
      {/* Toast Alert */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] glass px-5 py-3 rounded-xl border border-racing-red bg-black/95 shadow-[0_0_30px_rgba(225,6,0,0.3)] flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-racing-red shrink-0 animate-ping" />
            <span className="font-orbitron text-[11px] font-black tracking-widest text-white uppercase">
              {actionMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {user?.user_metadata?.role === 'CEO' && <CeoDashboard />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Driver Passport Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass rounded-2xl p-6 border-white/5 relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
            
            {/* Avatar display/upload */}
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-racing-red/50 mb-4 bg-white/5 flex items-center justify-center">
              {avatarBase64 ? (
                <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-white/20" />
              )}
              <label className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[8px] font-orbitron font-black uppercase tracking-widest text-white">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <span>Upload</span>
                <span>Photo</span>
              </label>
            </div>

            <h2 className="font-orbitron font-black text-lg text-white mb-1 uppercase truncate max-w-full">
              {user.user_metadata?.full_name || 'Driver Cadet'}
            </h2>
            <span className="font-mono text-[10px] text-white/30 truncate block max-w-full mb-6">{user.email}</span>

            {/* Performance Telemetry: Level & XP */}
            <div className="w-full space-y-3 mb-6">
              <div className="flex justify-between items-center text-[10px] font-orbitron font-bold">
                <span className="text-white/40 uppercase">Driver Rank License</span>
                <span className="text-racing-red font-black tracking-widest">{profile.driver_rank}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-orbitron font-bold text-white/30 uppercase">
                <span>LVL {profile.level}</span>
                <span>{currentLevelXp} / 1000 XP</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-racing-red shadow-[0_0_10px_#E10600] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* ERS loyalty display */}
            <div className="w-full bg-white/3 border border-white/5 p-4 rounded-xl flex justify-between items-center mb-6">
              <div className="text-left">
                <span className="text-[8px] font-orbitron font-black uppercase tracking-widest text-white/30 block mb-0.5">ERS Points balance</span>
                <span className="font-orbitron font-black text-xl text-yellow-400">{profile.credits} PTS</span>
              </div>
              <Award className="text-yellow-400 shrink-0" size={24} />
            </div>

            {user?.user_metadata?.role !== 'CEO' && !ceoExists && (
              <button 
                onClick={async () => {
                  updateUserMetadata({ role: 'CEO' });
                  setCeoExists(true);
                  if (!isSupabaseConfigured) {
                    await fetch('/api/ceo', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token || ''}`
                      },
                      body: JSON.stringify({ action: 'claim', email: user.email })
                    });
                  }
                  triggerAlert('CEO Access Granted');
                  playSound('gear-shift');
                }}
                className="w-full py-2.5 mb-3 bg-racing-red/10 border border-racing-red/30 text-racing-red hover:bg-racing-red/20 rounded-xl font-orbitron text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Crown size={12} />
                <span>Claim CEO Role</span>
              </button>
            )}

            <button 
              onClick={() => setIsSwitcherOpen(true)}
              className="w-full py-2.5 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-white rounded-xl font-orbitron text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <SwitchCamera size={12} />
              <span>Switch Account</span>
            </button>

            <button 
              onClick={handleLogout}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded-xl font-orbitron text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={12} />
              <span>DOCK CADET / LOGOUT</span>
            </button>
            
            {/* Premium VIP Paddock Pass Card Component */}
            <VipPaddockPass user={user} isVip={isVip} />
          </div>

          {/* Referral system Card */}
          <div className="glass rounded-2xl p-6 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400" />
            <h3 className="font-orbitron font-black text-xs tracking-wider text-white mb-2 uppercase">ERS REFERRALS</h3>
            <p className="text-[10px] text-white/40 leading-relaxed font-orbitron uppercase mb-4">
              Invite friends to the paddock grid. Get <span className="text-yellow-400 font-bold">200 ERS points</span> automatically when they complete their first order!
            </p>
            <div className="bg-black/40 rounded-xl border border-white/5 p-3 flex justify-between items-center">
              <span className="font-mono text-[9px] text-white/50 truncate max-w-[200px] select-all">
                {window.location.origin}/ref/{user.id}
              </span>
              <button 
                onClick={copyReferralLink}
                className="text-white/40 hover:text-yellow-400 transition-colors p-1"
                title="Copy referral link"
              >
                {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Active Subscriptions & VIP */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VIP Paddock Pass Status Card */}
          <div className={`glass rounded-2xl p-6 relative overflow-hidden ${isVip ? 'border-yellow-400/50 bg-gradient-to-br from-black to-yellow-900/20' : 'border-white/5 bg-black/40'}`}>
            {isVip && <div className="absolute top-0 left-0 w-full h-[3px] bg-yellow-400 shadow-[0_0_20px_#facc15]" />}
            {!isVip && <div className="absolute top-0 left-0 w-full h-[2px] bg-white/10" />}
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Crown className={isVip ? "text-yellow-400" : "text-white/30"} size={24} />
                  <h3 className={`font-orbitron font-black text-lg tracking-wider uppercase ${isVip ? 'text-white' : 'text-white/50'}`}>
                    Paddock Club VIP
                  </h3>
                  {isVip && (
                    <span className="px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded text-[9px] font-orbitron font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle size={10} /> ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-white/50 max-w-md">
                  {isVip 
                    ? "You have permanent access to VIP race tickets, 2x ERS point multipliers, and exclusive team merchandise."
                    : "Upgrade to unlock exclusive high-end team merchandise, VIP tickets, and permanent ERS point multipliers."}
                </p>
              </div>
              
              <button 
                onClick={() => router.push('/vip')}
                className={`shrink-0 px-6 py-3 rounded-xl font-orbitron text-xs font-black uppercase tracking-widest transition-all ${
                  isVip 
                    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-none hover:scale-105'
                }`}
              >
                {isVip ? 'View Benefits' : 'Upgrade to VIP'}
              </button>
            </div>
          </div>

          {/* VIP Exclusive Products Section */}
          {isVip && (
            <div className="glass rounded-2xl p-6 border-yellow-400/30 relative overflow-hidden bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400 shadow-[0_0_10px_#facc15]" />
              <div className="flex items-center gap-2 mb-6">
                <Crown size={16} className="text-yellow-400" />
                <h3 className="font-orbitron font-black text-sm tracking-wider text-yellow-400">VIP EXCLUSIVE CATALOG</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter(p => p.is_vip_only).map(product => (
                  <div key={product.id} className="border border-yellow-400/20 bg-yellow-400/5 p-4 rounded-xl flex items-center gap-4 group hover:bg-yellow-400/10 transition-colors">
                    <div className="w-16 h-16 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-yellow-400/20">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-orbitron font-bold tracking-[0.2em] text-yellow-400/60 uppercase block mb-1">
                        {product.category}
                      </span>
                      <h4 className="font-orbitron font-black text-xs text-white uppercase line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-orbitron font-bold text-sm text-yellow-400">
                          €{product.price.toFixed(2)}
                        </span>
                        <button 
                          onClick={() => router.push('/menu')}
                          className="text-[9px] font-orbitron uppercase tracking-widest text-white/50 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10"
                        >
                          View Menu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SubscriptionManager email={user.email || ''} />

          {/* Order History list */}
          <div className="glass rounded-2xl p-6 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-racing-red" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History size={16} className="text-racing-red" />
                <h3 className="font-orbitron font-black text-sm tracking-wider text-white">ORDER TELEMETRY LOGS</h3>
              </div>
              <span className="bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 font-orbitron text-[9px] font-bold text-white/50">
                {orders.length} Logged
              </span>
            </div>

            {ordersLoading ? (
              <div className="text-center py-20 font-orbitron text-xs text-white/30 animate-pulse">
                Synchronizing Order History logs...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/5 rounded-xl bg-black/20">
                <Package size={32} className="mx-auto text-white/10 mb-3" />
                <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-white/40 block">No orders detected in cockpit</span>
                <span className="text-[9px] text-white/20 uppercase tracking-wider block mt-1">Place an order at fueling station / gear store to initialize telemetry</span>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isCancellable = ['pending', 'paid', 'confirmed'].includes(order.status.toLowerCase());
                  
                  return (
                    <div 
                      key={order.id} 
                      className="border border-white/5 bg-white/2 hover:bg-white/3 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">#{order.id.slice(-8).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 border rounded-[4px] text-[8px] font-orbitron font-black uppercase tracking-wider ${
                            order.status === 'cancelled' 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                              : order.status === 'completed'
                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/40 font-orbitron">
                          Logged: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right sm:text-right">
                          <span className="font-orbitron text-xs font-bold text-white/40 uppercase block text-[8px]">Amount</span>
                          <span className="font-orbitron font-black text-sm text-white">€{order.total_amount.toFixed(2)}</span>
                        </div>

                        {isCancellable && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancellingId === order.id}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-lg font-orbitron text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            {isCancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AccountSwitcherModal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)} />
    </main>
  );
}
