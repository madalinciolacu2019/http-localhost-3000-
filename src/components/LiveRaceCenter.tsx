import React, { useState, useEffect } from 'react';
import { Timer, Map, Wind, Thermometer, CloudRain, Zap, Radio, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveRaceCenter: React.FC = () => {
  const [session, setSession] = useState({
    gp: 'MONACO GRAND PRIX',
    track: 'Circuit de Monaco',
    status: 'FP1 LIVE',
    timeLeft: '18:42',
    weather: { temp: 22, trackTemp: 34, humidity: 45, chanceOfRain: 10 },
    fastestLap: '1:12.442 (VER)'
  });

  // Simulation: Update time left
  useEffect(() => {
    const timer = setInterval(() => {
      setSession(prev => {
        const [mins, secs] = prev.timeLeft.split(':').map(Number);
        if (secs === 0 && mins === 0) return prev;
        const newSecs = secs === 0 ? 59 : secs - 1;
        const newMins = secs === 0 ? mins - 1 : mins;
        return { ...prev, timeLeft: `${newMins}:${newSecs < 10 ? '0' : ''}${newSecs}` };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0b0d 0%, #15171a 100%)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }}>
      <div style={{ position: 'absolute', top: -50, right: -50, width: '200px', height: '200px', background: 'rgba(225, 6, 0, 0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E10600', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', background: '#E10600', borderRadius: '50%', opacity: 0.8 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Live Strategy Feed</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontStyle: 'italic', margin: 0 }}>{session.gp}</h3>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Map size={12} /> {session.track}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '8px', display: 'inline-block' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>Session Ends In</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{session.timeLeft}</div>
          </div>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>
            <Thermometer size={14} /> AIR TEMP
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{session.weather.temp}°C</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>
            <CloudRain size={14} /> RAIN CHANCE
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>{session.weather.chanceOfRain}%</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>
            <Zap size={14} /> FASTEST LAP
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>{session.fastestLap}</div>
        </div>

        <div style={{ background: 'rgba(255,24,1,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,24,1,0.2)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E10600', fontSize: '0.7rem', fontWeight: 800, marginBottom: '8px' }}>
            <Radio size={14} /> PIT RADIO
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Listen Live <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Track Status: <span style={{ color: '#10B981' }}>GREEN FLAG</span></div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>FIA Node: <span style={{ color: '#fff' }}>MON-01-SECURE</span></div>
      </div>
    </div>
  );
};
