'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Layers, Flag, User as UserIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { useUI } from '@/frontend/context/UIContext';
import GarageModal from './GarageModal';
import { getActiveRace, getNextRace, f1Races, F1Race } from '@/shared/lib/f1Calendar';


export const EcosystemHeader: React.FC = () => {
  const { user } = useAuth();
  const { raceMode, setRaceMode } = useUI();
  const [activePlatform] = useState<'store' | 'coffee'>('coffee');
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeRace, setActiveRace] = useState<F1Race | null>(null);
  const [nextRace, setNextRace] = useState<F1Race | null>(null);

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const active = getActiveRace(today);
    const next = getNextRace(today);
    setActiveRace(active);
    setNextRace(next);
    
    // Automatically set raceMode to true if we are on a race weekend
    if (active) {
      setRaceMode(true);
    } else {
      setRaceMode(false);
    }
  }, [setRaceMode]);


  // Global Race Mode Toggle Effect
  useEffect(() => {
    if (!mounted) return;
    if (raceMode) {
      document.body.style.setProperty('--accent-red', '#ff1e1e');
      document.body.style.boxShadow = 'inset 0 0 100px rgba(255, 0, 0, 0.1)';
    } else {
      document.body.style.setProperty('--accent-red', '#E10600');
      document.body.style.boxShadow = 'none';
    }
  }, [raceMode, mounted]);

  const handleNavigateStore = () => {
    // URL token handoff for shared auth session
    const currentPort = typeof window !== 'undefined' ? window.location.port : '';
    let url = currentPort === '5173' ? 'http://localhost:3000' : 'http://localhost:5173';
    const mockSession = typeof window !== 'undefined' ? localStorage.getItem('mock_session') : null;
    if (mockSession) {
      url += `?apex_handoff=${encodeURIComponent(mockSession)}`;
    }
    window.location.href = url;
  };

  if (!mounted) {
    return <div style={{ height: 'var(--ecosystem-header-height, 52px)' }} className="bg-black/90 border-b border-white/5 w-full" />;
  }

  return (
    <>
      <div 
        className="ecosystem-header"
        style={{
          borderBottom: `1px solid ${raceMode ? 'rgba(255, 0, 0, 0.4)' : 'var(--border-subtle)'}`,
          boxShadow: raceMode ? '0 4px 20px rgba(255, 0, 0, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
      >
        
        {/* Left side: Ecosystem Master Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-white/45">
            <Layers size={14} className="text-racing-red" />
            <span className="font-extrabold tracking-widest text-[0.75rem] text-white">APEX ECOSYSTEM</span>
          </div>

          <div className="hidden sm:block h-3.5 w-px bg-white/10" />

          {/* Dynamic Platform Pills Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>


            <button
              type="button"
              style={{
                background: activePlatform === 'coffee' ? '#f59e0b' : 'transparent',
                color: activePlatform === 'coffee' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: activePlatform === 'coffee' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)'
              }}
            >
              <Coffee size={12} />
              <span>Coffee Studio</span>
            </button>
          </div>

        </div>

        {/* Right side: User & System State */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2">
            {raceMode ? (
              <>
                <button
                  onClick={() => {
                    const streamUrl = activeRace?.streamUrl || 'https://f1tv.formula1.com/';
                    window.open(streamUrl, '_blank');
                  }}
                  style={{
                    background: 'rgba(255, 0, 0, 0.15)',
                    border: '1px solid #ff1e1e',
                    color: '#ff1e1e',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    animation: 'pulse 1.5s infinite alternate',
                    boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)'
                  }}
                  title={`Watch ${activeRace?.name || 'Grand Prix'} live on F1 TV!`}
                >
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#ff1e1e', borderRadius: '50%', animation: 'blink 1s infinite' }} />
                  <Flag size={12} />
                  <span>RACE WEEKEND: LIVE</span>
                </button>

                <div className="hidden sm:flex items-center gap-1 text-[0.7rem]">
                  <span className="text-white/40 font-medium">Watch:</span>
                  <a
                    href={activeRace?.streamUrl || 'https://f1tv.formula1.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#ff1e1e',
                      textDecoration: 'underline',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#ff1e1e'}
                  >
                    f1tv.formula1.com <ExternalLink size={10} style={{ marginLeft: '1px' }} />
                  </a>
                </div>

                <button
                  onClick={() => {
                    setRaceMode(false);
                    setActiveRace(null);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  title="Force standby (neutral) state"
                >
                  Standby
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setRaceMode(true);
                    // For preview, default to next race or Canada GP
                    const canadaGP = f1Races.find(r => r.round === 7) || null;
                    setActiveRace(canadaGP);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                  title="Force Live simulated mode"
                >
                  <Flag size={12} />
                  <span>RACE WEEKEND: STANDBY</span>
                </button>

                {nextRace && (
                  <div className="hidden sm:flex items-center gap-1.5 text-white/50 text-[0.7rem]">
                    <span className="font-bold">Next:</span>
                    <span className="text-white font-bold">{nextRace.name}</span>
                    <span className="opacity-70">({new Date(nextRace.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="hidden sm:block h-3.5 w-px bg-white/10" />

          {/* User Identity Passport */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsGarageOpen(true)}>
            <UserIcon size={12} className="text-white/40" />
            <span className="font-extrabold text-[0.7rem] text-white">
              {user ? (user.user_metadata?.full_name?.split(' ')[0] || 'Driver') : 'Guest'}
            </span>
          </div>

        </div>
      </div>

      {isGarageOpen && <GarageModal onClose={() => setIsGarageOpen(false)} />}
    </>
  );
};

export default EcosystemHeader;
