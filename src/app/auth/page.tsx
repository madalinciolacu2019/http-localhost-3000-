'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSound } from '@/context/SoundContext';
import { useRouter } from 'next/navigation';
import { Flag, ArrowRight, Eye, EyeOff, Zap, AlertCircle, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { isFirebaseConfigured } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/paddock-club');
    }
    
    // Remember me email pre-fill
    const savedEmail = localStorage.getItem('apex_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    // Load saved accounts
    try {
      const dbStr = localStorage.getItem('mock_users_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const accounts = Object.keys(db).map(email => ({
          email,
          ...db[email]
        }));
        setSavedAccounts(accounts);
      }
    } catch (e) {
      console.error("Could not parse mock db", e);
    }
  }, [user, authLoading, router]);

  const handleFastLogin = async (accountEmail: string, accountName: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    playSound('engine-rev');

    const { error } = await signIn(accountEmail, 'fast-login', true, accountName);
    if (error) {
      setError(error);
      playSound('click');
      setLoading(false);
    } else {
      setSuccess('Session authenticated. Entering paddock...');
      playSound('gear-shift');
      setTimeout(() => router.push('/paddock-club'), 1500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    playSound('engine-rev');

    if (tab === 'login') {
      const { error } = await signIn(email, password, rememberMe, name);
      if (error) {
        setError(error);
        playSound('click');
      } else {
        if (rememberMe) {
          localStorage.setItem('apex_remembered_email', email);
        } else {
          localStorage.removeItem('apex_remembered_email');
        }
        setSuccess('Session authenticated. Entering paddock...');
        playSound('gear-shift');
        setTimeout(() => router.push('/paddock-club'), 1500);
      }
    } else {
      if (!name.trim()) { setError('Driver name is required.'); setLoading(false); return; }
      const { error } = await signUp(email, password, name, rememberMe);
      if (error) {
        setError(error);
        playSound('click');
      } else {
        if (rememberMe) {
          localStorage.setItem('apex_remembered_email', email);
        }
        setSuccess('Registration confirmed. Check your email to verify your account.');
        playSound('gear-shift');
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-carbon-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,0,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(225,6,0,0.05),transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-racing-red to-transparent" />

      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 80px,rgba(255,255,255,0.5) 80px,rgba(255,255,255,0.5) 81px)', backgroundSize: '100% 81px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-12 group">
          <div className="bg-racing-red px-4 py-1.5 skew-x-[-15deg] transition-all duration-500 group-hover:shadow-[0_0_30px_#E10600]">
            <span className="font-orbitron font-black text-2xl text-white skew-x-[15deg] tracking-tighter">APEX</span>
          </div>
          <span className="font-orbitron text-lg font-black tracking-[0.2em] text-white italic">BREWS</span>
        </Link>

        {/* Card */}
        <div className="glass border-white/5 rounded-2xl overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-white/5">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); setSuccess(null); playSound('click'); }}
                className={`flex-1 py-4 font-orbitron text-[10px] font-black tracking-[0.3em] uppercase transition-all relative ${
                  tab === t ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="auth-tab-bg"
                    className="absolute inset-0 bg-racing-red/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t === 'login' ? 'Enter Paddock' : 'Join Grid'}</span>
                {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-racing-red" />}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* Supabase Not Configured Banner */}
            {!isSupabaseConfigured && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 border border-pit-yellow/30 bg-pit-yellow/5 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-pit-yellow flex-shrink-0" />
                  <p className="font-orbitron text-[10px] font-black text-pit-yellow tracking-wider uppercase">Supabase Not Configured</p>
                </div>
                <p className="text-[10px] text-white/40 font-orbitron leading-relaxed">
                  Add your Supabase keys to <span className="text-white/70 font-black">.env.local</span> to enable authentication.
                </p>
                <div className="bg-black/40 rounded-lg p-2.5 font-mono text-[9px] text-green-400 leading-relaxed">
                  NEXT_PUBLIC_SUPABASE_URL=<span className="text-pit-yellow">https://xxx.supabase.co</span><br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=<span className="text-pit-yellow">eyJ...</span>
                </div>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-orbitron font-black text-pit-yellow/70 hover:text-pit-yellow transition-colors tracking-widest uppercase"
                >
                  Open Supabase Dashboard
                  <ExternalLink size={11} />
                </a>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.form
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {tab === 'login' && savedAccounts.length > 0 && (
                  <div className="space-y-2 mb-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] font-orbitron">
                      Saved Accounts
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {savedAccounts.map(acc => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => handleFastLogin(acc.email, acc.full_name)}
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-3 rounded-xl transition-all flex-shrink-0 min-w-[160px] text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-racing-red/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="font-orbitron font-black text-[10px] text-racing-red uppercase">
                              {(acc.full_name || acc.email)[0]}
                            </span>
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-orbitron font-black text-xs text-white truncate">{acc.full_name || 'Driver'}</div>
                            <div className="text-[9px] text-white/40 font-mono truncate">{acc.role || 'CUSTOMER'}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] font-orbitron">
                    {tab === 'login' ? 'Driver Name (Optional)' : 'Driver Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tab === 'login' ? 'Leave blank to keep current name' : 'Your racing name'}
                    required={tab === 'signup'}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-racing-red/50 transition-colors font-orbitron text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] font-orbitron">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@team.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-racing-red/50 transition-colors font-orbitron text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] font-orbitron">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-racing-red/50 transition-colors font-orbitron text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pb-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        setRememberMe(e.target.checked);
                        playSound('click');
                      }}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-racing-red focus:ring-0 focus:ring-offset-0 accent-racing-red cursor-pointer"
                    />
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em] font-orbitron hover:text-white transition-colors">
                      Remember Me
                    </span>
                  </label>

                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) {
                          setError('Enter your email above, then click Forgot Password.');
                          return;
                        }
                        playSound('click');
                        setLoading(true);
                        setError(null);
                        try {
                          if (isSupabaseConfigured) {
                            await supabase.auth.resetPasswordForEmail(email, {
                              redirectTo: `${window.location.origin}/auth`,
                            });
                          } else if (isFirebaseConfigured) {
                            const { auth: fbAuth } = await import('@/lib/firebase');
                            if (fbAuth) await sendPasswordResetEmail(fbAuth, email);
                          }
                          setSuccess('Password reset email sent! Check your inbox.');
                        } catch {
                          setError('Could not send reset email. Please try again.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-[10px] font-black text-racing-red/60 hover:text-racing-red uppercase tracking-[0.15em] font-orbitron transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                {/* Error / Success */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 bg-racing-red/10 border border-racing-red/30 rounded-lg px-4 py-3"
                    >
                      <AlertCircle size={14} className="text-racing-red flex-shrink-0" />
                      <p className="text-racing-red text-[10px] font-orbitron">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3"
                    >
                      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                      <p className="text-green-400 text-[10px] font-orbitron">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-racing flex items-center justify-center gap-3 py-4 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>{tab === 'login' ? 'ENTER PADDOCK' : 'JOIN THE GRID'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </motion.form>
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="text-[9px] text-white/20 font-orbitron tracking-widest">OR</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>

            <p className="text-center text-[9px] text-white/20 font-orbitron tracking-widest uppercase">
              {tab === 'login' ? "No account? " : "Already racing? "}
              <button
                onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-racing-red hover:text-white transition-colors"
              >
                {tab === 'login' ? 'Join the Grid' : 'Enter Paddock'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[9px] text-white/10 mt-8 font-orbitron tracking-widest uppercase">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-white/20 hover:text-white transition-colors">Terms</Link>
          {' & '}
          <Link href="/privacy" className="text-white/20 hover:text-white transition-colors">Privacy Policy</Link>
        </p>
      </motion.div>
    </main>
  );
}
