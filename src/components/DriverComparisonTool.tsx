import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Award, Target, Timer, Trophy, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { driverData, DriverStats } from '@/data/driverComparisonData';

export const DriverComparisonTool: React.FC = () => {
  const [driver1, setDriver1] = useState<DriverStats>(driverData[0]);
  const [driver2, setDriver2] = useState<DriverStats>(driverData[2]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  const handleLaunchSimulator = () => {
    setIsSimulating(true);
    setSimResult(null);
    
    // Simulation Logic
    setTimeout(() => {
      const score1 = (driver1.titles * 10) + (driver1.winPercentage * 2);
      const score2 = (driver2.titles * 10) + (driver2.winPercentage * 2);
      
      if (score1 > score2) setSimResult(driver1.name);
      else setSimResult(driver2.name);
      
      setIsSimulating(false);
    }, 3000);
  };

  const renderStatRow = (label: string, val1: number | string, val2: number | string, icon: any) => {
    const isNumeric = typeof val1 === 'number';
    const highlight1 = isNumeric && (val1 as number) > (val2 as number);
    const highlight2 = isNumeric && (val2 as number) > (val1 as number);

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ flex: 1, textAlign: 'left', color: highlight1 ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: highlight1 ? 800 : 400, fontSize: '1.1rem' }}>
          {val1}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {icon}
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{label}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'right', color: highlight2 ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: highlight2 ? 800 : 400, fontSize: '1.1rem' }}>
          {val2}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#E10600', marginBottom: '12px' }}>
          <Shield size={16} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Historical Telemetry Analysis</span>
        </div>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, fontStyle: 'italic', color: '#fff', margin: 0 }}>DRIVER COMPARISON</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Normalize performance metrics across Formula 1 eras.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Driver 1 Selector */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', aspectRatio: '1', borderRadius: '24px', overflow: 'hidden', 
            border: `2px solid ${driver1.color}`, padding: '4px', background: 'rgba(0,0,0,0.3)',
            marginBottom: '20px'
          }}>
            <img src={driver1.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} alt={driver1.name} />
          </div>
          <select 
            value={driver1.id} 
            onChange={(e) => setDriver1(driverData.find(d => d.id === e.target.value)!)}
            style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', fontWeight: 700 }}
          >
            {driverData.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Comparison Stats */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {renderStatRow('ERA', driver1.era, driver2.era, <Timer size={16} color="rgba(255,255,255,0.3)" />)}
          {renderStatRow('TITLES', driver1.titles, driver2.titles, <Trophy size={16} color="#f59e0b" />)}
          {renderStatRow('WINS', driver1.wins, driver2.wins, <Award size={16} color="#E10600" />)}
          {renderStatRow('POLES', driver1.poles, driver2.poles, <Target size={16} color="#10B981" />)}
          {renderStatRow('WIN %', `${driver1.winPercentage}%`, `${driver2.winPercentage}%`, <Zap size={16} color="#0600EF" />)}

          {/* Simulator Launch Button */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button 
              onClick={handleLaunchSimulator}
              disabled={isSimulating}
              style={{
                width: '100%',
                padding: '20px',
                background: isSimulating ? 'rgba(255,255,255,0.05)' : 'linear-gradient(to right, #E10600, #ff4b45)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1rem',
                fontStyle: 'italic',
                cursor: isSimulating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                boxShadow: isSimulating ? 'none' : '0 10px 20px rgba(225, 6, 0, 0.3)'
              }}
            >
              {isSimulating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={20} /></motion.div>
                  ANALYZING TELEMETRY...
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" />
                  LAUNCH SIMULATOR head-to-head
                </>
              )}
            </button>
          </div>
        </div>

        {/* Driver 2 Selector */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', aspectRatio: '1', borderRadius: '24px', overflow: 'hidden', 
            border: `2px solid ${driver2.color}`, padding: '4px', background: 'rgba(0,0,0,0.3)',
            marginBottom: '20px'
          }}>
            <img src={driver2.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} alt={driver2.name} />
          </div>
          <select 
            value={driver2.id} 
            onChange={(e) => setDriver2(driverData.find(d => d.id === e.target.value)!)}
            style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', fontWeight: 700 }}
          >
            {driverData.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Result Overlay */}
      <AnimatePresence>
        {simResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              marginTop: '40px', padding: '32px', background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '24px', textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.2em', marginBottom: '8px' }}>SIMULATION COMPLETE</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>WINNER: <span style={{ color: '#10B981' }}>{simResult.toUpperCase()}</span></div>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '12px', fontSize: '0.9rem' }}>
              Based on historical telemetry normalization, {simResult} holds the strategic edge in this cross-era matchup.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
