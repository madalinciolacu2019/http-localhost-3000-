'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Layers, Flag, User as UserIcon, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import GarageModal from './GarageModal';

export const EcosystemHeader: React.FC = () => {
  const { user } = useAuth();
  const { raceMode, setRaceMode } = useUI();
  const [activePlatform] = useState<'store' | 'coffee'>('coffee');
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    let url = 'http://localhost:5173';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Layers size={14} color="var(--accent-red)" />
            <span style={{ fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.75rem', color: '#fff' }}>APEX ECOSYSTEM</span>
          </div>

          <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)' }} />

          {/* Dynamic Platform Pills Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={handleNavigateStore}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ShoppingBag size={12} />
              <span>Merch Store</span>
            </button>

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

          <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)' }} />

          {/* Beta Access Link */}
          <a
            href="/beta"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-red)',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(255,0,0,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.05)'}
          >
            <Zap size={12} />
            BETA CLUB
          </a>
        </div>

        {/* Right side: User & System State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <button
            onClick={() => setRaceMode(!raceMode)}
            style={{
              background: raceMode ? 'rgba(255,0,0,0.1)' : 'transparent',
              border: `1px solid ${raceMode ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
              color: raceMode ? 'var(--accent-red)' : 'var(--text-muted)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Flag size={12} />
            {raceMode ? 'RACE WEEKEND: LIVE' : 'RACE WEEKEND: STANDBY'}
          </button>

          <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)' }} />

          <button
            onClick={() => setIsGarageOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={12} />
            </div>
            {user ? user.user_metadata?.full_name || 'Apex ID' : 'Guest Garage'}
          </button>

        </div>
      </div>

      {isGarageOpen && <GarageModal onClose={() => setIsGarageOpen(false)} />}
    </>
  );
};

export default EcosystemHeader;
