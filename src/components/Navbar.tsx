'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coffee, Flag, ShoppingCart, User, LogOut, Terminal } from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { id: 'home', label: 'Grid', href: '/', icon: Flag },
  { id: 'paddock', label: 'Paddock', href: '/paddock', icon: Trophy },
  { id: 'menu', label: 'Fueling', href: '/menu', icon: Coffee },
  { id: 'pit-wall', label: 'Pit Wall', href: '/pit-wall', icon: Terminal },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { playSound } = useSound();
  const { totalItems, openCart } = useCart();
  const { user, signOut } = useAuth();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handlePaddockClub = () => {
    playSound('engine-rev');
    if (user) {
      router.push('/paddock-club');
    } else {
      router.push('/auth');
    }
  };

  const handleSignOut = async () => {
    playSound('gear-shift');
    await signOut();
    router.push('/');
  };

  return (
    <header 
      className="fixed left-0 right-0 z-50 p-4 md:p-8 pointer-events-none transition-all duration-300"
      style={{ top: 'var(--ecosystem-header-height, 52px)' }}
    >
      <nav className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group relative"
          onClick={() => playSound('engine-rev')}
        >
          <div className="bg-racing-red px-4 py-1.5 skew-x-[-15deg] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_#E10600]">
            <span className="font-orbitron font-black text-2xl text-white skew-x-[15deg] tracking-tighter">APEX</span>
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron text-lg font-black tracking-[0.2em] text-white hidden sm:block italic">BREWS</span>
            <div className="h-[1px] w-0 group-hover:w-full bg-racing-red transition-all duration-500" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 glass rounded-sm px-2 py-1 border-white/5 relative overflow-hidden group/nav">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/nav:translate-x-full transition-transform duration-1000" />
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onMouseEnter={() => {
                  setIsHovered(item.id);
                  playSound('click');
                }}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => playSound('gear-shift')}
                className={`relative px-8 py-2.5 flex items-center gap-2 transition-all skew-x-[-15deg] ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-racing-red shadow-[0_0_15px_#E10600]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-2 skew-x-[15deg]">
                  <item.icon size={16} className={isActive ? 'text-white' : 'group-hover:text-racing-red transition-colors'} />
                  <span className="font-orbitron text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Profile Trigger */}
          <button
            onClick={handlePaddockClub}
            className="lg:hidden glass p-3 rounded-full hover:bg-racing-red/20 transition-all text-white/50 hover:text-white border-white/5 flex items-center justify-center relative"
            aria-label="Paddock Account Profile"
          >
            {user ? (
              <div className="w-4 h-4 rounded-full bg-racing-red flex items-center justify-center font-orbitron text-[8px] font-black text-white">
                {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
            ) : (
              <User size={18} />
            )}
          </button>

          {/* Cart Button */}
          <button 
            className="glass p-3 rounded-full hover:bg-racing-red/20 transition-all text-white/50 hover:text-white border-white/5 relative"
            onClick={() => { openCart(); playSound('click'); }}
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.div
                  key="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-racing-red rounded-full flex items-center justify-center shadow-[0_0_8px_#E10600]"
                >
                  <span className="font-orbitron text-[9px] font-black text-white px-1">{totalItems > 9 ? '9+' : totalItems}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Desktop Paddock Club / Auth */}
          {user ? (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={handlePaddockClub}
                className="flex items-center gap-3 glass px-5 py-2.5 border-pit-yellow/20 hover:border-pit-yellow transition-all group/btn skew-x-[-15deg]"
              >
                <div className="w-6 h-6 rounded-full bg-racing-red flex items-center justify-center skew-x-[15deg]">
                  <span className="font-orbitron text-[9px] font-black text-white">
                    {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span className="font-orbitron text-[10px] font-black uppercase tracking-widest skew-x-[15deg] text-pit-yellow">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Paddock'}
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 glass rounded-lg hover:bg-racing-red/20 hover:border-racing-red/30 transition-all text-white/30 hover:text-racing-red"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handlePaddockClub}
              className="hidden lg:flex items-center gap-3 glass px-6 py-2.5 border-racing-red/20 hover:border-racing-red transition-all group/btn skew-x-[-15deg]"
            >
              <User size={16} className="text-racing-red skew-x-[15deg]" />
              <span className="font-orbitron text-[10px] font-black uppercase tracking-widest skew-x-[15deg]">Paddock Club</span>
            </button>
          )}
        </div>
      </nav>

      {/* Decorative Telemetry Line */}
      <div className="max-w-7xl mx-auto mt-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent relative overflow-hidden">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-racing-red/50 to-transparent"
        />
      </div>

      {/* Mobile Premium Nav Bar (Bottom HUD) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] glass rounded-2xl border-white/10 px-4 py-3 pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-carbon-black/95 backdrop-blur-3xl z-[150]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => playSound('gear-shift')}
                className="flex flex-col items-center gap-1.5 py-1 px-2.5 relative group flex-1"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-racing-red/10 text-racing-red scale-110 shadow-[0_0_10px_rgba(225,6,0,0.2)]' : 'text-white/40 group-hover:text-white/80'}`}>
                  <item.icon size={18} />
                </div>
                <span className={`font-orbitron text-[7px] font-black uppercase tracking-wider transition-colors ${isActive ? 'text-racing-red' : 'text-white/40'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-dot"
                    className="absolute -bottom-1 w-1 h-1 bg-racing-red rounded-full shadow-[0_0_8px_#E10600]"
                  />
                )}
              </Link>
            );
          })}
          
          {/* Pitbox Action Toggle */}
          <button
            onClick={() => { openCart(); playSound('click'); }}
            className="flex flex-col items-center gap-1.5 py-1 px-2.5 relative group flex-1"
          >
            <div className="p-1.5 rounded-xl text-white/40 group-hover:text-white/80 relative transition-all">
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-racing-red rounded-full flex items-center justify-center font-orbitron text-[8px] font-black text-white px-1 shadow-[0_0_8px_#E10600]">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <span className="font-orbitron text-[7px] font-black uppercase tracking-wider text-white/40 group-hover:text-white/80 transition-colors">
              Pitbox
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
