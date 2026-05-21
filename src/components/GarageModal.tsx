import React from 'react';
import { X, Award, ShoppingBag, Coffee, LogIn, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GarageModalProps {
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({ onClose }) => {
  const { user, signIn, signOut } = useAuth();

  const handleDemoSignIn = async () => {
    await signIn('demo@apex.com', 'password123');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#07080a',
        border: '1px solid #1f2937', // border-subtle
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>APEX GARAGE</h2>
            <p style={{ color: '#9ca3af', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Unified Ecosystem Profile</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <LogIn size={32} color="#9ca3af" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fff' }}>Sign in to Apex ID</h3>
              <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Sync your Paddock Pass, Orders, and Academy scores across the ecosystem.</p>
              <button 
                onClick={handleDemoSignIn}
                style={{
                  background: '#E10600',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Authenticate (Demo)
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* Profile Card */}
              <div style={{ background: '#111827', padding: '24px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                    {user.user_metadata?.full_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>{user.user_metadata?.full_name || 'Driver'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#E10600', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        LEVEL {user.user_metadata?.level || 1}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>• {user.user_metadata?.xp || 0} XP</span>
                    </div>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#9ca3af', marginBottom: '6px', fontWeight: 700 }}>
                    <span>XP PROGRESS</span>
                    <span>{((user.user_metadata?.xp || 0) % 1000) / 10}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${((user.user_metadata?.xp || 0) % 1000) / 10}%`, 
                      background: 'linear-gradient(to right, #E10600, #ff4b45)',
                      boxShadow: '0 0 10px rgba(225, 6, 0, 0.5)'
                    }} />
                  </div>
                </div>

                <button onClick={() => signOut()} style={{ width: '100%', background: 'transparent', border: '1px solid #1f2937', color: '#9ca3af', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Sign Out
                </button>
              </div>

              {/* Academy Scores */}
              <div style={{ background: '#111827', padding: '24px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '1rem', color: '#fff' }}>
                  <Award size={18} color="#f59e0b" /> Racing Academy (Coffee Studio)
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#9ca3af' }}>DRS Reaction Time</span>
                  <strong style={{ color: '#10B981' }}>{user.user_metadata?.best_drs_time || '0.18s'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                  <span style={{ color: '#9ca3af' }}>VIP Discount Status</span>
                  <strong style={{ color: '#fff' }}>{user?.user_metadata?.best_drs_time ? 'UNLOCKED (15% OFF)' : 'LOCKED'}</strong>
                </div>
              </div>

              {/* Paddock Rank Rewards */}
              <div style={{ background: '#111827', padding: '24px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '1rem', color: '#fff' }}>
                   <Zap size={18} color="#E10600" /> Paddock Rank Rewards
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { lvl: 2, label: 'Early Access Drops', status: (user.user_metadata?.level || 1) >= 2 ? 'UNLOCKED' : 'LOCKED' },
                    { lvl: 5, label: 'Free Pit-Lane Shipping', status: (user.user_metadata?.level || 1) >= 5 ? 'UNLOCKED' : 'LOCKED' },
                    { lvl: 10, label: 'Legendary Badge', status: (user.user_metadata?.level || 1) >= 10 ? 'UNLOCKED' : 'LOCKED' },
                  ].map((reward, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.8rem' }}>
                        <span style={{ color: '#E10600', fontWeight: 800 }}>LVL {reward.lvl}</span>
                        <span style={{ color: '#fff', marginLeft: '8px' }}>{reward.label}</span>
                      </div>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 900, 
                        color: reward.status === 'UNLOCKED' ? '#10B981' : '#9ca3af'
                      }}>{reward.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Fleet / Car Collection Section */}
              <div style={{ 
                gridColumn: '1 / -1', 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '24px',
                marginTop: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                    <Award size={20} color="#E10600" /> MY ACTIVE FLEET
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em' }}>2 CARS DEPLOYED</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* Car 1: Ferrari */}
                  <div style={{ 
                    position: 'relative', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '1px solid rgba(213, 0, 0, 0.3)',
                    background: '#0d0e12'
                  }}>
                    <img 
                      src="/ferrari_sf24.png" 
                      alt="Ferrari F1" 
                      style={{ width: '100%', height: '200px', objectFit: 'cover', opacity: 1.0 }} 
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, left: 0, right: 0, 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#D50000', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>CHASSIS ID: SF-24-X1</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>SCUDERIA FERRARI</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>ENGINE HEALTH</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>98%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>LAST TRACK TIME</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>1:18.442</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Car 2: Red Bull */}
                  <div style={{ 
                    position: 'relative', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '1px solid rgba(6, 0, 239, 0.3)',
                    background: '#0d0e12'
                  }}>
                    <img 
                      src="/redbull_rb20.png" 
                      alt="Red Bull F1" 
                      style={{ width: '100%', height: '200px', objectFit: 'cover', opacity: 1.0 }} 
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, left: 0, right: 0, 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#0600EF', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>CHASSIS ID: RB20-EVO</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>RED BULL RACING</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>TYRE WEAR</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>MED (12 Laps)</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>ERS CHARGE</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>100%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merch Orders */}
              <div style={{ background: '#111827', padding: '24px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '1rem', color: '#fff' }}>
                  <ShoppingBag size={18} color="#E10600" /> Recent Orders (Shop)
                </h3>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                  No recent orders found.
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GarageModal;
